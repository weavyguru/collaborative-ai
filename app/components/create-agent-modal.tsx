"use client"
import { useState } from "react"
import type React from "react"

interface CreateAgentModalProps {
  isOpen: boolean
  onClose: () => void
  onAgentCreated: () => void
}

export default function CreateAgentModal({ isOpen, onClose, onAgentCreated }: CreateAgentModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    instructions: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch("/api/weavy/agents/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to create agent")
      }

      // Reset form
      setFormData({
        name: "",
        description: "",
        instructions: "",
      })

      // Notify parent component
      onAgentCreated()
      onClose()
    } catch (error) {
      console.error("Error creating agent:", error)
      setError(error instanceof Error ? error.message : "Failed to create agent")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      setFormData({
        name: "",
        description: "",
        instructions: "",
      })
      setError(null)
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="modal fade show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Create New Agent</h5>
            <button type="button" className="btn-close" onClick={handleClose} disabled={isSubmitting}></button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}

              <div className="mb-3">
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
                      <div className="col-6">
                        <small className="text-muted">Provider:</small>
                        <div className="fw-medium">Weavy</div>
                      </div>
                      <div className="col-6">
                        <small className="text-muted">Model:</small>
                        <div className="fw-medium">Weavy</div>
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
                      <span className="visually-hidden">Creating...</span>
                    </div>
                    Creating Agent...
                  </>
                ) : (
                  "Create Agent"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
