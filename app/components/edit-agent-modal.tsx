"use client"
import { useState, useEffect } from "react"
import type React from "react"

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

interface EditAgentModalProps {
  agent: Agent | null
  isOpen: boolean
  onClose: () => void
  onAgentUpdated: (updatedAgent: Agent) => void
}

export default function EditAgentModal({ agent, isOpen, onClose, onAgentUpdated }: EditAgentModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    instructions: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Update form data when agent changes
  useEffect(() => {
    if (agent) {
      setFormData({
        name: agent.name || "",
        description: agent.comment || "",
        instructions: agent.instructions || "",
      })
    }
  }, [agent])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!agent) return

    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch(`/api/weavy/agents/${encodeURIComponent(agent.uid)}/update`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to update agent")
      }

      const data = await response.json()

      // Notify parent component with updated agent
      onAgentUpdated(data.agent)
      onClose()
    } catch (error) {
      console.error("Error updating agent:", error)
      setError(error instanceof Error ? error.message : "Failed to update agent")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      setError(null)
      onClose()
    }
  }

  if (!isOpen || !agent) return null

  return (
    <div className="modal fade show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Edit Agent</h5>
            <button type="button" className="btn-close" onClick={handleClose} disabled={isSubmitting}></button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}

              <div className="row mb-3">
                <div className="col-md-8">
                  <label htmlFor="name" className="form-label">
                    Agent Name <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    disabled={isSubmitting}
                    placeholder="Enter agent name"
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label">UID</label>
                  <input
                    type="text"
                    className="form-control"
                    value={agent.uid}
                    disabled
                    readOnly
                    style={{ backgroundColor: "#f8f9fa" }}
                  />
                  <small className="text-muted">UID cannot be changed</small>
                </div>
              </div>

              <div className="mb-3">
                <label htmlFor="description" className="form-label">
                  Description
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                  placeholder="Brief description of the agent"
                />
              </div>

              <div className="mb-3">
                <label htmlFor="instructions" className="form-label">
                  Instructions
                </label>
                <textarea
                  className="form-control"
                  id="instructions"
                  name="instructions"
                  rows={6}
                  value={formData.instructions}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                  placeholder="Detailed instructions for how the agent should behave..."
                />
              </div>

              <div className="mb-3">
                <div className="card bg-light">
                  <div className="card-body">
                    <h6 className="card-title mb-2">Agent Configuration</h6>
                    <div className="row">
                      <div className="col-4">
                        <small className="text-muted">Provider:</small>
                        <div className="fw-medium">{agent.provider}</div>
                      </div>
                      <div className="col-4">
                        <small className="text-muted">Model:</small>
                        <div className="fw-medium">{agent.model}</div>
                      </div>
                      <div className="col-4">
                        <small className="text-muted">Knowledge Base:</small>
                        <div className="fw-medium">
                          {agent.knowledge_base_id ? `ID: ${agent.knowledge_base_id}` : "None"}
                        </div>
                      </div>
                    </div>
                    <div className="row mt-2">
                      <div className="col-6">
                        <small className="text-muted">Created:</small>
                        <div className="small">{new Date(agent.created_at).toLocaleDateString()}</div>
                      </div>
                      <div className="col-6">
                        <small className="text-muted">Last Updated:</small>
                        <div className="small">{new Date(agent.updated_at).toLocaleDateString()}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={handleClose} disabled={isSubmitting}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={isSubmitting || !formData.name.trim()}>
                {isSubmitting ? (
                  <>
                    <div className="spinner-border spinner-border-sm me-2" role="status">
                      <span className="visually-hidden">Updating...</span>
                    </div>
                    Updating Agent...
                  </>
                ) : (
                  "Update Agent"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
