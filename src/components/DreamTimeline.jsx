import { useState } from 'react'
import ShareUtils from '../utils/ShareUtilsImproved'
import './DreamTimeline.css'

function DreamTimeline({ dreams, onUpdateDream, onDeleteDream, onAnalyzeDream }) {
  const [editingId, setEditingId] = useState(null)
  const [editTitle, setEditTitle] = useState('')
  const [editContent, setEditContent] = useState('')
  const [editMood, setEditMood] = useState('')
  const [editTags, setEditTags] = useState('')
  const [shareSuccess, setShareSuccess] = useState(null)
  const [deleteConfirmation, setDeleteConfirmation] = useState(null)

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
  const handleShareDream = async (dream) => {
    try {
      const shareResult = ShareUtils.generateShareUrl(dream)
      
      if (shareResult.url) {
        const success = await ShareUtils.copyToClipboard(shareResult.url)
        if (success) {
          setShareSuccess(dream.id)
          setTimeout(() => setShareSuccess(null), 3000)
          
          // Show warning if dream was truncated
          if (shareResult.wasTruncated) {
            setTimeout(() => {
              alert('Note: Your dream was truncated for sharing due to length limits. The full dream will remain in your journal.')
            }, 500)
          }
        } else {
          alert('Failed to copy share link. Please try again.')
        }
      } else {
        // Handle case where dream is too long to share
        const validation = shareResult.validationResult
        alert(`Cannot share dream: ${validation.reason}\n\nSuggestion: ${validation.suggestedAction || 'Try shortening the content'}`)
      }
    } catch (error) {
      console.error('Error sharing dream:', error)
      alert('Failed to share dream. Please try again.')
    }
  }

  const handleDeleteClick = (dream) => {
    setDeleteConfirmation(dream)
  }

  const confirmDelete = () => {
    if (deleteConfirmation) {
      onDeleteDream(deleteConfirmation.id)
      setDeleteConfirmation(null)
    }
  }

  const cancelDelete = () => {
    setDeleteConfirmation(null)
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
                <>                  <div className="dream-header">
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
                        onClick={() => handleShareDream(dream)}
                        className={`share-button ${shareSuccess === dream.id ? 'share-success' : ''}`}
                        title={shareSuccess === dream.id ? "Share link copied!" : "Share this dream"}
                      >
                        {shareSuccess === dream.id ? '✅' : '📤'}
                      </button>
                      <button 
                        onClick={() => startEditing(dream)}
                        className="edit-button"
                        title="Edit dream"
                      >
                        ✏️
                      </button>                      <button 
                        onClick={() => handleDeleteClick(dream)}
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
                  
                  {shareSuccess === dream.id && (
                    <div className="share-success">
                      Dream link copied to clipboard!
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        ))}
      </div>      {deleteConfirmation && (
        <div className="delete-modal-overlay">
          <div className="delete-modal">
            <div className="delete-modal-header">
              <span className="delete-modal-icon">🌙</span>
              <h3>Release this dream?</h3>
            </div>
            <div className="delete-modal-content">
              <p>Are you sure you want to release "<strong>{deleteConfirmation.title}</strong>" into the cosmic void?</p>
              <p className="delete-warning">This action cannot be undone, and your dream will be lost forever.</p>
            </div>
            <div className="delete-modal-actions">
              <button onClick={confirmDelete} className="confirm-delete-button">
                <span className="button-icon">✨</span>
                Release Dream
              </button>
              <button onClick={cancelDelete} className="cancel-delete-button">
                <span className="button-icon">🛡️</span>
                Keep Dream
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DreamTimeline
