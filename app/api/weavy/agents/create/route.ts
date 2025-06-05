import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { name, description, instructions } = await request.json()

    // Validate required fields
    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }

    // Create agent payload for Weavy
    const agentPayload = {
      name: name.trim(),
      comment: description?.trim() || "",
      instructions: instructions?.trim() || "",
      provider: "weavy",
      model: "weavy",
    }

    // Create agent in Weavy
    const response = await fetch(`${process.env.WEAVY_URL}/api/agents`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.WEAVY_API_KEY}`,
      },
      body: JSON.stringify(agentPayload),
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error("Weavy create agent error:", errorData)
      return NextResponse.json({ error: "Failed to create agent" }, { status: response.status })
    }

    const agentData = await response.json()

    return NextResponse.json({
      success: true,
      agent: agentData,
    })
  } catch (error) {
    console.error("Create agent error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
