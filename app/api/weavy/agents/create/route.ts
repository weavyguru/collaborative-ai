import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { name, description, instructions } = await request.json()

    // Validate required fields according to Weavy API docs
    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }

    // Create agent payload according to Weavy API specification
    // Based on the docs, the required fields are typically:
    // - name (required)
    // - provider (required)
    // - model (required)
    // Optional fields may include: description, instructions, etc.
    const agentPayload = {
      name: name.trim(),
      provider: "weavy",
      model: "weavy",
      // Add optional fields only if they have values
      ...(description?.trim() && { description: description.trim() }),
      ...(instructions?.trim() && { instructions: instructions.trim() }),
    }

    console.log("Creating agent with payload:", JSON.stringify(agentPayload, null, 2))

    // Create agent in Weavy
    const response = await fetch(`${process.env.WEAVY_URL}/api/agents`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.WEAVY_API_KEY}`,
      },
      body: JSON.stringify(agentPayload),
    })

    const responseText = await response.text()
    console.log("Weavy API response status:", response.status)
    console.log("Weavy API response headers:", Object.fromEntries(response.headers.entries()))
    console.log("Weavy API response body:", responseText)

    if (!response.ok) {
      console.error("Weavy create agent error:", {
        status: response.status,
        statusText: response.statusText,
        body: responseText,
        url: `${process.env.WEAVY_URL}/api/agents`,
        payload: agentPayload,
      })

      // Try to parse error response
      let errorMessage = "Failed to create agent"
      let errorDetails = responseText

      try {
        const errorData = JSON.parse(responseText)
        errorMessage = errorData.message || errorData.error || errorData.title || errorMessage
        errorDetails = errorData.detail || errorData.details || responseText
      } catch (e) {
        // If response is not JSON, use the raw text
        errorMessage = responseText || errorMessage
      }

      return NextResponse.json(
        {
          error: errorMessage,
          details: errorDetails,
          status: response.status,
        },
        { status: response.status },
      )
    }

    let agentData
    try {
      agentData = JSON.parse(responseText)
    } catch (e) {
      console.error("Failed to parse agent response:", responseText)
      return NextResponse.json({ error: "Invalid response from Weavy API" }, { status: 500 })
    }

    console.log("Successfully created agent:", agentData)

    return NextResponse.json({
      success: true,
      agent: agentData,
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
