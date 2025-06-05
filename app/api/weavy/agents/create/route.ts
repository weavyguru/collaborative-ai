import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { name, description, instructions } = await request.json()

    // Validate required fields
    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }

    // Generate a UID based on the name
    const generateUID = (name: string): string => {
      const cleanName = name
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "-") // Replace non-alphanumeric with hyphens
        .replace(/-+/g, "-") // Replace multiple hyphens with single
        .replace(/^-|-$/g, "") // Remove leading/trailing hyphens

      // Add timestamp to ensure uniqueness and guarantee non-digit requirement
      const timestamp = Date.now().toString()
      return `${cleanName}-${timestamp}`
    }

    const agentUID = generateUID(name)
    const knowledgeBaseUID = `${agentUID}-kb` // Knowledge base UID

    console.log("Creating knowledge base for agent:", { agentUID, knowledgeBaseUID })

    // Step 1: Create a files app (knowledge base) first
    const filesAppPayload = {
      uid: knowledgeBaseUID,
      type: "523edd88-4bbf-4547-b60f-2859a6d2ddc1", // Files app GUID
      name: `${name} Knowledge Base`,
      ...(description?.trim() && { description: `Knowledge base for ${name}` }),
    }

    console.log("Creating files app with payload:", JSON.stringify(filesAppPayload, null, 2))

    const filesAppResponse = await fetch(`${process.env.WEAVY_URL}/api/apps`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.WEAVY_API_KEY}`,
      },
      body: JSON.stringify(filesAppPayload),
    })

    const filesAppResponseText = await filesAppResponse.text()
    console.log("Files app response status:", filesAppResponse.status)
    console.log("Files app response body:", filesAppResponseText)

    if (!filesAppResponse.ok) {
      console.error("Failed to create files app:", {
        status: filesAppResponse.status,
        body: filesAppResponseText,
      })
      return NextResponse.json(
        { error: "Failed to create knowledge base", details: filesAppResponseText },
        { status: filesAppResponse.status },
      )
    }

    let filesAppData
    try {
      filesAppData = JSON.parse(filesAppResponseText)
    } catch (e) {
      console.error("Failed to parse files app response:", filesAppResponseText)
      return NextResponse.json(
        { error: "Invalid response from Weavy API when creating knowledge base" },
        { status: 500 },
      )
    }

    console.log("Successfully created files app:", filesAppData)

    // Step 2: Create agent with the knowledge base ID
    const agentPayload = {
      uid: agentUID,
      name: name.trim(),
      provider: "weavy",
      model: "weavy",
      knowledge_base_id: filesAppData.id, // Use the ID from the files app response
      // Add optional fields only if they have values
      ...(description?.trim() && { comment: description.trim() }),
      ...(instructions?.trim() && { instructions: instructions.trim() }),
    }

    console.log("Creating agent with payload:", JSON.stringify(agentPayload, null, 2))

    // Create agent in Weavy
    const agentResponse = await fetch(`${process.env.WEAVY_URL}/api/agents`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.WEAVY_API_KEY}`,
      },
      body: JSON.stringify(agentPayload),
    })

    const agentResponseText = await agentResponse.text()
    console.log("Agent API response status:", agentResponse.status)
    console.log("Agent API response body:", agentResponseText)

    if (!agentResponse.ok) {
      console.error("Weavy create agent error:", {
        status: agentResponse.status,
        statusText: agentResponse.statusText,
        body: agentResponseText,
      })

      // If agent creation fails, we should consider cleaning up the files app
      // For now, we'll just log it but you might want to delete the files app
      console.warn("Agent creation failed, files app was created but agent was not:", filesAppData.id)

      // Try to parse error response
      let errorMessage = "Failed to create agent"
      let errorDetails = agentResponseText

      try {
        const errorData = JSON.parse(agentResponseText)
        errorMessage = errorData.message || errorData.error || errorData.title || errorMessage
        errorDetails = errorData.detail || errorData.details || agentResponseText
      } catch (e) {
        // If response is not JSON, use the raw text
        errorMessage = agentResponseText || errorMessage
      }

      return NextResponse.json(
        {
          error: errorMessage,
          details: errorDetails,
          status: agentResponse.status,
          filesAppCreated: filesAppData.id, // Include this for debugging
        },
        { status: agentResponse.status },
      )
    }

    let agentData
    try {
      agentData = JSON.parse(agentResponseText)
    } catch (e) {
      console.error("Failed to parse agent response:", agentResponseText)
      return NextResponse.json({ error: "Invalid response from Weavy API" }, { status: 500 })
    }

    console.log("Successfully created agent:", agentData)

    return NextResponse.json({
      success: true,
      agent: agentData,
      knowledgeBase: filesAppData, // Include knowledge base info in response
    })
  } catch (error) {
    console.error("Create agent error:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
