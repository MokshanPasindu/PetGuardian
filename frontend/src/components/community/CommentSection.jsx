// src/components/community/CommentSection.jsx
import { useState } from 'react'
import { FiSend } from 'react-icons/fi'
import { communityService } from '../../services/communityService'
import { useConfirm } from '../../hooks/useConfirm'
import Avatar from '../common/Avatar'
import ConfirmDialog from '../common/ConfirmDialog'
import CommentItem from './CommentItem' // ✅ NEW
import toast from 'react-hot-toast'

const CommentSection = ({ postId, comments = [], onCommentAdded, onCommentDeleted, onCommentUpdated, currentUser }) => {
  const [newComment, setNewComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [localComments, setLocalComments] = useState(comments)
  const { confirmState, confirm, closeConfirm, loading: confirmLoading } = useConfirm()

  // Update local state when props change
  useState(() => {
    setLocalComments(comments)
  }, [comments])

  // Add top-level comment
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!newComment.trim()) return
    
    try {
      setSubmitting(true)
      const comment = await communityService.addComment(postId, newComment.trim())
      
      setNewComment('')
      toast.success('Comment added!')
      
      setLocalComments(prev => [...prev, comment])
      
      if (onCommentAdded) {
        onCommentAdded(comment)
      }
    } catch (error) {
      toast.error(error.message)
    } finally {
      setSubmitting(false)
    }
  }

  // ✅ NEW: Add reply to comment
  const handleReply = async (parentCommentId, content) => {
    try {
      const reply = await communityService.addReply(postId, parentCommentId, content)
      
      toast.success('Reply added!')
      
      // Update local state - add reply to parent comment
      setLocalComments(prevComments =>
        prevComments.map(comment => {
          if (comment.id === parentCommentId) {
            return {
              ...comment,
              replies: [...(comment.replies || []), reply],
              replyCount: (comment.replyCount || 0) + 1
            }
          }
          return comment
        })
      )
      
    } catch (error) {
      toast.error(error.message)
      throw error
    }
  }

  // ✅ NEW: Edit comment
  const handleEdit = async (commentId, content) => {
    try {
      const updatedComment = await communityService.updateComment(postId, commentId, content)
      
      toast.success('Comment updated!')
      
      // Update local state
      const updateCommentInTree = (comments) => {
        return comments.map(comment => {
          if (comment.id === commentId) {
            return updatedComment
          }
          if (comment.replies && comment.replies.length > 0) {
            return {
              ...comment,
              replies: updateCommentInTree(comment.replies)
            }
          }
          return comment
        })
      }
      
      setLocalComments(prev => updateCommentInTree(prev))
      
      if (onCommentUpdated) {
        onCommentUpdated(updatedComment)
      }
      
    } catch (error) {
      toast.error(error.message)
      throw error
    }
  }

  // Like comment
  const handleLike = async (commentId) => {
    try {
      const updatedComment = await communityService.likeComment(postId, commentId)
      
      // Update local state
      const updateCommentInTree = (comments) => {
        return comments.map(comment => {
          if (comment.id === commentId) {
            return updatedComment
          }
          if (comment.replies && comment.replies.length > 0) {
            return {
              ...comment,
              replies: updateCommentInTree(comment.replies)
            }
          }
          return comment
        })
      }
      
      setLocalComments(prev => updateCommentInTree(prev))
      
    } catch (error) {
      toast.error(error.message)
    }
  }

  // Delete comment
  const handleDelete = async (commentId) => {
    await confirm({
      title: 'Delete Comment?',
      message: 'Are you sure you want to delete this comment? This action cannot be undone.',
      type: 'danger',
      onConfirm: async () => {
        try {
          await communityService.deleteComment(postId, commentId)
          toast.success('Comment deleted!')
          
          // Remove from local state
          const removeCommentFromTree = (comments) => {
            return comments
              .filter(comment => comment.id !== commentId)
              .map(comment => ({
                ...comment,
                replies: comment.replies ? removeCommentFromTree(comment.replies) : []
              }))
          }
          
          setLocalComments(prev => removeCommentFromTree(prev))
          
          if (onCommentDeleted) {
            onCommentDeleted(commentId)
          }
        } catch (error) {
          toast.error(error.message)
          throw error
        }
      },
    })
  }

  return (
    <>
      <div className="space-y-6">
        {/* Add Comment */}
        <form onSubmit={handleSubmit} className="flex gap-3">
          <Avatar src={currentUser?.avatar} name={currentUser?.name || 'User'} size="sm" />
          <div className="flex-1 relative">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              disabled={submitting}
              maxLength={1000}
              className="w-full px-4 py-3 pr-12 bg-gray-100 dark:bg-gray-700 rounded-xl border-none focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white placeholder-gray-500"
            />
            <button
              type="submit"
              disabled={!newComment.trim() || submitting}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-primary-500 hover:text-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <FiSend className="w-5 h-5" />
            </button>
          </div>
        </form>

        {/* Comments List */}
        <div className="space-y-4">
          {localComments && localComments.length > 0 ? (
            localComments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                postId={postId}
                currentUser={currentUser}
                onLike={handleLike}
                onDelete={handleDelete}
                onEdit={handleEdit}
                onReply={handleReply}
              />
            ))
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">
                No comments yet. Be the first to comment!
              </p>
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        isOpen={confirmState.isOpen}
        onClose={closeConfirm}
        onConfirm={confirmState.onConfirm}
        title={confirmState.title}
        message={confirmState.message}
        type={confirmState.type}
        loading={confirmLoading}
        confirmText="Delete Comment"
        cancelText="Cancel"
      />
    </>
  )
}

export default CommentSection