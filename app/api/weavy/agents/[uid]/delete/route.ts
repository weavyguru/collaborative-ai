import { type NextRequest, NextResponse } from "next/server"

export async function DELETE(request: NextRequest, { params }: { params: { uid: string } }) {
  try {
    const { uid } = params

    if (!uid) {
      return NextResponse.json({ error: "Agent UID is required" }, { status: 400 })
    }

    console.log("Deleting agent:", uid)

    // Delete agent from Weavy
    const response = await fetch(`${process.env.WEAVY_URL}/api/agents/${encodeURIComponent(uid)}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.WEAVY_API_KEY}`,
      },
    })

    console.log("Delete agent response status:", response.status)

    if (!response.ok) {
      const errorData = await response.text()
      console.error("Weavy delete agent error:", errorData)

      if (response.status === 404) {
        return NextResponse.json({ error: "Agent not found" }, { status: 404 })
      }

      return NextResponse.json({ error: "Failed to delete agent" }, { status: response.status })
    }

    console.log("Successfully deleted agent:", uid)

    return NextResponse.json({
      success: true,
      message: "Agent deleted successfully",
    })
  } catch (error) {
    console.error("Delete agent error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
