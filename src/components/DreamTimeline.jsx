import { useState, useEffect } from 'react'
import ShareUtils from '../utils/ShareUtils'
import './DreamTimeline.css'

function DreamTimeline({ dreams, onUpdateDream, onDeleteDream, onAnalyzeDream }) {
  const [editingId, setEditingId] = useState(null)
  const [editTitle, setEditTitle] = useState('')
  const [editContent, setEditContent] = useState('')
  const [editMood, setEditMood] = useState('')
  const [editTags, setEditTags] = useState('')
  const [shareSuccess, setShareSuccess] = useState(null)
  const [deleteConfirmation, setDeleteConfirmation] = useState(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState(null)

  // Auto-clear error messages after 10 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null)
      }, 10000) // 10 seconds

      return () => clearTimeout(timer)
    }
  }, [error])

  // Auto-clear share success messages after 10 seconds
  useEffect(() => {
    if (shareSuccess) {
      const timer = setTimeout(() => {
        setShareSuccess(null)
      }, 10000) // 10 seconds

      return () => clearTimeout(timer)
    }
  }, [shareSuccess])

  const startEditing = (dream) => {
    setEditingId(dream.id)
    setEditTitle(dream.title)
    setEditContent(dream.content)
    setEditMood(dream.mood)
    setEditTags(dream.tags ? dream.tags.join(', ') : '')
  }
  const saveEdit = async () => {
    setIsUpdating(true)
    setError(null)
    
    try {
      await onUpdateDream(editingId, {
        title: editTitle.trim(),
        content: editContent.trim(),
        mood: editMood,
        tags: editTags.split(',').map(tag => tag.trim()).filter(tag => tag)
      })
      setEditingId(null)
    } catch (error) {
      console.error('Failed to update dream:', error)
      setError('Failed to update dream. Please try again.')
    } finally {
      setIsUpdating(false)
    }
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
      const shareResult = await ShareUtils.shareDream(dream)
      
      if (shareResult.success) {
        const success = await ShareUtils.copyToClipboard(shareResult.shareUrl)
        if (success) {
          setShareSuccess(dream.id)
          setTimeout(() => setShareSuccess(null), 3000)
        } else {
          alert('Failed to copy share link. Please try again.')
        }
      } else {
        alert(`Failed to share dream: ${shareResult.error}`)
      }
    } catch (error) {
      console.error('Error sharing dream:', error)
      alert('Failed to share dream. Please try again.')
    }
  }

  const handleDeleteClick = (dream) => {
    setDeleteConfirmation(dream)
  }
  const confirmDelete = async () => {
    if (deleteConfirmation) {
      setIsDeleting(true)
      setError(null)
      
      try {
        await onDeleteDream(deleteConfirmation.id)
        setDeleteConfirmation(null)
      } catch (error) {
        console.error('Failed to delete dream:', error)
        setError('Failed to delete dream. Please try again.')
      } finally {
        setIsDeleting(false)
      }
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
                    />                  </div>
                  {error && (
                    <div className="error-message" style={{
                      backgroundColor: '#ffebee',
                      color: '#c62828',
                      padding: '8px 12px',
                      margin: '8px 0',
                      borderRadius: '4px',
                      border: '1px solid #ffcdd2',
                      fontSize: '14px'
                    }}>
                      {error}
                    </div>
                  )}
                  <div className="edit-actions">
                    <button 
                      onClick={saveEdit} 
                      className="save-button"
                      disabled={isUpdating}
                    >
                      {isUpdating ? '💫 Saving...' : '💾 Save'}
                    </button>
                    <button 
                      onClick={cancelEdit} 
                      className="cancel-button"
                      disabled={isUpdating}
                    >
                      ❌ Cancel
                    </button>
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
            </div>            <div className="delete-modal-actions">
              <button 
                onClick={confirmDelete} 
                className="confirm-delete-button"
                disabled={isDeleting}
              >
                <span className="button-icon">{isDeleting ? '💫' : '✨'}</span>
                {isDeleting ? 'Releasing...' : 'Release Dream'}
              </button>
              <button 
                onClick={cancelDelete} 
                className="cancel-delete-button"
                disabled={isDeleting}
              >
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
