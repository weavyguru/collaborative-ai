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

    // First, upsert the user to ensure they exist in Weavy with proper details
    console.log("Upserting user before token generation...")
    const userUpsertResponse = await fetch(`${request.nextUrl.origin}/api/weavy/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: uid, // Use email as userId
        name,
        email,
        avatar,
      }),
    })

    if (!userUpsertResponse.ok) {
      const errorText = await userUpsertResponse.text()
      console.error("Failed to upsert user before token generation:", errorText)
      // Continue anyway, but log the error
    } else {
      console.log("User upsert successful before token generation")
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
