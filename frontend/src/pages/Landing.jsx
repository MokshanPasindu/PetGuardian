// src/pages/Landing.jsx
import { Link } from 'react-router-dom'
import { FiArrowRight, FiCpu, FiMapPin, FiShield, FiHeart, FiSmartphone, FiMessageCircle } from 'react-icons/fi'
import MainLayout from '../layouts/MainLayout'

const features = [
  {
    icon: FiCpu,
    title: 'AI Skin Analysis',
    description: 'Upload a photo and get instant AI-powered preliminary screening for common pet skin diseases.',
    color: 'from-blue-500 to-blue-600',
  },
  {
    icon: FiMapPin,
    title: 'Vet Connect',
    description: 'Find nearby veterinary clinics instantly with real-time availability and directions.',
    color: 'from-emerald-500 to-emerald-600',
  },
  {
    icon: FiShield,
    title: 'Digital Health Passport',
    description: 'Centralized medical records, vaccination schedules, and health history for every pet.',
    color: 'from-purple-500 to-purple-600',
  },
  {
    icon: FiSmartphone,
    title: 'QR Safety Tags',
    description: 'Generate unique QR codes for your pets. Anyone who finds them can access emergency info.',
    color: 'from-orange-500 to-orange-600',
  },
  {
    icon: FiMessageCircle,
    title: 'Smart Chatbot',
    description: 'Get instant answers to common pet care questions and preventive care advice.',
    color: 'from-pink-500 to-pink-600',
  },
  {
    icon: FiHeart,
    title: 'Community Portal',
    description: 'Connect with other pet owners, share experiences, and get peer support.',
    color: 'from-teal-500 to-teal-600',
  },
]

const steps = [
  { step: '01', title: 'Create Account', desc: 'Sign up and create profiles for your pets with all their details.' },
  { step: '02', title: 'Upload Image', desc: 'Take a photo of the affected area and upload it for AI analysis.' },
  { step: '03', title: 'Get Results', desc: 'Receive instant predictions with severity levels and recommendations.' },
  { step: '04', title: 'Take Action', desc: 'Follow guidance, find vets, and keep records — all in one place.' },
]

export default function Landing() {
  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-accent-50
                        dark:from-gray-950 dark:via-gray-900 dark:to-gray-950" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary-200/30 dark:bg-primary-900/10
                        rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent-200/30 dark:bg-accent-900/10
                        rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-36">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full
                              bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400
                              text-sm font-medium mb-6">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                AI-Powered Pet Healthcare
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold font-display
                             text-gray-900 dark:text-white leading-tight mb-6">
                Protect Your Pet with
                <span className="gradient-text block">Intelligent Care</span>
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-lg">
                AI-powered skin disease detection, digital health records, emergency vet discovery,
                and QR-based pet identification — all in one beautiful platform.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/register" className="btn-primary text-center !px-8 !py-4 text-base">
                  Get Started Free <FiArrowRight className="inline ml-2 w-5 h-5" />
                </Link>
                <a href="#features" className="btn-secondary text-center !px-8 !py-4 text-base">
                  Explore Features
                </a>
              </div>

              {/* Social Proof */}
              <div className="flex items-center gap-6 mt-10 pt-10 border-t border-gray-200 dark:border-gray-800">
                <div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">10K+</div>
                  <div className="text-sm text-gray-500">Happy Pets</div>
                </div>
                <div className="w-px h-10 bg-gray-200 dark:bg-gray-800" />
                <div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">95%</div>
                  <div className="text-sm text-gray-500">AI Accuracy</div>
                </div>
                <div className="w-px h-10 bg-gray-200 dark:bg-gray-800" />
                <div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">500+</div>
                  <div className="text-sm text-gray-500">Vet Clinics</div>
                </div>
              </div>
            </div>

            {/* Hero Visual */}
            <div className="hidden lg:flex justify-center">
              <div className="relative">
                <div className="w-96 h-96 bg-gradient-to-br from-primary-400 to-accent-500 rounded-3xl
                                rotate-6 opacity-20 absolute -inset-6" />
                <div className="relative w-96 h-96 bg-gradient-to-br from-primary-500 via-primary-600 to-accent-600
                                rounded-3xl overflow-hidden shadow-2xl flex items-center justify-center">
                  <div className="text-center text-white">
                    <div className="text-9xl animate-bounce-gentle mb-4">🐾</div>
                    <p className="text-xl font-bold">PetGuardian</p>
                    <p className="text-sm text-white/70">Your pet's health companion</p>
                  </div>
                </div>
                {/* Floating badges */}
                <div className="absolute -top-4 -right-4 bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-xl animate-float">
                  <div className="text-3xl mb-1">🔬</div>
                  <div className="text-xs font-bold">AI Analysis</div>
                </div>
                <div className="absolute -bottom-4 -left-4 bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-xl animate-float"
                  style={{ animationDelay: '2s' }}>
                  <div className="text-3xl mb-1">📋</div>
                  <div className="text-xs font-bold">Health Records</div>
                </div>
                <div className="absolute top-1/2 -right-8 bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-xl animate-float"
                  style={{ animationDelay: '4s' }}>
                  <div className="text-3xl mb-1">📍</div>
                  <div className="text-xs font-bold">Vet Connect</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="section-title mb-4">
              Everything Your Pet <span className="gradient-text">Needs</span>
            </h2>
            <p className="section-subtitle">
              Comprehensive tools designed to make pet healthcare management simple, smart, and accessible.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <div key={i}
                className="group p-8 rounded-2xl border border-gray-200 dark:border-gray-800
                           hover:border-primary-200 dark:hover:border-primary-800
                           bg-white dark:bg-gray-900 card-hover">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color}
                                flex items-center justify-center mb-6 shadow-lg
                                group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-gray-50 dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="section-title mb-4">
              How It <span className="gradient-text">Works</span>
            </h2>
            <p className="section-subtitle">
              Get started in minutes with our simple four-step process.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, i) => (
              <div key={i} className="relative text-center">
                <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center
                                text-white text-2xl font-bold mx-auto mb-6 shadow-lg shadow-primary-500/30">
                  {step.step}
                </div>
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-[60%] w-[80%]
                                  border-t-2 border-dashed border-primary-200 dark:border-primary-800" />
                )}
                <h3 className="text-lg font-bold mb-2">{step.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 gradient-primary opacity-95" />
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
          <div className="absolute bottom-10 right-10 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-display text-white mb-6">
            Ready to Give Your Pet the Best Care?
          </h2>
          <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
            Join thousands of pet owners who trust PetGuardian for smarter pet health management.
          </p>
          <Link to="/register"
            className="inline-flex items-center gap-2 px-10 py-4 bg-white text-primary-600 font-bold
                       rounded-xl hover:bg-gray-100 transform hover:scale-105 transition-all duration-200
                       shadow-2xl text-lg">
            Start Free Today <FiArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </MainLayout>
  )
}