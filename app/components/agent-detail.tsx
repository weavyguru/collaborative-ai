"use client"
import { useEffect, useRef, useState } from "react"
import { useSession } from "next-auth/react"
import EditAgentModal from "./edit-agent-modal"

interface Agent {
  id: number
  uid: string
  name: string
  picture?: string
  comment?: string
  instructions?: string
  knowledge_base_id?: number
  provider: string
  model: string
  created_at: string
  updated_at: string
}

interface AgentDetailProps {
  agent: Agent
  onClose: () => void
}

export default function AgentDetail({ agent, onClose }: AgentDetailProps) {
  const { data: session } = useSession()
  const filesRef = useRef<HTMLDivElement>(null)
  const weavyInitialized = useRef(false)
  const [showEditModal, setShowEditModal] = useState(false)

  const handleAgentUpdated = (updatedAgent: Agent) => {
    // Update the agent prop would need to be handled by parent component
    // For now, we'll just close the detail modal and let parent refresh
    onClose()
  }

  // Token factory function that calls our backend
  const tokenFactory = async () => {
    if (!session?.user?.email) {
      throw new Error("No user email available")
    }

    console.log("Agent Detail - Token factory called with session data:", {
      name: session.user.name,
      email: session.user.email,
      image: session.user.image,
    })

    try {
      const response = await fetch("/api/weavy/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: session.user.email,
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
    if (!agent.knowledge_base_id || !session) return

    // Reset initialization flag
    weavyInitialized.current = false

    // Clear any existing content
    if (filesRef.current) {
      filesRef.current.innerHTML = `
        <div class="d-flex align-items-center justify-content-center h-100 w-100 text-secondary">
          <div class="spinner-border spinner-border-sm me-2" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          Loading Knowledge Base...
        </div>
      `
    }

    // Load Weavy UIkit script
    const script = document.createElement("script")
    script.src = `${process.env.NEXT_PUBLIC_WEAVY_URL}/uikit-web/weavy.js`
    script.type = "module"
    script.async = true

    script.onload = () => {
      if (!weavyInitialized.current && filesRef.current) {
        weavyInitialized.current = true

        // Clear the loading message
        filesRef.current.innerHTML = ""

        try {
          // Initialize Weavy
          const weavy = new (window as any).Weavy({
            url: process.env.NEXT_PUBLIC_WEAVY_URL,
            tokenFactory: tokenFactory,
          })

          // Create files element with knowledge base ID as UID
          const files = document.createElement("wy-files")
          files.setAttribute("uid", agent.knowledge_base_id!.toString())
          files.style.height = "400px"
          files.style.width = "100%"
          files.style.display = "flex"
          files.style.flex = "1"

          // Append files component
          filesRef.current.appendChild(files)
        } catch (error) {
          console.error("Weavy files initialization error:", error)
          if (filesRef.current) {
            filesRef.current.innerHTML = `
              <div class="d-flex flex-column align-items-center justify-content-center h-100 text-danger p-4">
                <div class="fs-6 fw-semibold mb-2">Failed to load Knowledge Base</div>
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
      if (filesRef.current) {
        filesRef.current.innerHTML = `
          <div class="d-flex flex-column align-items-center justify-content-center h-100 text-danger p-4">
            <div class="fs-6 fw-semibold mb-2">Failed to load Weavy</div>
            <div class="small text-secondary text-center">
              Could not load script
            </div>
          </div>
        `
      }
    }

    // Add script to head if it doesn't exist
    const existingScript = document.querySelector(`script[src="${script.src}"]`)
    if (!existingScript) {
      document.head.appendChild(script)
    } else {
      script.onload(null as any)
    }

    return () => {
      // Cleanup
      if (filesRef.current) {
        filesRef.current.innerHTML = ""
      }
    }
  }, [agent.knowledge_base_id, session])

  return (
    <div className="modal fade show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
      <div className="modal-dialog modal-xl">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Agent Details</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <div className="row">
              <div className="col-md-4">
                <div className="card">
                  <div className="card-body text-center">
                    <img
                      src={
                        agent.picture ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(agent.name) || "/placeholder.svg"}&background=6c757d&color=fff&size=100`
                      }
                      alt={agent.name}
                      className="rounded-circle mb-3"
                      width="100"
                      height="100"
                      style={{ objectFit: "cover" }}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(agent.name)}&background=6c757d&color=fff&size=100`
                      }}
                    />
                    <h5 className="card-title">{agent.name}</h5>
                    <p className="text-muted small mb-2">UID: {agent.uid}</p>
                    <div className="d-flex justify-content-center gap-2 mb-3">
                      <span className="badge bg-primary">{agent.provider}</span>
                      <span className="badge bg-secondary">{agent.model}</span>
                    </div>
                    {agent.comment && <p className="card-text small text-muted">{agent.comment}</p>}
                  </div>
                </div>

                <div className="card mt-3">
                  <div className="card-header">
                    <h6 className="mb-0">Agent Information</h6>
                  </div>
                  <div className="card-body">
                    <div className="row g-2">
                      <div className="col-12">
                        <small className="text-muted">Created:</small>
                        <div className="small">{new Date(agent.created_at).toLocaleDateString()}</div>
                      </div>
                      <div className="col-12">
                        <small className="text-muted">Updated:</small>
                        <div className="small">{new Date(agent.updated_at).toLocaleDateString()}</div>
                      </div>
                      {agent.knowledge_base_id && (
                        <div className="col-12">
                          <small className="text-muted">Knowledge Base ID:</small>
                          <div className="small">{agent.knowledge_base_id}</div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-md-8">
                <div className="d-flex flex-column h-100 gap-3">
                  <div className="card flex-shrink-0">
                    <div className="card-header">
                      <h6 className="mb-0">Instructions</h6>
                    </div>
                    <div className="card-body">
                      {agent.instructions ? (
                        <div className="bg-light p-3 rounded" style={{ maxHeight: "200px", overflowY: "auto" }}>
                          <pre className="mb-0 small" style={{ whiteSpace: "pre-wrap" }}>
                            {agent.instructions}
                          </pre>
                        </div>
                      ) : (
                        <p className="text-muted">No instructions provided</p>
                      )}
                    </div>
                  </div>

                  {agent.knowledge_base_id && (
                    <div className="card flex-grow-1 d-flex flex-column">
                      <div className="card-header flex-shrink-0">
                        <h6 className="mb-0">Knowledge Base Files</h6>
                      </div>
                      <div className="card-body p-0 flex-grow-1 d-flex flex-column">
                        <div ref={filesRef} className="flex-grow-1 d-flex flex-column" style={{ minHeight: "400px" }}>
                          <div className="d-flex align-items-center justify-content-center h-100 w-100 text-secondary p-4">
                            <div className="spinner-border spinner-border-sm me-2" role="status">
                              <span className="visually-hidden">Loading...</span>
                            </div>
                            Loading Knowledge Base...
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Close
            </button>
            <button type="button" className="btn btn-primary" onClick={() => setShowEditModal(true)}>
              Edit Agent
            </button>
          </div>
        </div>
      </div>
      {/* Edit Agent Modal */}
      <EditAgentModal
        agent={agent}
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onAgentUpdated={handleAgentUpdated}
      />
    </div>
  )
}
