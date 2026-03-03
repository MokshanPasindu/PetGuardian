// src/components/community/CommentSection.jsx
import { useState } from 'react'
import { FiHeart, FiSend } from 'react-icons/fi'
import Avatar from '../common/Avatar'
import Button from '../common/Button'
import { formatRelativeTime } from '../../utils/helpers'

const CommentSection = ({ comments, onAddComment, currentUser }) => {
  const [newComment, setNewComment] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (newComment.trim()) {
      onAddComment(newComment.trim())
      setNewComment('')
    }
  }

  return (
    <div className="space-y-6">
      {/* Add Comment */}
      <form onSubmit={handleSubmit} className="flex gap-3">
        <Avatar src={currentUser?.avatar} name={currentUser?.name} size="sm" />
        <div className="flex-1 relative">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            className="w-full px-4 py-3 pr-12 bg-gray-100 dark:bg-gray-700 rounded-xl border-none focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white placeholder-gray-500"
          />
          <button
            type="submit"
            disabled={!newComment.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-primary-500 hover:text-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FiSend className="w-5 h-5" />
          </button>
        </div>
      </form>

      {/* Comments List */}
      <div className="space-y-4">
        {comments?.map((comment) => (
          <div
            key={comment.id}
            className="flex gap-3 p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50"
          >
            <Avatar
              src={comment.author.avatar}
              name={comment.author.name}
              size="sm"
            />
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <p className="font-medium text-gray-900 dark:text-white">
                  {comment.author.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {formatRelativeTime(comment.createdAt)}
                </p>
              </div>
              <p className="text-gray-700 dark:text-gray-300 text-sm">
                {comment.content}
              </p>
              <button className="flex items-center gap-1 mt-2 text-sm text-gray-500 dark:text-gray-400 hover:text-primary-500 transition-colors">
                <FiHeart className="w-4 h-4" />
                <span>{comment.likes || 0}</span>
              </button>
            </div>
          </div>
        ))}

        {(!comments || comments.length === 0) && (
          <p className="text-center text-gray-500 dark:text-gray-400 py-8">
            No comments yet. Be the first to comment!
          </p>
        )}
      </div>
    </div>
  )
}

export default CommentSection