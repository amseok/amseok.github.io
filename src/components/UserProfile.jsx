import { useRef, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import ApiService from '../services/ApiService';
import './UserProfile.css';

function UserProfile({ isOpen, onClose }) {
  const { user, updateProfile, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    bio: user?.bio || '',
    timezone: user?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [avatar, setAvatar] = useState(user?.avatar || null);
  const fileInputRef = useRef(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type and size
    if (!file.type.startsWith('image/')) {
      setErrors(prev => ({
        ...prev,
        avatar: 'Please select an image file'
      }));
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      setErrors(prev => ({
        ...prev,
        avatar: 'Image must be smaller than 5MB'
      }));
      return;
    }

    try {
      const response = await ApiService.uploadAvatar(file);
      setAvatar(response.avatarUrl);
      setErrors(prev => ({
        ...prev,
        avatar: ''
      }));
    } catch (error) {
      setErrors(prev => ({
        ...prev,
        avatar: error.message || 'Failed to upload avatar'
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await updateProfile({
        ...formData,
        avatar
      });
      setIsEditing(false);
    } catch (error) {
      setErrors({
        submit: error.message || 'Failed to update profile'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      bio: user?.bio || '',
      timezone: user?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone
    });
    setAvatar(user?.avatar || null);
    setErrors({});
    setIsEditing(false);
  };

  const handleLogout = async () => {
    try {
      await logout();
      onClose();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="profile-modal-overlay" onClick={onClose}>
      <div className="profile-modal" onClick={e => e.stopPropagation()}>
        <button className="profile-modal-close" onClick={onClose}>
          ×
        </button>
        
        <div className="profile-header">
          <div className="avatar-section">
            <div className="avatar-container" onClick={isEditing ? handleAvatarClick : undefined}>
              {avatar ? (
                <img src={avatar} alt="Profile" className="avatar-image" />
              ) : (
                <div className="avatar-placeholder">
                  {user?.name?.charAt(0)?.toUpperCase() || '?'}
                </div>
              )}
              {isEditing && (
                <div className="avatar-overlay">
                  <span>📷</span>
                </div>
              )}
            </div>
            {errors.avatar && <span className="error-message">{errors.avatar}</span>}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              style={{ display: 'none' }}
            />
          </div>
          
          <div className="profile-info">
            <h2>User Profile</h2>
            <p className="member-since">
              Member since {new Date(user?.createdAt || Date.now()).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="profile-content">
          {isEditing ? (
            <form className="profile-form">
              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={errors.name ? 'error' : ''}
                />
                {errors.name && <span className="error-message">{errors.name}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={errors.email ? 'error' : ''}
                />
                {errors.email && <span className="error-message">{errors.email}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="bio">Bio</label>
                <textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  placeholder="Tell us about yourself..."
                  rows={3}
                />
              </div>

              <div className="form-group">
                <label htmlFor="timezone">Timezone</label>
                <select
                  id="timezone"
                  name="timezone"
                  value={formData.timezone}
                  onChange={handleInputChange}
                >
                  {Intl.supportedValuesOf('timeZone').map(tz => (
                    <option key={tz} value={tz}>{tz}</option>
                  ))}
                </select>
              </div>

              {errors.submit && (
                <div className="error-message submit-error">
                  {errors.submit}
                </div>
              )}

              <div className="form-actions">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isSubmitting}
                  className="btn-primary"
                >
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          ) : (
            <div className="profile-display">
              <div className="profile-field">
                <label>Name</label>
                <span>{user?.name}</span>
              </div>

              <div className="profile-field">
                <label>Email</label>
                <span>{user?.email}</span>
              </div>

              <div className="profile-field">
                <label>Bio</label>
                <span>{user?.bio || 'No bio provided'}</span>
              </div>

              <div className="profile-field">
                <label>Timezone</label>
                <span>{user?.timezone || 'Not set'}</span>
              </div>

              <div className="profile-stats">
                <div className="stat-item">
                  <span className="stat-number">{user?.dreamCount || 0}</span>
                  <span className="stat-label">Dreams</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">{user?.analysisCount || 0}</span>
                  <span className="stat-label">Analyses</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">{user?.shareCount || 0}</span>
                  <span className="stat-label">Shared</span>
                </div>
              </div>

              <div className="profile-actions">
                <button
                  onClick={() => setIsEditing(true)}
                  className="btn-primary"
                >
                  Edit Profile
                </button>
                <button
                  onClick={handleLogout}
                  className="btn-danger"
                >
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default UserProfile;
