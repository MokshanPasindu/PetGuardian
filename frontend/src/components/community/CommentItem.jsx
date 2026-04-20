// src/components/community/CommentItem.jsx
import { useState } from 'react'
import { FiHeart, FiMessageCircle, FiEdit2, FiTrash2, FiSend, FiX } from 'react-icons/fi'
import Avatar from '../common/Avatar'
import Button from '../common/Button'
import { formatRelativeTime } from '../../utils/helpers'

const CommentItem = ({
  comment,
  postId,
  currentUser,
  onLike,
  onDelete,
  onEdit,
  onReply,
  depth = 0,
  maxDepth = 2,
}) => {
  const [showReplyBox, setShowReplyBox] = useState(false)
  const [replyContent, setReplyContent] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(comment.content)
  const [submitting, setSubmitting] = useState(false)

  const isAuthor = currentUser?.id === comment.author.id
  const canReply = depth < maxDepth

  // Handle reply submit
  const handleReplySubmit = async (e) => {
    e.preventDefault()
    if (!replyContent.trim() || submitting) return

    try {
      setSubmitting(true)
      await onReply(comment.id, replyContent.trim())
      setReplyContent('')
      setShowReplyBox(false)
    } catch (error) {
      console.error('Reply failed:', error)
    } finally {
      setSubmitting(false)
    }
  }

  // Handle edit submit
  const handleEditSubmit = async () => {
    if (!editContent.trim() || submitting) return
    if (editContent === comment.content) {
      setIsEditing(false)
      return
    }

    try {
      setSubmitting(true)
      await onEdit(comment.id, editContent.trim())
      setIsEditing(false)
    } catch (error) {
      console.error('Edit failed:', error)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className={`${depth > 0 ? 'ml-8 mt-3' : ''}`}>
      <div className="flex gap-3 p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
        <Avatar
          src={comment.author.avatar}
          name={comment.author.name}
          size="sm"
        />
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <p className="font-medium text-gray-900 dark:text-white text-sm">
                {comment.author.name}
              </p>
              {comment.edited && (
                <span className="text-xs text-gray-500 dark:text-gray-400">(edited)</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {formatRelativeTime(comment.createdAt)}
              </p>
              {isAuthor && !isEditing && (
                <>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-gray-400 hover:text-blue-500 p-1 rounded transition-colors"
                    title="Edit comment"
                  >
                    <FiEdit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDelete(comment.id)}
                    className="text-gray-400 hover:text-red-500 p-1 rounded transition-colors"
                    title="Delete comment"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Content */}
          {isEditing ? (
            <div className="space-y-2">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                rows={3}
                maxLength={1000}
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleEditSubmit}
                  loading={submitting}
                  disabled={!editContent.trim()}
                >
                  Save
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    setIsEditing(false)
                    setEditContent(comment.content)
                  }}
                  disabled={submitting}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-gray-700 dark:text-gray-300 text-sm mb-2 whitespace-pre-wrap">
              {comment.content}
            </p>
          )}

          {/* Actions */}
          {!isEditing && (
            <div className="flex items-center gap-4 text-sm">
              <button
                onClick={() => onLike(comment.id)}
                className={`flex items-center gap-1 font-medium transition-colors ${
                  comment.likedByCurrentUser
                    ? 'text-red-500'
                    : 'text-gray-500 dark:text-gray-400 hover:text-red-500'
                }`}
              >
                <FiHeart
                  className={`w-4 h-4 ${comment.likedByCurrentUser ? 'fill-current' : ''}`}
                />
                <span>{comment.likes || 0}</span>
              </button>

              {canReply && (
                <button
                  onClick={() => setShowReplyBox(!showReplyBox)}
                  className="flex items-center gap-1 text-gray-500 dark:text-gray-400 hover:text-primary-500 transition-colors"
                >
                  <FiMessageCircle className="w-4 h-4" />
                  <span>Reply</span>
                  {comment.replyCount > 0 && (
                    <span className="text-xs">({comment.replyCount})</span>
                  )}
                </button>
              )}
            </div>
          )}

          {/* Reply Box */}
          {showReplyBox && (
            <form onSubmit={handleReplySubmit} className="mt-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="Write a reply..."
                  className="flex-1 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  maxLength={1000}
                  disabled={submitting}
                />
                <button
                  type="submit"
                  disabled={!replyContent.trim() || submitting}
                  className="px-3 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <FiSend className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowReplyBox(false)
                    setReplyContent('')
                  }}
                  className="px-3 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                >
                  <FiX className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Nested Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="space-y-2 mt-2">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              postId={postId}
              currentUser={currentUser}
              onLike={onLike}
              onDelete={onDelete}
              onEdit={onEdit}
              onReply={onReply}
              depth={depth + 1}
              maxDepth={maxDepth}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default CommentItem