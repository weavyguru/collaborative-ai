import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    // Get agents from Weavy
    const response = await fetch(`${process.env.WEAVY_URL}/api/agents`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.WEAVY_API_KEY}`,
      },
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error("Weavy get agents error:", errorData)
      return NextResponse.json({ error: "Failed to get agents" }, { status: response.status })
    }

    const agentsData = await response.json()

    return NextResponse.json({
      success: true,
      agents: agentsData.data || [],
      count: agentsData.count || 0,
    })
  } catch (error) {
    console.error("Get agents error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
