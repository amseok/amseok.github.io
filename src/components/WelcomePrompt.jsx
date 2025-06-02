import { useState } from 'react';
import AuthModal from './AuthModal';
import './WelcomePrompt.css';

function WelcomePrompt() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('signup'); // 'signup' or 'login'

  const handleSignup = () => {
    setAuthMode('signup');
    setShowAuthModal(true);
  };

  const handleLogin = () => {
    setAuthMode('login');
    setShowAuthModal(true);
  };

  return (
    <>
      <div className="welcome-prompt">
        <div className="welcome-content">
          <div className="welcome-icon">
            <span className="moon">🌙</span>
            <span className="stars-floating">✨</span>
          </div>
          
          <h2 className="welcome-title">Welcome to Dream Journal</h2>
          <p className="welcome-subtitle">
            Capture, explore, and understand your nocturnal adventures
          </p>

          <div className="features-grid">
            <div className="feature">
              <span className="feature-icon">📝</span>
              <h3>Record Dreams</h3>
              <p>Capture your dreams with mood, tags, and detailed descriptions</p>
            </div>
            <div className="feature">
              <span className="feature-icon">🔮</span>
              <h3>AI Analysis</h3>
              <p>Get AI-powered interpretations and insights about your dreams</p>
            </div>
            <div className="feature">
              <span className="feature-icon">📊</span>
              <h3>Track Patterns</h3>
              <p>Discover recurring themes and patterns in your dream world</p>
            </div>
            <div className="feature">
              <span className="feature-icon">📤</span>
              <h3>Share Dreams</h3>
              <p>Share your most interesting dreams with friends and family</p>
            </div>
          </div>

          <div className="welcome-actions">
            <button 
              className="primary-cta-button"
              onClick={handleSignup}
            >
              <span className="button-icon">🌟</span>
              Start Your Dream Journey
            </button>
            <button 
              className="secondary-cta-button"
              onClick={handleLogin}
            >
              <span className="button-icon">🚪</span>
              I Already Have an Account
            </button>
          </div>

          <div className="welcome-benefits">
            <p className="benefits-text">
              Join thousands of dreamers who are already exploring their subconscious minds
            </p>
            <div className="benefits-list">
              <span className="benefit-item">✓ Free to start</span>
              <span className="benefit-item">✓ Secure & private</span>
              <span className="benefit-item">✓ Cross-device sync</span>
            </div>
          </div>
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialMode={authMode}
      />
    </>
  );
}

export default WelcomePrompt;
