import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  FiUsers, FiCalendar, FiClock, FiCheckCircle,
  FiAlertCircle, FiTrendingUp, FiActivity,
  FiCheck, FiX, FiFileText, FiEye,
} from 'react-icons/fi'
import { useAuth } from '../../hooks/useAuth'
import { vetService } from '../../services/vetService'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import Badge from '../../components/common/Badge'
import { LoadingPage } from '../../components/common/LoadingSpinner'
import { formatDate } from '../../utils/helpers'
import toast from 'react-hot-toast'

// ── Status badge ───────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const map = {
    PENDING:   { variant: 'warning', label: 'Pending' },
    CONFIRMED: { variant: 'success', label: 'Confirmed' },
    COMPLETED: { variant: 'info',    label: 'Completed' },
    CANCELLED: { variant: 'danger',  label: 'Cancelled' },
  }
  const c = map[status] ?? { variant: 'default', label: status }
  return <Badge variant={c.variant}>{c.label}</Badge>
}

const VetDashboard = () => {
  const { user } = useAuth()

  const [dashboard, setDashboard]   = useState(null)
  const [loading, setLoading]       = useState(true)
  const [actionLoading, setActionLoading] = useState(null)

  // ── Load dashboard data ────────────────────────────────────
  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true)
      const data = await vetService.getVetDashboard()
      setDashboard(data)
    } catch (err) {
      console.error('Failed to load vet dashboard:', err)
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadDashboard()
  }, [loadDashboard])

  // ── Appointment actions ────────────────────────────────────
  const handleConfirm = async (id) => {
    try {
      setActionLoading(id)
      await vetService.confirmAppointment(id)
      toast.success('Appointment confirmed!')
      loadDashboard()
    } catch {
      toast.error('Failed to confirm appointment')
    } finally {
      setActionLoading(null)
    }
  }

  const handleComplete = async (id) => {
    try {
      setActionLoading(id)
      await vetService.completeAppointment(id)
      toast.success('Appointment marked as completed!')
      loadDashboard()
    } catch {
      toast.error('Failed to complete appointment')
    } finally {
      setActionLoading(null)
    }
  }

  const handleCancel = async (id) => {
    try {
      setActionLoading(id)
      await vetService.vetCancelAppointment(id)
      toast.success('Appointment cancelled')
      loadDashboard()
    } catch {
      toast.error('Failed to cancel appointment')
    } finally {
      setActionLoading(null)
    }
  }

  if (loading) return <LoadingPage message="Loading dashboard..." />

  const stats = [
    {
      label:  "Today's Appointments",
      value:  dashboard?.todayAppointments   ?? 0,
      icon:   FiCalendar,
      color:  'text-blue-500',
      bg:     'bg-blue-100 dark:bg-blue-900/30',
    },
    {
      label:  'Pending Requests',
      value:  dashboard?.pendingAppointments ?? 0,
      icon:   FiClock,
      color:  'text-yellow-500',
      bg:     'bg-yellow-100 dark:bg-yellow-900/30',
      alert:  (dashboard?.pendingAppointments ?? 0) > 0,
    },
    {
      label:  'Confirmed',
      value:  dashboard?.confirmedAppointments ?? 0,
      icon:   FiCheckCircle,
      color:  'text-green-500',
      bg:     'bg-green-100 dark:bg-green-900/30',
    },
    {
      label:  'Completed This Week',
      value:  dashboard?.completedThisWeek ?? 0,
      icon:   FiActivity,
      color:  'text-purple-500',
      bg:     'bg-purple-100 dark:bg-purple-900/30',
    },
  ]

  return (
    <div className="space-y-6">

      {/* ── Welcome Banner ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-accent-500 to-primary-500
                   rounded-2xl p-6 md:p-8 text-white"
      >
        <div className="flex flex-col md:flex-row md:items-center
                        justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-display font-bold mb-2">
              Good morning, Dr. {user?.lastName ?? user?.firstName ?? 'Doctor'}! 🩺
            </h1>
            <p className="text-white/80">
              {dashboard?.todayAppointments ?? 0} appointments today
              {(dashboard?.pendingAppointments ?? 0) > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-white/20 rounded-full text-sm">
                  {dashboard.pendingAppointments} pending requests
                </span>
              )}
            </p>
          </div>
          <div className="flex gap-3">
            <Link to="/vet/appointments">
              <Button className="bg-white text-primary-600 hover:bg-primary-50"
                      icon={FiCalendar}>
                Full Schedule
              </Button>
            </Link>
          </div>
        </div>
      </motion.div>

      {/* ── Stats Grid ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <Card className="h-full">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                    {stat.label}
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {stat.value}
                  </p>
                  {stat.alert && (
                    <p className="text-xs text-yellow-600 dark:text-yellow-400
                                  mt-1 flex items-center gap-1">
                      <FiAlertCircle className="w-3 h-3" />
                      Needs attention
                    </p>
                  )}
                </div>
                <div className={`p-3 rounded-xl ${stat.bg}`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* ── Main Content ── */}
      <div className="grid lg:grid-cols-3 gap-6">

        {/* Today's Schedule */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Today's Schedule
              </h2>
              <Link to="/vet/appointments">
                <Button variant="ghost" size="sm" icon={FiEye}>
                  View All
                </Button>
              </Link>
            </div>

            {(dashboard?.todaySchedule ?? []).length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <FiCalendar className="w-10 h-10 mx-auto mb-2 opacity-40" />
                <p>No appointments scheduled for today</p>
              </div>
            ) : (
              <div className="space-y-3">
                {(dashboard?.todaySchedule ?? []).map((apt) => (
                  <div key={apt.id}
                       className="flex items-center gap-4 p-4 rounded-xl
                                  bg-gray-50 dark:bg-gray-700/50
                                  hover:bg-gray-100 dark:hover:bg-gray-700
                                  transition-colors">

                    {/* Pet avatar */}
                    {apt.petImage ? (
                      <img src={apt.petImage} alt={apt.petName}
                           className="w-12 h-12 rounded-xl object-cover flex-shrink-0" />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-primary-100
                                      dark:bg-primary-900/30 flex items-center
                                      justify-center flex-shrink-0 text-xl">
                        🐾
                      </div>
                    )}

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {apt.petName}
                        </p>
                        <StatusBadge status={apt.status} />
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {apt.reason ?? 'General visit'}
                      </p>
                      <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                        <FiClock className="w-3 h-3" />
                        {apt.time?.toString().substring(0, 5)}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-1 flex-shrink-0">
                      {apt.status === 'PENDING' && (
                        <>
                          <button
                            onClick={() => handleConfirm(apt.id)}
                            disabled={actionLoading === apt.id}
                            className="p-2 bg-green-100 dark:bg-green-900/30
                                       text-green-600 rounded-lg
                                       hover:bg-green-200 transition-colors
                                       disabled:opacity-50"
                            title="Confirm"
                          >
                            <FiCheck className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleCancel(apt.id)}
                            disabled={actionLoading === apt.id}
                            className="p-2 bg-red-100 dark:bg-red-900/30
                                       text-red-600 rounded-lg
                                       hover:bg-red-200 transition-colors
                                       disabled:opacity-50"
                            title="Cancel"
                          >
                            <FiX className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      {apt.status === 'CONFIRMED' && (
                        <button
                          onClick={() => handleComplete(apt.id)}
                          disabled={actionLoading === apt.id}
                          className="p-2 bg-blue-100 dark:bg-blue-900/30
                                     text-blue-600 rounded-lg
                                     hover:bg-blue-200 transition-colors
                                     disabled:opacity-50 text-xs font-medium px-3"
                          title="Mark Complete"
                        >
                          Done
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Upcoming Confirmed */}
          {(dashboard?.upcomingAppointments ?? []).length > 0 && (
            <Card>
              <h2 className="text-lg font-semibold text-gray-900
                             dark:text-white mb-4">
                Upcoming Confirmed
              </h2>
              <div className="space-y-3">
                {(dashboard.upcomingAppointments).slice(0, 5).map((apt) => (
                  <div key={apt.id}
                       className="flex items-center gap-3 p-3 rounded-xl
                                  bg-green-50 dark:bg-green-900/10
                                  border border-green-100 dark:border-green-900/30">
                    <div className="w-10 h-10 rounded-xl bg-green-100
                                    dark:bg-green-900/30 flex items-center
                                    justify-center flex-shrink-0 text-lg">
                      🐾
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-white text-sm">
                        {apt.petName}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {apt.reason}
                      </p>
                    </div>
                    <div className="text-right text-xs text-gray-500">
                      <p className="font-medium">{formatDate(apt.date)}</p>
                      <p>{apt.time?.toString().substring(0, 5)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Pending Requests */}
        <div>
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white
                             flex items-center gap-2">
                Pending Requests
                {(dashboard?.pendingAppointments ?? 0) > 0 && (
                  <Badge variant="danger">
                    {dashboard.pendingAppointments}
                  </Badge>
                )}
              </h2>
            </div>

            {(dashboard?.pendingRequests ?? []).length === 0 ? (
              <div className="text-center py-6 text-gray-400">
                <FiCheckCircle className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm">No pending requests</p>
              </div>
            ) : (
              <div className="space-y-3">
                {(dashboard.pendingRequests).map((apt) => (
                  <div key={apt.id}
                       className="p-4 rounded-xl border border-yellow-200
                                  dark:border-yellow-800 bg-yellow-50
                                  dark:bg-yellow-900/10">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-semibold text-gray-900
                                      dark:text-white text-sm">
                          {apt.petName}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {apt.reason ?? 'General visit'}
                        </p>
                      </div>
                      <Badge variant="warning">Pending</Badge>
                    </div>

                    {/* Date/time */}
                    <div className="flex items-center gap-3 text-xs
                                    text-gray-500 dark:text-gray-400 mb-3">
                      <span className="flex items-center gap-1">
                        <FiCalendar className="w-3 h-3" />
                        {formatDate(apt.date)}
                      </span>
                      <span className="flex items-center gap-1">
                        <FiClock className="w-3 h-3" />
                        {apt.time?.toString().substring(0, 5)}
                      </span>
                    </div>

                    {/* Clinic */}
                    <p className="text-xs text-gray-400 mb-3">
                      📍 {apt.clinicName}
                    </p>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleConfirm(apt.id)}
                        disabled={actionLoading === apt.id}
                        className="flex-1 py-2 bg-green-500 hover:bg-green-600
                                   text-white text-xs font-medium rounded-lg
                                   transition-colors disabled:opacity-50
                                   flex items-center justify-center gap-1"
                      >
                        <FiCheck className="w-3 h-3" />
                        Confirm
                      </button>
                      <button
                        onClick={() => handleCancel(apt.id)}
                        disabled={actionLoading === apt.id}
                        className="flex-1 py-2 bg-red-100 dark:bg-red-900/30
                                   hover:bg-red-200 text-red-600 text-xs
                                   font-medium rounded-lg transition-colors
                                   disabled:opacity-50
                                   flex items-center justify-center gap-1"
                      >
                        <FiX className="w-3 h-3" />
                        Decline
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Quick Stats */}
          <Card className="mt-4">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3 text-sm">
              Overview
            </h3>
            <div className="space-y-2">
              {[
                {
                  label: 'Total Appointments',
                  value: dashboard?.totalAppointments ?? 0,
                  color: 'text-gray-600'
                },
                {
                  label: 'Total Patients',
                  value: dashboard?.totalPatients ?? 0,
                  color: 'text-blue-600'
                },
                {
                  label: 'Completed This Week',
                  value: dashboard?.completedThisWeek ?? 0,
                  color: 'text-green-600'
                },
              ].map((item) => (
                <div key={item.label}
                     className="flex items-center justify-between
                                py-2 border-b border-gray-100
                                dark:border-gray-700 last:border-0">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {item.label}
                  </span>
                  <span className={`font-bold ${item.color}`}>
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default VetDashboard