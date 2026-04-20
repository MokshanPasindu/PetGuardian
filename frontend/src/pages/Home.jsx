// src/pages/Home.jsx
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import {
  FiCamera,
  FiMapPin,
  FiHeart,
  FiShield,
  FiUsers,
  FiMessageCircle,
  FiCheck,
  FiArrowRight,
  FiStar,
  FiPlay,
} from 'react-icons/fi'
import { useAuth } from '../hooks/useAuth'
import Button from '../components/common/Button'

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
}

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const features = [
  {
    icon: FiCamera,
    title: 'AI Skin Analysis',
    description:
      'Upload a photo of your pet\'s skin condition and get instant AI-powered preliminary assessment with severity levels.',
    color: 'bg-blue-500',
  },
  {
    icon: FiHeart,
    title: 'Digital Health Passport',
    description:
      'Keep all your pet\'s medical records, vaccinations, and health history in one secure, accessible place.',
    color: 'bg-pink-500',
  },
  {
    icon: FiMapPin,
    title: 'Vet Connect',
    description:
      'Find nearby veterinary clinics instantly, especially during emergencies with real-time availability.',
    color: 'bg-green-500',
  },
  {
    icon: FiShield,
    title: 'QR Pet ID',
    description:
      'Generate unique QR codes for your pets that link to emergency contact info for quick recovery if lost.',
    color: 'bg-purple-500',
  },
  {
    icon: FiUsers,
    title: 'Pet Community',
    description:
      'Connect with other pet owners, share experiences, and get advice from the community.',
    color: 'bg-orange-500',
  },
  {
    icon: FiMessageCircle,
    title: 'AI Chatbot',
    description:
      'Get instant answers to common pet care questions with our intelligent chatbot assistant.',
    color: 'bg-teal-500',
  },
]

const testimonials = [
  {
    name: 'Sarah Johnson',
    role: 'Dog Owner',
    image: 'https://randomuser.me/api/portraits/women/1.jpg',
    content:
      'PetGuardian helped me identify a skin condition on my Golden Retriever early. The AI scan suggested it could be serious, and my vet confirmed it. Early detection made all the difference!',
    rating: 5,
  },
  {
    name: 'Michael Chen',
    role: 'Cat Parent',
    image: 'https://randomuser.me/api/portraits/men/2.jpg',
    content:
      'The digital health passport is a game-changer. I no longer have to carry paper records to every vet visit. Everything is organized and accessible.',
    rating: 5,
  },
  {
    name: 'Emily Rodriguez',
    role: 'Multi-Pet Owner',
    image: 'https://randomuser.me/api/portraits/women/3.jpg',
    content:
      'Managing health records for 3 pets was overwhelming until I found PetGuardian. The QR tags have already helped my cat get home safely once!',
    rating: 5,
  },
]

const stats = [
  { value: '50K+', label: 'Happy Pets' },
  { value: '10K+', label: 'AI Scans' },
  { value: '5K+', label: 'Vets Listed' },
  { value: '98%', label: 'Satisfaction' },
]

