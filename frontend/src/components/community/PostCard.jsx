// src/components/community/PostCard.jsx
import { Link } from 'react-router-dom'
import { FiHeart, FiMessageCircle, FiBookmark } from 'react-icons/fi'
import Card from '../common/Card'
import Badge from '../common/Badge'
import Avatar from '../common/Avatar'
import { formatRelativeTime, truncateText } from '../../utils/helpers'
import { POST_CATEGORIES } from '../../utils/constants'

const PostCard = ({ post, compact = false }) => {
  const category = POST_CATEGORIES.find((c) => c.value === post.category)

  if (compact) {
    return (
      <Link to={`/community/post/${post.id}`}>
        <Card hover className="h-full">
          <div className="flex items-start gap-3">
            <Avatar src={post.author.avatar} name={post.author.name} size="sm" />
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-gray-900 dark:text-white line-clamp-2">
                {post.title}
              </h3>
              <div className="flex items-center gap-3 mt-2 text-sm text-gray-500 dark:text-gray-400">
                <span className="flex items-center gap-1">
                  <FiHeart className="w-4 h-4" /> {post.likes}
                </span>
                <span className="flex items-center gap-1">
                  <FiMessageCircle className="w-4 h-4" /> {post.comments}
                </span>
              </div>
            </div>
          </div>
        </Card>
      </Link>
    )
  }

  return (
    <Link to={`/community/post/${post.id}`}>
      <Card hover>
        <div className="flex gap-4">
          {post.image && (
            <img
              src={post.image}
              alt={post.title}
              className="w-32 h-32 rounded-xl object-cover hidden sm:block flex-shrink-0"
            />
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-3">
                <Avatar src={post.author.avatar} name={post.author.name} size="sm" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white text-sm">
                    {post.author.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formatRelativeTime(post.createdAt)}
                  </p>
                </div>
              </div>
              <Badge variant="info">{category?.label || post.category}</Badge>
            </div>

            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 hover:text-primary-500 transition-colors">
              {post.title}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2 mb-4">
              {truncateText(post.content, 150)}
            </p>

            <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-1 hover:text-primary-500 transition-colors">
                <FiHeart className="w-4 h-4" />
                <span>{post.likes}</span>
              </span>
              <span className="flex items-center gap-1 hover:text-primary-500 transition-colors">
                <FiMessageCircle className="w-4 h-4" />
                <span>{post.comments}</span>
              </span>
              <span className="flex items-center gap-1 hover:text-primary-500 transition-colors">
                <FiBookmark className="w-4 h-4" />
                <span>Save</span>
              </span>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  )
}

export default PostCard