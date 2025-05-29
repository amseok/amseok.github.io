import { useState } from 'react'
import './DreamTimeline.css'

function DreamTimeline({ dreams, onUpdateDream, onDeleteDream, onAnalyzeDream }) {
  const [editingId, setEditingId] = useState(null)
  const [editTitle, setEditTitle] = useState('')
  const [editContent, setEditContent] = useState('')
  const [editMood, setEditMood] = useState('')
  const [editTags, setEditTags] = useState('')

  const startEditing = (dream) => {
    setEditingId(dream.id)
    setEditTitle(dream.title)
    setEditContent(dream.content)
    setEditMood(dream.mood)
    setEditTags(dream.tags ? dream.tags.join(', ') : '')
  }

  const saveEdit = () => {
    onUpdateDream(editingId, {
      title: editTitle.trim(),
      content: editContent.trim(),
      mood: editMood,
      tags: editTags.split(',').map(tag => tag.trim()).filter(tag => tag),
      updatedAt: new Date().toISOString()
    })
    setEditingId(null)
  }

  const cancelEdit = () => {
    setEditingId(null)
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getMoodEmoji = (mood) => {
    const moods = {
      wonderful: '🌟',
      peaceful: '😌',
      neutral: '😐',
      strange: '🤔',
      scary: '😨',
      sad: '😢'
    }
    return moods[mood] || '😐'
  }

  if (dreams.length === 0) {
    return (
      <div className="timeline-empty">
        <div className="empty-state">
          <span className="empty-icon">🌙</span>
          <h3>No dreams recorded yet</h3>
          <p>Start recording your dreams to build your personal dream journal</p>
        </div>
      </div>
    )
  }

  return (
    <div className="dream-timeline">
      <h2 className="timeline-title">Your Dream Journey</h2>
      <div className="timeline-container">
        {dreams.map((dream) => (
          <div key={dream.id} className="timeline-item">
            <div className="timeline-marker"></div>
            <div className="dream-card">
              {editingId === dream.id ? (
                <div className="edit-form">
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="edit-title-input"
                  />
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="edit-content-input"
                    rows="4"
                  />
                  <div className="edit-controls">
                    <select
                      value={editMood}
                      onChange={(e) => setEditMood(e.target.value)}
                      className="edit-mood-select"
                    >
                      <option value="wonderful">🌟 Wonderful</option>
                      <option value="peaceful">😌 Peaceful</option>
                      <option value="neutral">😐 Neutral</option>
                      <option value="strange">🤔 Strange</option>
                      <option value="scary">😨 Scary</option>
                      <option value="sad">😢 Sad</option>
                    </select>
                    <input
                      type="text"
                      value={editTags}
                      onChange={(e) => setEditTags(e.target.value)}
                      placeholder="Tags..."
                      className="edit-tags-input"
                    />
                  </div>
                  <div className="edit-actions">
                    <button onClick={saveEdit} className="save-button">💾 Save</button>
                    <button onClick={cancelEdit} className="cancel-button">❌ Cancel</button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="dream-header">
                    <h3 className="dream-title">{dream.title}</h3>
                    <div className="dream-actions">
                      <button 
                        onClick={() => onAnalyzeDream(dream)}
                        className="analyze-button"
                        title="Analyze dream meaning"
                      >
                        🔮
                      </button>
                      <button 
                        onClick={() => startEditing(dream)}
                        className="edit-button"
                        title="Edit dream"
                      >
                        ✏️
                      </button>
                      <button 
                        onClick={() => onDeleteDream(dream.id)}
                        className="delete-button"
                        title="Delete dream"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                  
                  <div className="dream-meta">
                    <span className="dream-mood">{getMoodEmoji(dream.mood)}</span>
                    <span className="dream-date">{formatDate(dream.createdAt)}</span>
                  </div>
                  
                  <p className="dream-content">{dream.content}</p>
                  
                  {dream.tags && dream.tags.length > 0 && (
                    <div className="dream-tags">
                      {dream.tags.map((tag, i) => (
                        <span key={i} className="tag">#{tag}</span>
                      ))}
                    </div>
                  )}
                  
                  {dream.updatedAt && (
                    <div className="dream-updated">
                      Last updated: {formatDate(dream.updatedAt)}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default DreamTimeline
