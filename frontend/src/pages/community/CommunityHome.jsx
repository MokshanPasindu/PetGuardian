// src/pages/community/CommunityHome.jsx
import { useState, useEffect, useCallback, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FiPlus,
  FiSearch,
  FiTrendingUp,
  FiClock,
  FiX,
  FiFilter,
  FiMessageCircle,
} from 'react-icons/fi'
import { communityService } from '../../services/communityService'
import { useAuth } from '../../hooks/useAuth'
import PostCard from '../../components/community/PostCard'
import Avatar from '../../components/common/Avatar'
import EmptyState from '../../components/common/EmptyState'
import { LoadingPage } from '../../components/common/LoadingSpinner'
import { debounce } from '../../utils/helpers'
import { POST_CATEGORIES } from '../../utils/constants'
import toast from 'react-hot-toast'

const CATEGORY_STYLES = {
  GENERAL:       { bg: 'bg-slate-100 dark:bg-slate-800',   text: 'text-slate-600 dark:text-slate-300',   active: 'bg-slate-600 text-white',       dot: 'bg-slate-500' },
  HEALTH:        { bg: 'bg-red-50 dark:bg-red-900/20',     text: 'text-red-600 dark:text-red-400',       active: 'bg-red-500 text-white',         dot: 'bg-red-500' },
  NUTRITION:     { bg: 'bg-orange-50 dark:bg-orange-900/20', text: 'text-orange-600 dark:text-orange-400', active: 'bg-orange-500 text-white',    dot: 'bg-orange-500' },
  TRAINING:      { bg: 'bg-blue-50 dark:bg-blue-900/20',   text: 'text-blue-600 dark:text-blue-400',     active: 'bg-blue-500 text-white',        dot: 'bg-blue-500' },
  EMERGENCY:     { bg: 'bg-rose-50 dark:bg-rose-900/20',   text: 'text-rose-600 dark:text-rose-400',     active: 'bg-rose-600 text-white',        dot: 'bg-rose-600' },
  SUCCESS_STORY: { bg: 'bg-yellow-50 dark:bg-yellow-900/20', text: 'text-yellow-600 dark:text-yellow-400', active: 'bg-yellow-500 text-white',  dot: 'bg-yellow-500' },
}

const SORT_OPTIONS = [
  { value: 'recent',   label: 'Most Recent',  icon: FiClock },
  { value: 'trending', label: 'Trending',     icon: FiTrendingUp },
]

