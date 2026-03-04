// src/pages/community/CommunityHome.jsx
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  FiPlus,
  FiSearch,
  FiTrendingUp,
  FiClock,
  FiHeart,
  FiMessageCircle,
  FiBookmark,
} from 'react-icons/fi'
import { communityService } from '../../services/communityService' 
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import Badge from '../../components/common/Badge'
import Avatar from '../../components/common/Avatar'
import { LoadingPage } from '../../components/common/LoadingSpinner'
import { formatRelativeTime } from '../../utils/helpers'
import { POST_CATEGORIES } from '../../utils/constants'

const CommunityHome = () => {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('all')
  const [sortBy, setSortBy] = useState('recent')

useEffect(() => {
  const fetchPosts = async () => {
    try {
      setLoading(true)
      const data = await communityService.getPosts(activeCategory, sortBy)
      setPosts(data)
    } catch (error) {
      console.error('Failed to fetch posts:', error)
    } finally {
      setLoading(false)
    }
  }

  fetchPosts()
}, [activeCategory, sortBy])
  const getCategoryBadge = (category) => {
    const cat = POST_CATEGORIES.find((c) => c.value === category)
    return <Badge variant="info">{cat?.label || category}</Badge>
  }

  if (loading) {
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
              className="input-field pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={sortBy === 'recent' ? 'primary' : 'secondary'}
              size="sm"
              icon={FiClock}
              onClick={() => setSortBy('recent')}
            >
              Recent
            </Button>
            <Button
              variant={sortBy === 'trending' ? 'primary' : 'secondary'}
              size="sm"
              icon={FiTrendingUp}
              onClick={() => setSortBy('trending')}
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
            onClick={() => setActiveCategory('all')}
          >
            All
          </Button>
          {POST_CATEGORIES.map((cat) => (
            <Button
              key={cat.value}
              variant={activeCategory === cat.value ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setActiveCategory(cat.value)}
            >
              {cat.label}
            </Button>
          ))}
        </div>
      </Card>

      {/* Posts Grid */}
      <div className="grid gap-6">
        {posts.map((post, index) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Link to={`/community/post/${post.id}`}>
              <Card hover>
                <div className="flex gap-4">
                  {post.image && (
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-32 h-32 rounded-xl object-cover hidden sm:block"
                    />
                  )}
                  <div className="flex-1">
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

                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 hover:text-primary-500 transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2 mb-4">
                      {post.content}
                    </p>

                    <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
                      <button className="flex items-center gap-1 hover:text-primary-500 transition-colors">
                        <FiHeart className="w-4 h-4" />
                        <span>{post.likes}</span>
                      </button>
                      <button className="flex items-center gap-1 hover:text-primary-500 transition-colors">
                        <FiMessageCircle className="w-4 h-4" />
                        <span>{post.comments}</span>
                      </button>
                      <button className="flex items-center gap-1 hover:text-primary-500 transition-colors">
                        <FiBookmark className="w-4 h-4" />
                        <span>Save</span>
                      </button>
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Load More */}
      <div className="text-center">
        <Button variant="secondary">Load More Posts</Button>
      </div>
    </div>
  )
}

export default CommunityHome