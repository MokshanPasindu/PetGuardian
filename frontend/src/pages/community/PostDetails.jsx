// src/pages/community/PostDetails.jsx
import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  FiArrowLeft,
  FiHeart,
  FiMessageCircle,
  FiEdit2,
  FiTrash2,
  FiFlag,
  FiShare2,
  FiAlertTriangle,
  FiBookmark,
} from 'react-icons/fi'
import { communityService } from '../../services/communityService'
import { useAuth } from '../../hooks/useAuth'
import { useConfirm } from '../../hooks/useConfirm'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import Avatar from '../../components/common/Avatar'
import Input from '../../components/common/Input'
import Modal from '../../components/common/Modal'
import ConfirmDialog from '../../components/common/ConfirmDialog'
import CommentSection from '../../components/community/CommentSection'
import ShareButton from '../../components/community/ShareButton'
import { LoadingPage } from '../../components/common/LoadingSpinner'
import { formatRelativeTime, formatDate, cn } from '../../utils/helpers'
import { POST_CATEGORIES } from '../../utils/constants'
import toast from 'react-hot-toast'

const CATEGORY_STYLES = {
  GENERAL:       { bg: 'bg-slate-100 dark:bg-slate-700',    text: 'text-slate-600 dark:text-slate-300',   border: 'border-slate-300' },
  HEALTH:        { bg: 'bg-red-50 dark:bg-red-900/30',      text: 'text-red-600 dark:text-red-400',       border: 'border-red-400' },
  NUTRITION:     { bg: 'bg-orange-50 dark:bg-orange-900/30', text: 'text-orange-600 dark:text-orange-400', border: 'border-orange-400' },
  TRAINING:      { bg: 'bg-blue-50 dark:bg-blue-900/30',    text: 'text-blue-600 dark:text-blue-400',     border: 'border-blue-400' },
  EMERGENCY:     { bg: 'bg-rose-50 dark:bg-rose-900/30',    text: 'text-rose-600 dark:text-rose-400',     border: 'border-rose-500' },
  SUCCESS_STORY: { bg: 'bg-yellow-50 dark:bg-yellow-900/30', text: 'text-yellow-600 dark:text-yellow-400', border: 'border-yellow-400' },
}

