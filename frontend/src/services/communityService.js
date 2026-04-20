// src/services/communityService.js
import api from './api'

export const communityService = {
  // Get all posts with filters
  getPosts: async (category = 'all', sortBy = 'recent', page = 0, size = 10) => {
    try {
      const params = { page, size, sort: sortBy }
      
      if (category && category !== 'all') {
        params.category = category.toUpperCase()
      }
      
      const response = await api.get('/community/posts', { params })
      
      if (response.data.content) {
        return response.data.content
      }
      return response.data
      
    } catch (error) {
      console.error('Get Posts Error:', error)
      throw new Error(error.response?.data?.message || 'Failed to fetch posts')
    }
  },

  // Get single post by ID
  getPostById: async (postId) => {
    try {
      const response = await api.get(`/community/posts/${postId}`)
      return response.data
    } catch (error) {
      console.error('Get Post Error:', error)
      throw new Error(error.response?.data?.message || 'Failed to fetch post')
    }
  },

  // ✅ NEW: Get posts by tags
  getPostsByTags: async (tags, page = 0, size = 10) => {
    try {
      const response = await api.get('/community/posts/by-tags', {
        params: { tags, page, size }
      })
      return response.data
    } catch (error) {
      console.error('Get Posts By Tags Error:', error)
      throw new Error(error.response?.data?.message || 'Failed to fetch posts by tags')
    }
  },

  // Search posts
  searchPosts: async (query, page = 0, size = 10) => {
    try {
      const response = await api.get('/community/posts/search', {
        params: { query, page, size }
      })
      return response.data
    } catch (error) {
      console.error('Search Posts Error:', error)
      throw new Error(error.response?.data?.message || 'Failed to search posts')
    }
  },

  // Create new post
  createPost: async (postData) => {
    try {
      const formData = new FormData()
      
      formData.append('title', postData.title)
      formData.append('content', postData.content)
      formData.append('category', postData.category.toUpperCase())
      
      // ✅ NEW: Add tags
      if (postData.tags && postData.tags.length > 0) {
        postData.tags.forEach(tag => {
          formData.append('tags', tag)
        })
      }
      
      if (postData.images && postData.images.length > 0) {
        formData.append('image', postData.images[0])
      }

      const response = await api.post('/community/posts', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      
      return response.data
    } catch (error) {
      console.error('Create Post Error:', error)
      throw new Error(error.response?.data?.message || 'Failed to create post')
    }
  },

  // Update post
  updatePost: async (postId, postData) => {
    try {
      const formData = new FormData()
      
      if (postData.title) formData.append('title', postData.title)
      if (postData.content) formData.append('content', postData.content)
      if (postData.category) formData.append('category', postData.category.toUpperCase())
      
      // ✅ NEW: Add tags
      if (postData.tags && postData.tags.length > 0) {
        postData.tags.forEach(tag => {
          formData.append('tags', tag)
        })
      }
      
      if (postData.images && postData.images.length > 0) {
        formData.append('image', postData.images[0])
      }

      const response = await api.put(`/community/posts/${postId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      return response.data
    } catch (error) {
      console.error('Update Post Error:', error)
      throw new Error(error.response?.data?.message || 'Failed to update post')
    }
  },

  // Delete post
  deletePost: async (postId) => {
    try {
      const response = await api.delete(`/community/posts/${postId}`)
      return response.data
    } catch (error) {
      console.error('Delete Post Error:', error)
      throw new Error(error.response?.data?.message || 'Failed to delete post')
    }
  },

  // Like a post (toggle)
  likePost: async (postId) => {
    try {
      const response = await api.post(`/community/posts/${postId}/like`)
      return response.data
    } catch (error) {
      console.error('Like Post Error:', error)
      throw new Error(error.response?.data?.message || 'Failed to like post')
    }
  },

  // ✅ NEW: Flag post
  flagPost: async (postId, reason) => {
    try {
      const response = await api.post(`/community/posts/${postId}/flag`, {
        reason
      })
      return response.data
    } catch (error) {
      console.error('Flag Post Error:', error)
      throw new Error(error.response?.data?.message || 'Failed to flag post')
    }
  },

  // Get comments for a post
  getComments: async (postId) => {
    try {
      const response = await api.get(`/community/posts/${postId}/comments`)
      return response.data
    } catch (error) {
      console.error('Get Comments Error:', error)
      return []
    }
  },

  // Add comment to post
  addComment: async (postId, content) => {
    try {
      const response = await api.post(`/community/posts/${postId}/comments`, {
        content: content
      })
      return response.data
    } catch (error) {
      console.error('Add Comment Error:', error)
      throw new Error(error.response?.data?.message || 'Failed to add comment')
    }
  },

  // ✅ NEW: Add reply to comment
  addReply: async (postId, commentId, content) => {
    try {
      const response = await api.post(
        `/community/posts/${postId}/comments/${commentId}/replies`,
        { content }
      )
      return response.data
    } catch (error) {
      console.error('Add Reply Error:', error)
      throw new Error(error.response?.data?.message || 'Failed to add reply')
    }
  },

  // ✅ NEW: Update comment
  updateComment: async (postId, commentId, content) => {
    try {
      const response = await api.put(
        `/community/posts/${postId}/comments/${commentId}`,
        { content }
      )
      return response.data
    } catch (error) {
      console.error('Update Comment Error:', error)
      throw new Error(error.response?.data?.message || 'Failed to update comment')
    }
  },

  // Delete comment
  deleteComment: async (postId, commentId) => {
    try {
      const response = await api.delete(`/community/posts/${postId}/comments/${commentId}`)
      return response.data
    } catch (error) {
      console.error('Delete Comment Error:', error)
      throw new Error(error.response?.data?.message || 'Failed to delete comment')
    }
  },

  // Like a comment (toggle)
  likeComment: async (postId, commentId) => {
    try {
      const response = await api.post(`/community/posts/${postId}/comments/${commentId}/like`)
      return response.data
    } catch (error) {
      console.error('Like Comment Error:', error)
      throw new Error(error.response?.data?.message || 'Failed to like comment')
    }
  },

  // ✅ NEW: Admin - Get flagged posts
  getFlaggedPosts: async (page = 0, size = 10) => {
    try {
      const response = await api.get('/community/admin/flagged-posts', {
        params: { page, size }
      })
      return response.data
    } catch (error) {
      console.error('Get Flagged Posts Error:', error)
      throw new Error(error.response?.data?.message || 'Failed to fetch flagged posts')
    }
  },

  // ✅ NEW: Admin - Unflag post
  unflagPost: async (postId) => {
    try {
      const response = await api.put(`/community/admin/posts/${postId}/unflag`)
      return response.data
    } catch (error) {
      console.error('Unflag Post Error:', error)
      throw new Error(error.response?.data?.message || 'Failed to unflag post')
    }
  },

  // ✅ NEW: Admin - Delete post
  deletePostByAdmin: async (postId) => {
    try {
      const response = await api.delete(`/community/admin/posts/${postId}`)
      return response.data
    } catch (error) {
      console.error('Admin Delete Post Error:', error)
      throw new Error(error.response?.data?.message || 'Failed to delete post')
    }
  },
}

export default communityService