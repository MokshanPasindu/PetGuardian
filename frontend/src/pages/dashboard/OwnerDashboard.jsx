// src/pages/dashboard/OwnerDashboard.jsx
import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  FiHeart,
  FiCamera,
  FiCalendar,
  FiMapPin,
  FiPlus,
  FiArrowRight,
  FiAlertTriangle,
  FiTrendingUp,
  FiClock,
  FiFileText,
  FiCheckCircle,
  FiActivity,
  FiGrid,
} from 'react-icons/fi'
import { useAuth } from '../../hooks/useAuth'
import { usePets } from '../../hooks/usePets'
import { useHealth } from '../../hooks/useHealth'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import Badge from '../../components/common/Badge'
import LoadingSpinner, {
  LoadingPage,
} from '../../components/common/LoadingSpinner'
import EmptyState from '../../components/common/EmptyState'
import PetCard from '../../components/pet/PetCard'
import { formatDate, formatRelativeTime } from '../../utils/helpers'
import { healthService } from '../../services/healthService'

// ─── Pet Health Summary Card ───────────────────────────────────────────────
const PetHealthSummaryCard = ({ pet }) => {
  const [summary, setSummary] = useState(null)
  const [summaryLoading, setSummaryLoading] = useState(true)

  useEffect(() => {
    const loadSummary = async () => {
      try {
        setSummaryLoading(true)
        const data = await healthService.getHealthSummary(pet.id)
        setSummary(data)
      } catch {
        // no summary yet - that's okay
      } finally {
        setSummaryLoading(false)
      }
    }
    loadSummary()
  }, [pet.id])

  const hasAlerts =
    summary?.overdueVaccinations > 0 || summary?.upcomingVaccinations > 0

  return (
    <Link to={`/health/${pet.id}`}>
      <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all group cursor-pointer">
        {/* Pet Image */}
        <div className="relative flex-shrink-0">
          <img
            src={
              pet.image ||
              `https://ui-avatars.com/api/?name=${pet.name}&background=22c55e&color=fff`
            }
            alt={pet.name}
            className="w-12 h-12 rounded-xl object-cover"
          />
          {hasAlerts && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
              <FiAlertTriangle className="w-2.5 h-2.5 text-white" />
            </span>
          )}
        </div>

        {/* Pet Info */}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">
            {pet.name}
          </p>
          {summaryLoading ? (
            <div className="h-3 w-20 bg-gray-200 dark:bg-gray-600 rounded animate-pulse mt-1" />
          ) : summary ? (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {summary.totalRecords} record
              {summary.totalRecords !== 1 ? 's' : ''}
              {summary.overdueVaccinations > 0 && (
                <span className="text-red-500 ml-1">
                  • {summary.overdueVaccinations} overdue
                </span>
              )}
            </p>
          ) : (
            <p className="text-xs text-gray-400">No records yet</p>
          )}
        </div>

        {/* Status Badge */}
        <div className="flex-shrink-0">
          {summaryLoading ? (
            <div className="w-16 h-5 bg-gray-200 dark:bg-gray-600 rounded-full animate-pulse" />
          ) : summary?.overdueVaccinations > 0 ? (
            <Badge variant="danger" size="sm">
              Overdue
            </Badge>
          ) : summary?.upcomingVaccinations > 0 ? (
            <Badge variant="warning" size="sm">
              Due Soon
            </Badge>
          ) : (
            <Badge variant="success" size="sm">
              Healthy
            </Badge>
          )}
        </div>
      </div>
    </Link>
  )
}

