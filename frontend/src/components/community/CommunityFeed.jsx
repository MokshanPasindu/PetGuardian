// src/components/community/CommunityFeed.jsx
import { motion } from 'framer-motion'
import PostCard from './PostCard'
import EmptyState from '../common/EmptyState'
import Button from '../common/Button'
import { FiMessageCircle } from 'react-icons/fi'

const CommunityFeed = ({ posts, loading, onLoadMore, hasMore }) => {
  if (loading && (!posts || posts.length === 0)) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-gray-200 dark:bg-gray-700 rounded-2xl h-48 animate-pulse"
          />
        ))}
      </div>
    )
  }

  if (!posts || posts.length === 0) {
    return (
      <EmptyState
        icon={FiMessageCircle}
        title="No posts yet"
        description="Be the first to share something with the community"
        action={() => (window.location.href = '/community/create')}
        actionLabel="Create Post"
      />
    )
  }

  return (
    <div className="space-y-6">
      {posts.map((post, index) => (
        <motion.div
          key={post.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <PostCard post={post} />
        </motion.div>
      ))}

      {hasMore && (
        <div className="text-center pt-4">
          <Button variant="secondary" onClick={onLoadMore} loading={loading}>
            Load More
          </Button>
        </div>
      )}
    </div>
  )
}

export default CommunityFeed