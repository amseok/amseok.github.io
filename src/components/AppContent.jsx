import { useEffect, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import ApiService from '../services/ApiService'
import ShareUtils from '../utils/ShareUtils'
import DreamAnalyzer from './DreamAnalyzer'
import DreamEntry from './DreamEntry'
import DreamTimeline from './DreamTimeline'
import Header from './Header'
import SharedDream from './SharedDream'
import WelcomePrompt from './WelcomePrompt'

function AppContent() {
  const { isAuthenticated, loading } = useAuth()
  const [dreams, setDreams] = useState([])
  const [selectedDream, setSelectedDream] = useState(null)
  const [showAnalyzer, setShowAnalyzer] = useState(false)
  const [_isLoaded, setIsLoaded] = useState(false)
  const [isSharedView, setIsSharedView] = useState(false)
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

  // Check if we're in shared view mode
  useEffect(() => {
    const checkSharedView = () => {
      setIsSharedView(ShareUtils.isSharedUrl())
    }
    
    checkSharedView()
    
    // Listen for navigation changes
    const handleNavigationChange = () => {
      checkSharedView()
    }
    
    window.addEventListener('navigationChange', handleNavigationChange)
    window.addEventListener('popstate', checkSharedView)
    
    return () => {
      window.removeEventListener('navigationChange', handleNavigationChange)
      window.removeEventListener('popstate', checkSharedView)
    }
  }, [])

  // Load dreams on component mount using API
  useEffect(() => {
    const loadDreams = async () => {
      if (!isAuthenticated) {
        setIsLoaded(true)
        return
      }

      try {
        setError(null)
        const response = await ApiService.getDreams()
        setDreams(response.dreams || [])
        setIsLoaded(true)
        console.log('Dreams loaded successfully:', response.dreams?.length || 0)
      } catch (error) {
        console.error('Failed to load dreams:', error)
        setError('Failed to load dreams')
        setDreams([])
        setIsLoaded(true)
      }
    }
    
    loadDreams()
  }, [isAuthenticated])

  const addDream = async (dream) => {
    try {
      setError(null)
      const response = await ApiService.createDream(dream)
      const newDream = response.dream
      setDreams(prev => [newDream, ...prev])
      return newDream
    } catch (error) {
      console.error('Failed to create dream:', error)
      setError('Failed to save dream')
      throw error
    }
  }

  const updateDream = async (id, updatedDream) => {
    try {
      setError(null)
      const response = await ApiService.updateDream(id, updatedDream)
      const updated = response.dream
      setDreams(prev => prev.map(dream => 
        dream.id === id ? updated : dream
      ))
      return updated
    } catch (error) {
      console.error('Failed to update dream:', error)
      setError('Failed to update dream')
      throw error
    }
  }

  const updateDreamAnalysis = async (id, analysis) => {
    try {
      setError(null)
      const response = await ApiService.updateDream(id, { analysis })
      const updated = response.dream
      setDreams(prev => prev.map(dream => 
        dream.id === id ? updated : dream
      ))
      // Update selected dream if it's the one being analyzed
      setSelectedDream(prev => prev && prev.id === id ? updated : prev)
      return updated
    } catch (error) {
      console.error('Failed to update dream analysis:', error)
      setError('Failed to save analysis')
      throw error
    }
  }

  const deleteDream = async (id) => {
    try {
      setError(null)
      await ApiService.deleteDream(id)
      setDreams(prev => prev.filter(dream => dream.id !== id))
    } catch (error) {
      console.error('Failed to delete dream:', error)
      setError('Failed to delete dream')
      throw error
    }
  }

  const handleAnalyzeDream = (dream) => {
    setSelectedDream(dream)
    setShowAnalyzer(true)
  }

  // If we're in shared view, show SharedDream component
  if (isSharedView) {
    return <SharedDream />
  }

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="app">
        <div className="stars"></div>
        <div className="stars2"></div>
        <div className="stars3"></div>
        <Header />
        <div className="loading-container" style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '50vh',
          color: '#b19cd9',
          fontSize: '1.2rem'
        }}>
          <div>
            <span style={{ fontSize: '2rem', marginRight: '10px' }}>🌙</span>
            Loading...
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="app">
      <div className="stars"></div>
      <div className="stars2"></div>
      <div className="stars3"></div>
      
      <Header />

      {error && (
        <div className="error-banner" style={{
          backgroundColor: '#ffebee',
          color: '#c62828',
          padding: '12px',
          margin: '20px',
          borderRadius: '8px',
          border: '1px solid #ffcdd2',
          textAlign: 'center'
        }}>
          {error}
        </div>
      )}

      {!isAuthenticated ? (
        // Show welcome prompt for non-authenticated users
        <>
          <div className="header">
            <h1 className="title">
              <span className="dream-icon">🌙</span>
              Dream Journal
              <span className="dream-icon">✨</span>
            </h1>
            <p className="subtitle">Capture your nocturnal adventures</p>
          </div>
          <WelcomePrompt />
        </>
      ) : (
        // Show main app for authenticated users
        <>
          <div className="header">
            <h1 className="title">
              <span className="dream-icon">🌙</span>
              Dream Journal
              <span className="dream-icon">✨</span>
            </h1>
            <p className="subtitle">Capture your nocturnal adventures</p>
          </div>

          <main className="main-content">
            <DreamEntry onAddDream={addDream} />
            <DreamTimeline 
              dreams={dreams}
              onUpdateDream={updateDream}
              onDeleteDream={deleteDream}
              onAnalyzeDream={handleAnalyzeDream}
            />
          </main>

          {showAnalyzer && selectedDream && (
            <DreamAnalyzer 
              dream={selectedDream}
              onClose={() => setShowAnalyzer(false)}
              onUpdateDreamAnalysis={updateDreamAnalysis}
            />
          )}
        </>
      )}
    </div>
  )
}

export default AppContent