const Home = () => {
  const { isAuthenticated } = useAuth()
  const [heroRef, heroInView] = useInView({ triggerOnce: true, threshold: 0.1 })
  const [featuresRef, featuresInView] = useInView({ triggerOnce: true, threshold: 0.1 })
  const [statsRef, statsInView] = useInView({ triggerOnce: true, threshold: 0.1 })
  const [testimonialsRef, testimonialsInView] = useInView({ triggerOnce: true, threshold: 0.1 })

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
                <span className="text-white font-bold text-xl">🐾</span>
              </div>
              <span className="text-2xl font-display font-bold text-gray-900 dark:text-white">
                PetGuardian
              </span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-gray-600 dark:text-gray-400 hover:text-primary-500 transition-colors">
                Features
              </a>
              <a href="#how-it-works" className="text-gray-600 dark:text-gray-400 hover:text-primary-500 transition-colors">
                How it Works
              </a>
              <a href="#testimonials" className="text-gray-600 dark:text-gray-400 hover:text-primary-500 transition-colors">
                Testimonials
              </a>
            </div>
            <div className="flex items-center gap-3">
              {isAuthenticated ? (
                <Link to="/dashboard">
                  <Button>Go to Dashboard</Button>
                </Link>
              ) : (
                <>
                  <Link to="/login">
                    <Button variant="ghost">Sign In</Button>
                  </Link>
                  <Link to="/register">
                    <Button>Get Started</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section
        ref={heroRef}
        className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden"
      >
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="initial"
            animate={heroInView ? 'animate' : 'initial'}
            variants={staggerContainer}
            className="grid lg:grid-cols-2 gap-12 items-center"
          >
            <motion.div variants={fadeInUp}>
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 text-sm font-medium mb-6">
                <FiShield className="w-4 h-4" />
                AI-Powered Pet Healthcare
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-gray-900 dark:text-white leading-tight mb-6">
                Your Pet's Health,{' '}
                <span className="text-gradient">Simplified</span>
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-lg">
                AI-powered preliminary screening, digital health records, emergency vet discovery, 
                and smart pet identification — all in one platform.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Link to="/register">
                  <Button size="lg" icon={FiArrowRight} iconPosition="right">
                    Start Free Trial
                  </Button>
                </Link>
                <Button variant="secondary" size="lg" icon={FiPlay}>
                  Watch Demo
                </Button>
              </div>
              <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <FiCheck className="w-5 h-5 text-primary-500" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center gap-2">
                  <FiCheck className="w-5 h-5 text-primary-500" />
                  <span>Free forever plan</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              variants={fadeInUp}
              className="relative"
            >
              <div className="relative z-10">
                <img
                  src="https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600&h=700&fit=crop"
                  alt="Happy dog"
                  className="rounded-3xl shadow-2xl"
                />
                {/* Floating Cards */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                  className="absolute -left-8 top-1/4 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 flex items-center gap-3"
                >
                  <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <FiCheck className="w-6 h-6 text-green-500" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">Scan Complete</p>
                    <p className="text-sm text-gray-500">No issues detected</p>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 }}
                  className="absolute -right-4 bottom-1/4 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white text-sm font-bold">
                      AI
                    </div>
                    <span className="font-semibold text-gray-900 dark:text-white">98% Accuracy</span>
                  </div>
                  <div className="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div className="w-[98%] h-full bg-primary-500 rounded-full" />
                  </div>
                </motion.div>
              </div>
              {/* Background decoration */}
              <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-br from-primary-100 to-accent-100 dark:from-primary-900/20 dark:to-accent-900/20 rounded-full blur-3xl opacity-60" />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section ref={statsRef} className="py-16 bg-gray-50 dark:bg-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="initial"
            animate={statsInView ? 'animate' : 'initial'}
            variants={staggerContainer}
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {stats.map((stat) => (
              <motion.div
                key={stat.label}
                variants={fadeInUp}
                className="text-center"
              >
                <p className="text-4xl md:text-5xl font-display font-bold text-primary-500 mb-2">
                  {stat.value}
                </p>
                <p className="text-gray-600 dark:text-gray-400">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section ref={featuresRef} id="features" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="initial"
            animate={featuresInView ? 'animate' : 'initial'}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.span
              variants={fadeInUp}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 text-sm font-medium mb-4"
            >
              Features
            </motion.span>
            <motion.h2
              variants={fadeInUp}
              className="text-3xl md:text-4xl font-display font-bold text-gray-900 dark:text-white mb-4"
            >
              Everything Your Pet Needs
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto"
            >
              Comprehensive tools to keep your furry friends healthy and safe
            </motion.p>
          </motion.div>

          <motion.div
            initial="initial"
            animate={featuresInView ? 'animate' : 'initial'}
            variants={staggerContainer}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {features.map((feature) => (
              <motion.div
                key={feature.title}
                variants={fadeInUp}
                className="group bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-soft hover:shadow-medium transition-all duration-300 hover:-translate-y-1"
              >
                <div
                  className={`w-14 h-14 ${feature.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                >
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-800/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 text-sm font-medium mb-4">
              How It Works
            </span>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 dark:text-white mb-4">
              Simple Steps to Better Pet Care
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Create Pet Profile',
                description: 'Add your pets with basic info, photos, and medical history.',
              },
              {
                step: '02',
                title: 'Use AI Scan',
                description: 'Upload photos of any concerning skin conditions for instant analysis.',
              },
              {
                step: '03',
                title: 'Get Recommendations',
                description: 'Receive severity-based guidance and find nearby vets if needed.',
              },
            ].map((item, index) => (
              <div key={item.step} className="relative">
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-soft">
                  <span className="text-6xl font-display font-bold text-primary-100 dark:text-primary-900/30">
                    {item.step}
                  </span>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 -mt-4">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {item.description}
                  </p>
                </div>
                {index < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 w-8 text-primary-300">
                    <FiArrowRight className="w-8 h-8" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section ref={testimonialsRef} id="testimonials" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="initial"
            animate={testimonialsInView ? 'animate' : 'initial'}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.span
              variants={fadeInUp}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 text-sm font-medium mb-4"
            >
              Testimonials
            </motion.span>
            <motion.h2
              variants={fadeInUp}
              className="text-3xl md:text-4xl font-display font-bold text-gray-900 dark:text-white mb-4"
            >
              Loved by Pet Parents
            </motion.h2>
          </motion.div>

          <motion.div
            initial="initial"
            animate={testimonialsInView ? 'animate' : 'initial'}
            variants={staggerContainer}
            className="grid md:grid-cols-3 gap-8"
          >
            {testimonials.map((testimonial) => (
              <motion.div
                key={testimonial.name}
                variants={fadeInUp}
                className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-soft"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <FiStar key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  "{testimonial.content}"
                </p>
                <div className="flex items-center gap-3">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {testimonial.name}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {testimonial.role}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-3xl p-8 md:p-12 text-center text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10" />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
                Ready to Give Your Pet the Best Care?
              </h2>
              <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
                Join thousands of pet parents who trust PetGuardian for their pet's health and safety.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/register">
                  <Button
                    size="lg"
                    className="bg-white text-primary-600 hover:bg-primary-50"
                    icon={FiArrowRight}
                    iconPosition="right"
                  >
                    Get Started Free
                  </Button>
                </Link>
                <Link to="/login">
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-white text-white hover:bg-white/10"
                  >
                    Sign In
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
                  <span className="text-white font-bold text-xl">🐾</span>
                </div>
                <span className="text-2xl font-display font-bold">PetGuardian</span>
              </div>
              <p className="text-gray-400 max-w-md">
                AI-powered pet health and safety system providing preliminary screening, 
                digital health records, and emergency veterinary discovery.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>© {new Date().getFullYear()} PetGuardian. All rights reserved.</p>
            <p className="text-sm mt-2">
              ⚠️ This system provides preliminary screening only and does not replace professional veterinary diagnosis.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Home