const PostDetails = () => {
  const { id }       = useParams()
  const navigate     = useNavigate()
  const { user }     = useAuth()
  const { confirmState, confirm, closeConfirm, loading: confirmLoading } = useConfirm()

  const [post,      setPost]      = useState(null)
  const [comments,  setComments]  = useState([])
  const [loading,   setLoading]   = useState(true)
  const [liked,     setLiked]     = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [saved,     setSaved]     = useState(false)

  const [showFlagModal, setShowFlagModal] = useState(false)
  const [flagReason,    setFlagReason]    = useState('')
  const [flagging,      setFlagging]      = useState(false)

  useEffect(() => { fetchPost(); fetchComments() }, [id])

  const fetchPost = async () => {
    try {
      setLoading(true)
      const data = await communityService.getPostById(id)
      setPost(data)
      setLiked(data.likedByCurrentUser)
      setLikeCount(data.likes || 0)
    } catch {
      toast.error('Failed to load post')
      navigate('/community')
    } finally {
      setLoading(false)
    }
  }

  const fetchComments = async () => {
    try {
      const data = await communityService.getComments(id)
      setComments(Array.isArray(data) ? data : [])
    } catch {
      setComments([])
    }
  }

  // ─── Like (optimistic) ────────────────────────────────────────────────────
  const handleLike = async () => {
    const wasLiked = liked
    setLiked(!wasLiked)
    setLikeCount(prev => wasLiked ? prev - 1 : prev + 1)
    try {
      const updated = await communityService.likePost(id)
      setPost(updated)
      setLiked(updated.likedByCurrentUser)
      setLikeCount(updated.likes || 0)
    } catch {
      setLiked(wasLiked)
      setLikeCount(prev => wasLiked ? prev + 1 : prev - 1)
      toast.error('Failed to like post')
    }
  }

  // ─── Delete ───────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    await confirm({
      title: 'Delete Post?',
      message: 'This will permanently delete your post and all its comments.',
      type: 'danger',
      onConfirm: async () => {
        await communityService.deletePost(id)
        toast.success('Post deleted')
        navigate('/community')
      },
    })
  }

  // ─── Flag ─────────────────────────────────────────────────────────────────
  const handleFlag = async () => {
    if (flagReason.trim().length < 10) {
      toast.error('Please provide at least 10 characters')
      return
    }
    try {
      setFlagging(true)
      await communityService.flagPost(id, flagReason.trim())
      toast.success('Post reported. Thank you!')
      setShowFlagModal(false)
      setFlagReason('')
      fetchPost()
    } catch (error) {
      toast.error(error.message || 'Failed to report post')
    } finally {
      setFlagging(false)
    }
  }

  if (loading) return <LoadingPage message="Loading post..." />
  if (!post) return null

  const cat      = POST_CATEGORIES.find(c => c.value === post.category)
  const style    = CATEGORY_STYLES[post.category] || CATEGORY_STYLES.GENERAL
  const isAuthor = user && post.author?.id === user.id

  return (
    <>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 py-6">

          {/* ── Back button ────────────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-5"
          >
            <button
              onClick={() => navigate('/community')}
              className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-primary-500 dark:hover:text-primary-400 font-medium transition-colors group"
            >
              <FiArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Back to Community
            </button>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* ── Main Content (2/3) ──────────────────────────────────────── */}
            <div className="lg:col-span-2 space-y-5">

              {/* Post card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-soft overflow-hidden"
              >
                {/* Hero image */}
                {post.imageUrl && (
                  <div className="relative h-64 md:h-80 overflow-hidden bg-gray-100 dark:bg-gray-700">
                    <img
                      src={post.imageUrl}
                      alt={post.title}
                      className="w-full h-full object-cover"
                      onError={e => { e.target.style.display = 'none' }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                  </div>
                )}

                <div className="p-6 md:p-8">
                  {/* Flagged banner */}
                  {post.flagged && (
                    <div className="mb-5 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-3">
                      <FiAlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-red-700 dark:text-red-400 text-sm">
                          This post is under review
                        </p>
                        {post.flagReason && (
                          <p className="text-xs text-red-600 dark:text-red-500 mt-1">
                            Reason: {post.flagReason}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Category + actions row */}
                  <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                    <span className={cn(
                      'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold',
                      style.bg, style.text
                    )}>
                      {cat?.icon} {cat?.label.replace(/^\S+\s/, '') || post.category}
                    </span>

                    {isAuthor && (
                      <div className="flex items-center gap-2">
                        <Link to={`/community/edit/${post.id}`}>
                          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                            <FiEdit2 className="w-4 h-4" /> Edit
                          </button>
                        </Link>
                        <button
                          onClick={handleDelete}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
                          <FiTrash2 className="w-4 h-4" /> Delete
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Title */}
                  <h1 className="text-2xl md:text-3xl font-display font-bold text-gray-900 dark:text-white mb-4 leading-tight">
                    {post.title}
                  </h1>

                  {/* Author row */}
                  <div className="flex items-center gap-3 mb-5 pb-5 border-b border-gray-100 dark:border-gray-700">
                    <Avatar src={post.author?.avatar} name={post.author?.name} size="md" />
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {post.author?.name || 'Anonymous'}
                      </p>
                      <p className="text-sm text-gray-400">
                        {formatDate(post.createdAt)} · {formatRelativeTime(post.createdAt)}
                      </p>
                    </div>
                  </div>

                  {/* Tags */}
                  {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-5">
                      {[...post.tags].map((tag, i) => (
                        <span key={i} className="px-3 py-1 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 rounded-full text-sm font-medium">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Body */}
                  <div className="prose prose-sm dark:prose-invert max-w-none mb-6">
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed text-base">
                      {post.content}
                    </p>
                  </div>

                  {/* ── Reactions bar ──────────────────────────────────────── */}
                  <div className="flex items-center gap-2 pt-5 border-t border-gray-100 dark:border-gray-700 flex-wrap">

                    {/* Like */}
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={handleLike}
                      className={cn(
                        'flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-all',
                        liked
                          ? 'bg-red-50 dark:bg-red-900/20 text-red-500 shadow-sm'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500'
                      )}
                    >
                      <motion.div animate={liked ? { scale: [1, 1.4, 1] } : {}}>
                        <FiHeart className={cn('w-4 h-4', liked && 'fill-current')} />
                      </motion.div>
                      <span>{likeCount} {likeCount === 1 ? 'Like' : 'Likes'}</span>
                    </motion.button>

                    {/* Comments count */}
                    <div className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700">
                      <FiMessageCircle className="w-4 h-4" />
                      <span>{comments.length} {comments.length === 1 ? 'Comment' : 'Comments'}</span>
                    </div>

                    {/* Save */}
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setSaved(!saved)}
                      className={cn(
                        'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all',
                        saved
                          ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-500 hover:text-primary-500'
                      )}
                    >
                      <FiBookmark className={cn('w-4 h-4', saved && 'fill-current')} />
                      {saved ? 'Saved' : 'Save'}
                    </motion.button>

                    {/* Share */}
                    <ShareButton post={post} />

                    {/* Report (non-author only) */}
                    {!isAuthor && !post.flagged && (
                      <button
                        onClick={() => setShowFlagModal(true)}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all ml-auto"
                      >
                        <FiFlag className="w-4 h-4" />
                        Report
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>

              {/* ── Comments ─────────────────────────────────────────────────── */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                id="comments"
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-soft p-6 md:p-8"
              >
                <h2 className="text-lg font-display font-bold text-gray-900 dark:text-white mb-6">
                  Comments
                  {comments.length > 0 && (
                    <span className="ml-2 text-sm font-normal text-gray-400">
                      ({comments.length})
                    </span>
                  )}
                </h2>
                <CommentSection
                  postId={post.id}
                  comments={comments}
                  currentUser={user}
                  onCommentAdded={c => setComments(prev => [...prev, c])}
                  onCommentDeleted={id => setComments(prev => prev.filter(c => c.id !== id))}
                  onCommentUpdated={u => setComments(prev => prev.map(c => c.id === u.id ? u : c))}
                />
              </motion.div>
            </div>

            {/* ── Sidebar (1/3) ──────────────────────────────────────────── */}
            <aside className="space-y-5">

              {/* Author card */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-soft p-5"
              >
                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
                  Posted By
                </h3>
                <div className="flex items-center gap-3 mb-4">
                  <Avatar src={post.author?.avatar} name={post.author?.name} size="lg" />
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white">
                      {post.author?.name}
                    </p>
                    <p className="text-sm text-gray-400">Pet Parent</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded-xl">
                    <p className="font-bold text-gray-900 dark:text-white">{likeCount}</p>
                    <p className="text-xs text-gray-400">Likes</p>
                  </div>
                  <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded-xl">
                    <p className="font-bold text-gray-900 dark:text-white">{comments.length}</p>
                    <p className="text-xs text-gray-400">Comments</p>
                  </div>
                </div>
              </motion.div>

              {/* Post info */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 }}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-soft p-5"
              >
                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
                  Post Info
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Category</span>
                    <span className={cn('font-medium', style.text)}>
                      {cat?.label || post.category}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Published</span>
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      {formatDate(post.createdAt)}
                    </span>
                  </div>
                  {post.updatedAt && post.updatedAt !== post.createdAt && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Updated</span>
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        {formatRelativeTime(post.updatedAt)}
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Back to community */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Link to="/community">
                  <button className="w-full py-3 px-4 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2">
                    <FiArrowLeft className="w-4 h-4" />
                    Back to Community
                  </button>
                </Link>
              </motion.div>
            </aside>
          </div>
        </div>
      </div>

      {/* Flag Modal */}
      <Modal
        isOpen={showFlagModal}
        onClose={() => { setShowFlagModal(false); setFlagReason('') }}
        title="Report Post"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Help keep our community safe. Tell us why this post should be reviewed.
          </p>
          <Input
            label="Reason for reporting"
            placeholder="Describe why this post violates community guidelines..."
            value={flagReason}
            onChange={e => setFlagReason(e.target.value)}
            helperText={`${flagReason.length}/500 (min 10)`}
            maxLength={500}
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => { setShowFlagModal(false); setFlagReason('') }} disabled={flagging}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleFlag} loading={flagging} disabled={flagReason.trim().length < 10}>
              Submit Report
            </Button>
          </div>
        </div>
      </Modal>

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

export default PostDetails