import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import ApiService from '../services/ApiService'
import './DreamAnalyzer.css'

function DreamAnalyzer({ dream, onClose, onUpdateDreamAnalysis }) {
    const [analysis, setAnalysis] = useState(dream.analysis || '')
    const [loading, setLoading] = useState(false)
    const [copySuccess, setCopySuccess] = useState(false)

    const analyzeDream = async () => {
        // Check if dream content has at least 10 words
        const wordCount = dream.content.trim().split(/\s+/).filter(word => word.length > 0).length
        if (wordCount < 10) {
            setAnalysis('Please write at least 10 words about your dream before requesting an analysis. Dreams with more detail provide better interpretations.')
            return
        }

        setLoading(true)
        try {
            const response = await ApiService.analyzeDream(dream.id)
            
            setAnalysis(response.analysis)

            // Save analysis to dream object
            if (onUpdateDreamAnalysis) {
                onUpdateDreamAnalysis(dream.id, response.analysis)
            }
        } catch (error) {
            console.error('Error analyzing dream:', error)
            const errorMessage = `Error analyzing dream: ${error.message}. Please try again later.`
            setAnalysis(errorMessage)

            // Don't save error messages to the dream
        } finally {
            setLoading(false)
        }
    }

    const rethinkDream = () => {
        setAnalysis('')
        if (onUpdateDreamAnalysis) {
            onUpdateDreamAnalysis(dream.id, '')
        }
        analyzeDream()
    }

    const copyAnalysis = async () => {
        try {
            await navigator.clipboard.writeText(analysis)
            setCopySuccess(true)
            setTimeout(() => setCopySuccess(false), 2000)
        } catch (err) {
            console.error('Failed to copy text:', err)
            // Fallback for older browsers
            const textArea = document.createElement('textarea')
            textArea.value = analysis
            document.body.appendChild(textArea)
            textArea.select()
            try {
                document.execCommand('copy')
                setCopySuccess(true)
                setTimeout(() => setCopySuccess(false), 2000)
            } catch (fallbackErr) {
                console.error('Fallback copy failed:', fallbackErr)
            }
            document.body.removeChild(textArea)
        }
    }

    return (
        <div className="dream-analyzer-overlay" onClick={onClose}>
            <div className="dream-analyzer" onClick={(e) => e.stopPropagation()}>
                <div className="analyzer-header">
                    <h2>🔮 Dream Analysis</h2>
                    <button onClick={onClose} className="close-button">✕</button>
                </div>

                <div className="dream-summary">
                    <h3>"{dream.title}"</h3>
                    <p className="dream-preview">{dream.content.substring(0, 200)}...</p>
                </div>

                <div className="analysis-section">
                    {analysis && (
                        <div className="analysis-result">
                            <div className="analysis-header">
                                <h4>
                                    Dream Interpretation:
                                    {dream.analysis && analysis === dream.analysis && (
                                        <span className="saved-indicator">💾 Saved</span>
                                    )}
                                </h4>
                                <div className="analysis-actions">
                                    <button
                                        onClick={rethinkDream}
                                        disabled={loading}
                                        className="rethink-button-small"
                                        title="Generate new analysis"
                                    >
                                        {loading ? '🔄' : '🔄 Rethink'}
                                    </button>
                                    <button
                                        onClick={copyAnalysis}
                                        className={`copy-button ${copySuccess ? 'copy-success' : ''}`}
                                        title="Copy analysis to clipboard"
                                    >
                                        {copySuccess ? '✓ Copied!' : '📋 Copy'}
                                    </button>
                                </div>
                            </div>
                            <div className="analysis-content">
                                <ReactMarkdown
                                    components={{
                                        h1: ({ children }) => <h2 className="markdown-h1">{children}</h2>,
                                        h2: ({ children }) => <h3 className="markdown-h2">{children}</h3>,
                                        h3: ({ children }) => <h4 className="markdown-h3">{children}</h4>,
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
                                    {analysis}
                                </ReactMarkdown>
                            </div>
                        </div>
                    )}
                    <div className="analysis-buttons">
                        {!analysis && (
                            <button
                                onClick={analyzeDream}
                                disabled={loading || dream.content.trim().split(/\s+/).filter(word => word.length > 0).length < 10}
                                className="analyze-dream-button"
                                title={dream.content.trim().split(/\s+/).filter(word => word.length > 0).length < 10 ?
                                    'Please write at least 10 words about your dream' :
                                    'Analyze your dream with AI'}
                            >
                                {loading ? '🔄 Analyzing...' :
                                    dream.content.trim().split(/\s+/).filter(word => word.length > 0).length < 10 ?
                                        '✨ Write more details (10+ words)' :
                                        '✨ Analyze Dream'}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default DreamAnalyzer
