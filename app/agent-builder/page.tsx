"use client"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"
import Script from "next/script"
import AgentDetail from "../components/agent-detail"
import CreateAgentModal from "../components/create-agent-modal"

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

export default function AgentBuilder() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [agents, setAgents] = useState<Agent[]>([])
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null)
  const [loadingAgents, setLoadingAgents] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)

  // Redirect to sign in if not authenticated
  useEffect(() => {
    if (status === "loading") return // Still loading

    if (!session) {
      router.push("/auth/signin")
      return
    }

    setIsLoading(false)
  }, [session, status, router])

  // Fetch agents from Weavy
  const fetchAgents = async () => {
    setLoadingAgents(true)
    setError(null)

    try {
      const response = await fetch("/api/weavy/agents")

      if (!response.ok) {
        throw new Error("Failed to fetch agents")
      }

      const data = await response.json()
      setAgents(data.agents || [])
    } catch (error) {
      console.error("Error fetching agents:", error)
      setError("Failed to load agents")
    } finally {
      setLoadingAgents(false)
    }
  }

  useEffect(() => {
    if (!session || isLoading) return
    fetchAgents()
  }, [session, isLoading])

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/auth/signin" })
  }

  const handleAgentClick = async (agent: Agent) => {
    try {
      // Fetch detailed agent information
      const response = await fetch(`/api/weavy/agents/${encodeURIComponent(agent.uid)}`)

      if (!response.ok) {
        throw new Error("Failed to fetch agent details")
      }

      const data = await response.json()
      setSelectedAgent(data.agent)
    } catch (error) {
      console.error("Error fetching agent details:", error)
      // Fallback to basic agent data
      setSelectedAgent(agent)
    }
  }

  const handleAgentCreated = () => {
    // Refresh the agents list
    fetchAgents()
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
                <Link href="/" className="nav-link text-decoration-none fw-medium text-secondary hover-text-primary">
                  Messenger
                </Link>
                <Link
                  href="/agent-builder"
                  className="nav-link text-decoration-none fw-medium text-primary border-bottom border-2 border-primary pb-1"
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

        <main className="container-fluid py-4 flex-grow-1">
          <div className="row h-100">
            <div className="col-12">
              <div className="card h-100">
                <div className="card-body">
                  <div className="d-flex align-items-center justify-content-between mb-4">
                    <h2 className="card-title h5 mb-0">
                      Agent Builder
                      {agents.length > 0 && <span className="badge bg-secondary ms-2">{agents.length}</span>}
                    </h2>
                    <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
                      <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16" className="me-2">
                        <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" />
                        <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z" />
                      </svg>
                      Create New Agent
                    </button>
                  </div>

                  {error && (
                    <div className="alert alert-danger" role="alert">
                      {error}
                    </div>
                  )}

                  {loadingAgents ? (
                    <div className="d-flex align-items-center justify-content-center py-5">
                      <div className="spinner-border me-2" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                      Loading agents...
                    </div>
                  ) : agents.length > 0 ? (
                    <div className="row">
                      {agents.map((agent) => (
                        <div key={agent.id} className="col-md-4 mb-4">
                          <div
                            className="card h-100 cursor-pointer border-hover"
                            onClick={() => handleAgentClick(agent)}
                            style={{ cursor: "pointer" }}
                          >
                            <div className="card-body text-center d-flex flex-column">
                              <img
                                src={
                                  agent.picture ||
                                  `https://ui-avatars.com/api/?name=${encodeURIComponent(agent.name) || "/placeholder.svg"}&background=6c757d&color=fff&size=64`
                                }
                                alt={agent.name}
                                className="rounded-circle mx-auto mb-3"
                                width="64"
                                height="64"
                                style={{ objectFit: "cover" }}
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement
                                  target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(agent.name)}&background=6c757d&color=fff&size=64`
                                }}
                              />
                              <h5 className="card-title">{agent.name}</h5>
                              <p className="text-muted small mb-2">UID: {agent.uid}</p>
                              <div className="d-flex justify-content-center gap-1 mb-3">
                                <span className="badge bg-primary small">{agent.provider}</span>
                                <span className="badge bg-secondary small">{agent.model}</span>
                              </div>
                              {agent.comment && (
                                <p className="card-text text-muted small flex-grow-1">
                                  {agent.comment.length > 100 ? `${agent.comment.substring(0, 100)}...` : agent.comment}
                                </p>
                              )}
                              <div className="mt-auto">
                                <small className="text-muted">
                                  Created: {new Date(agent.created_at).toLocaleDateString()}
                                </small>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="card">
                      <div className="card-body text-center py-5">
                        <div className="text-muted mb-3">
                          <svg width="48" height="48" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" />
                            <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z" />
                          </svg>
                        </div>
                        <h5 className="text-muted">No agents found</h5>
                        <p className="text-muted small mb-3">Get started by creating your first AI agent</p>
                        <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
                          Create Your First Agent
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Agent Detail Modal */}
      {selectedAgent && <AgentDetail agent={selectedAgent} onClose={() => setSelectedAgent(null)} />}

      {/* Create Agent Modal */}
      <CreateAgentModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onAgentCreated={handleAgentCreated}
      />

      {/* Bootstrap JS */}
      <Script
        src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"
        integrity="sha384-C6RzsynM9kWDrMNeT87bh95OGNyZPhcTNXj1NW7RuBCsyN/o0jlpcV8Qyq46cDfL"
        crossOrigin="anonymous"
      />
    </>
  )
}