const CommunityHome = () => {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [posts,          setPosts]          = useState([])
  const [loading,        setLoading]        = useState(true)
  const [loadingMore,    setLoadingMore]    = useState(false)
  const [activeCategory, setActiveCategory] = useState('all')
  const [sortBy,         setSortBy]         = useState('recent')
  const [searchQuery,    setSearchQuery]    = useState('')
  const [searchFocused,  setSearchFocused]  = useState(false)
  const [likingPosts,    setLikingPosts]    = useState(new Set())
  const [currentPage,    setCurrentPage]    = useState(0)
  const [totalPages,     setTotalPages]     = useState(0)
  const [totalElements,  setTotalElements]  = useState(0)
  const [showMobileFilter, setShowMobileFilter] = useState(false)

  const searchRef = useRef(null)
  const PAGE_SIZE = 10

  // ─── Fetch posts ─────────────────────────────────────────────────────────
  const fetchPosts = useCallback(async (page = 0, append = false) => {
    try {
      if (append) setLoadingMore(true)
      else        setLoading(true)

      const data = await communityService.getPosts(
        activeCategory, sortBy, page, PAGE_SIZE
      )

      const content = data.content || []
      setPosts(prev => append ? [...prev, ...content] : content)
      setTotalPages(data.totalPages   || 0)
      setTotalElements(data.totalElements || 0)
      setCurrentPage(page)
    } catch {
      toast.error('Failed to load posts')
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [activeCategory, sortBy])

  // ─── Search posts ─────────────────────────────────────────────────────────
  const searchPosts = useCallback(async (query, page = 0) => {
    if (!query.trim()) { fetchPosts(0); return }
    try {
      setLoading(true)
      const data = await communityService.searchPosts(query, page, PAGE_SIZE)
      setPosts(data.content || [])
      setTotalPages(data.totalPages   || 0)
      setTotalElements(data.totalElements || 0)
      setCurrentPage(page)
    } catch {
      toast.error('Search failed')
    } finally {
      setLoading(false)
    }
  }, [fetchPosts])

  const debouncedSearch = useCallback(debounce(searchPosts, 500), [searchPosts])

  useEffect(() => {
    setCurrentPage(0)
    if (searchQuery.trim()) debouncedSearch(searchQuery)
    else                    fetchPosts(0)
  }, [activeCategory, sortBy])

  useEffect(() => {
    if (searchQuery.trim()) debouncedSearch(searchQuery)
    else                    fetchPosts(0)
  }, [searchQuery])

  // ─── Like ─────────────────────────────────────────────────────────────────
  const handleLike = async (e, postId) => {
    e.preventDefault(); e.stopPropagation()
    if (likingPosts.has(postId)) return
    try {
      setLikingPosts(prev => new Set(prev).add(postId))
      const updated = await communityService.likePost(postId)
      setPosts(prev => prev.map(p => p.id === postId ? updated : p))
    } catch {
      toast.error('Failed to like post')
    } finally {
      setLikingPosts(prev => { const s = new Set(prev); s.delete(postId); return s })
    }
  }

  // ─── Load more ────────────────────────────────────────────────────────────
  const handleLoadMore = () => {
    const next = currentPage + 1
    if (searchQuery.trim()) searchPosts(searchQuery, next)
    else                    fetchPosts(next, true)
  }

  // ─── Category change ──────────────────────────────────────────────────────
  const handleCategoryChange = (cat) => {
    setActiveCategory(cat)
    setCurrentPage(0)
    setShowMobileFilter(false)
  }

  if (loading && posts.length === 0) return <LoadingPage message="Loading community..." />

  const hasMore = currentPage + 1 < totalPages

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">

        {/* ── Hero Banner ─────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-500 via-primary-600 to-emerald-700 p-6 md:p-10 text-white"
        >
          {/* Decorative blobs */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-16 pointer-events-none" />

          <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-3xl">🐾</span>
                <span className="text-sm font-semibold bg-white/20 px-3 py-1 rounded-full">
                  Pet Community
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-display font-bold mb-2 leading-tight">
                Connect with<br className="hidden md:block" /> Pet Lovers
              </h1>
              <p className="text-white/80 text-base md:text-lg max-w-md">
                Share experiences, ask questions, and learn from thousands of
                fellow pet parents.
              </p>

              {/* Quick stats */}
              <div className="flex items-center gap-6 mt-5">
                <div>
                  <p className="text-2xl font-bold">{totalElements.toLocaleString()}</p>
                  <p className="text-white/70 text-sm">Posts</p>
                </div>
                <div className="w-px h-10 bg-white/20" />
                <div>
                  <p className="text-2xl font-bold">{POST_CATEGORIES.length}</p>
                  <p className="text-white/70 text-sm">Categories</p>
                </div>
                <div className="w-px h-10 bg-white/20" />
                <div>
                  <p className="text-2xl font-bold">∞</p>
                  <p className="text-white/70 text-sm">Knowledge</p>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="flex-shrink-0">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate('/community/create')}
                className="flex items-center gap-2 bg-white text-primary-600 font-bold px-6 py-3.5 rounded-2xl shadow-lg hover:shadow-xl transition-all"
              >
                <FiPlus className="w-5 h-5" />
                Create Post
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* ── Search bar ──────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`relative transition-all duration-200 ${
            searchFocused ? 'scale-[1.01]' : ''
          }`}
        >
          <div className={`flex items-center gap-3 bg-white dark:bg-gray-800 rounded-2xl px-4 py-3 shadow-soft border-2 transition-colors duration-200 ${
            searchFocused
              ? 'border-primary-500 shadow-primary-500/10 shadow-medium'
              : 'border-transparent'
          }`}>
            <FiSearch className={`w-5 h-5 flex-shrink-0 transition-colors ${
              searchFocused ? 'text-primary-500' : 'text-gray-400'
            }`} />
            <input
              ref={searchRef}
              type="text"
              placeholder="Search posts, topics, or keywords..."
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setCurrentPage(0) }}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              className="flex-1 bg-transparent text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none text-base"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <FiX className="w-4 h-4 text-gray-400" />
              </button>
            )}
            {/* Mobile filter toggle */}
            <button
              onClick={() => setShowMobileFilter(!showMobileFilter)}
              className="md:hidden p-2 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
            >
              <FiFilter className="w-4 h-4" />
            </button>
          </div>

          {/* Search result count */}
          {searchQuery && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm text-gray-500 dark:text-gray-400 mt-2 ml-1"
            >
              {totalElements > 0
                ? `Found ${totalElements} result${totalElements !== 1 ? 's' : ''} for "${searchQuery}"`
                : `No results for "${searchQuery}"`}
            </motion.p>
          )}
        </motion.div>

        {/* ── Main layout: Sidebar + Feed ──────────────────────────────────── */}
        <div className="flex flex-col md:flex-row gap-6">

          {/* ── LEFT SIDEBAR ─────────────────────────────────────────────── */}
          <aside className="md:w-64 flex-shrink-0 space-y-4">

            {/* Categories */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-soft p-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3 px-1 text-sm uppercase tracking-wider">
                Categories
              </h3>
              <div className="space-y-1">
                {/* All */}
                <button
                  onClick={() => handleCategoryChange('all')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    activeCategory === 'all'
                      ? 'bg-primary-500 text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <span className="text-base">🌐</span>
                  <span>All Posts</span>
                  {activeCategory === 'all' && totalElements > 0 && (
                    <span className="ml-auto text-xs bg-white/20 px-2 py-0.5 rounded-full">
                      {totalElements}
                    </span>
                  )}
                </button>

                {POST_CATEGORIES.map(cat => {
                  const style = CATEGORY_STYLES[cat.value] || CATEGORY_STYLES.GENERAL
                  const isActive = activeCategory === cat.value
                  return (
                    <button
                      key={cat.value}
                      onClick={() => handleCategoryChange(cat.value)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                        isActive
                          ? style.active + ' shadow-sm'
                          : `${style.text} hover:bg-gray-50 dark:hover:bg-gray-700`
                      }`}
                    >
                      <span className="text-base">{cat.icon}</span>
                      <span>{cat.label.replace(/^\S+\s/, '')}</span>
                      {isActive && totalElements > 0 && (
                        <span className="ml-auto text-xs bg-white/20 px-2 py-0.5 rounded-full">
                          {totalElements}
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Sort options */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-soft p-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3 px-1 text-sm uppercase tracking-wider">
                Sort By
              </h3>
              <div className="space-y-1">
                {SORT_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => { setSortBy(opt.value); setCurrentPage(0) }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      sortBy === opt.value
                        ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <opt.icon className="w-4 h-4" />
                    {opt.label}
                    {sortBy === opt.value && (
                      <span className="ml-auto w-2 h-2 rounded-full bg-primary-500" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Create post CTA (desktop) */}
            <div className="hidden md:block bg-gradient-to-br from-primary-500 to-emerald-600 rounded-2xl p-5 text-white">
              <p className="text-2xl mb-2">✍️</p>
              <h4 className="font-bold mb-1">Share Your Story</h4>
              <p className="text-white/80 text-sm mb-4">
                Help others by sharing your pet experiences
              </p>
              <Link to="/community/create">
                <button className="w-full bg-white text-primary-600 font-semibold py-2 rounded-xl hover:bg-primary-50 transition-colors text-sm">
                  Create Post
                </button>
              </Link>
            </div>
          </aside>

          {/* ── Mobile category filter (slide down) ─────────────────────── */}
          <AnimatePresence>
            {showMobileFilter && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="md:hidden bg-white dark:bg-gray-800 rounded-2xl shadow-soft p-4 overflow-hidden"
              >
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleCategoryChange('all')}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                      activeCategory === 'all'
                        ? 'bg-primary-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    🌐 All
                  </button>
                  {POST_CATEGORIES.map(cat => (
                    <button
                      key={cat.value}
                      onClick={() => handleCategoryChange(cat.value)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                        activeCategory === cat.value
                          ? 'bg-primary-500 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── FEED ─────────────────────────────────────────────────────── */}
          <div className="flex-1 min-w-0 space-y-4">

            {/* Active filter pill */}
            {(activeCategory !== 'all' || searchQuery) && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-2 flex-wrap"
              >
                {activeCategory !== 'all' && (
                  <span className="flex items-center gap-2 px-3 py-1.5 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 rounded-full text-sm font-medium">
                    {POST_CATEGORIES.find(c => c.value === activeCategory)?.label}
                    <button onClick={() => setActiveCategory('all')}>
                      <FiX className="w-3.5 h-3.5" />
                    </button>
                  </span>
                )}
                {searchQuery && (
                  <span className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm font-medium">
                    "{searchQuery}"
                    <button onClick={() => setSearchQuery('')}>
                      <FiX className="w-3.5 h-3.5" />
                    </button>
                  </span>
                )}
              </motion.div>
            )}

            {/* Posts */}
            {posts.length > 0 ? (
              <>
                <AnimatePresence mode="popLayout">
                  {posts.map((post, index) => (
                    <motion.div
                      key={post.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{ delay: Math.min(index * 0.05, 0.3) }}
                    >
                      <PostCard
                        post={post}
                        onLike={handleLike}
                        likingPosts={likingPosts}
                        currentUser={user}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>

                {/* Load more */}
                {hasMore && (
                  <div className="flex justify-center pt-4">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleLoadMore}
                      disabled={loadingMore}
                      className="flex items-center gap-2 px-8 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-2xl shadow-soft hover:shadow-medium transition-all disabled:opacity-60"
                    >
                      {loadingMore ? (
                        <>
                          <span className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                          Loading...
                        </>
                      ) : (
                        <>
                          Load More Posts
                          <span className="text-xs text-gray-400 ml-1">
                            ({(totalElements - posts.length)} remaining)
                          </span>
                        </>
                      )}
                    </motion.button>
                  </div>
                )}

                {/* End of feed */}
                {!hasMore && posts.length >= 5 && (
                  <div className="text-center py-8 text-gray-400 dark:text-gray-600">
                    <p className="text-2xl mb-2">🎉</p>
                    <p className="text-sm font-medium">You're all caught up!</p>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-soft p-12">
                <EmptyState
                  icon={FiMessageCircle}
                  title={searchQuery ? 'No posts found' : 'No posts yet'}
                  description={
                    searchQuery
                      ? `No posts match "${searchQuery}". Try a different search.`
                      : 'Be the first to post in this category!'
                  }
                  action={
                    searchQuery
                      ? () => setSearchQuery('')
                      : () => navigate('/community/create')
                  }
                  actionLabel={searchQuery ? 'Clear Search' : 'Create First Post'}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CommunityHome