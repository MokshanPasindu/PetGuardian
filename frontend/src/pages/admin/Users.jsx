// src/pages/admin/Users.jsx
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'react-hot-toast'
import { 
  FiSearch, 
  FiFilter,
  FiUser,
  FiEdit2,
  FiTrash2,
  FiShield,
  FiShieldOff,
  FiAlertTriangle,
  FiUserPlus,
  FiChevronLeft,
  FiChevronRight,
} from 'react-icons/fi'
import adminService from '../../services/adminService'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import Select from '../../components/common/Select'
import Modal from '../../components/common/Modal'
import ConfirmDialog from '../../components/common/ConfirmDialog'
import { LoadingPage } from '../../components/common/LoadingSpinner'
import EmptyState from '../../components/common/EmptyState'

const Users = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [totalPages, setTotalPages] = useState(0)
  const [totalUsers, setTotalUsers] = useState(0)
  
  // Filters & Pagination
  const [page, setPage] = useState(0)
  const [size, setSize] = useState(10)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState('desc')
  
  // Modals
  const [showRoleModal, setShowRoleModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [newRole, setNewRole] = useState('')
  
  // Confirm dialogs
  const [showBanConfirm, setShowBanConfirm] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [userToAction, setUserToAction] = useState(null)

  // Role options for Select component
  const roleOptions = [
    { value: '', label: 'All Roles' },
    { value: 'OWNER', label: 'Owner' },
    { value: 'VET', label: 'Veterinarian' },
    { value: 'ADMIN', label: 'Admin' },
  ]

  const sortOptions = [
    { value: 'createdAt-desc', label: 'Newest First' },
    { value: 'createdAt-asc', label: 'Oldest First' },
    { value: 'firstName-asc', label: 'Name A-Z' },
    { value: 'firstName-desc', label: 'Name Z-A' },
  ]

  const roleModalOptions = [
    { value: 'OWNER', label: 'Owner' },
    { value: 'VET', label: 'Veterinarian' },
    { value: 'ADMIN', label: 'Admin' },
  ]

  // Fetch users
  const fetchUsers = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const params = {
        page,
        size,
        sortBy,
        sortOrder,
      }
      
      if (roleFilter) params.role = roleFilter
      if (search) params.search = search
      
      const data = await adminService.getAllUsers(params)
      
      setUsers(data.content || [])
      setTotalUsers(data.totalElements || 0)
      setTotalPages(data.totalPages || 0)
      
    } catch (error) {
      console.error('❌ Error fetching users:', error)
      setError(error.message || 'Failed to load users')
      toast.error(error.message || 'Failed to load users')
      setUsers([])
      setTotalUsers(0)
      setTotalPages(0)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [page, size, roleFilter, sortBy, sortOrder])

  // Search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(0)
      fetchUsers()
    }, 500)
    
    return () => clearTimeout(timer)
  }, [search])

  // Handle role change
  const handleRoleChange = async () => {
    if (!selectedUser || !newRole) return
    
    try {
      await adminService.changeUserRole(selectedUser.id, newRole)
      toast.success(`User role changed to ${newRole}`)
      setShowRoleModal(false)
      setSelectedUser(null)
      setNewRole('')
      fetchUsers()
    } catch (error) {
      toast.error(error.message || 'Failed to change role')
    }
  }

  // Handle ban/unban
  const handleToggleBan = async () => {
    if (!userToAction) return
    
    try {
      await adminService.toggleUserBan(userToAction.id)
      const action = userToAction.enabled ? 'banned' : 'unbanned'
      toast.success(`User ${action} successfully`)
      setShowBanConfirm(false)
      setUserToAction(null)
      fetchUsers()
    } catch (error) {
      toast.error(error.message || 'Failed to toggle ban')
    }
  }

  // Handle delete
  const handleDelete = async () => {
    if (!userToAction) return
    
    try {
      await adminService.deleteUser(userToAction.id)
      toast.success('User deleted successfully')
      setShowDeleteConfirm(false)
      setUserToAction(null)
      fetchUsers()
    } catch (error) {
      toast.error(error.message || 'Failed to delete user')
    }
  }

  // Open modals
  const openRoleModal = (user) => {
    setSelectedUser(user)
    setNewRole(user.role)
    setShowRoleModal(true)
  }

  const openBanConfirm = (user) => {
    setUserToAction(user)
    setShowBanConfirm(true)
  }

  const openDeleteConfirm = (user) => {
    setUserToAction(user)
    setShowDeleteConfirm(true)
  }

  // Role badge
  const getRoleBadge = (role) => {
    const badges = {
      ADMIN: <span className="badge bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">Admin</span>,
      VET: <span className="badge bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">Veterinarian</span>,
      OWNER: <span className="badge-success">Owner</span>,
    }
    return badges[role] || <span className="badge">{role}</span>
  }

  // Status badge
  const getStatusBadge = (enabled) => {
    return enabled ? (
      <span className="badge-success">Active</span>
    ) : (
      <span className="badge-danger">Banned</span>
    )
  }

  if (loading && users.length === 0) {
    return <LoadingPage message="Loading users..." />
  }

  if (error && users.length === 0) {
    return (
      <div className="space-y-6">
        <Card>
          <EmptyState
            icon={FiAlertTriangle}
            title="Error Loading Users"
            description={error}
            action={fetchUsers}
            actionLabel="Retry"
          />
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900 dark:text-white">
            User Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage users, roles, and permissions
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            <span className="font-semibold text-primary-600 dark:text-primary-400">
              {totalUsers}
            </span>{' '}
            total users
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="md:col-span-1">
            <Input
              type="text"
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              icon={FiSearch}
            />
          </div>

          {/* Role Filter */}
          <Select
            options={roleOptions}
            value={roleFilter}
            onChange={(value) => {
              setRoleFilter(value)
              setPage(0)
            }}
            placeholder="Filter by role"
          />

          {/* Sort */}
          <Select
            options={sortOptions}
            value={`${sortBy}-${sortOrder}`}
            onChange={(value) => {
              const [field, order] = value.split('-')
              setSortBy(field)
              setSortOrder(order)
            }}
            placeholder="Sort by"
          />
        </div>
      </Card>

      {/* Users List */}
      {users.length > 0 ? (
        <div className="space-y-4">
          {users.map((user, index) => (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="hover:shadow-medium transition-all duration-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* User Info */}
                  <div className="flex items-center gap-4 flex-1">
                    <div className="flex-shrink-0">
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.firstName}
                          className="w-14 h-14 rounded-xl object-cover ring-2 ring-gray-100 dark:ring-gray-700"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-xl bg-gradient-primary flex items-center justify-center ring-2 ring-gray-100 dark:ring-gray-700">
                          <FiUser className="w-7 h-7 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                        {user.firstName} {user.lastName}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                        {user.email}
                      </p>
                      {user.phone && (
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                          {user.phone}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {getRoleBadge(user.role)}
                    {getStatusBadge(user.enabled)}
                  </div>

                  {/* Date */}
                  <div className="hidden lg:block text-sm text-gray-500 dark:text-gray-400">
                    Joined {new Date(user.createdAt).toLocaleDateString()}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openRoleModal(user)}
                      className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                      title="Change Role"
                    >
                      <FiEdit2 className="w-5 h-5" />
                    </button>

                    <button
                      onClick={() => openBanConfirm(user)}
                      className={`p-2 rounded-lg transition-colors ${
                        user.enabled
                          ? 'text-warning-600 hover:bg-warning-50 dark:hover:bg-warning-900/20'
                          : 'text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20'
                      }`}
                      title={user.enabled ? 'Ban User' : 'Unban User'}
                    >
                      {user.enabled ? (
                        <FiShieldOff className="w-5 h-5" />
                      ) : (
                        <FiShield className="w-5 h-5" />
                      )}
                    </button>

                    <button
                      onClick={() => openDeleteConfirm(user)}
                      className="p-2 rounded-lg text-danger-600 hover:bg-danger-50 dark:hover:bg-danger-900/20 transition-colors"
                      title="Delete User"
                    >
                      <FiTrash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <Card>
          <EmptyState
            icon={FiUser}
            title="No users found"
            description={
              search || roleFilter
                ? 'Try adjusting your filters'
                : 'No users in database'
            }
            action={() => {
              setSearch('')
              setRoleFilter('')
            }}
            actionLabel="Clear Filters"
          />
        </Card>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Card>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Page <span className="font-semibold">{page + 1}</span> of{' '}
              <span className="font-semibold">{totalPages}</span>
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setPage(0)}
                disabled={page === 0}
              >
                First
              </Button>
              <Button
                variant="secondary"
                size="sm"
                icon={FiChevronLeft}
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page === 0}
              />
              <Button
                variant="secondary"
                size="sm"
                icon={FiChevronRight}
                iconPosition="right"
                onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                disabled={page >= totalPages - 1}
              />
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setPage(totalPages - 1)}
                disabled={page >= totalPages - 1}
              >
                Last
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Change Role Modal */}
      <Modal
        isOpen={showRoleModal}
        onClose={() => setShowRoleModal(false)}
        title="Change User Role"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Change role for{' '}
            <strong className="text-gray-900 dark:text-white">
              {selectedUser?.firstName} {selectedUser?.lastName}
            </strong>
          </p>

          <Select
            label="New Role"
            options={roleModalOptions}
            value={newRole}
            onChange={setNewRole}
            required
          />

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" onClick={() => setShowRoleModal(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleRoleChange}
              disabled={!newRole || newRole === selectedUser?.role}
            >
              Change Role
            </Button>
          </div>
        </div>
      </Modal>

      {/* Ban Confirm Dialog */}
      <ConfirmDialog
        isOpen={showBanConfirm}
        onClose={() => setShowBanConfirm(false)}
        onConfirm={handleToggleBan}
        title={userToAction?.enabled ? 'Ban User' : 'Unban User'}
        message={
          userToAction?.enabled
            ? `Are you sure you want to ban ${userToAction?.firstName} ${userToAction?.lastName}? They will not be able to log in.`
            : `Are you sure you want to unban ${userToAction?.firstName} ${userToAction?.lastName}? They will be able to log in again.`
        }
        confirmText={userToAction?.enabled ? 'Ban User' : 'Unban User'}
        variant={userToAction?.enabled ? 'danger' : 'primary'}
      />

      {/* Delete Confirm Dialog */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete User"
        message={`Are you sure you want to permanently delete ${userToAction?.firstName} ${userToAction?.lastName}? This action cannot be undone.`}
        confirmText="Delete User"
        variant="danger"
      />
    </div>
  )
}

export default Users