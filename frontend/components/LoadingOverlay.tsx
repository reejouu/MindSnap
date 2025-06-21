import React from "react"

export default function LoadingOverlay({ show = false }: { show: boolean }) {
  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 transition-opacity duration-500 pointer-events-none ${show ? "opacity-100" : "opacity-0"}`}
      aria-hidden={!show}
    >
      <div className="flex flex-col items-center">
        {/* Dynamic spinner with pulse and color shift */}
        <div className="relative w-20 h-20 animate-spin-slow">
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 80 80" fill="none">
            <circle cx="40" cy="40" r="32" stroke="#34d399" strokeWidth="6" strokeDasharray="60 100" strokeLinecap="round" className="animate-pulse-green" />
            <circle cx="40" cy="40" r="24" stroke="#06b6d4" strokeWidth="4" strokeDasharray="40 80" strokeLinecap="round" className="animate-pulse-cyan" />

          </svg>
          {/* Orbiting dot */}
          <span className="absolute left-1/2 top-0 w-4 h-4 -translate-x-1/2 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full shadow-lg animate-orbit" />
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
        @keyframes pulse-green {
          0%, 100% { stroke: #34d399; opacity: 1; }
          50% { stroke: #10b981; opacity: 0.6; }
        }
        .animate-pulse-green {
          animation: pulse-green 1.5s infinite;
        }
        @keyframes pulse-cyan {
          0%, 100% { stroke: #06b6d4; opacity: 1; }
          50% { stroke: #22d3ee; opacity: 0.6; }
        }
        .animate-pulse-cyan {
          animation: pulse-cyan 1.2s infinite;
        }
        @keyframes pulse-purple {
          0%, 100% { stroke: #a78bfa; opacity: 1; }
          50% { stroke: #c4b5fd; opacity: 0.6; }
        }
        .animate-pulse-purple {
          animation: pulse-purple 1.8s infinite;
        }
        @keyframes orbit {
          0% { transform: rotate(0deg) translateY(-36px) scale(1); }
          50% { transform: rotate(180deg) translateY(-36px) scale(1.2); }
          100% { transform: rotate(360deg) translateY(-36px) scale(1); }
        }
        .animate-orbit {
          transform-origin: 50% 50%;
          animation: orbit 2s linear infinite;
        }
      `}</style>
    </div>
  )
}
