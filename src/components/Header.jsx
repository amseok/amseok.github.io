import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import AuthModal from './AuthModal';
import './Header.css';
import UserProfile from './UserProfile';

function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showProfile, setShowProfile] = useState(false); const [showUserMenu, setShowUserMenu] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserMenu]);

  // Adjust dropdown position on mobile
  useEffect(() => {
    if (showUserMenu && dropdownRef.current) {
      const dropdown = dropdownRef.current.querySelector('.user-dropdown');
      if (dropdown) {
        const rect = dropdown.getBoundingClientRect();
        const viewportWidth = window.innerWidth;

        // If dropdown goes off the right edge, adjust position
        if (rect.right > viewportWidth - 10) {
          dropdown.style.right = '0';
          dropdown.style.transform = `translateX(${Math.min(0, viewportWidth - rect.right - 10)}px)`;
        } else {
          dropdown.style.transform = 'translateX(0)';
        }
      }
    }
  }, [showUserMenu]);

  const handleUserMenuClick = () => {
    //  console.log('User menu clicked, current state:', showUserMenu);
    setShowUserMenu(!showUserMenu);
  };

  const handleProfileClick = () => {
    // console.log('Profile clicked!');
    setShowProfile(true);
    setShowUserMenu(false);
  };
  const handleLogout = async () => {
    // console.log('Logout clicked!');
    setShowUserMenu(false);
    setIsLoggingOut(true);

    try {
      // Add a small delay for the animation to be visible
      await new Promise(resolve => setTimeout(resolve, 600));
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleSettingsClick = () => {
    // console.log('Settings clicked!');
    setShowUserMenu(false);
    // TODO: Add settings modal later
    // console.log('Settings clicked - will add settings modal later');
  };

  return (
    <>
      <header className="auth-header">
        <div className="auth-header-content">
          {isAuthenticated ? (
            <div className="user-section">
              <div className="user-menu-container" ref={dropdownRef}>
                <button
                  className={`user-menu-trigger ${isLoggingOut ? 'logging-out' : ''}`}
                  onClick={handleUserMenuClick}
                  title={`Signed in as ${user?.name || 'User'}`}
                  disabled={isLoggingOut}
                >
                  <div className="user-avatar">
                    {isLoggingOut ? (
                      <div className="logout-animation">
                        <span className="logout-icon">👋</span>
                        <span className="login-icon">👤</span>
                      </div>
                    ) : user?.avatar ? (
                      <img src={user.avatar} alt="Profile" />
                    ) : (
                      <span>{user?.name?.charAt(0)?.toUpperCase() || '?'}</span>
                    )}
                  </div>
                </button>

                {showUserMenu && (
                  <div className="user-dropdown">
                    <div className="dropdown-user-info">
                      <span className="dropdown-user-name">{user?.name || 'User'}</span>
                      <span className="dropdown-user-email">{user?.email}</span>
                    </div>
                    <div className="dropdown-divider" style={{ marginTop: 0 }}></div>

                    <button
                      className="dropdown-item"
                      onClick={handleProfileClick}
                    >
                      <span className="dropdown-icon">👤</span>
                      Profile
                    </button>
                    <button
                      className="dropdown-item"
                      onClick={handleSettingsClick}
                    >
                      <span className="dropdown-icon">⚙️</span>
                      Settings
                    </button>
                    <div className="dropdown-divider"></div>
                    <button
                      className="dropdown-item logout-item"
                      onClick={handleLogout}
                    >
                      <span className="dropdown-icon">🚪</span>
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <button
              className="login-icon-btn"
              onClick={() => setShowAuthModal(true)}
              title="Sign In"
            >
              <span className="login-icon">👤</span>
            </button>
          )}
        </div>
      </header>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />

      {/* User Profile Modal */}
      <UserProfile
        isOpen={showProfile}
        onClose={() => setShowProfile(false)}
      />
    </>
  );
}

export default Header;
