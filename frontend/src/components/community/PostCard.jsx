// src/components/community/PostCard.jsx
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FiHeart,
  FiMessageCircle,
  FiShare2,
  FiBookmark,
  FiMoreHorizontal,
  FiEdit2,
  FiTrash2,
  FiFlag,
} from 'react-icons/fi'
import Avatar from '../common/Avatar'
import ShareButton from './ShareButton'
import { formatRelativeTime, cn } from '../../utils/helpers'
import { POST_CATEGORIES } from '../../utils/constants'

const CATEGORY_STYLES = {
  GENERAL:       { bg: 'bg-slate-100 dark:bg-slate-700',    text: 'text-slate-600 dark:text-slate-300' },
  HEALTH:        { bg: 'bg-red-50 dark:bg-red-900/30',      text: 'text-red-600 dark:text-red-400' },
  NUTRITION:     { bg: 'bg-orange-50 dark:bg-orange-900/30', text: 'text-orange-600 dark:text-orange-400' },
  TRAINING:      { bg: 'bg-blue-50 dark:bg-blue-900/30',    text: 'text-blue-600 dark:text-blue-400' },
  EMERGENCY:     { bg: 'bg-rose-50 dark:bg-rose-900/30',    text: 'text-rose-600 dark:text-rose-400' },
  SUCCESS_STORY: { bg: 'bg-yellow-50 dark:bg-yellow-900/30', text: 'text-yellow-600 dark:text-yellow-400' },
}

