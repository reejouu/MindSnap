import React from "react"

export default function LoadingOverlay({ show = false }: { show: boolean }) {
  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 transition-opacity duration-500 pointer-events-none ${show ? "opacity-100" : "opacity-0"}`}
      aria-hidden={!show}
    >
      <div className="flex flex-col items-center">
        {/* Sleek round spinner */}
        <div className="relative w-20 h-20 animate-spin-slow">
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 80 80" fill="none">
            <circle cx="40" cy="40" r="32" stroke="#34d399" strokeWidth="6" strokeDasharray="60 100" strokeLinecap="round" />
            <circle cx="40" cy="40" r="24" stroke="#06b6d4" strokeWidth="4" strokeDasharray="40 80" strokeLinecap="round" />
          </svg>
        </div>
        <span className="mt-6 text-lg text-emerald-300 font-semibold tracking-wide animate-fade-in">Loading...</span>
      </div>
      <style jsx>{`
        @keyframes spin-slow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 2s linear infinite;
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 1s ease-in;
        }
      `}</style>
    </div>
  )
}
