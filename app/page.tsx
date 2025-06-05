"use client"
import { useEffect, useRef, useState } from "react"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Script from "next/script"

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const messengerRef = useRef<HTMLDivElement>(null)
  const weavyInitialized = useRef(false)
  const [isLoading, setIsLoading] = useState(true)

  // Redirect to sign in if not authenticated
  useEffect(() => {
    if (status === "loading") return // Still loading

    if (!session) {
      router.push("/auth/signin")
      return
    }

    setIsLoading(false)
  }, [session, status, router])

  // Token factory function that calls our backend
  const tokenFactory = async () => {
    if (!session?.user?.email) {
      throw new Error("No user email available")
    }

    try {
      const response = await fetch("/api/weavy/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: session.user.email, // Use email as userId
          name: session.user.name,
          email: session.user.email,
          avatar: session.user.image,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to get token")
      }

      const data = await response.json()
      return data.access_token
    } catch (error) {
      console.error("Token fetch error:", error)
      throw error
    }
  }

  useEffect(() => {
    if (!session || isLoading) return

    // Reset initialization flag
    weavyInitialized.current = false

    // Clear any existing content
    if (messengerRef.current) {
      messengerRef.current.innerHTML = `
        <div class="d-flex align-items-center justify-content-center h-100 w-100 text-secondary">
          <div class="spinner-border spinner-border-sm me-2" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          Loading Weavy Messenger...
        </div>
      `
    }

    // Load Weavy UIkit script
    const script = document.createElement("script")
    script.src = `${process.env.NEXT_PUBLIC_WEAVY_URL}/uikit-web/weavy.js`
    script.type = "module"
    script.async = true

    script.onload = () => {
      if (!weavyInitialized.current && messengerRef.current) {
        weavyInitialized.current = true

        // Clear the loading message
        messengerRef.current.innerHTML = ""

        try {
          // Initialize Weavy
          const weavy = new (window as any).Weavy({
            url: process.env.NEXT_PUBLIC_WEAVY_URL,
            tokenFactory: tokenFactory,
          })

          // Create messenger element
          const messenger = document.createElement("wy-messenger")
          messenger.setAttribute("uid", "global-messenger")
          messenger.style.height = "100%"
          messenger.style.width = "100%"
          messenger.style.display = "flex"
          messenger.style.flex = "1"
          messenger.style.overflow = "hidden"
          messenger.style.maxHeight = "100%"

          // Append messenger
          messengerRef.current.appendChild(messenger)
        } catch (error) {
          console.error("Weavy initialization error:", error)
          if (messengerRef.current) {
            messengerRef.current.innerHTML = `
              <div class="d-flex flex-column align-items-center justify-content-center h-100 text-danger p-4">
                <div class="fs-5 fw-semibold mb-2">Failed to initialize Weavy</div>
                <div class="small text-secondary text-center">
                  Error: ${error}
                </div>
              </div>
            `
          }
        }
      }
    }

    script.onerror = (error) => {
      console.error("Failed to load Weavy script:", error)
      if (messengerRef.current) {
        messengerRef.current.innerHTML = `
          <div class="d-flex flex-column align-items-center justify-content-center h-100 text-danger p-4">
            <div class="fs-5 fw-semibold mb-2">Failed to load Weavy</div>
            <div class="small text-secondary text-center">
              Could not load script from: ${script.src}
            </div>
          </div>
        `
      }
    }

    // Add script to head
    document.head.appendChild(script)

    return () => {
      // Cleanup
      if (messengerRef.current) {
        messengerRef.current.innerHTML = ""
      }
      // Remove script
      if (script.parentNode) {
        script.parentNode.removeChild(script)
      }
    }
  }, [session, isLoading])

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/auth/signin" })
  }

  // Show loading while checking authentication
  if (status === "loading" || isLoading) {
    return (
      <div className="container-fluid vh-100 d-flex align-items-center justify-content-center bg-light">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    )
  }

  // Don't render anything if no session (will redirect)
  if (!session) {
    return null
  }

  return (
    <>
      <div className="container-fluid vh-100 d-flex flex-column bg-light">
        <header className="bg-white shadow-sm border-bottom">
          <div className="container-fluid py-3">
            <div className="d-flex justify-content-between align-items-center">
              <h1 className="h4 mb-0 fw-bold">Weavy Messenger MVP</h1>

              {/* Navigation */}
              <nav className="d-flex align-items-center gap-4">
                <Link
                  href="/"
                  className="nav-link text-decoration-none fw-medium text-primary border-bottom border-2 border-primary pb-1"
                >
                  Messenger
                </Link>
                <Link
                  href="/agent-builder"
                  className="nav-link text-decoration-none fw-medium text-secondary hover-text-primary"
                >
                  Agent Builder
                </Link>
              </nav>

              <div className="d-flex align-items-center gap-3">
                <div className="d-flex align-items-center gap-2">
                  <img
                    src={session.user?.image || "/placeholder.svg"}
                    alt={session.user?.name || "User"}
                    className="rounded-circle"
                    width="32"
                    height="32"
                  />
                  <div className="small text-secondary">
                    <span className="fw-medium">{session.user?.name}</span>
                    <div className="text-muted" style={{ fontSize: "0.75rem" }}>
                      {session.user?.email}
                    </div>
                  </div>
                </div>
                <button onClick={handleSignOut} className="btn btn-outline-secondary btn-sm">
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="container-fluid py-4 main-content">
          <div className="card messenger-container h-100">
            <div className="card-body">
              <h2 className="card-title h5 mb-3">Messenger</h2>
              <div className="border rounded bg-light messenger-wrapper d-flex">
                <div ref={messengerRef} className="h-100 w-100 d-flex">
                  <div className="d-flex align-items-center justify-content-center h-100 w-100 text-secondary">
                    <div className="spinner-border spinner-border-sm me-2" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    Loading Weavy Messenger...
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Bootstrap JS */}
      <Script
        src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"
        integrity="sha384-C6RzsynM9kWDrMNeT87bh95OGNyZPhcTNXj1NW7RuBCsyN/o0jlpcV8Qyq46cDfL"
        crossOrigin="anonymous"
      />
    </>
  )
}
