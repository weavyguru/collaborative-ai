import { type NextRequest, NextResponse } from "next/server"

export async function PUT(request: NextRequest, { params }: { params: { uid: string } }) {
  try {
    const { uid } = params
    const { name, description, instructions } = await request.json()

    if (!uid) {
      return NextResponse.json({ error: "Agent UID is required" }, { status: 400 })
    }

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }

    // Create update payload
    const updatePayload = {
      name: name.trim(),
      // Add optional fields only if they have values
      ...(description?.trim() && { comment: description.trim() }),
      ...(instructions?.trim() && { instructions: instructions.trim() }),
    }

    console.log("Updating agent with payload:", JSON.stringify(updatePayload, null, 2))

    // Update agent in Weavy
    const response = await fetch(`${process.env.WEAVY_URL}/api/agents/${encodeURIComponent(uid)}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.WEAVY_API_KEY}`,
      },
      body: JSON.stringify(updatePayload),
    })

    const responseText = await response.text()
    console.log("Update agent response status:", response.status)
    console.log("Update agent response body:", responseText)

    if (!response.ok) {
      console.error("Weavy update agent error:", {
        status: response.status,
        statusText: response.statusText,
        body: responseText,
      })

      if (response.status === 404) {
        return NextResponse.json({ error: "Agent not found" }, { status: 404 })
      }

      // Try to parse error response
      let errorMessage = "Failed to update agent"
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

    console.log("Successfully updated agent:", agentData)

    return NextResponse.json({
      success: true,
      agent: agentData,
    })
  } catch (error) {
    console.error("Update agent error:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
