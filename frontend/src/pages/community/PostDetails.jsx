// src/pages/community/PostDetails.jsx
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  FiArrowLeft,
  FiHeart,
  FiMessageCircle,
  FiBookmark,
  FiShare2,
  FiMoreHorizontal,
  FiSend,
} from 'react-icons/fi'
import { communityService } from '../../services/communityService'
import { useAuth } from '../../hooks/useAuth'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import Badge from '../../components/common/Badge'
import Avatar from '../../components/common/Avatar'
import { LoadingPage } from '../../components/common/LoadingSpinner'
import { formatRelativeTime, formatDate } from '../../utils/helpers'
import { POST_CATEGORIES } from '../../utils/constants'

const PostDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [comment, setComment] = useState('')
  const [liked, setLiked] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const fetchPost = async () => {
      try {
        // Mock data for demo
        setPost({
          id,
          title: 'Tips for Managing Dog Allergies in Spring',
          content: `Spring is here and so are the allergies! Here are some tips I've learned from managing my Golden Retriever's seasonal allergies over the past 3 years.

**1. Regular Bathing**
Bathing your dog once a week during allergy season can help remove pollen and other allergens from their coat.

**2. Wipe Down After Walks**
Use pet-safe wipes to clean your dog's paws and belly after outdoor walks.

**3. Keep Windows Closed**
During high pollen days, keep windows closed to prevent allergens from entering your home.

**4. Consider Supplements**
Fish oil supplements can help reduce inflammation and improve skin health.

**5. Consult Your Vet**
If symptoms persist, consult with your vet about antihistamines or other treatments.

Hope this helps other pet parents dealing with the same issues!`,
          author: {
            id: '1',
            name: 'Sarah Johnson',
            avatar: 'https://randomuser.me/api/portraits/women/1.jpg',
          },
          category: 'health',
          likes: 45,
          createdAt: new Date(Date.now() - 3600000).toISOString(),
          image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&h=400&fit=crop',
          comments: [
            {
              id: '1',
              author: {
                name: 'Mike Chen',
                avatar: 'https://randomuser.me/api/portraits/men/2.jpg',
              },
              content: 'Great tips! The fish oil supplement worked wonders for my dog.',
              createdAt: new Date(Date.now() - 1800000).toISOString(),
              likes: 5,
            },
            {
              id: '2',
              author: {
                name: 'Emily Rodriguez',
                avatar: 'https://randomuser.me/api/portraits/women/3.jpg',
              },
              content: 'How often do you give fish oil supplements? Daily or weekly?',
              createdAt: new Date(Date.now() - 900000).toISOString(),
              likes: 2,
            },
          ],
        })
      } catch (error) {
        console.error('Failed to fetch post:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPost()
  }, [id])

  const handleLike = () => {
    setLiked(!liked)
  }

  const handleSave = () => {
    setSaved(!saved)
  }

  const handleSubmitComment = (e) => {
    e.preventDefault()
    if (!comment.trim()) return

    // Add comment to list (mock)
    setPost((prev) => ({
      ...prev,
      comments: [
        ...prev.comments,
        {
          id: Date.now().toString(),
          author: {
            name: user?.name || 'You',
            avatar: user?.avatar,
          },
          content: comment,
          createdAt: new Date().toISOString(),
          likes: 0,
        },
      ],
    }))
    setComment('')
  }

  const getCategoryBadge = (category) => {
    const cat = POST_CATEGORIES.find((c) => c.value === category)
    return <Badge variant="info">{cat?.label || category}</Badge>
  }

  if (loading) {
    return <LoadingPage message="Loading post..." />
  }

  if (!post) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Post not found
        </h2>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Button
        variant="ghost"
        icon={FiArrowLeft}
        onClick={() => navigate(-1)}
      >
        Back to Community
      </Button>

      {/* Post Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card>
          {post.image && (
            <img
              src={post.image}
              alt={post.title}
              className="w-full h-64 object-cover rounded-xl mb-6"
            />
          )}

          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <Avatar
                src={post.author.avatar}
                name={post.author.name}
                size="md"
              />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  {post.author.name}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {formatDate(post.createdAt)} • {formatRelativeTime(post.createdAt)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {getCategoryBadge(post.category)}
              <Button variant="ghost" size="sm">
                <FiMoreHorizontal className="w-5 h-5" />
              </Button>
            </div>
          </div>

          <h1 className="text-2xl font-display font-bold text-gray-900 dark:text-white mb-4">
            {post.title}
          </h1>

          <div className="prose dark:prose-invert max-w-none mb-6">
            {post.content.split('\n').map((paragraph, index) => (
              <p key={index} className="text-gray-700 dark:text-gray-300 mb-2">
                {paragraph.startsWith('**') ? (
                  <strong>{paragraph.replace(/\*\*/g, '')}</strong>
                ) : (
                  paragraph
                )}
              </p>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-4">
              <button
                onClick={handleLike}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors ${
                  liked
                    ? 'bg-red-100 dark:bg-red-900/30 text-red-500'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'
                }`}
              >
                <FiHeart className={`w-5 h-5 ${liked ? 'fill-current' : ''}`} />
                <span>{post.likes + (liked ? 1 : 0)}</span>
              </button>
              <button className="flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 transition-colors">
                <FiMessageCircle className="w-5 h-5" />
                <span>{post.comments.length}</span>
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleSave}
                className={`p-2 rounded-xl transition-colors ${
                  saved
                    ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-500'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'
                }`}
              >
                <FiBookmark className={`w-5 h-5 ${saved ? 'fill-current' : ''}`} />
              </button>
              <button className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 transition-colors">
                <FiShare2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Comments Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <Card.Header>
            <Card.Title>Comments ({post.comments.length})</Card.Title>
          </Card.Header>

          {/* Comment Form */}
          <form onSubmit={handleSubmitComment} className="mb-6">
            <div className="flex gap-3">
              <Avatar src={user?.avatar} name={user?.name} size="sm" />
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Write a comment..."
                  className="input-field pr-12"
                />
                <button
                  type="submit"
                  disabled={!comment.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-primary-500 hover:text-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FiSend className="w-5 h-5" />
                </button>
              </div>
            </div>
          </form>

          {/* Comments List */}
          <div className="space-y-4">
            {post.comments.map((commentItem) => (
              <div
                key={commentItem.id}
                className="flex gap-3 p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50"
              >
                <Avatar
                  src={commentItem.author.avatar}
                  name={commentItem.author.name}
                  size="sm"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-medium text-gray-900 dark:text-white">
                      {commentItem.author.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatRelativeTime(commentItem.createdAt)}
                    </p>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 text-sm">
                    {commentItem.content}
                  </p>
                  <button className="flex items-center gap-1 mt-2 text-sm text-gray-500 dark:text-gray-400 hover:text-primary-500 transition-colors">
                    <FiHeart className="w-4 h-4" />
                    <span>{commentItem.likes}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>
    </div>
  )
}

export default PostDetails