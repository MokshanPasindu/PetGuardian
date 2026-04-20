// src/pages/admin/ContentModeration.jsx
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  FiFlag,
  FiTrash2,
  FiCheckCircle,
  FiAlertTriangle,
  FiCalendar,
  FiUser,
} from 'react-icons/fi'
import { communityService } from '../../services/communityService'
import { useConfirm } from '../../hooks/useConfirm'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import Badge from '../../components/common/Badge'
import Avatar from '../../components/common/Avatar'
import EmptyState from '../../components/common/EmptyState'
import ConfirmDialog from '../../components/common/ConfirmDialog'
import { LoadingPage } from '../../components/common/LoadingSpinner'
import { formatRelativeTime } from '../../utils/helpers'
import { POST_CATEGORIES } from '../../utils/constants'
import toast from 'react-hot-toast'

const ContentModeration = () => {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const { confirmState, confirm, closeConfirm, loading: confirmLoading } = useConfirm()
  const pageSize = 10

  useEffect(() => {
    fetchFlaggedPosts()
  }, [currentPage])

  const fetchFlaggedPosts = async () => {
    try {
      setLoading(true)
      const data = await communityService.getFlaggedPosts(currentPage, pageSize)
      
      if (data.content) {
        setPosts(data.content)
        setTotalPages(data.totalPages || 0)
        setTotalElements(data.totalElements || 0)
      } else {
        setPosts([])
      }
    } catch (error) {
      console.error('Failed to fetch flagged posts:', error)
      toast.error('Failed to load flagged posts')
      setPosts([])
    } finally {
      setLoading(false)
    }
  }

  const handleUnflag = async (postId, postTitle) => {
    await confirm({
      title: 'Approve Post?',
      message: `Are you sure you want to approve "${postTitle}" and remove the flag?`,
      type: 'info',
      onConfirm: async () => {
        try {
          await communityService.unflagPost(postId)
          toast.success('Post approved successfully!')
          fetchFlaggedPosts()
        } catch (error) {
          toast.error(error.message || 'Failed to approve post')
          throw error
        }
      },
    })
  }

  const handleDelete = async (postId, postTitle) => {
    await confirm({
      title: 'Delete Post?',
      message: `Are you sure you want to permanently delete "${postTitle}"? This action cannot be undone.`,
      type: 'danger',
      onConfirm: async () => {
        try {
          await communityService.deletePostByAdmin(postId)
          toast.success('Post deleted successfully!')
          fetchFlaggedPosts()
        } catch (error) {
          toast.error(error.message || 'Failed to delete post')
          throw error
        }
      },
    })
  }

  const getCategoryBadge = (category) => {
    const cat = POST_CATEGORIES.find((c) => c.value === category)
    return (
      <Badge variant="info">
        {cat?.icon} {cat?.label || category}
      </Badge>
    )
  }

  if (loading && posts.length === 0) {
    return <LoadingPage message="Loading flagged posts..." />
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-display font-bold text-gray-900 dark:text-white">
              Content Moderation
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Review and manage flagged community posts
            </p>
          </div>
          
          {totalElements > 0 && (
            <div className="flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
              <FiAlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
              <span className="font-semibold text-red-700 dark:text-red-300">
                {totalElements} flagged {totalElements === 1 ? 'post' : 'posts'}
              </span>
            </div>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-xl">
                <FiFlag className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Flagged</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalElements}</p>
              </div>
            </div>
          </Card>
          
          <Card>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                <FiCalendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Current Page</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {currentPage + 1} / {totalPages || 1}
                </p>
              </div>
            </div>
          </Card>
          
          <Card>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                <FiCheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Showing</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{posts.length}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Flagged Posts List */}
        {posts.length > 0 ? (
          <div className="space-y-4">
            {posts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="border-l-4 border-red-500">
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar
                          src={post.author.avatar}
                          name={post.author.name}
                          size="sm"
                        />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {post.author.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Posted {formatRelativeTime(post.createdAt)}
                          </p>
                        </div>
                      </div>
                      {getCategoryBadge(post.category)}
                    </div>

                    {/* Title */}
                    <Link to={`/community/post/${post.id}`} target="_blank">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white hover:text-primary-500 transition-colors">
                        {post.title}
                      </h3>
                    </Link>

                    {/* Content Preview */}
                    <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2">
                      {post.content}
                    </p>

                    {/* Flag Reason */}
                    {post.flagReason && (
                      <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                        <div className="flex items-start gap-2">
                          <FiAlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-red-800 dark:text-red-300">
                              Flag Reason:
                            </p>
                            <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                              {post.flagReason}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Tags */}
                    {post.tags && post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {[...post.tags].map((tag, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <Link to={`/community/post/${post.id}`} target="_blank">
                        <Button variant="secondary" size="sm">
                          View Post
                        </Button>
                      </Link>
                      
                      <Button
                        variant="primary"
                        size="sm"
                        icon={FiCheckCircle}
                        onClick={() => handleUnflag(post.id, post.title)}
                      >
                        Approve
                      </Button>
                      
                      <Button
                        variant="danger"
                        size="sm"
                        icon={FiTrash2}
                        onClick={() => handleDelete(post.id, post.title)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <Card>
            <EmptyState
              icon={FiCheckCircle}
              title="No Flagged Posts"
              description="Great! There are no posts flagged for review at the moment."
            />
          </Card>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <Card>
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Page {currentPage + 1} of {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setCurrentPage(0)}
                  disabled={currentPage === 0}
                >
                  First
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 0}
                >
                  Previous
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage >= totalPages - 1}
                >
                  Next
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setCurrentPage(totalPages - 1)}
                  disabled={currentPage >= totalPages - 1}
                >
                  Last
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmState.isOpen}
        onClose={closeConfirm}
        onConfirm={confirmState.onConfirm}
        title={confirmState.title}
        message={confirmState.message}
        type={confirmState.type}
        loading={confirmLoading}
      />
    </>
  )
}

export default ContentModeration