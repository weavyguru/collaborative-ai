import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { uid: string } }) {
  try {
    const { uid } = params

    if (!uid) {
      return NextResponse.json({ error: "Agent UID is required" }, { status: 400 })
    }

    // Get specific agent from Weavy
    const response = await fetch(`${process.env.WEAVY_URL}/api/agents/${encodeURIComponent(uid)}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.WEAVY_API_KEY}`,
      },
    })

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json({ error: "Agent not found" }, { status: 404 })
      }
      const errorData = await response.text()
      console.error("Weavy get agent error:", errorData)
      return NextResponse.json({ error: "Failed to get agent" }, { status: response.status })
    }

    const agentData = await response.json()

    return NextResponse.json({
      success: true,
      agent: agentData,
    })
  } catch (error) {
    console.error("Get agent error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
