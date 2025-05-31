import { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import ShareUtils from '../utils/ShareUtils'
import './SharedDream.css'

function SharedDream() {
  const [dream, setDream] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Get shared dream from URL
    const sharedDream = ShareUtils.getSharedDreamFromUrl()
    
    if (sharedDream) {
      setDream(sharedDream)
      setError(null)
    } else {
      setError('Invalid or corrupted share link')
    }
    
    setLoading(false)
  }, [])

  const handleGoToApp = () => {
    ShareUtils.navigateToMainApp()
    // Force a page reload to return to main app
    window.location.reload()
  }

  if (loading) {
    return (
      <div className="shared-dream-container">
        <div className="loading-shared">
          <div className="loading-spinner">🌙</div>
          <p>Loading shared dream...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="shared-dream-container">
        <div className="shared-error">
          <div className="error-icon">😴</div>
          <h2>Oops! Dream Not Found</h2>
          <p>{error}</p>
          <p>The dream you're looking for might have been shared incorrectly or the link might be broken.</p>
          <button onClick={handleGoToApp} className="go-to-app-button">
            🌙 Start Your Own Dream Journal
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="shared-dream-container">
      <div className="stars"></div>
      <div className="stars2"></div>
      <div className="stars3"></div>
      
      <header className="shared-header">
        <h1 className="shared-title">
          <span className="dream-icon">🌙</span>
          Shared Dream
          <span className="dream-icon">✨</span>
        </h1>
        <p className="shared-subtitle">Someone shared their nocturnal adventure with you</p>
        <button onClick={handleGoToApp} className="back-to-app-button">
          📖 Create Your Own Dream Journal
        </button>
      </header>

      <main className="shared-content">
        <div className="shared-dream-card">
          <div className="dream-header-shared">
            <h2 className="dream-title-shared">{dream.title}</h2>
            <div className="dream-meta-shared">
              <span className="dream-mood-shared">
                {ShareUtils.getMoodEmoji(dream.mood)} {dream.mood}
              </span>
              <span className="dream-date-shared">
                {ShareUtils.formatShareDate(dream.createdAt)}
              </span>
            </div>
          </div>

          <div className="dream-content-shared">
            <h3>Dream Description</h3>
            <p className="dream-text">{dream.content}</p>
          </div>

          {dream.tags && dream.tags.length > 0 && (
            <div className="dream-tags-shared">
              <h3>Tags</h3>
              <div className="tags-container">
                {dream.tags.map((tag, index) => (
                  <span key={index} className="tag-shared">#{tag}</span>
                ))}
              </div>
            </div>
          )}

          {dream.analysis && (
            <div className="dream-analysis-shared">
              <h3>AI Dream Analysis</h3>
              <div className="analysis-content">
                <ReactMarkdown
                  components={{
                    h1: ({ children }) => <h4 className="markdown-h1">{children}</h4>,
                    h2: ({ children }) => <h4 className="markdown-h2">{children}</h4>,
                    h3: ({ children }) => <h5 className="markdown-h3">{children}</h5>,
                    h4: ({ children }) => <h5 className="markdown-h4">{children}</h5>,
                    p: ({ children }) => <p className="markdown-p">{children}</p>,
                    strong: ({ children }) => <strong className="markdown-strong">{children}</strong>,
                    em: ({ children }) => <em className="markdown-em">{children}</em>,
                    ul: ({ children }) => <ul className="markdown-ul">{children}</ul>,
                    ol: ({ children }) => <ol className="markdown-ol">{children}</ol>,
                    li: ({ children }) => <li className="markdown-li">{children}</li>,
                    blockquote: ({ children }) => <blockquote className="markdown-blockquote">{children}</blockquote>,
                    code: ({ children }) => <code className="markdown-code">{children}</code>,
                  }}
                >
                  {dream.analysis}
                </ReactMarkdown>
              </div>
            </div>
          )}

          <div className="shared-footer">
            <p className="shared-attribution">
              This dream was shared from 
              <strong> Dream Journal</strong> - 
              a beautiful app for capturing and analyzing your nocturnal adventures.
            </p>
            <button onClick={handleGoToApp} className="cta-button">
              🌟 Start Your Dream Journey
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}

export default SharedDream
