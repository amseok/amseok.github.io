import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import './DreamEntry.css'

function DreamEntry({ onAddDream }) {
    const [title, setTitle] = useState('')
    const [content, setContent] = useState('')
    const [mood, setMood] = useState('neutral')
    const [tags, setTags] = useState('')
    const [isExpanded, setIsExpanded] = useState(false)
    const [isMoodDropdownOpen, setIsMoodDropdownOpen] = useState(false)
    const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 })
    const dropdownRef = useRef(null)
    const buttonRef = useRef(null)

    const moodOptions = [
        { value: 'wonderful', label: '🌟 Wonderful' },
        { value: 'peaceful', label: '😌 Peaceful' },
        { value: 'neutral', label: '😐 Neutral' },
        { value: 'strange', label: '🤔 Strange' },
        { value: 'scary', label: '😨 Scary' },
        { value: 'sad', label: '😢 Sad' }
    ]

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsMoodDropdownOpen(false)
      }
    }

    function handleEscape(event) {
      if (event.key === 'Escape') {
        setIsMoodDropdownOpen(false)
      }
    }

    if (isMoodDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('touchstart', handleClickOutside)
      document.addEventListener('keydown', handleEscape)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }  }, [isMoodDropdownOpen])

  // Handle window resize and scroll to close dropdown
  useEffect(() => {
    const handleWindowEvents = () => {
      if (isMoodDropdownOpen) {
        setIsMoodDropdownOpen(false)
      }
    }

    if (isMoodDropdownOpen) {
      window.addEventListener('resize', handleWindowEvents)
      window.addEventListener('scroll', handleWindowEvents)
    }

    return () => {
      window.removeEventListener('resize', handleWindowEvents)
      window.removeEventListener('scroll', handleWindowEvents)
    }
  }, [isMoodDropdownOpen])

  const toggleDropdown = () => {
    if (!isMoodDropdownOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      setDropdownPosition({
        top: rect.bottom + window.scrollY + 5,
        left: rect.left + window.scrollX,
        width: rect.width
      })
    }
    setIsMoodDropdownOpen(!isMoodDropdownOpen)
  }

    const handleSubmit = (e) => {
        e.preventDefault()
        if (!title.trim() || !content.trim()) return

        onAddDream({
            title: title.trim(),
            content: content.trim(),
            mood,
            tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag)
        })        // Reset form
        setTitle('')
        setContent('')
        setMood('neutral')
        setTags('')
        setIsExpanded(false)
    }

    return (
        <div className={`dream-entry ${isExpanded ? 'expanded' : ''}`}>
            <button
                className="expand-button"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <span className="plus-icon">{isExpanded ? '−' : '+'}</span>
                {isExpanded ? 'Cancel' : 'Record a Dream'}
            </button>

            {isExpanded && (
                <form onSubmit={handleSubmit} className="dream-form">
                    <div className="form-group">
                        <input
                            type="text"
                            placeholder="Dream title..."
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="dream-title-input"
                            autoFocus
                        />
                    </div>

                    <div className="form-group">
                        <textarea
                            placeholder="Describe your dream in detail..."
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            className="dream-content-input"
                            rows="6"
                        />
                    </div>
                    <div className="form-group">
                        <label className="mood-label">Dream Mood:</label>
                        <div className="custom-select-container" ref={dropdownRef}>                            <button
                                type="button"
                                ref={buttonRef}
                                className="custom-select-button"
                                onClick={toggleDropdown}
                            >
                                <span className="selected-mood">
                                    {moodOptions.find(option => option.value === mood)?.label}
                                </span>
                                <span className={`dropdown-arrow ${isMoodDropdownOpen ? 'open' : ''}`}>
                                    ▼
                                </span>
                            </button>                            {isMoodDropdownOpen && createPortal(
                                <div 
                                    className="custom-dropdown-portal"
                                    style={{
                                        position: 'absolute',
                                        top: dropdownPosition.top,
                                        left: dropdownPosition.left,
                                        width: dropdownPosition.width,
                                        zIndex: 999999
                                    }}
                                    ref={dropdownRef}
                                >
                                    {moodOptions.map(option => (
                                        <button
                                            key={option.value}
                                            type="button"
                                            className={`dropdown-option ${mood === option.value ? 'selected' : ''}`}
                                            onClick={() => {
                                                setMood(option.value)
                                                setIsMoodDropdownOpen(false)
                                            }}
                                        >
                                            {option.label}
                                        </button>
                                    ))}
                                </div>,
                                document.body
                            )}
                        </div>
                    </div>

                    <div className="form-group">
                        <input
                            type="text"
                            placeholder="Tags (comma separated): flying, family, water..."
                            value={tags}
                            onChange={(e) => setTags(e.target.value)}
                            className="tags-input"
                        />
                    </div>

                    <div className="form-actions">
                        <button type="submit" className="submit-button">
                            ✨ Save Dream
                        </button>
                    </div>
                </form>
            )}
        </div>
    )
}

export default DreamEntry
