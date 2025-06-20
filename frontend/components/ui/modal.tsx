"use client"

import type React from "react"
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
      <div className="bg-gradient-to-br from-gray-900/95 via-gray-800/90 to-gray-900/95 border border-emerald-500/20 rounded-2xl shadow-2xl max-w-lg w-full p-6 relative animate-in zoom-in duration-300 backdrop-blur-sm">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white hover:bg-red-500/10 rounded-lg p-1 transition-all duration-200 hover:scale-110"
          aria-label="Close"
        >
          <X className="w-6 h-6" />
        </button>
        {title && (
          <h2 className="text-xl font-bold text-center mb-4 bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            {title}
          </h2>
        )}
        <div className="modal-content text-gray-200">{children}</div>
      </div>
    </div>
  )
}