const PostCard = ({
  post,
  onLike,
  likingPosts = new Set(),
  currentUser,
  onDelete,
  compact = false,
}) => {
  const [saved,     setSaved]     = useState(false)
  const [showMenu,  setShowMenu]  = useState(false)
  const [imgError,  setImgError]  = useState(false)

  const cat   = POST_CATEGORIES.find(c => c.value === post.category)
  const style = CATEGORY_STYLES[post.category] || CATEGORY_STYLES.GENERAL
  const isAuthor  = currentUser && post.author?.id === currentUser.id
  const isLiking  = likingPosts?.has(post.id)
  const isLiked   = post.likedByCurrentUser

  // ─── Compact variant (sidebar/widgets) ───────────────────────────────────
  if (compact) {
    return (
      <Link to={`/community/post/${post.id}`}>
        <div className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group">
          <Avatar src={post.author?.avatar} name={post.author?.name} size="sm" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2 group-hover:text-primary-500 transition-colors">
              {post.title}
            </p>
            <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
              <span className="flex items-center gap-1">
                <FiHeart className="w-3 h-3" /> {post.likes || 0}
              </span>
              <span className="flex items-center gap-1">
                <FiMessageCircle className="w-3 h-3" /> {post.comments || 0}
              </span>
              <span>{formatRelativeTime(post.createdAt)}</span>
            </div>
          </div>
        </div>
      </Link>
    )
  }

  // ─── Full card ────────────────────────────────────────────────────────────
  return (
    <motion.article
      whileHover={{ y: -1 }}
      transition={{ duration: 0.15 }}
      className="bg-white dark:bg-gray-800 rounded-2xl shadow-soft hover:shadow-medium transition-all duration-200 overflow-hidden"
    >
      {/* ── Post image (if exists) ─────────────────────────────────────────── */}
      {post.imageUrl && !imgError && (
        <Link to={`/community/post/${post.id}`}>
          <div className="relative h-52 overflow-hidden bg-gray-100 dark:bg-gray-700">
            <img
              src={post.imageUrl}
              alt={post.title}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              onError={() => setImgError(true)}
            />
            {/* Category pill over image */}
            <div className="absolute top-3 left-3">
              <span className={cn(
                'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm bg-white/90 dark:bg-gray-900/80',
                style.text
              )}>
                <span>{cat?.icon}</span>
                {cat?.label.replace(/^\S+\s/, '') || post.category}
              </span>
            </div>
            {/* Flagged overlay */}
            {post.flagged && (
              <div className="absolute inset-0 bg-red-900/40 flex items-center justify-center">
                <span className="bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                  <FiFlag className="w-3 h-3" /> Under Review
                </span>
              </div>
            )}
          </div>
        </Link>
      )}

      {/* ── Card body ──────────────────────────────────────────────────────── */}
      <div className="p-5">

        {/* Author row */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <Avatar
              src={post.author?.avatar}
              name={post.author?.name}
              size="sm"
            />
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white leading-tight">
                {post.author?.name || 'Anonymous'}
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500">
                {formatRelativeTime(post.createdAt)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Category badge (no image) */}
            {(!post.imageUrl || imgError) && (
              <span className={cn(
                'hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium',
                style.bg, style.text
              )}>
                {cat?.icon} {cat?.label.replace(/^\S+\s/, '') || post.category}
              </span>
            )}

            {/* More menu */}
            {isAuthor && (
              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-400"
                >
                  <FiMoreHorizontal className="w-4 h-4" />
                </button>
                <AnimatePresence>
                  {showMenu && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -5 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -5 }}
                        transition={{ duration: 0.1 }}
                        className="absolute right-0 top-8 w-40 bg-white dark:bg-gray-800 rounded-xl shadow-strong border border-gray-100 dark:border-gray-700 z-20 overflow-hidden"
                      >
                        <Link
                          to={`/community/edit/${post.id}`}
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                          onClick={() => setShowMenu(false)}
                        >
                          <FiEdit2 className="w-3.5 h-3.5" /> Edit Post
                        </Link>
                        {onDelete && (
                          <button
                            onClick={() => { setShowMenu(false); onDelete(post.id) }}
                            className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors border-t border-gray-100 dark:border-gray-700"
                          >
                            <FiTrash2 className="w-3.5 h-3.5" /> Delete
                          </button>
                        )}
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>

        {/* Title */}
        <Link to={`/community/post/${post.id}`}>
          <h2 className="text-base font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 hover:text-primary-500 dark:hover:text-primary-400 transition-colors leading-snug">
            {post.title}
          </h2>
        </Link>

        {/* Content preview */}
        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-3 leading-relaxed">
          {post.content}
        </p>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {[...post.tags].slice(0, 3).map((tag, i) => (
              <span
                key={i}
                className="px-2 py-0.5 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 rounded-full text-xs font-medium"
              >
                #{tag}
              </span>
            ))}
            {post.tags.length > 3 && (
              <span className="px-2 py-0.5 text-xs text-gray-400 dark:text-gray-500 rounded-full bg-gray-50 dark:bg-gray-700">
                +{post.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* ── Action bar ──────────────────────────────────────────────────── */}
        <div className="flex items-center gap-1 pt-3 border-t border-gray-100 dark:border-gray-700">

          {/* Like */}
          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={(e) => onLike?.(e, post.id)}
            disabled={isLiking}
            className={cn(
              'flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all',
              isLiked
                ? 'text-red-500 bg-red-50 dark:bg-red-900/20'
                : 'text-gray-500 dark:text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20',
              isLiking && 'opacity-60 cursor-not-allowed'
            )}
          >
            <motion.div
              animate={isLiked ? { scale: [1, 1.4, 1] } : { scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <FiHeart className={cn('w-4 h-4', isLiked && 'fill-current')} />
            </motion.div>
            <span>{post.likes || 0}</span>
          </motion.button>

          {/* Comments */}
          <Link
            to={`/community/post/${post.id}#comments`}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all"
          >
            <FiMessageCircle className="w-4 h-4" />
            <span>{post.comments || 0}</span>
          </Link>

          {/* Share */}
          <div className="ml-auto flex items-center gap-1">
            {/* Save */}
            <motion.button
              whileTap={{ scale: 0.85 }}
              onClick={() => setSaved(!saved)}
              className={cn(
                'p-2 rounded-xl text-sm transition-all',
                saved
                  ? 'text-primary-500 bg-primary-50 dark:bg-primary-900/20'
                  : 'text-gray-400 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20'
              )}
              title={saved ? 'Unsave' : 'Save'}
            >
              <FiBookmark className={cn('w-4 h-4', saved && 'fill-current')} />
            </motion.button>

            {/* Share */}
            <ShareButton post={post} compact />
          </div>
        </div>
      </div>
    </motion.article>
  )
}

export default PostCard