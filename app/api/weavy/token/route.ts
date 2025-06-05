import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { userId, name, email, avatar } = await request.json()

    console.log("Token request received with data:", { userId, name, email, avatar: avatar ? "present" : "missing" })

    // Validate required fields
    if (!email) {
      return NextResponse.json({ error: "email is required" }, { status: 400 })
    }

    // Use email as the UID for Weavy
    const uid = email

    // IMPORTANT: First, directly upsert the user to Weavy to ensure they exist with proper details
    console.log("Directly upserting user to Weavy...")

    const upsertPayload = {
      uid: uid, // Use email as UID
      name: name || email.split("@")[0], // Use full name from Google Auth, fallback to email prefix
      email: email,
      picture: avatar || null, // Include profile picture from Google Auth
    }

    console.log("User upsert payload:", JSON.stringify(upsertPayload, null, 2))

    // Direct call to Weavy API to upsert user
    const upsertResponse = await fetch(`${process.env.WEAVY_URL}/api/users/${encodeURIComponent(uid)}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.WEAVY_API_KEY}`,
      },
      body: JSON.stringify(upsertPayload),
    })

    const upsertResponseText = await upsertResponse.text()
    console.log("Weavy user upsert response status:", upsertResponse.status)
    console.log("Weavy user upsert response body:", upsertResponseText)

    if (!upsertResponse.ok) {
      console.error("Failed to upsert user in Weavy:", upsertResponseText)
      return NextResponse.json({ error: "Failed to upsert user" }, { status: upsertResponse.status })
    }

    let userData
    try {
      userData = JSON.parse(upsertResponseText)
      console.log("Successfully upserted user:", userData)
    } catch (e) {
      console.error("Failed to parse user response:", upsertResponseText)
      return NextResponse.json({ error: "Invalid response from Weavy API" }, { status: 500 })
    }

    // Create the user payload for token generation
    const userPayload = {
      sub: uid, // Subject (user ID) - using email as UID
      name: name || email.split("@")[0], // Use full name from Google Auth, fallback to email prefix
      email: email,
      picture: avatar || null, // Include profile picture from Google Auth
      iss: process.env.WEAVY_URL, // Issuer (your Weavy environment URL)
      aud: process.env.WEAVY_URL, // Audience (your Weavy environment URL)
      exp: Math.floor(Date.now() / 1000) + 60 * 60, // Expires in 1 hour
      iat: Math.floor(Date.now() / 1000), // Issued at
    }

    console.log("Token payload:", JSON.stringify(userPayload, null, 2))

    // Make request to Weavy to get access token
    const response = await fetch(`${process.env.WEAVY_URL}/api/users/${encodeURIComponent(uid)}/tokens`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.WEAVY_API_KEY}`,
      },
      body: JSON.stringify(userPayload),
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error("Weavy API error:", errorData)
      return NextResponse.json({ error: "Failed to generate token" }, { status: response.status })
    }

    const tokenData = await response.json()

    return NextResponse.json({
      access_token: tokenData.access_token,
    })
  } catch (error) {
    console.error("Token generation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
