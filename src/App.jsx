import { useEffect, useState } from 'react'
import './App.css'
import DreamAnalyzer from './components/DreamAnalyzer'
import DreamEntry from './components/DreamEntry'
import DreamTimeline from './components/DreamTimeline'
import SharedDream from './components/SharedDream'
import DreamStorage from './utils/DreamStorage'
import ShareUtils from './utils/ShareUtils'

function App() {
  const [dreams, setDreams] = useState([])
  const [selectedDream, setSelectedDream] = useState(null)
  const [showAnalyzer, setShowAnalyzer] = useState(false)
  const [storage] = useState(() => new DreamStorage())
  const [isLoaded, setIsLoaded] = useState(false)
  const [isSharedView, setIsSharedView] = useState(false)

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

  // Load dreams on component mount with enhanced storage
  useEffect(() => {
    const loadDreams = async () => {
      try {
        const loadedDreams = await storage.loadDreams()
        setDreams(loadedDreams)
        setIsLoaded(true)
        console.log('Dreams loaded successfully:', loadedDreams.length)
      } catch (error) {
        console.error('Failed to load dreams:', error)
        setDreams([])
        setIsLoaded(true)
      }
    }
    
    loadDreams()
  }, [storage])

  // Save dreams with enhanced storage whenever dreams change (only after initial load)
  useEffect(() => {
    if (!isLoaded) return // Don't save until initial load is complete
    
    const saved = storage.saveDreams(dreams)
    if (!saved) {
      console.error('Failed to save dreams!')
      // Could show user notification here
    }
  }, [dreams, storage, isLoaded])

  const addDream = (dream) => {
    const newDream = {
      id: Date.now(),
      ...dream,
      createdAt: new Date().toISOString()
    }
    setDreams(prev => [newDream, ...prev])
  }

  const updateDream = (id, updatedDream) => {
    setDreams(prev => prev.map(dream => 
      dream.id === id ? { ...dream, ...updatedDream, analysis: '' } : dream
    ))
  }

  const updateDreamAnalysis = (id, analysis) => {
    setDreams(prev => prev.map(dream => 
      dream.id === id ? { ...dream, analysis } : dream
    ))
    // Update selected dream if it's the one being analyzed
    setSelectedDream(prev => prev && prev.id === id ? { ...prev, analysis } : prev)
  }

  const deleteDream = (id) => {
    setDreams(prev => prev.filter(dream => dream.id !== id))
  }

  const handleAnalyzeDream = (dream) => {
    setSelectedDream(dream)
    setShowAnalyzer(true)
  }

  // If we're in shared view, show SharedDream component
  if (isSharedView) {
    return <SharedDream />
  }

  return (
    <div className="app">
      <div className="stars"></div>
      <div className="stars2"></div>
      <div className="stars3"></div>
      
      <header className="header">
        <h1 className="title">
          <span className="dream-icon">🌙</span>
          Dream Journal
          <span className="dream-icon">✨</span>
        </h1>
        <p className="subtitle">Capture your nocturnal adventures</p>
      </header>

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
    </div>
  )
}

export default App