// ─── Upcoming Vaccination Item ─────────────────────────────────────────────
const UpcomingVaccinationItem = ({ vaccination, petName }) => {
  const isOverdue = vaccination.status === 'OVERDUE'
  const isUpcoming = vaccination.status === 'UPCOMING'

  return (
    <div
      className={`flex items-center gap-3 p-3 rounded-xl border-l-4 ${
        isOverdue
          ? 'border-l-red-500 bg-red-50 dark:bg-red-900/10'
          : 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-900/10'
      }`}
    >
      <div
        className={`p-2 rounded-lg flex-shrink-0 ${
          isOverdue
            ? 'bg-red-100 dark:bg-red-900/30'
            : 'bg-yellow-100 dark:bg-yellow-900/30'
        }`}
      >
        {isOverdue ? (
          <FiAlertTriangle
            className={`w-4 h-4 ${
              isOverdue ? 'text-red-500' : 'text-yellow-500'
            }`}
          />
        ) : (
          <FiClock className="w-4 h-4 text-yellow-500" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900 dark:text-white text-sm">
          {vaccination.name}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {petName} •{' '}
          {isOverdue ? 'Was due' : 'Due'} {formatDate(vaccination.nextDueDate)}
        </p>
      </div>
      <Badge variant={isOverdue ? 'danger' : 'warning'} size="sm">
        {isOverdue ? 'Overdue' : 'Soon'}
      </Badge>
    </div>
  )
}

// ─── Main Dashboard ────────────────────────────────────────────────────────
const OwnerDashboard = () => {
  const { user } = useAuth()
  const { pets, fetchPets, loading: petsLoading } = usePets()

  // Aggregated health data across all pets
  const [allSummaries, setAllSummaries] = useState([])
  const [allVaccinations, setAllVaccinations] = useState([]) // [{vac, petName}]
  const [allRecentRecords, setAllRecentRecords] = useState([]) // [{record, petName}]
  const [healthLoading, setHealthLoading] = useState(false)

  // Computed stats from real data
  const [dashStats, setDashStats] = useState({
    totalPets: 0,
    upcomingVaccinations: 0,
    overdueVaccinations: 0,
    totalRecords: 0,
  })

  // Load pets on mount
  useEffect(() => {
    fetchPets()
  }, [fetchPets])

  // Load health data for ALL pets once pets are loaded
  useEffect(() => {
    if (pets.length === 0) return

    const loadAllHealthData = async () => {
      setHealthLoading(true)
      try {
        // Fetch summary + vaccinations for each pet in parallel
        const results = await Promise.allSettled(
          pets.map(async (pet) => {
            const [summary, vaccinations] = await Promise.allSettled([
              healthService.getHealthSummary(pet.id),
              healthService.getVaccinations(pet.id),
            ])
            return {
              pet,
              summary:
                summary.status === 'fulfilled' ? summary.value : null,
              vaccinations:
                vaccinations.status === 'fulfilled'
                  ? vaccinations.value
                  : [],
            }
          })
        )

        const successfulResults = results
          .filter((r) => r.status === 'fulfilled')
          .map((r) => r.value)

        // Set summaries
        setAllSummaries(successfulResults.map((r) => r.summary))

        // Flatten all vaccinations with pet name
        const flatVaccinations = successfulResults.flatMap(({ pet, vaccinations }) =>
          vaccinations.map((vac) => ({ vac, petName: pet.name, petId: pet.id }))
        )
        setAllVaccinations(flatVaccinations)

        // Flatten and sort recent records
        const flatRecords = successfulResults.flatMap(({ pet, summary }) =>
          (summary?.recentRecords || []).map((record) => ({
            record,
            petName: pet.name,
            petId: pet.id,
          }))
        )
        // Sort by date descending
        flatRecords.sort(
          (a, b) => new Date(b.record.date) - new Date(a.record.date)
        )
        setAllRecentRecords(flatRecords)

        // Compute aggregated stats
        const totalRecords = successfulResults.reduce(
          (sum, r) => sum + (r.summary?.totalRecords || 0),
          0
        )
        const upcomingVaccinations = flatVaccinations.filter(
          ({ vac }) => vac.status === 'UPCOMING'
        ).length
        const overdueVaccinations = flatVaccinations.filter(
          ({ vac }) => vac.status === 'OVERDUE'
        ).length

        setDashStats({
          totalPets: pets.length,
          upcomingVaccinations,
          overdueVaccinations,
          totalRecords,
        })
      } catch (error) {
        console.error('Failed to load health data:', error)
      } finally {
        setHealthLoading(false)
      }
    }

    loadAllHealthData()
  }, [pets])

  // Vaccinations that need attention (overdue + upcoming)
  const attentionVaccinations = allVaccinations
    .filter(({ vac }) => vac.status === 'OVERDUE' || vac.status === 'UPCOMING')
    .sort((a, b) => {
      // Overdue first, then by date
      if (a.vac.status === 'OVERDUE' && b.vac.status !== 'OVERDUE') return -1
      if (a.vac.status !== 'OVERDUE' && b.vac.status === 'OVERDUE') return 1
      return new Date(a.vac.nextDueDate) - new Date(b.vac.nextDueDate)
    })
    .slice(0, 5)

  const quickActions = [
    {
      icon: FiCamera,
      label: 'AI Scan',
      description: 'Analyze skin condition',
      path: '/scan',
      color: 'bg-blue-500',
    },
    {
      icon: FiPlus,
      label: 'Add Pet',
      description: 'Register new pet',
      path: '/pets/add',
      color: 'bg-green-500',
    },
    {
      icon: FiMapPin,
      label: 'Find Vet',
      description: 'Nearby clinics',
      path: '/vets',
      color: 'bg-purple-500',
    },
    {
      icon: FiCalendar,
      label: 'Appointments',
      description: 'Schedule visit',
      path: '/appointments',
      color: 'bg-orange-500',
    },
  ]

  if (petsLoading) {
    return <LoadingPage message="Loading your dashboard..." />
  }

  // ── Greeting based on time of day ──────────────────────────────────────
  const hour = new Date().getHours()
  const greeting =
    hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="space-y-6">
      {/* ── Welcome Header ──────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-primary-500 via-primary-600 to-primary-700 rounded-2xl p-6 md:p-8 text-white overflow-hidden relative"
      >
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-1/3 w-32 h-32 bg-white/5 rounded-full translate-y-1/2" />

        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <p className="text-primary-200 text-sm font-medium mb-1">
              {greeting}!
            </p>
            <h1 className="text-2xl md:text-3xl font-display font-bold mb-2">
              Welcome back, {user?.firstName || user?.name?.split(' ')[0]}!{' '}
              👋
            </h1>
            <p className="text-primary-100">
              {pets.length === 0
                ? "Get started by adding your first pet."
                : `You're caring for ${pets.length} pet${pets.length !== 1 ? 's' : ''}.`}
              {dashStats.overdueVaccinations > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-red-500/80 rounded-full text-xs font-semibold">
                  ⚠️ {dashStats.overdueVaccinations} overdue vaccination
                  {dashStats.overdueVaccinations > 1 ? 's' : ''}
                </span>
              )}
            </p>
          </div>
          <Link to="/scan">
            <Button
              className="bg-white text-primary-600 hover:bg-primary-50 border-0 shadow-lg"
              icon={FiCamera}
            >
              Start AI Scan
            </Button>
          </Link>
        </div>
      </motion.div>

      {/* ── Stats Grid ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'My Pets',
            value: dashStats.totalPets,
            icon: FiHeart,
            color: 'text-pink-500',
            bg: 'bg-pink-100 dark:bg-pink-900/30',
            sub:
              dashStats.totalPets === 0
                ? 'Add your first pet'
                : `${dashStats.totalPets} registered`,
            path: '/pets',
          },
          {
            label: 'Health Records',
            value: healthLoading ? '...' : dashStats.totalRecords,
            icon: FiFileText,
            color: 'text-blue-500',
            bg: 'bg-blue-100 dark:bg-blue-900/30',
            sub: 'Across all pets',
            path: '/pets',
          },
          {
            label: 'Vaccinations Due',
            value: healthLoading
              ? '...'
              : dashStats.upcomingVaccinations + dashStats.overdueVaccinations,
            icon: FiCalendar,
            color:
              dashStats.overdueVaccinations > 0
                ? 'text-red-500'
                : dashStats.upcomingVaccinations > 0
                ? 'text-yellow-500'
                : 'text-green-500',
            bg:
              dashStats.overdueVaccinations > 0
                ? 'bg-red-100 dark:bg-red-900/30'
                : dashStats.upcomingVaccinations > 0
                ? 'bg-yellow-100 dark:bg-yellow-900/30'
                : 'bg-green-100 dark:bg-green-900/30',
            sub:
              dashStats.overdueVaccinations > 0
                ? `${dashStats.overdueVaccinations} overdue!`
                : dashStats.upcomingVaccinations > 0
                ? `${dashStats.upcomingVaccinations} due soon`
                : 'All up to date ✓',
            path: '/pets',
          },
          {
            label: 'AI Scans',
            value: '—',
            icon: FiCamera,
            color: 'text-purple-500',
            bg: 'bg-purple-100 dark:bg-purple-900/30',
            sub: 'View scan history',
            path: '/scan/history',
          },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Link to={stat.path}>
              <Card className="h-full hover:shadow-medium transition-shadow cursor-pointer">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                      {stat.label}
                    </p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                      {stat.value}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 flex items-center gap-1">
                      <FiTrendingUp className="w-3 h-3" />
                      {stat.sub}
                    </p>
                  </div>
                  <div className={`p-3 rounded-xl ${stat.bg} flex-shrink-0`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* ── Quick Actions ────────────────────────────────────────────── */}
      <Card>
        <Card.Header>
          <Card.Title>Quick Actions</Card.Title>
        </Card.Header>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <Link
              key={action.label}
              to={action.path}
              className="group flex flex-col items-center p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
            >
              <div
                className={`w-12 h-12 ${action.color} rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-sm`}
              >
                <action.icon className="w-6 h-6 text-white" />
              </div>
              <p className="font-medium text-gray-900 dark:text-white text-sm">
                {action.label}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                {action.description}
              </p>
            </Link>
          ))}
        </div>
      </Card>

      {/* ── Overdue / Urgent Alert Banner ───────────────────────────── */}
      {dashStats.overdueVaccinations > 0 && !healthLoading && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Card className="border-l-4 border-l-red-500 bg-red-50 dark:bg-red-900/10">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-xl flex-shrink-0">
                <FiAlertTriangle className="w-6 h-6 text-red-500" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-red-800 dark:text-red-400 mb-1">
                  Action Required: Overdue Vaccinations
                </h3>
                <p className="text-red-700 dark:text-red-300 text-sm mb-3">
                  {dashStats.overdueVaccinations} vaccination
                  {dashStats.overdueVaccinations > 1 ? 's are' : ' is'} overdue
                  across your pets. Schedule a vet visit as soon as possible.
                </p>
                <div className="flex items-center gap-3">
                  <Link to="/appointments">
                    <Button size="sm" variant="danger">
                      Book Appointment
                    </Button>
                  </Link>
                  <Link to="/vets">
                    <Button size="sm" variant="ghost">
                      Find Nearby Vet
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* ── Main Content Grid ────────────────────────────────────────── */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* ── My Pets (with health status) ─────────────────────────── */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <Card.Header>
              <Card.Title className="flex items-center gap-2">
                <FiHeart className="w-5 h-5 text-pink-500" />
                My Pets
              </Card.Title>
              <Link to="/pets">
                <Button
                  variant="ghost"
                  size="sm"
                  icon={FiArrowRight}
                  iconPosition="right"
                >
                  View All
                </Button>
              </Link>
            </Card.Header>

            {pets.length > 0 ? (
              <div className="space-y-3">
                {pets.slice(0, 5).map((pet) => (
                  <PetHealthSummaryCard key={pet.id} pet={pet} />
                ))}
                {pets.length > 5 && (
                  <Link to="/pets">
                    <p className="text-sm text-center text-primary-500 hover:underline pt-1">
                      +{pets.length - 5} more pets
                    </p>
                  </Link>
                )}
              </div>
            ) : (
              <EmptyState
                icon={FiHeart}
                title="No pets yet"
                description="Add your first pet to start tracking their health and manage their records."
                action={() => (window.location.href = '/pets/add')}
                actionLabel="Add Your First Pet"
              />
            )}

            {pets.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                <Link to="/pets/add">
                  <Button
                    variant="ghost"
                    className="w-full"
                    size="sm"
                    icon={FiPlus}
                  >
                    Add Another Pet
                  </Button>
                </Link>
              </div>
            )}
          </Card>

          {/* ── Recent Health Records ──────────────────────────────── */}
          {allRecentRecords.length > 0 && (
            <Card>
              <Card.Header>
                <Card.Title className="flex items-center gap-2">
                  <FiFileText className="w-5 h-5 text-blue-500" />
                  Recent Health Records
                </Card.Title>
              </Card.Header>

              {healthLoading ? (
                <div className="flex justify-center py-6">
                  <LoadingSpinner />
                </div>
              ) : (
                <div className="space-y-3">
                  {allRecentRecords.slice(0, 5).map(
                    ({ record, petName, petId }) => (
                      <Link
                        key={record.id}
                        to={`/health/${petId}/history`}
                      >
                        <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                          <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                            <FiFileText className="w-4 h-4 text-blue-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 dark:text-white text-sm truncate">
                              {record.title}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {petName} •{' '}
                              {formatDate(record.date)}
                              {record.vetName &&
                                ` • Dr. ${record.vetName}`}
                            </p>
                          </div>
                          <Badge
                            variant="info"
                            size="sm"
                            className="capitalize flex-shrink-0"
                          >
                            {record.type
                              ?.toLowerCase()
                              .replace('_', ' ')}
                          </Badge>
                        </div>
                      </Link>
                    )
                  )}
                </div>
              )}
            </Card>
          )}
        </div>

        {/* ── Right Sidebar ─────────────────────────────────────────── */}
        <div className="space-y-6">
          {/* ── Vaccination Alerts ──────────────────────────────────── */}
          <Card>
            <Card.Header>
              <Card.Title className="flex items-center gap-2">
                <FiCalendar className="w-5 h-5 text-purple-500" />
                Vaccination Alerts
              </Card.Title>
              {attentionVaccinations.length > 0 && (
                <Badge variant="danger" size="sm">
                  {attentionVaccinations.length} alert
                  {attentionVaccinations.length > 1 ? 's' : ''}
                </Badge>
              )}
            </Card.Header>

            {healthLoading ? (
              <div className="flex justify-center py-6">
                <LoadingSpinner />
              </div>
            ) : attentionVaccinations.length > 0 ? (
              <div className="space-y-3">
                {attentionVaccinations.map(({ vac, petName, petId }) => (
                  <Link key={vac.id} to={`/health/${petId}/vaccinations`}>
                    <UpcomingVaccinationItem
                      vaccination={vac}
                      petName={petName}
                    />
                  </Link>
                ))}
                <Link to="/appointments">
                  <Button
                    variant="primary"
                    size="sm"
                    className="w-full mt-2"
                    icon={FiCalendar}
                  >
                    Book Appointment
                  </Button>
                </Link>
              </div>
            ) : pets.length === 0 ? (
              <div className="text-center py-4">
                <FiCalendar className="w-8 h-8 mx-auto text-gray-300 dark:text-gray-600 mb-2" />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Add pets to track vaccinations
                </p>
              </div>
            ) : (
              <div className="text-center py-4">
                <FiCheckCircle className="w-8 h-8 mx-auto text-green-500 mb-2" />
                <p className="text-sm font-medium text-green-700 dark:text-green-400">
                  All vaccinations up to date!
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Great job keeping your pets healthy 🎉
                </p>
              </div>
            )}
          </Card>

          {/* ── Pet Health Overview ──────────────────────────────────── */}
          {pets.length > 0 && (
            <Card>
              <Card.Header>
                <Card.Title className="flex items-center gap-2">
                  <FiActivity className="w-5 h-5 text-green-500" />
                  Health Overview
                </Card.Title>
              </Card.Header>

              {healthLoading ? (
                <div className="flex justify-center py-6">
                  <LoadingSpinner />
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Overall status */}
                  <div
                    className={`p-3 rounded-xl text-center ${
                      dashStats.overdueVaccinations > 0
                        ? 'bg-red-50 dark:bg-red-900/10'
                        : dashStats.upcomingVaccinations > 0
                        ? 'bg-yellow-50 dark:bg-yellow-900/10'
                        : 'bg-green-50 dark:bg-green-900/10'
                    }`}
                  >
                    <p
                      className={`text-2xl font-bold ${
                        dashStats.overdueVaccinations > 0
                          ? 'text-red-600'
                          : dashStats.upcomingVaccinations > 0
                          ? 'text-yellow-600'
                          : 'text-green-600'
                      }`}
                    >
                      {dashStats.overdueVaccinations > 0
                        ? '⚠️ Needs Attention'
                        : dashStats.upcomingVaccinations > 0
                        ? '📅 Due Soon'
                        : '✅ All Good'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Overall health status
                    </p>
                  </div>

                  {/* Quick stats */}
                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div className="p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <p className="text-xl font-bold text-gray-900 dark:text-white">
                        {dashStats.totalRecords}
                      </p>
                      <p className="text-xs text-gray-500">Records</p>
                    </div>
                    <div className="p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <p className="text-xl font-bold text-gray-900 dark:text-white">
                        {allVaccinations.filter(
                          (v) => v.vac.status === 'COMPLETED'
                        ).length}
                      </p>
                      <p className="text-xs text-gray-500">Vaccinations</p>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          )}

          {/* ── Quick Links ──────────────────────────────────────────── */}
          <Card>
            <Card.Header>
              <Card.Title>Quick Links</Card.Title>
            </Card.Header>
            <div className="space-y-2">
              {[
                {
                  icon: FiGrid,
                  label: 'QR & ID Cards',
                  path: '/qr',
                  color: 'text-orange-500',
                },
                {
                  icon: FiCamera,
                  label: 'AI Scan History',
                  path: '/scan/history',
                  color: 'text-blue-500',
                },
                {
                  icon: FiMapPin,
                  label: 'Find Nearby Vets',
                  path: '/vets',
                  color: 'text-green-500',
                },
                {
                  icon: FiCalendar,
                  label: 'My Appointments',
                  path: '/appointments',
                  color: 'text-purple-500',
                },
              ].map((link) => (
                <Link key={link.label} to={link.path}>
                  <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group">
                    <link.icon
                      className={`w-5 h-5 ${link.color} flex-shrink-0`}
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white">
                      {link.label}
                    </span>
                    <FiArrowRight className="w-4 h-4 text-gray-400 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </Link>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default OwnerDashboard