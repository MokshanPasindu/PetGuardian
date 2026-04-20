// src/pages/community/PostDetails.jsx
import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiArrowLeft, FiHeart, FiMessageCircle, FiEdit, FiTrash2, FiFlag, FiShare2 } from 'react-icons/fi'
import { communityService } from '../../services/communityService'
import { useAuth } from '../../hooks/useAuth'
import { useConfirm } from '../../hooks/useConfirm'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import Badge from '../../components/common/Badge'
import Avatar from '../../components/common/Avatar'
import Input from '../../components/common/Input'
import Modal from '../../components/common/Modal'
import ConfirmDialog from '../../components/common/ConfirmDialog'
import CommentSection from '../../components/community/CommentSection'
import ShareButton from '../../components/community/ShareButton'
import { LoadingPage } from '../../components/common/LoadingSpinner'
import { formatRelativeTime } from '../../utils/helpers'
import { POST_CATEGORIES } from '../../utils/constants'
import toast from 'react-hot-toast'

const PostDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { confirmState, confirm, closeConfirm, loading: confirmLoading } = useConfirm()
  
  const [post, setPost] = useState(null)
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [liked, setLiked] = useState(false)
  
  // ✅ NEW: Flag modal state
  const [showFlagModal, setShowFlagModal] = useState(false)
  const [flagReason, setFlagReason] = useState('')
  const [flagging, setFlagging] = useState(false)

  useEffect(() => {
    fetchPost()
    fetchComments()
  }, [id])

  const fetchPost = async () => {
    try {
      setLoading(true)
      const data = await communityService.getPostById(id)
      setPost(data)
      setLiked(data.likedByCurrentUser)
    } catch (error) {
      toast.error('Failed to load post')
      navigate('/community')
    } finally {
      setLoading(false)
    }
  }

  const fetchComments = async () => {
    try {
      const data = await communityService.getComments(id)
      setComments(data)
    } catch (error) {
      console.error('Failed to load comments:', error)
    }
  }

  const handleLike = async () => {
    try {
      const updatedPost = await communityService.likePost(id)
      setPost(updatedPost)
      setLiked(updatedPost.likedByCurrentUser)
      toast.success(updatedPost.likedByCurrentUser ? 'Post liked!' : 'Post unliked!')
    } catch (error) {
      toast.error('Failed to like post')
    }
  }

  const handleDelete = async () => {
    await confirm({
      title: 'Delete Post?',
      message: 'Are you sure you want to delete this post? This action cannot be undone and all comments will be lost.',
      type: 'danger',
      onConfirm: async () => {
        try {
          await communityService.deletePost(id)
          toast.success('Post deleted successfully!')
          navigate('/community')
        } catch (error) {
          toast.error(error.message || 'Failed to delete post')
          throw error
        }
      },
    })
  }

  // ✅ NEW: Flag post
  const handleFlag = async () => {
    if (!flagReason.trim() || flagReason.length < 10) {
      toast.error('Please provide a reason (at least 10 characters)')
      return
    }

    try {
      setFlagging(true)
      await communityService.flagPost(id, flagReason.trim())
      toast.success('Post flagged for review. Thank you for helping keep our community safe.')
      setShowFlagModal(false)
      setFlagReason('')
      fetchPost() // Refresh to show flagged status
    } catch (error) {
      toast.error(error.message || 'Failed to flag post')
    } finally {
      setFlagging(false)
    }
  }

  const category = POST_CATEGORIES.find((c) => c.value === post?.category)
  const isAuthor = user && post && user.id === post.author.id

  if (loading) {
    return <LoadingPage message="Loading post..." />
  }

  if (!post) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Post not found</p>
        <Button onClick={() => navigate('/community')} className="mt-4">
          Back to Community
        </Button>
      </div>
    )
  }

  return (
    <>
      <div className="max-w-4xl mx-auto space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Button
            variant="ghost"
            icon={FiArrowLeft}
            onClick={() => navigate('/community')}
            className="mb-4"
          >
            Back to Community
          </Button>

          {/* Post Content */}
          <Card>
            {/* ✅ NEW: Flagged warning banner */}
            {post.flagged && (
              <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <div className="flex items-start gap-3">
                  <FiFlag className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
                  <div>
                    <p className="font-medium text-red-800 dark:text-red-300">
                      This post has been flagged for review
                    </p>
                    {post.flagReason && (
                      <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                        Reason: {post.flagReason}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <Avatar
                  src={post.author.avatar}
                  name={post.author.name}
                  size="md"
                />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {post.author.name}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {formatRelativeTime(post.createdAt)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="info">{category?.label || post.category}</Badge>
                
                {isAuthor && (
                  <div className="flex gap-2">
                    <Link to={`/community/edit/${post.id}`}>
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={FiEdit}
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                      >
                        Edit
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={FiTrash2}
                      onClick={handleDelete}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      Delete
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              {post.title}
            </h1>

            {/* ✅ NEW: Display Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {[...post.tags].map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 rounded-full text-sm font-medium"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {post.imageUrl && (
              <div className="mb-6">
                <img
                  src={post.imageUrl}
                  alt={post.title}
                  className="w-full rounded-xl max-h-96 object-cover"
                  onError={(e) => {
                    console.error('Image failed to load:', post.imageUrl)
                    e.target.style.display = 'none'
                  }}
                />
              </div>
            )}

            <div className="prose dark:prose-invert max-w-none mb-6">
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                {post.content}
              </p>
            </div>

            <div className="flex items-center gap-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={handleLike}
                className={`flex items-center gap-2 font-medium transition-colors ${
                  liked
                    ? 'text-red-500'
                    : 'text-gray-500 dark:text-gray-400 hover:text-red-500'
                }`}
              >
                <FiHeart className={`w-5 h-5 ${liked ? 'fill-current' : ''}`} />
                <span>{post.likes} {post.likes === 1 ? 'Like' : 'Likes'}</span>
              </button>
              
              <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                <FiMessageCircle className="w-5 h-5" />
                <span>{comments.length} {comments.length === 1 ? 'Comment' : 'Comments'}</span>
              </div>

              <ShareButton post={post} />

              {/* ✅ NEW: Flag button (only if not author and not already flagged) */}
              {!isAuthor && !post.flagged && (
                <button
                  onClick={() => setShowFlagModal(true)}
                  className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-red-500 transition-colors"
                >
                  <FiFlag className="w-5 h-5" />
                  <span>Report</span>
                </button>
              )}
            </div>
          </Card>

          {/* Comments */}
          <Card>
            <Card.Header>
              <Card.Title>
                Comments ({comments.length})
              </Card.Title>
            </Card.Header>
            <CommentSection
              postId={post.id}
              comments={comments}
              currentUser={user}
              onCommentAdded={(newComment) => setComments([...comments, newComment])}
              onCommentDeleted={(commentId) =>
                setComments(comments.filter((c) => c.id !== commentId))
              }
              onCommentUpdated={(updatedComment) =>
                setComments(comments.map((c) => (c.id === updatedComment.id ? updatedComment : c)))
              }
            />
          </Card>
        </motion.div>
      </div>

      {/* ✅ NEW: Flag Modal */}
      <Modal
        isOpen={showFlagModal}
        onClose={() => {
          setShowFlagModal(false)
          setFlagReason('')
        }}
        title="Report Post"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Please provide a reason for flagging this post. Our moderators will review it.
          </p>

          <Input
            label="Reason"
            placeholder="Why are you reporting this post?"
            value={flagReason}
            onChange={(e) => setFlagReason(e.target.value)}
            helperText={`${flagReason.length}/500 characters (min 10)`}
            maxLength={500}
          />

          <div className="flex justify-end gap-3">
            <Button
              variant="secondary"
              onClick={() => {
                setShowFlagModal(false)
                setFlagReason('')
              }}
              disabled={flagging}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleFlag}
              loading={flagging}
              disabled={flagReason.trim().length < 10}
            >
              Submit Report
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmState.isOpen}
        onClose={closeConfirm}
        onConfirm={confirmState.onConfirm}
        title={confirmState.title}
        message={confirmState.message}
        type={confirmState.type}
        loading={confirmLoading}
        confirmText="Delete Post"
        cancelText="Cancel"
      />
    </>
  )
}

export default PostDetails