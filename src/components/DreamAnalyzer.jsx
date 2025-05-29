import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import './DreamAnalyzer.css'

function DreamAnalyzer({ dream, onClose, onUpdateDreamAnalysis }) {
    const [analysis, setAnalysis] = useState(dream.analysis || '')
    const [loading, setLoading] = useState(false)
    const [apiKey, setApiKey] = useState(localStorage.getItem('openai_api_key') || '')
    const [showApiKeyInput, setShowApiKeyInput] = useState(!apiKey)

    const saveApiKey = () => {
        localStorage.setItem('openai_api_key', apiKey)
        setShowApiKeyInput(false)
    }

    const analyzeDream = async () => {
        if (!apiKey) {
            setShowApiKeyInput(true)
            return
        }

        setLoading(true)
        try {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: 'gpt-4.1-mini',
                    messages: [
                        {
                            role: "system",
                            content: "You are a supportive dream interpreter versed in psychology and symbolism. Offer thoughtful, uplifting insights. Use markdown headings; highlight key points with **bold** and *italics*. Mention negatives only when clearly warranted."
                        },

                        {
                            role: "user",
                            content: `Interpret the dream below using these sections:
## TLDR (One sentence summary)
## Overview
## Symbols
## Psychology
## Themes

Use **bold** for key ideas, *italics* for symbols, and bullet points where helpful.

**Dream**
- **Title:** ${dream.title}
- **Content:** ${dream.content}
- **Mood:** ${dream.mood}
- **Tags:** ${dream.tags ? dream.tags.join(", ") : "None"}`
                        }
                    ],
                    max_tokens: 600,
                    temperature: 0.7
                })
            })

            const data = await response.json()

            if (data.error) {
                throw new Error(data.error.message)
            } setAnalysis(data.choices[0].message.content)

            // Save analysis to dream object
            if (onUpdateDreamAnalysis) {
                onUpdateDreamAnalysis(dream.id, data.choices[0].message.content)
            }
        } catch (error) {
            console.error('Error analyzing dream:', error)
            const errorMessage = `Error analyzing dream: ${error.message}. Please check your API key and try again.`
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

                {showApiKeyInput ? (
                    <div className="api-key-section">
                        <h4>OpenAI API Key Required</h4>
                        <p>To analyze dreams, please enter your OpenAI API key:</p>
                        <div className="api-key-input-group">
                            <input
                                type="password"
                                value={apiKey}
                                onChange={(e) => setApiKey(e.target.value)}
                                placeholder="sk-..."
                                className="api-key-input"
                            />
                            <button onClick={saveApiKey} className="save-key-button">
                                Save Key
                            </button>
                        </div>
                        <p className="api-key-note">
                            Your API key is stored locally and never sent anywhere except to OpenAI.
                            Get your key from <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer">OpenAI Platform</a>.
                        </p>
                    </div>) : (
                    <div className="analysis-section">
                        
                        {analysis && (
                            <div className="analysis-result">
                                <h4>
                                    Dream Interpretation:
                                    {dream.analysis && analysis === dream.analysis && (
                                        <span className="saved-indicator">💾 Saved</span>
                                    )}
                                </h4>
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
                            {!analysis ? (
                                <button
                                    onClick={analyzeDream}
                                    disabled={loading}
                                    className="analyze-dream-button"
                                >
                                    {loading ? '🔄 Analyzing...' : '✨ Analyze Dream'}
                                </button>
                            ) : (
                                <button
                                    onClick={rethinkDream}
                                    disabled={loading}
                                    className="rethink-button"
                                >
                                    {loading ? '🔄 Rethinking...' : '🔄 Rethink Analysis'}
                                </button>
                            )}
                        </div>
                    </div>
                )}

                <div className="analyzer-footer">
                    <button onClick={() => setShowApiKeyInput(!showApiKeyInput)} className="toggle-key-button">
                        {showApiKeyInput ? 'Hide' : 'Change'} API Key
                    </button>
                </div>
            </div>
        </div>
    )
}

export default DreamAnalyzer
