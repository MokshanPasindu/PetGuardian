// src/components/community/TagInput.jsx
import { useState, useRef } from 'react'
import { FiX, FiTag } from 'react-icons/fi'

const TagInput = ({ tags = [], onChange, maxTags = 5, label = 'Tags' }) => {
  const [inputValue, setInputValue] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const inputRef = useRef(null)

  // ─── Add tag ──────────────────────────────────────────────────────────────
  const addTag = (value) => {
    const tag = value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-_]/g, '') // only alphanumeric, dash, underscore

    if (!tag) return
    if (tags.includes(tag)) {
      setInputValue('')
      return
    }
    if (tags.length >= maxTags) return

    onChange([...tags, tag])
    setInputValue('')
  }

  // ─── Remove tag ───────────────────────────────────────────────────────────
  const removeTag = (tagToRemove) => {
    onChange(tags.filter((t) => t !== tagToRemove))
  }

  // ─── Key handlers ─────────────────────────────────────────────────────────
  const handleKeyDown = (e) => {
    // Add tag on Enter or comma
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addTag(inputValue)
    }
    // Remove last tag on Backspace if input is empty
    if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      onChange(tags.slice(0, -1))
    }
  }

  const handleInputChange = (e) => {
    const val = e.target.value
    // Auto-add on comma
    if (val.endsWith(',')) {
      addTag(val.slice(0, -1))
    } else {
      setInputValue(val)
    }
  }

  const handleBlur = () => {
    setIsFocused(false)
    // Add any remaining text as a tag
    if (inputValue.trim()) {
      addTag(inputValue)
    }
  }

  const canAddMore = tags.length < maxTags

  return (
    <div>
      {/* Label */}
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
        <span className="flex items-center gap-1.5">
          <FiTag className="w-4 h-4" />
          {label}
          <span className="text-gray-400 font-normal text-xs">
            (optional, max {maxTags})
          </span>
        </span>
      </label>

      {/* Tag container */}
      <div
        onClick={() => inputRef.current?.focus()}
        className={`flex flex-wrap gap-2 min-h-[44px] p-2 rounded-xl border transition-colors cursor-text ${
          isFocused
            ? 'border-primary-500 ring-2 ring-primary-500/20'
            : 'border-gray-200 dark:border-gray-700'
        } bg-white dark:bg-gray-800`}
      >
        {/* Existing tags */}
        {tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 rounded-lg text-sm font-medium"
          >
            #{tag}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                removeTag(tag)
              }}
              className="w-4 h-4 flex items-center justify-center rounded-full hover:bg-primary-200 dark:hover:bg-primary-800 transition-colors"
            >
              <FiX className="w-3 h-3" />
            </button>
          </span>
        ))}

        {/* Input */}
        {canAddMore && (
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={handleBlur}
            placeholder={
              tags.length === 0
                ? 'Add tags (press Enter or comma)'
                : 'Add more...'
            }
            maxLength={30}
            className="flex-1 min-w-[120px] bg-transparent text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none py-0.5"
          />
        )}

        {/* Max reached indicator */}
        {!canAddMore && (
          <span className="text-xs text-gray-400 dark:text-gray-500 self-center ml-1">
            Max {maxTags} tags reached
          </span>
        )}
      </div>

      {/* Helper text */}
      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5">
        Press <kbd className="px-1 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs">Enter</kbd> or{' '}
        <kbd className="px-1 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs">,</kbd> to add a tag.
        {tags.length > 0 && (
          <span className="ml-1">
            {tags.length}/{maxTags} tags used.
          </span>
        )}
      </p>
    </div>
  )
}

export default TagInput