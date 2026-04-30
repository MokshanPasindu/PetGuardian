// src/components/community/CommentSection.jsx
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiSend, FiChevronDown } from 'react-icons/fi'
import { communityService } from '../../services/communityService'
import { useConfirm } from '../../hooks/useConfirm'
import Avatar from '../common/Avatar'
import ConfirmDialog from '../common/ConfirmDialog'
import CommentItem from './CommentItem'
import toast from 'react-hot-toast'

const INITIAL_VISIBLE = 3      // comments shown by default
const LOAD_MORE_COUNT = 5      // how many to add each time

const CommentSection = ({
  postId,
  comments = [],
  onCommentAdded,
  onCommentDeleted,
  onCommentUpdated,
  currentUser,
}) => {
  const [localComments, setLocalComments] = useState(comments)
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE)
  const [newComment, setNewComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [replyingTo, setReplyingTo] = useState(null) // { commentId, name }
  const inputRef = useRef(null)

  const { confirmState, confirm, closeConfirm, loading: confirmLoading } =
    useConfirm()

  // ─── Sync prop → local ─────────────────────────────────────────────────────
  useEffect(() => {
    setLocalComments(comments)
  }, [comments])

  // ─── Auto focus input when replying ───────────────────────────────────────
  useEffect(() => {
    if (replyingTo) {
      inputRef.current?.focus()
    }
  }, [replyingTo])

  // ─── Derived ───────────────────────────────────────────────────────────────
  const totalComments = localComments.length
  const visibleComments = localComments.slice(0, visibleCount)
  const hiddenCount = totalComments - visibleCount
  const hasMore = hiddenCount > 0

  // ─── Show more ─────────────────────────────────────────────────────────────
  const handleShowMore = () => {
    setVisibleCount((prev) => prev + LOAD_MORE_COUNT)
  }

  // ─── Show all ──────────────────────────────────────────────────────────────
  const handleShowAll = () => {
    setVisibleCount(totalComments)
  }

  // ─── Cancel reply ──────────────────────────────────────────────────────────
  const cancelReply = () => {
    setReplyingTo(null)
    setNewComment('')
  }

  // ─── Submit (comment or reply) ─────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!newComment.trim()) return

    try {
      setSubmitting(true)

      if (replyingTo) {
        // ── Add reply ──────────────────────────────────────────────────────
        const reply = await communityService.addReply(
          postId,
          replyingTo.commentId,
          newComment.trim()
        )

        setLocalComments((prev) =>
          prev.map((c) =>
            c.id === replyingTo.commentId
              ? {
                  ...c,
                  replies: [...(c.replies || []), reply],
                  replyCount: (c.replyCount || 0) + 1,
                }
              : c
          )
        )

        setReplyingTo(null)
        toast.success('Reply added!')
      } else {
        // ── Add top-level comment ──────────────────────────────────────────
        const comment = await communityService.addComment(
          postId,
          newComment.trim()
        )

        setLocalComments((prev) => [...prev, comment])

        // Auto-show the new comment
        setVisibleCount((prev) => Math.max(prev, totalComments + 1))

        if (onCommentAdded) onCommentAdded(comment)
        toast.success('Comment added!')
      }

      setNewComment('')
    } catch (error) {
      toast.error(error.message || 'Failed to post comment')
    } finally {
      setSubmitting(false)
    }
  }

  // ─── Reply trigger (from CommentItem) ─────────────────────────────────────
  const handleReplyTrigger = (commentId, authorName) => {
    setReplyingTo({ commentId, name: authorName })
    setNewComment(`@${authorName} `)
  }

  // ─── Edit ──────────────────────────────────────────────────────────────────
  const handleEdit = async (commentId, content) => {
    try {
      const updated = await communityService.updateComment(
        postId,
        commentId,
        content
      )
      setLocalComments((prev) => updateInTree(prev, commentId, updated))
      if (onCommentUpdated) onCommentUpdated(updated)
      toast.success('Comment updated!')
    } catch (error) {
      toast.error(error.message || 'Failed to update comment')
      throw error
    }
  }

  // ─── Like ──────────────────────────────────────────────────────────────────
  const handleLike = async (commentId) => {
    try {
      const updated = await communityService.likeComment(postId, commentId)
      setLocalComments((prev) => updateInTree(prev, commentId, updated))
    } catch (error) {
      toast.error(error.message || 'Failed to like comment')
    }
  }

  // ─── Delete ────────────────────────────────────────────────────────────────
  const handleDelete = async (commentId) => {
    await confirm({
      title: 'Delete Comment?',
      message: 'Are you sure? This cannot be undone.',
      type: 'danger',
      onConfirm: async () => {
        try {
          await communityService.deleteComment(postId, commentId)
          setLocalComments((prev) => removeFromTree(prev, commentId))
          if (onCommentDeleted) onCommentDeleted(commentId)
          toast.success('Comment deleted!')
        } catch (error) {
          toast.error(error.message || 'Failed to delete comment')
          throw error
        }
      },
    })
  }

  // ─── Tree helpers ──────────────────────────────────────────────────────────
  const updateInTree = (list, id, updated) =>
    list.map((c) => {
      if (c.id === id) return updated
      if (c.replies?.length)
        return { ...c, replies: updateInTree(c.replies, id, updated) }
      return c
    })

  const removeFromTree = (list, id) =>
    list
      .filter((c) => c.id !== id)
      .map((c) => ({
        ...c,
        replies: c.replies ? removeFromTree(c.replies, id) : [],
      }))

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      <div className="space-y-0">

        {/* ── Comment count header ─────────────────────────────────────────── */}
        {totalComments > 0 && (
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {totalComments === 1
                ? '1 Comment'
                : `${totalComments} Comments`}
            </h3>

            {/* View all shortcut */}
            {totalComments > INITIAL_VISIBLE && visibleCount < totalComments && (
              <button
                onClick={handleShowAll}
                className="text-sm text-primary-500 hover:text-primary-600 dark:text-primary-400 font-medium transition-colors"
              >
                View all {totalComments} comments
              </button>
            )}
          </div>
        )}

        {/* ── Comments list ─────────────────────────────────────────────────── */}
        <div className="space-y-1">
          <AnimatePresence initial={false}>
            {visibleComments.map((comment, index) => (
              <motion.div
                key={comment.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2, delay: index * 0.03 }}
              >
                <CommentItem
                  comment={comment}
                  postId={postId}
                  currentUser={currentUser}
                  onLike={handleLike}
                  onDelete={handleDelete}
                  onEdit={handleEdit}
                  onReplyTrigger={handleReplyTrigger}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* ── Show more button ──────────────────────────────────────────────── */}
        {hasMore && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="pt-3"
          >
            <button
              onClick={handleShowMore}
              className="flex items-center gap-2 text-sm font-semibold text-gray-500 dark:text-gray-400 hover:text-primary-500 dark:hover:text-primary-400 transition-colors group"
            >
              <div className="flex items-center gap-1">
                <div className="w-6 h-px bg-gray-300 dark:bg-gray-600 group-hover:bg-primary-400 transition-colors" />
                <FiChevronDown className="w-4 h-4" />
                <div className="w-6 h-px bg-gray-300 dark:bg-gray-600 group-hover:bg-primary-400 transition-colors" />
              </div>
              View {Math.min(hiddenCount, LOAD_MORE_COUNT)} more{' '}
              {Math.min(hiddenCount, LOAD_MORE_COUNT) === 1
                ? 'comment'
                : 'comments'}
              {hiddenCount > LOAD_MORE_COUNT && (
                <span className="text-gray-400 font-normal">
                  ({hiddenCount} remaining)
                </span>
              )}
            </button>
          </motion.div>
        )}

        {/* ── Empty state ───────────────────────────────────────────────────── */}
        {totalComments === 0 && (
          <div className="text-center py-10">
            <p className="text-3xl mb-2">💬</p>
            <p className="font-medium text-gray-600 dark:text-gray-400">
              No comments yet
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
              Be the first to share your thoughts!
            </p>
          </div>
        )}

        {/* ── Divider ───────────────────────────────────────────────────────── */}
        <div className="pt-4 mt-4 border-t border-gray-100 dark:border-gray-700" />

        {/* ── Comment input ─────────────────────────────────────────────────── */}
        <div className="space-y-2">

          {/* Reply indicator */}
          <AnimatePresence>
            {replyingTo && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center justify-between px-3 py-2 bg-primary-50 dark:bg-primary-900/20 rounded-xl border border-primary-200 dark:border-primary-800"
              >
                <p className="text-sm text-primary-700 dark:text-primary-400">
                  Replying to{' '}
                  <span className="font-semibold">@{replyingTo.name}</span>
                </p>
                <button
                  onClick={cancelReply}
                  className="text-xs text-primary-600 dark:text-primary-400 hover:text-primary-700 font-medium transition-colors"
                >
                  Cancel
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Input row */}
          <form onSubmit={handleSubmit} className="flex items-center gap-3">
            <Avatar
              src={currentUser?.avatar}
              name={
                currentUser?.name ||
                `${currentUser?.firstName || ''} ${currentUser?.lastName || ''}`.trim() ||
                'User'
              }
              size="sm"
            />
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder={
                  replyingTo
                    ? `Reply to ${replyingTo.name}...`
                    : 'Add a comment...'
                }
                disabled={submitting}
                maxLength={1000}
                className="w-full px-4 py-2.5 pr-12 bg-gray-100 dark:bg-gray-800 rounded-full text-sm border border-transparent focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-all"
              />
              <AnimatePresence>
                {newComment.trim() && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    type="submit"
                    disabled={submitting}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-primary-500 hover:text-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {submitting ? (
                      <span className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin block" />
                    ) : (
                      <FiSend className="w-4 h-4" />
                    )}
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </form>

          {/* Character count */}
          {newComment.length > 800 && (
            <p className="text-xs text-right text-gray-400 pr-2">
              {1000 - newComment.length} characters remaining
            </p>
          )}
        </div>
      </div>

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmState.isOpen}
        onClose={closeConfirm}
        onConfirm={confirmState.onConfirm}
        title={confirmState.title}
        message={confirmState.message}
        type={confirmState.type}
        loading={confirmLoading}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </>
  )
}

export default CommentSection