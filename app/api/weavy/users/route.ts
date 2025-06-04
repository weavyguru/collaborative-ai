import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { userId, name, email, avatar } = await request.json()

    // Validate required fields
    if (!email) {
      return NextResponse.json({ error: "email is required" }, { status: 400 })
    }

    // Use email as the UID for Weavy
    const uid = email

    // Always upsert the user - PUT will create or update
    const upsertPayload = {
      uid: uid, // Use email as UID
      name: name || email.split("@")[0],
      email: email,
      picture: avatar || null,
    }

    const upsertResponse = await fetch(`${process.env.WEAVY_URL}/api/users/${encodeURIComponent(uid)}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.WEAVY_API_KEY}`,
      },
      body: JSON.stringify(upsertPayload),
    })

    if (!upsertResponse.ok) {
      const errorData = await upsertResponse.text()
      console.error("Weavy user upsert error:", errorData)
      return NextResponse.json({ error: "Failed to upsert user" }, { status: upsertResponse.status })
    }

    const userData = await upsertResponse.json()

    return NextResponse.json({
      success: true,
      user: userData,
      action: "upserted",
    })
  } catch (error) {
    console.error("User upsert error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get("email")

    if (!email) {
      return NextResponse.json({ error: "email is required" }, { status: 400 })
    }

    // Use email as the UID for Weavy
    const uid = email

    // Get user from Weavy
    const response = await fetch(`${process.env.WEAVY_URL}/api/users/${encodeURIComponent(uid)}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.WEAVY_API_KEY}`,
      },
    })

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json({ error: "User not found" }, { status: 404 })
      }
      const errorData = await response.text()
      console.error("Weavy get user error:", errorData)
      return NextResponse.json({ error: "Failed to get user" }, { status: response.status })
    }

    const userData = await response.json()

    return NextResponse.json({
      success: true,
      user: userData,
    })
  } catch (error) {
    console.error("Get user error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
