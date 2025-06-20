import React from "react"
import { X } from "lucide-react"

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="bg-gradient-to-br from-background via-background to-primary/5 border border-primary/20 rounded-2xl shadow-2xl max-w-lg w-full p-6 relative animate-in zoom-in duration-300">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-text/60 hover:text-primary transition-colors"
          aria-label="Close"
        >
          <X className="w-6 h-6" />
        </button>
        {title && (
          <h2 className="text-xl font-bold text-center mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            {title}
          </h2>
        )}
        <div className="modal-content text-text/90">{children}</div>
      </div>
    </div>
  )
} 