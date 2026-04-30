// src/components/community/ShareButton.jsx
import { useState } from 'react'
import { FiShare2, FiCopy, FiCheckCircle, FiTwitter, FiFacebook } from 'react-icons/fi'
import toast from 'react-hot-toast'

const ShareButton = ({ post, compact = false }) => {
  const [showMenu, setShowMenu] = useState(false)
  const [copied, setCopied] = useState(false)

  const postUrl = `${window.location.origin}/community/post/${post.id}`
  const shareText = `Check out this post: "${post.title}" on PetGuardian`

  // ─── Copy link ────────────────────────────────────────────────────────────
  const handleCopyLink = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    try {
      await navigator.clipboard.writeText(postUrl)
      setCopied(true)
      toast.success('Link copied!')
      setTimeout(() => {
        setCopied(false)
        setShowMenu(false)
      }, 2000)
    } catch {
      toast.error('Failed to copy link')
    }
  }

  // ─── Native share ─────────────────────────────────────────────────────────
  const handleNativeShare = async (e) => {
    e.preventDefault()
    e.stopPropagation()

    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          text: shareText,
          url: postUrl,
        })
        setShowMenu(false)
      } catch (err) {
        if (err.name !== 'AbortError') {
          handleCopyLink(e)
        }
      }
    } else {
      setShowMenu(!showMenu)
    }
  }

  // ─── Twitter share ────────────────────────────────────────────────────────
  const handleTwitter = (e) => {
    e.preventDefault()
    e.stopPropagation()
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      shareText
    )}&url=${encodeURIComponent(postUrl)}`
    window.open(url, '_blank', 'width=550,height=420')
    setShowMenu(false)
  }

  // ─── Facebook share ───────────────────────────────────────────────────────
  const handleFacebook = (e) => {
    e.preventDefault()
    e.stopPropagation()
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
      postUrl
    )}`
    window.open(url, '_blank', 'width=550,height=420')
    setShowMenu(false)
  }

  // ─── Compact mode (used in feed) ──────────────────────────────────────────
  if (compact) {
    return (
      <button
        onClick={handleNativeShare}
        className="flex items-center gap-1 text-gray-400 hover:text-primary-500 dark:text-gray-500 dark:hover:text-primary-400 transition-colors text-sm"
        title="Share post"
      >
        {copied ? (
          <FiCheckCircle className="w-4 h-4 text-green-500" />
        ) : (
          <FiShare2 className="w-4 h-4" />
        )}
      </button>
    )
  }

  // ─── Full mode (used in PostDetails) ─────────────────────────────────────
  return (
    <div className="relative">
      <button
        onClick={handleNativeShare}
        className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-primary-500 dark:hover:text-primary-400 transition-colors font-medium"
      >
        <FiShare2 className="w-5 h-5" />
        <span>Share</span>
      </button>

      {/* Dropdown menu (shown on non-native share devices) */}
      {showMenu && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={(e) => {
              e.stopPropagation()
              setShowMenu(false)
            }}
          />

          {/* Menu */}
          <div className="absolute bottom-full left-0 mb-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-large border border-gray-100 dark:border-gray-700 z-20 overflow-hidden">
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-3 w-full px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              {copied ? (
                <FiCheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <FiCopy className="w-4 h-4" />
              )}
              {copied ? 'Copied!' : 'Copy Link'}
            </button>

            <button
              onClick={handleTwitter}
              className="flex items-center gap-3 w-full px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-t border-gray-100 dark:border-gray-700"
            >
              <FiTwitter className="w-4 h-4 text-sky-500" />
              Share on Twitter
            </button>

            <button
              onClick={handleFacebook}
              className="flex items-center gap-3 w-full px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-t border-gray-100 dark:border-gray-700"
            >
              <FiFacebook className="w-4 h-4 text-blue-600" />
              Share on Facebook
            </button>
          </div>
        </>
      )}
    </div>
  )
}

export default ShareButton