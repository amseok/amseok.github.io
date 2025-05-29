import { useState } from 'react'
import './DreamEntry.css'

function DreamEntry({ onAddDream }) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [mood, setMood] = useState('neutral')
  const [tags, setTags] = useState('')
  const [isExpanded, setIsExpanded] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!title.trim() || !content.trim()) return

    onAddDream({
      title: title.trim(),
      content: content.trim(),
      mood,
      tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag)
    })

    // Reset form
    setTitle('')
    setContent('')
    setMood('neutral')
    setTags('')
    setIsExpanded(false)
  }

  return (
    <div className="dream-entry">
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
            <select
              value={mood}
              onChange={(e) => setMood(e.target.value)}
              className="mood-select"
            >
              <option value="wonderful">🌟 Wonderful</option>
              <option value="peaceful">😌 Peaceful</option>
              <option value="neutral">😐 Neutral</option>
              <option value="strange">🤔 Strange</option>
              <option value="scary">😨 Scary</option>
              <option value="sad">😢 Sad</option>
            </select>
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
