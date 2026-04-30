// src/pages/dashboard/AdminDashboard.jsx
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  FiUsers,
  FiHeart,
  FiMapPin,
  FiMessageSquare,
  FiTrendingUp,
  FiAlertTriangle,
  FiUserCheck,
  FiShield,
  FiRefreshCw,
  FiFlag,
  FiPlus,
} from 'react-icons/fi'
import { useAuth } from '../../hooks/useAuth'
import { adminService } from '../../services/adminService'
import { communityService } from '../../services/communityService'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import Avatar from '../../components/common/Avatar'
import { LoadingPage } from '../../components/common/LoadingSpinner'
import { formatRelativeTime } from '../../utils/helpers'
import toast from 'react-hot-toast'

const AdminDashboard = () => {
  const { user } = useAuth()

  // ─── State ────────────────────────────────────────────────────────────────
  const [stats, setStats] = useState(null)
  const [recentUsers, setRecentUsers] = useState([])
  const [roleCounts, setRoleCounts] = useState({})
  const [flaggedCount, setFlaggedCount] = useState(0)
  const [clinicCount, setClinicCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  // ─── Fetch All Dashboard Data ─────────────────────────────────────────────
  const fetchDashboardData = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true)
      else setLoading(true)

      // Run all requests in parallel
      const [statsData, recentUsersData, roleData, flaggedData, clinicsData] =
        await Promise.allSettled([
          adminService.getStatistics(),
          adminService.getRecentUsers(5),
          adminService.getUsersByRole(),
          communityService.getFlaggedPosts(0, 1),
          adminService.getAllClinics(),
        ])

      // Stats
      if (statsData.status === 'fulfilled') {
        setStats(statsData.value)
      }

      // Recent users
      if (recentUsersData.status === 'fulfilled') {
        setRecentUsers(Array.isArray(recentUsersData.value)
          ? recentUsersData.value
          : recentUsersData.value?.content || [])
      }

      // Role counts
      if (roleData.status === 'fulfilled') {
        setRoleCounts(roleData.value)
      }

      // Flagged posts count
      if (flaggedData.status === 'fulfilled') {
        setFlaggedCount(flaggedData.value?.totalElements || 0)
      }

      // Clinic count
      if (clinicsData.status === 'fulfilled') {
        setClinicCount(
          Array.isArray(clinicsData.value) ? clinicsData.value.length : 0
        )
      }

      if (isRefresh) toast.success('Dashboard refreshed')
    } catch (error) {
      console.error('Dashboard error:', error)
      toast.error('Failed to load some dashboard data')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  // ─── Stat Cards Config ────────────────────────────────────────────────────
  const statCards = [
    {
      label: 'Total Users',
      value: stats?.totalUsers ?? '—',
      sub: `+${stats?.newUsersLast30Days ?? 0} this month`,
      icon: FiUsers,
      color: 'text-blue-500',
      bg: 'bg-blue-100 dark:bg-blue-900/30',
      positive: true,
    },
    {
      label: 'Total Pets',
      value: stats?.totalPets ?? '—',
      sub: 'Registered profiles',
      icon: FiHeart,
      color: 'text-pink-500',
      bg: 'bg-pink-100 dark:bg-pink-900/30',
      positive: true,
    },
    {
      label: 'Vet Clinics',
      value: clinicCount,
      sub: `${stats?.vetsCount ?? 0} veterinarians`,
      icon: FiMapPin,
      color: 'text-purple-500',
      bg: 'bg-purple-100 dark:bg-purple-900/30',
      positive: true,
    },
    {
      label: 'Community Posts',
      value: stats?.totalPosts ?? '—',
      sub: `${flaggedCount} flagged`,
      icon: FiMessageSquare,
      color: flaggedCount > 0 ? 'text-orange-500' : 'text-green-500',
      bg: flaggedCount > 0
        ? 'bg-orange-100 dark:bg-orange-900/30'
        : 'bg-green-100 dark:bg-green-900/30',
      positive: flaggedCount === 0,
    },
  ]

  // ─── Role Distribution ────────────────────────────────────────────────────
  const roleDistribution = [
    {
      label: 'Pet Owners',
      count: roleCounts.OWNER ?? stats?.ownersCount ?? 0,
      color: 'bg-blue-500',
      total: stats?.totalUsers || 1,
    },
    {
      label: 'Veterinarians',
      count: roleCounts.VET ?? stats?.vetsCount ?? 0,
      color: 'bg-purple-500',
      total: stats?.totalUsers || 1,
    },
    {
      label: 'Admins',
      count: roleCounts.ADMIN ?? stats?.adminsCount ?? 0,
      color: 'bg-orange-500',
      total: stats?.totalUsers || 1,
    },
  ]

  if (loading) return <LoadingPage message="Loading admin dashboard..." />

  return (
    <div className="space-y-6">

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-2xl p-6 md:p-8 text-white"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-display font-bold mb-1">
              Admin Dashboard
            </h1>
            <p className="text-gray-400">
              Welcome back, {user?.firstName}. Here's your system overview.
            </p>
          </div>
          <div className="flex gap-3">
            {flaggedCount > 0 && (
              <Link to="/admin/content-moderation">
                <Button variant="danger" icon={FiFlag} size="sm">
                  {flaggedCount} Flagged Post{flaggedCount !== 1 ? 's' : ''}
                </Button>
              </Link>
            )}
            <Button
              variant="secondary"
              icon={FiRefreshCw}
              size="sm"
              onClick={() => fetchDashboardData(true)}
              loading={refreshing}
            >
              Refresh
            </Button>
          </div>
        </div>
      </motion.div>

      {/* ── Stat Cards ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08 }}
          >
            <Card className="h-full">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 truncate">
                    {stat.label}
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {stat.value?.toLocaleString?.() ?? stat.value}
                  </p>
                  <p className={`text-xs mt-1 flex items-center gap-1 ${
                    stat.positive ? 'text-green-500' : 'text-orange-500'
                  }`}>
                    <FiTrendingUp className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate">{stat.sub}</span>
                  </p>
                </div>
                <div className={`p-3 rounded-xl flex-shrink-0 ml-2 ${stat.bg}`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* ── Middle Row ──────────────────────────────────────────────────────── */}
      <div className="grid lg:grid-cols-3 gap-6">

        {/* Role Distribution */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              User Distribution
            </h3>
            <FiUsers className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {roleDistribution.map((role) => {
              const pct = stats?.totalUsers
                ? Math.round((role.count / stats.totalUsers) * 100)
                : 0
              return (
                <div key={role.label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600 dark:text-gray-400">
                      {role.label}
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {role.count} ({pct}%)
                    </span>
                  </div>
                  <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full ${role.color} rounded-full`}
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.8, delay: 0.3 }}
                    />
                  </div>
                </div>
              )
            })}
          </div>

          {/* New users badge */}
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 text-sm">
              <FiTrendingUp className="w-4 h-4 text-green-500" />
              <span className="text-gray-600 dark:text-gray-400">
                <span className="font-semibold text-green-500">
                  +{stats?.newUsersLast30Days ?? 0}
                </span>{' '}
                new users in last 30 days
              </span>
            </div>
          </div>
        </Card>

        {/* Quick Actions */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Quick Actions
            </h3>
            <FiShield className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-2">
            {[
              {
                label: 'Manage Users',
                desc: `${stats?.totalUsers ?? 0} total users`,
                to: '/admin/users',
                icon: FiUsers,
                color: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20',
              },
              {
                label: 'Vet Clinics',
                desc: `${clinicCount} clinics registered`,
                to: '/admin/vet-clinics',
                icon: FiMapPin,
                color: 'text-purple-500 bg-purple-50 dark:bg-purple-900/20',
              },
              {
                label: 'Content Moderation',
                desc: flaggedCount > 0
                  ? `${flaggedCount} posts need review`
                  : 'No flagged content',
                to: '/admin/content-moderation',
                icon: FiFlag,
                color: flaggedCount > 0
                  ? 'text-red-500 bg-red-50 dark:bg-red-900/20'
                  : 'text-green-500 bg-green-50 dark:bg-green-900/20',
              },
            ].map((action) => (
              <Link key={action.to} to={action.to}>
                <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer group">
                  <div className={`p-2 rounded-lg ${action.color}`}>
                    <action.icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white text-sm group-hover:text-primary-500 transition-colors">
                      {action.label}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {action.desc}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </Card>

        {/* System Summary */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              System Summary
            </h3>
            <FiAlertTriangle className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            {[
              {
                label: 'Total Users',
                value: stats?.totalUsers ?? 0,
                icon: FiUsers,
                color: 'text-blue-500',
              },
              {
                label: 'Pet Owners',
                value: stats?.ownersCount ?? 0,
                icon: FiHeart,
                color: 'text-pink-500',
              },
              {
                label: 'Veterinarians',
                value: stats?.vetsCount ?? 0,
                icon: FiUserCheck,
                color: 'text-purple-500',
              },
              {
                label: 'Admins',
                value: stats?.adminsCount ?? 0,
                icon: FiShield,
                color: 'text-orange-500',
              },
              {
                label: 'Total Pets',
                value: stats?.totalPets ?? 0,
                icon: FiHeart,
                color: 'text-green-500',
              },
              {
                label: 'Community Posts',
                value: stats?.totalPosts ?? 0,
                icon: FiMessageSquare,
                color: 'text-indigo-500',
              },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between py-1"
              >
                <div className="flex items-center gap-2">
                  <item.icon className={`w-4 h-4 ${item.color}`} />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {item.label}
                  </span>
                </div>
                <span className="font-semibold text-gray-900 dark:text-white text-sm">
                  {item.value?.toLocaleString?.() ?? item.value}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* ── Recent Users ────────────────────────────────────────────────────── */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Recently Joined Users
          </h3>
          <Link to="/admin/users">
            <Button variant="ghost" size="sm">
              View All
            </Button>
          </Link>
        </div>

        {recentUsers.length > 0 ? (
          <div className="space-y-3">
            {recentUsers.map((u, index) => (
              <motion.div
                key={u.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <Avatar src={u.avatar} name={u.name || `${u.firstName} ${u.lastName}`} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 dark:text-white text-sm truncate">
                    {u.firstName} {u.lastName}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {u.email}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    u.role === 'ADMIN'
                      ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                      : u.role === 'VET'
                      ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                      : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                  }`}>
                    {u.role}
                  </span>
                  <span className="text-xs text-gray-400">
                    {u.createdAt ? formatRelativeTime(u.createdAt) : '—'}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 dark:text-gray-400 py-6 text-sm">
            No recent users found
          </p>
        )}
      </Card>
    </div>
  )
}

export default AdminDashboard