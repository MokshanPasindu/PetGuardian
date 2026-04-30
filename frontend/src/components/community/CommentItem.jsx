// src/components/community/CommentItem.jsx
import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiHeart, FiMoreHorizontal, FiEdit2, FiTrash2, FiChevronDown, FiChevronUp } from 'react-icons/fi'
import Avatar from '../common/Avatar'
import { formatRelativeTime } from '../../utils/helpers'

const INITIAL_REPLIES_VISIBLE = 2

const CommentItem = ({
  comment,
  postId,
  currentUser,
  onLike,
  onDelete,
  onEdit,
  onReplyTrigger,
  depth = 0,
}) => {
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(comment.content)
  const [submittingEdit, setSubmittingEdit] = useState(false)
  const [likingComment, setLikingComment] = useState(false)
  const [liked, setLiked] = useState(comment.likedByCurrentUser || false)
  const [likeCount, setLikeCount] = useState(comment.likes || 0)
  const [showMenu, setShowMenu] = useState(false)
  const [showReplies, setShowReplies] = useState(false)
  const [visibleReplies, setVisibleReplies] = useState(INITIAL_REPLIES_VISIBLE)
  const [heartAnim, setHeartAnim] = useState(false)
  const editRef = useRef(null)

  const isAuthor =
    currentUser && comment.author && currentUser.id === comment.author.id

  const replies = comment.replies || []
  const totalReplies = replies.length || comment.replyCount || 0
  const shownReplies = replies.slice(0, visibleReplies)
  const hiddenReplies = totalReplies - visibleReplies

  // ─── Like with optimistic update + heart animation ─────────────────────────
  const handleLike = async () => {
    if (likingComment) return

    // Optimistic update
    const wasLiked = liked
    setLiked(!wasLiked)
    setLikeCount((prev) => (wasLiked ? prev - 1 : prev + 1))

    // Heart pop animation on like
    if (!wasLiked) {
      setHeartAnim(true)
      setTimeout(() => setHeartAnim(false), 600)
    }

    setLikingComment(true)
    try {
      await onLike(comment.id)
    } catch {
      // Revert on error
      setLiked(wasLiked)
      setLikeCount((prev) => (wasLiked ? prev + 1 : prev - 1))
    } finally {
      setLikingComment(false)
    }
  }

  // ─── Edit ──────────────────────────────────────────────────────────────────
  const handleStartEdit = () => {
    setIsEditing(true)
    setShowMenu(false)
    setEditContent(comment.content)
    setTimeout(() => {
      editRef.current?.focus()
      // Move cursor to end
      const len = editRef.current?.value.length
      editRef.current?.setSelectionRange(len, len)
    }, 50)
  }

  const handleSaveEdit = async () => {
    if (!editContent.trim() || editContent === comment.content) {
      setIsEditing(false)
      return
    }
    setSubmittingEdit(true)
    try {
      await onEdit(comment.id, editContent.trim())
      setIsEditing(false)
    } catch {
      // error handled in parent
    } finally {
      setSubmittingEdit(false)
    }
  }

  const handleKeyDownEdit = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSaveEdit()
    }
    if (e.key === 'Escape') {
      setIsEditing(false)
      setEditContent(comment.content)
    }
  }

  // ─── Reply trigger ─────────────────────────────────────────────────────────
  const handleReply = () => {
    if (onReplyTrigger) {
      onReplyTrigger(comment.id, comment.author?.name || 'User')
    }
  }

  // ─── Show more replies ─────────────────────────────────────────────────────
  const handleShowMoreReplies = () => {
    setVisibleReplies((prev) => prev + 3)
  }

  return (
    <div className={`${depth > 0 ? 'ml-10' : ''}`}>
      <div className="flex gap-3 py-2 group relative">

        {/* Avatar */}
        <div className="flex-shrink-0 mt-0.5">
          <Avatar
            src={comment.author?.avatar}
            name={comment.author?.name || 'User'}
            size={depth > 0 ? 'xs' : 'sm'}
          />
        </div>

        {/* Main content */}
        <div className="flex-1 min-w-0">

          {/* ── Comment bubble ─────────────────────────────────────────────── */}
          <div className="inline-block max-w-full">
            {isEditing ? (
              /* Edit mode */
              <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl px-4 py-2.5 w-full">
                <textarea
                  ref={editRef}
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  onKeyDown={handleKeyDownEdit}
                  rows={2}
                  maxLength={1000}
                  className="w-full bg-transparent text-sm text-gray-900 dark:text-white focus:outline-none resize-none"
                />
                <div className="flex items-center gap-3 mt-1.5 pt-1.5 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={handleSaveEdit}
                    disabled={
                      submittingEdit ||
                      !editContent.trim() ||
                      editContent === comment.content
                    }
                    className="text-xs font-semibold text-primary-500 hover:text-primary-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    {submittingEdit ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false)
                      setEditContent(comment.content)
                    }}
                    className="text-xs font-semibold text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <span className="text-xs text-gray-400 ml-auto">
                    Enter to save • Esc to cancel
                  </span>
                </div>
              </div>
            ) : (
              /* Normal mode */
              <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl px-4 py-2.5">
                {/* Author name */}
                <span className="font-semibold text-sm text-gray-900 dark:text-white mr-1.5">
                  {comment.author?.name || 'Anonymous'}
                </span>
                {/* Comment text */}
                <span className="text-sm text-gray-800 dark:text-gray-200 break-words">
                  {comment.content}
                </span>
              </div>
            )}
          </div>

          {/* ── Action bar ────────────────────────────────────────────────── */}
          {!isEditing && (
            <div className="flex items-center gap-4 mt-1 px-1">

              {/* Timestamp */}
              <span className="text-xs text-gray-400 dark:text-gray-500">
                {formatRelativeTime(comment.createdAt)}
              </span>

              {/* Edited badge */}
              {comment.edited && (
                <span className="text-xs text-gray-400 dark:text-gray-500 italic">
                  Edited
                </span>
              )}

              {/* Like count (only show if > 0) */}
              {likeCount > 0 && (
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                  {likeCount} {likeCount === 1 ? 'like' : 'likes'}
                </span>
              )}

              {/* Reply button (only top-level) */}
              {depth === 0 && (
                <button
                  onClick={handleReply}
                  className="text-xs font-semibold text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                >
                  Reply
                </button>
              )}

              {/* More menu (author only) */}
              {isAuthor && (
                <div className="relative">
                  <button
                    onClick={() => setShowMenu(!showMenu)}
                    className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <FiMoreHorizontal className="w-4 h-4" />
                  </button>

                  <AnimatePresence>
                    {showMenu && (
                      <>
                        {/* Backdrop */}
                        <div
                          className="fixed inset-0 z-10"
                          onClick={() => setShowMenu(false)}
                        />
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, y: -5 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: -5 }}
                          transition={{ duration: 0.1 }}
                          className="absolute left-0 bottom-full mb-1 w-36 bg-white dark:bg-gray-800 rounded-xl shadow-large border border-gray-100 dark:border-gray-700 z-20 overflow-hidden"
                        >
                          <button
                            onClick={handleStartEdit}
                            className="flex items-center gap-2 w-full px-3 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                          >
                            <FiEdit2 className="w-3.5 h-3.5" />
                            Edit
                          </button>
                          <button
                            onClick={() => {
                              setShowMenu(false)
                              onDelete(comment.id)
                            }}
                            className="flex items-center gap-2 w-full px-3 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors border-t border-gray-100 dark:border-gray-700"
                          >
                            <FiTrash2 className="w-3.5 h-3.5" />
                            Delete
                          </button>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>
          )}

          {/* ── Replies section ───────────────────────────────────────────── */}
          {depth === 0 && totalReplies > 0 && (
            <div className="mt-2 ml-1">
              {/* Toggle replies button */}
              <button
                onClick={() => {
                  setShowReplies(!showReplies)
                  setVisibleReplies(INITIAL_REPLIES_VISIBLE)
                }}
                className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 hover:text-primary-500 dark:hover:text-primary-400 transition-colors mb-2"
              >
                <div className="w-5 h-px bg-gray-300 dark:bg-gray-600" />
                {showReplies ? (
                  <>
                    <FiChevronUp className="w-3 h-3" />
                    Hide replies
                  </>
                ) : (
                  <>
                    <FiChevronDown className="w-3 h-3" />
                    View {totalReplies}{' '}
                    {totalReplies === 1 ? 'reply' : 'replies'}
                  </>
                )}
              </button>

              {/* Replies list */}
              <AnimatePresence>
                {showReplies && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-1 overflow-hidden"
                  >
                    {shownReplies.map((reply) => (
                      <CommentItem
                        key={reply.id}
                        comment={reply}
                        postId={postId}
                        currentUser={currentUser}
                        onLike={onLike}
                        onDelete={onDelete}
                        onEdit={onEdit}
                        onReplyTrigger={onReplyTrigger}
                        depth={1}
                      />
                    ))}

                    {/* Load more replies */}
                    {hiddenReplies > 0 && (
                      <button
                        onClick={handleShowMoreReplies}
                        className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 hover:text-primary-500 dark:hover:text-primary-400 transition-colors ml-10 mt-1"
                      >
                        <div className="w-4 h-px bg-gray-300 dark:bg-gray-600" />
                        View {Math.min(hiddenReplies, 3)} more{' '}
                        {Math.min(hiddenReplies, 3) === 1 ? 'reply' : 'replies'}
                      </button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* ── Heart like button (right side, Instagram style) ───────────────── */}
        {!isEditing && (
          <div className="flex-shrink-0 flex items-start pt-2">
            <button
              onClick={handleLike}
              disabled={likingComment}
              className="relative p-1 transition-transform active:scale-75"
              title={liked ? 'Unlike' : 'Like'}
            >
              {/* Heart pop animation */}
              <AnimatePresence>
                {heartAnim && (
                  <motion.div
                    initial={{ scale: 0, opacity: 1 }}
                    animate={{ scale: 2.5, opacity: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="absolute inset-0 flex items-center justify-center pointer-events-none"
                  >
                    <FiHeart className="w-3 h-3 text-red-400 fill-current" />
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.div
                animate={liked ? { scale: [1, 1.4, 1] } : { scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <FiHeart
                  className={`w-3.5 h-3.5 transition-colors ${
                    liked
                      ? 'text-red-500 fill-current'
                      : 'text-gray-300 dark:text-gray-600 hover:text-red-400'
                  }`}
                />
              </motion.div>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default CommentItem