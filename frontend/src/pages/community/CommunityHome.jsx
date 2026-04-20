// src/pages/community/CommunityHome.jsx
import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  FiPlus,
  FiSearch,
  FiTrendingUp,
  FiClock,
  FiHeart,
  FiMessageCircle,
  FiChevronLeft,
  FiChevronRight,
} from 'react-icons/fi'
import { communityService } from '../../services/communityService'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import Badge from '../../components/common/Badge'
import Avatar from '../../components/common/Avatar'
import EmptyState from '../../components/common/EmptyState'
import { LoadingPage } from '../../components/common/LoadingSpinner'
import ShareButton from '../../components/community/ShareButton'
import { formatRelativeTime, debounce } from '../../utils/helpers'
import { POST_CATEGORIES } from '../../utils/constants'
import toast from 'react-hot-toast'

const CommunityHome = () => {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('all')
  const [sortBy, setSortBy] = useState('recent')
  const [searchQuery, setSearchQuery] = useState('')
  const [likingPosts, setLikingPosts] = useState(new Set()) // Track posts being liked
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const pageSize = 10

  // Fetch posts
  const fetchPosts = async () => {
    try {
      setLoading(true)
      const data = await communityService.getPosts(activeCategory, sortBy, currentPage, pageSize)
      
      // Handle PagedResponse
      if (data.content) {
        setPosts(data.content)
        setTotalPages(data.totalPages || 0)
        setTotalElements(data.totalElements || 0)
      } else {
        setPosts(Array.isArray(data) ? data : [])
        setTotalPages(1)
        setTotalElements(Array.isArray(data) ? data.length : 0)
      }
    } catch (error) {
      console.error('Failed to fetch posts:', error)
      toast.error('Failed to load posts')
      setPosts([])
    } finally {
      setLoading(false)
    }
  }

  // Search posts
  const searchPosts = async (query) => {
    if (!query.trim()) {
      fetchPosts()
      return
    }
    
    try {
      setLoading(true)
      const data = await communityService.searchPosts(query, currentPage, pageSize)
      
      if (data.content) {
        setPosts(data.content)
        setTotalPages(data.totalPages || 0)
        setTotalElements(data.totalElements || 0)
      } else {
        setPosts(Array.isArray(data) ? data : [])
      }
    } catch (error) {
      console.error('Search failed:', error)
      toast.error('Search failed')
    } finally {
      setLoading(false)
    }
  }

  // Debounced search
  const debouncedSearch = useCallback(
    debounce((query) => {
      searchPosts(query)
    }, 500),
    []
  )

  // Handle search input
  const handleSearchChange = (e) => {
    const query = e.target.value
    setSearchQuery(query)
    setCurrentPage(0)
    debouncedSearch(query)
  }

  // ✅ NEW: Handle like post from feed
  const handleLikePost = async (e, postId) => {
    e.preventDefault() // Prevent navigation to post details
    e.stopPropagation()
    
    // Prevent multiple clicks
    if (likingPosts.has(postId)) return
    
    try {
      setLikingPosts(prev => new Set(prev).add(postId))
      
      // Call API
      const updatedPost = await communityService.likePost(postId)
      
      // Update local state
      setPosts(prevPosts =>
        prevPosts.map(post =>
          post.id === postId ? updatedPost : post
        )
      )
      
      // Optional: Show toast
      // toast.success(updatedPost.likedByCurrentUser ? 'Liked!' : 'Unliked!')
      
    } catch (error) {
      console.error('Failed to like post:', error)
      toast.error('Failed to like post')
    } finally {
      setLikingPosts(prev => {
        const newSet = new Set(prev)
        newSet.delete(postId)
        return newSet
      })
    }
  }

  // Fetch on dependency change
  useEffect(() => {
    if (searchQuery.trim()) {
      searchPosts(searchQuery)
    } else {
      fetchPosts()
    }
  }, [activeCategory, sortBy, currentPage])

  // Get category badge
  const getCategoryBadge = (category) => {
    const cat = POST_CATEGORIES.find((c) => c.value === category)
    return (
      <Badge variant="info">
        <span className="flex items-center gap-1">
          {cat?.icon && <span>{cat.icon}</span>}
          {cat?.label || category}
        </span>
      </Badge>
    )
  }

  // Handle page change
  const goToPage = (page) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (loading && posts.length === 0) {
    return <LoadingPage message="Loading community posts..." />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900 dark:text-white">
            Pet Community
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Connect, share, and learn from fellow pet parents
          </p>
        </div>
        <Link to="/community/create">
          <Button icon={FiPlus}>Create Post</Button>
        </Link>
      </div>

      {/* Search & Filters */}
      <Card>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search posts..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="input-field pl-10"
            />
          </div>
          
          <div className="flex gap-2">
            <Button
              variant={sortBy === 'recent' ? 'primary' : 'secondary'}
              size="sm"
              icon={FiClock}
              onClick={() => {
                setSortBy('recent')
                setCurrentPage(0)
              }}
            >
              Recent
            </Button>
            <Button
              variant={sortBy === 'trending' ? 'primary' : 'secondary'}
              size="sm"
              icon={FiTrendingUp}
              onClick={() => {
                setSortBy('trending')
                setCurrentPage(0)
              }}
            >
              Trending
            </Button>
          </div>
        </div>

        {/* Categories */}
        <div className="flex gap-2 mt-4 flex-wrap">
          <Button
            variant={activeCategory === 'all' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => {
              setActiveCategory('all')
              setCurrentPage(0)
            }}
          >
            All
          </Button>
          {POST_CATEGORIES.map((cat) => (
            <Button
              key={cat.value}
              variant={activeCategory === cat.value ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => {
                setActiveCategory(cat.value)
                setCurrentPage(0)
              }}
            >
              {cat.icon} {cat.label}
            </Button>
          ))}
        </div>

        {totalElements > 0 && (
          <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
            Showing <span className="font-semibold">{posts.length}</span> of{' '}
            <span className="font-semibold">{totalElements}</span> posts
            {searchQuery && (
              <span className="ml-1">
                for "<span className="font-semibold">{searchQuery}</span>"
              </span>
            )}
          </div>
        )}
      </Card>

      {/* Posts Grid */}
      {posts.length > 0 ? (
        <div className="grid gap-6">
          {posts.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card hover>
                <div className="flex gap-4">
                  {/* Post Image */}
                  {post.imageUrl && (
                    <Link to={`/community/post/${post.id}`} className="flex-shrink-0">
                      <img
                        src={post.imageUrl}
                        alt={post.title}
                        className="w-32 h-32 rounded-xl object-cover hidden sm:block"
                        onError={(e) => {
                          e.target.style.display = 'none'
                        }}
                      />
                    </Link>
                  )}
                  
                  <div className="flex-1 min-w-0">
                    {/* Author & Category */}
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <Avatar
                          src={post.author.avatar}
                          name={post.author.name}
                          size="sm"
                        />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white text-sm">
                            {post.author.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {formatRelativeTime(post.createdAt)}
                          </p>
                        </div>
                      </div>
                      {getCategoryBadge(post.category)}
                    </div>

                    {/* Title */}
                    <Link to={`/community/post/${post.id}`}>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 hover:text-primary-500 transition-colors line-clamp-2">
                        {post.title}
                      </h3>
                    </Link>
                    
                    {/* Content Preview */}
                    <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2 mb-4">
                      {post.content}
                    </p>
                    {/* After content preview, before interactions */}
                    {post.tags && post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {[...post.tags].slice(0, 3).map((tag, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 rounded-full text-xs font-medium"
                          >
                            #{tag}
                          </span>
                        ))}
                        {post.tags.length > 3 && (
                          <span className="px-2 py-1 text-xs text-gray-500 dark:text-gray-400">
                            +{post.tags.length - 3} more
                          </span>
                        )}
                      </div>
                    )}

                    {/* Interactions - ✅ UPDATED: Like button works here */}
                    <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
                      <button
                        onClick={(e) => handleLikePost(e, post.id)}
                        disabled={likingPosts.has(post.id)}
                        className={`flex items-center gap-1 font-medium transition-colors ${
                          post.likedByCurrentUser
                            ? 'text-red-500'
                            : 'hover:text-red-500'
                        } ${likingPosts.has(post.id) ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <FiHeart className={`w-4 h-4 ${post.likedByCurrentUser ? 'fill-current' : ''}`} />
                        <span>{post.likes || 0}</span>
                      </button>
                      
                      <Link 
                        to={`/community/post/${post.id}`}
                        className="flex items-center gap-1 hover:text-primary-500 transition-colors"
                      >
                        <FiMessageCircle className="w-4 h-4" />
                        <span>{post.comments || 0}</span>
                      </Link>
                      
                      <ShareButton post={post} compact />
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <Card>
          <EmptyState
            icon={FiSearch}
            title={searchQuery ? 'No posts found' : 'No posts yet'}
            description={
              searchQuery
                ? `No posts found for "${searchQuery}". Try a different search term.`
                : 'Be the first to create a post and start the conversation!'
            }
            action={searchQuery ? () => setSearchQuery('') : () => window.location.href = '/community/create'}
            actionLabel={searchQuery ? 'Clear Search' : 'Create First Post'}
          />
        </Card>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Card>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Page <span className="font-semibold">{currentPage + 1}</span> of{' '}
              <span className="font-semibold">{totalPages}</span>
            </p>
            
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => goToPage(0)}
                disabled={currentPage === 0}
              >
                First
              </Button>
              
              <Button
                variant="secondary"
                size="sm"
                icon={FiChevronLeft}
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 0}
              />
              
              {/* Page numbers */}
              <div className="hidden sm:flex gap-1">
                {[...Array(Math.min(5, totalPages))].map((_, i) => {
                  let pageNum
                  if (totalPages <= 5) {
                    pageNum = i
                  } else if (currentPage < 3) {
                    pageNum = i
                  } else if (currentPage > totalPages - 4) {
                    pageNum = totalPages - 5 + i
                  } else {
                    pageNum = currentPage - 2 + i
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => goToPage(pageNum)}
                      className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                        currentPage === pageNum
                          ? 'bg-primary-500 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      {pageNum + 1}
                    </button>
                  )
                })}
              </div>
              
              <Button
                variant="secondary"
                size="sm"
                icon={FiChevronRight}
                iconPosition="right"
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage >= totalPages - 1}
              />
              
              <Button
                variant="secondary"
                size="sm"
                onClick={() => goToPage(totalPages - 1)}
                disabled={currentPage >= totalPages - 1}
              >
                Last
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}

export default CommunityHome