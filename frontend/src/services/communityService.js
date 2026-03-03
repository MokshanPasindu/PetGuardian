// src/services/communityService.js
import api from './api'

export const communityService = {
  // Posts
  getPosts: async (category = 'all', sortBy = 'recent') => {
    try {
      // In production, this would call the actual API
      // const response = await api.get('/community/posts', { params: { category, sortBy } })
      // return response.data
      
      // For now, return mock data that matches your component
      return [
        {
          id: 1,
          title: 'Tips for Managing Dog Allergies in Spring',
          content: 'Spring is here and so are the allergies! Here are some tips I\'ve learned from managing my Golden Retriever\'s seasonal allergies...',
          author: {
            id: 1,
            name: 'Sarah Johnson',
            avatar: 'https://randomuser.me/api/portraits/women/1.jpg',
          },
          category: 'health',
          likes: 45,
          comments: 12,
          createdAt: new Date(Date.now() - 3600000).toISOString(),
          image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=200&fit=crop',
        },
        {
          id: 2,
          title: 'Best Food Brands for Sensitive Stomachs?',
          content: 'My cat has been having digestive issues lately. Can anyone recommend good food brands for cats with sensitive stomachs?',
          author: {
            id: 2,
            name: 'Mike Chen',
            avatar: 'https://randomuser.me/api/portraits/men/2.jpg',
          },
          category: 'nutrition',
          likes: 23,
          comments: 34,
          createdAt: new Date(Date.now() - 86400000).toISOString(),
        },
        {
          id: 3,
          title: 'Success Story: Training My Rescue Dog',
          content: 'After 6 months of patience and consistent training, my rescue dog Luna has completely transformed! Here\'s our journey...',
          author: {
            id: 3,
            name: 'Emily Rodriguez',
            avatar: 'https://randomuser.me/api/portraits/women/3.jpg',
          },
          category: 'success-story',
          likes: 156,
          comments: 28,
          createdAt: new Date(Date.now() - 172800000).toISOString(),
          image: 'https://images.unsplash.com/photo-1544568100-847a948585b9?w=400&h=200&fit=crop',
        },
      ]
    } catch (error) {
      console.error('Error fetching posts:', error)
      throw error
    }
  },

  getPostById: async (postId) => {
    try {
      // const response = await api.get(`/community/posts/${postId}`)
      // return response.data
      
      // Mock implementation
      return {
        id: postId,
        title: 'Sample Post',
        content: 'Sample content',
        author: {
          id: 1,
          name: 'Sarah Johnson',
          avatar: 'https://randomuser.me/api/portraits/women/1.jpg',
        },
        category: 'general',
        likes: 45,
        comments: 12,
        createdAt: new Date().toISOString(),
      }
    } catch (error) {
      console.error('Error fetching post:', error)
      throw error
    }
  },

  createPost: async (postData) => {
    try {
      // const response = await api.post('/community/posts', postData)
      // return response.data
      console.log('Creating post:', postData)
      return { ...postData, id: Date.now(), createdAt: new Date().toISOString() }
    } catch (error) {
      console.error('Error creating post:', error)
      throw error
    }
  },

  updatePost: async (postId, postData) => {
    try {
      // const response = await api.put(`/community/posts/${postId}`, postData)
      // return response.data
      console.log('Updating post:', postId, postData)
      return { ...postData, id: postId }
    } catch (error) {
      console.error('Error updating post:', error)
      throw error
    }
  },

  deletePost: async (postId) => {
    try {
      // const response = await api.delete(`/community/posts/${postId}`)
      // return response.data
      console.log('Deleting post:', postId)
      return { success: true }
    } catch (error) {
      console.error('Error deleting post:', error)
      throw error
    }
  },

  // Comments
  getComments: async (postId) => {
    try {
      // const response = await api.get(`/community/posts/${postId}/comments`)
      // return response.data
      return []
    } catch (error) {
      console.error('Error fetching comments:', error)
      throw error
    }
  },

  addComment: async (postId, commentData) => {
    try {
      // const response = await api.post(`/community/posts/${postId}/comments`, commentData)
      // return response.data
      console.log('Adding comment:', postId, commentData)
      return { ...commentData, id: Date.now(), createdAt: new Date().toISOString() }
    } catch (error) {
      console.error('Error adding comment:', error)
      throw error
    }
  },

  // Likes
  likePost: async (postId) => {
    try {
      // const response = await api.post(`/community/posts/${postId}/like`)
      // return response.data
      return { liked: true, likesCount: 46 }
    } catch (error) {
      console.error('Error liking post:', error)
      throw error
    }
  },

  unlikePost: async (postId) => {
    try {
      // const response = await api.delete(`/community/posts/${postId}/like`)
      // return response.data
      return { liked: false, likesCount: 44 }
    } catch (error) {
      console.error('Error unliking post:', error)
      throw error
    }
  },
}
export default communityService  