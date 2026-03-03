// src/pages/auth/Register.jsx
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { motion } from 'framer-motion'
import { FiUser, FiMail, FiLock, FiPhone, FiArrowRight } from 'react-icons/fi'
import { FcGoogle } from 'react-icons/fc'
import { useAuth } from '../../hooks/useAuth'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import Select from '../../components/common/Select'

const Register = () => {
  const { register: registerUser, loading } = useAuth()
  const [step, setStep] = useState(1)
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm()

  const password = watch('password')

  const onSubmit = async (data) => {
    try {
      await registerUser(data)
    } catch (error) {
      // Error handled in auth context
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Image */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-primary-500 to-primary-600 p-12 items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10" />
        <div className="relative z-10 text-center text-white">
          <img
            src="https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=500&h=500&fit=crop"
            alt="Happy dog"
            className="w-80 h-80 rounded-3xl object-cover shadow-2xl mx-auto mb-8"
          />
          <h2 className="text-3xl font-display font-bold mb-4">
            Join the PetGuardian Family
          </h2>
          <p className="text-primary-100 max-w-md mx-auto">
            Create your account and start managing your pet's health with AI-powered tools,
            digital records, and emergency services.
          </p>
          <div className="mt-8 flex items-center justify-center gap-4">
              {[1, 2].map((s) => (
              <div
                key={s}
                className={`w-3 h-3 rounded-full transition-colors ${
                  step >= s ? 'bg-white' : 'bg-white/30'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <Link to="/" className="flex items-center gap-2 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
              <span className="text-white font-bold text-xl">🐾</span>
            </div>
            <span className="text-2xl font-display font-bold text-gray-900 dark:text-white">
              PetGuardian
            </span>
          </Link>

          <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white mb-2">
            Create your account
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Start your journey to better pet health management
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-5"
              >
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="First Name"
                    placeholder="John"
                    error={errors.firstName?.message}
                    {...register('firstName', {
                      required: 'First name is required',
                    })}
                  />
                  <Input
                    label="Last Name"
                    placeholder="Doe"
                    error={errors.lastName?.message}
                    {...register('lastName', {
                      required: 'Last name is required',
                    })}
                  />
                </div>

                <Input
                  label="Email"
                  type="email"
                  icon={FiMail}
                  placeholder="you@example.com"
                  error={errors.email?.message}
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: 'Please enter a valid email',
                    },
                  })}
                />

                <Input
                  label="Phone Number"
                  type="tel"
                  icon={FiPhone}
                  placeholder="+1 (555) 000-0000"
                  error={errors.phone?.message}
                  {...register('phone', {
                    required: 'Phone number is required',
                  })}
                />

                <Button
                  type="button"
                  className="w-full"
                  onClick={() => setStep(2)}
                  icon={FiArrowRight}
                  iconPosition="right"
                >
                  Continue
                </Button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-5"
              >
                <Input
                  label="Password"
                  type="password"
                  icon={FiLock}
                  placeholder="••••••••"
                  helperText="At least 8 characters with uppercase, lowercase, and number"
                  error={errors.password?.message}
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 8,
                      message: 'Password must be at least 8 characters',
                    },
                    pattern: {
                      value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                      message: 'Password must contain uppercase, lowercase, and number',
                    },
                  })}
                />

                <Input
                  label="Confirm Password"
                  type="password"
                  icon={FiLock}
                  placeholder="••••••••"
                  error={errors.confirmPassword?.message}
                  {...register('confirmPassword', {
                    required: 'Please confirm your password',
                    validate: (value) =>
                      value === password || 'Passwords do not match',
                  })}
                />

                <div className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    id="terms"
                    className="w-4 h-4 mt-1 rounded border-gray-300 text-primary-500 focus:ring-primary-500"
                    {...register('terms', {
                      required: 'You must accept the terms and conditions',
                    })}
                  />
                  <label
                    htmlFor="terms"
                    className="text-sm text-gray-600 dark:text-gray-400"
                  >
                    I agree to the{' '}
                    <Link to="/terms" className="text-primary-600 hover:underline">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link to="/privacy" className="text-primary-600 hover:underline">
                      Privacy Policy
                    </Link>
                  </label>
                </div>
                {errors.terms && (
                  <p className="text-sm text-danger-500">{errors.terms.message}</p>
                )}

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="secondary"
                    className="flex-1"
                    onClick={() => setStep(1)}
                  >
                    Back
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1"
                    loading={loading}
                    icon={FiArrowRight}
                    iconPosition="right"
                  >
                    Create Account
                  </Button>
                </div>
              </motion.div>
            )}
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-gray-700" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-gray-900 text-gray-500">
                  Or continue with
                </span>
              </div>
            </div>

            <button className="mt-4 w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              <FcGoogle className="w-5 h-5" />
              <span className="font-medium text-gray-700 dark:text-gray-300">
                Google
              </span>
            </button>
          </div>

          <p className="mt-8 text-center text-gray-600 dark:text-gray-400">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-primary-600 hover:text-primary-500 font-medium"
            >
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}

export default Register