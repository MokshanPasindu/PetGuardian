// src/components/community/TagInput.jsx
import { useState } from 'react'
import { FiX, FiPlus } from 'react-icons/fi'

const TagInput = ({ tags = [], onChange, maxTags = 5 }) => {
  const [inputValue, setInputValue] = useState('')

  const addTag = () => {
    const tag = inputValue.trim().toLowerCase()
    
    if (!tag) return
    
    if (tags.length >= maxTags) {
      return
    }
    
    if (tags.includes(tag)) {
      setInputValue('')
      return
    }
    
    onChange([...tags, tag])
    setInputValue('')
  }

  const removeTag = (tagToRemove) => {
    onChange(tags.filter(tag => tag !== tagToRemove))
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addTag()
    }
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        Tags (Optional) - Max {maxTags}
      </label>
      
      {/* Display tags */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 rounded-full text-sm"
            >
              #{tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="hover:text-primary-900 dark:hover:text-primary-300"
              >
                <FiX className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}
      
      {/* Input */}
      {tags.length < maxTags && (
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Add a tag..."
            className="flex-1 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
            maxLength={20}
          />
          <button
            type="button"
            onClick={addTag}
            disabled={!inputValue.trim()}
            className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <FiPlus className="w-5 h-5" />
          </button>
        </div>
      )}
      
      <p className="text-xs text-gray-500 dark:text-gray-400">
        Press Enter or click + to add a tag. {tags.length}/{maxTags} tags used.
      </p>
    </div>
  )
}

export default TagInput