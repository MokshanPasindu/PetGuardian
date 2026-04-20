// src/components/community/ShareButton.jsx
import { useState, useRef, useEffect } from 'react'
import { FiShare2, FiLink, FiTwitter, FiFacebook, FiX } from 'react-icons/fi'
import toast from 'react-hot-toast'

const ShareButton = ({ post, compact = false }) => {
  const [showMenu, setShowMenu] = useState(false)
  const menuRef = useRef(null)
  
  const shareUrl = `${window.location.origin}/community/post/${post.id}`
  
  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])
  
  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl)
    toast.success('Link copied to clipboard!')
    setShowMenu(false)
  }
  
  const shareTwitter = () => {
    const text = `Check out this post: ${post.title}`
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`,
      '_blank',
      'width=550,height=420'
    )
    setShowMenu(false)
  }
  
  const shareFacebook = () => {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      '_blank',
      'width=550,height=420'
    )
    setShowMenu(false)
  }
  
  if (compact) {
    return (
      <button
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          copyLink()
        }}
        className="flex items-center gap-1 hover:text-primary-500 transition-colors"
      >
        <FiShare2 className="w-4 h-4" />
        <span>Share</span>
      </button>
    )
  }
  
  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-primary-500 transition-colors"
      >
        <FiShare2 className="w-5 h-5" />
        <span>Share</span>
      </button>
      
      {showMenu && (
        <div className="absolute bottom-full mb-2 right-0 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-2 space-y-1 z-10 min-w-[160px]">
          <button
            onClick={copyLink}
            className="flex items-center gap-3 w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300"
          >
            <FiLink className="w-4 h-4" />
            Copy Link
          </button>
          <button
            onClick={shareTwitter}
            className="flex items-center gap-3 w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300"
          >
            <FiTwitter className="w-4 h-4" />
            Twitter
          </button>
          <button
            onClick={shareFacebook}
            className="flex items-center gap-3 w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300"
          >
            <FiFacebook className="w-4 h-4" />
            Facebook
          </button>
        </div>
      )}
    </div>
  )
}

export default ShareButton