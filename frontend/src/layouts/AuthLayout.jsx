// src/layouts/AuthLayout.jsx
import { Link } from 'react-router-dom'

export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          <Link to="/" className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-lg shadow-primary-500/30">
              <span className="text-white text-lg">🐾</span>
            </div>
            <span className="text-xl font-bold font-display gradient-text">PetGuardian</span>
          </Link>
          {children}
        </div>
      </div>

      {/* Right Panel - Decoration */}
      <div className="hidden lg:flex flex-1 items-center justify-center
                       bg-gradient-to-br from-primary-500 via-primary-600 to-accent-600 p-12 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-accent-400/10 rounded-full blur-3xl" />
        </div>
        <div className="relative text-center text-white z-10">
          <div className="text-8xl mb-8 animate-float">🐾</div>
          <h2 className="text-4xl font-bold font-display mb-4">Protect What Matters</h2>
          <p className="text-lg text-white/80 max-w-md">
            AI-powered pet health monitoring, instant vet discovery, and digital health records — all in one place.
          </p>
          <div className="grid grid-cols-3 gap-6 mt-12">
            <div className="bg-white/10 backdrop-blur rounded-2xl p-4">
              <div className="text-3xl font-bold">10K+</div>
              <div className="text-sm text-white/70">Happy Pets</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-2xl p-4">
              <div className="text-3xl font-bold">95%</div>
              <div className="text-sm text-white/70">Accuracy</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-2xl p-4">
              <div className="text-3xl font-bold">500+</div>
              <div className="text-sm text-white/70">Vet Clinics</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}