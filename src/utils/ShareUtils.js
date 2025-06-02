// Simple Dream Sharing Utilities using Backend API
// -------------------------------------------------
// Replaces complex URL compression with simple server-side sharing

import ApiService from '../services/ApiService.js';

class ShareUtils {
  /**
   * Share a dream and get a share URL
   * @param {Object} dream - Dream object to share
   * @returns {Promise<Object>} - Share result with token and URL
   */
  static async shareDream(dream) {
    try {
      const result = await ApiService.shareDream(dream.id);
      
      const shareUrl = `${window.location.origin}/shared/${result.share_token}`;
      
      return {
        success: true,
        shareToken: result.share_token,
        shareUrl: shareUrl,
        message: 'Dream shared successfully'
      };
    } catch (error) {
      console.error('Share dream error:', error);
      return {
        success: false,
        error: error.message || 'Failed to share dream'
      };
    }
  }

  /**
   * Unshare a dream
   * @param {Object} dream - Dream object to unshare
   * @returns {Promise<Object>} - Unshare result
   */
  static async unshareDream(dream) {
    try {
      await ApiService.unshareDream(dream.id);
      
      return {
        success: true,
        message: 'Dream unshared successfully'
      };
    } catch (error) {
      console.error('Unshare dream error:', error);
      return {
        success: false,
        error: error.message || 'Failed to unshare dream'
      };
    }
  }

  /**
   * Get a shared dream by token
   * @param {string} shareToken - Share token from URL
   * @returns {Promise<Object>} - Dream data or error
   */
  static async getSharedDream(shareToken) {
    try {
      const result = await ApiService.getSharedDream(shareToken);
      
      return {
        success: true,
        dream: result.dream
      };
    } catch (error) {
      console.error('Get shared dream error:', error);
      return {
        success: false,
        error: error.message || 'Failed to load shared dream'
      };
    }
  }

  /**
   * Copy share URL to clipboard
   * @param {string} shareUrl - URL to copy
   * @returns {Promise<boolean>} - Success status
   */
  static async copyToClipboard(shareUrl) {
    try {
      await navigator.clipboard.writeText(shareUrl);
      return true;
    } catch (error) {
      console.error('Copy to clipboard error:', error);
      // Fallback for older browsers
      try {
        const textArea = document.createElement('textarea');
        textArea.value = shareUrl;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        return true;
      } catch (fallbackError) {
        console.error('Fallback copy error:', fallbackError);
        return false;
      }
    }
  }

  /**
   * Generate a shareable message for social media
   * @param {Object} dream - Dream object
   * @param {string} shareUrl - Share URL
   * @returns {string} - Formatted share message
   */
  static generateShareMessage(dream, shareUrl) {
    const title = dream.title || 'Untitled Dream';
    const message = `Check out my dream: "${title}" - ${shareUrl}`;
    return message;
  }

  /**
   * Validate share token format
   * @param {string} token - Token to validate
   * @returns {boolean} - Is valid token
   */
  static isValidShareToken(token) {
    if (!token || typeof token !== 'string') {
      return false;
    }
    
    // UUID v4 format validation
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(token);
  }

  /**
   * Extract share token from URL
   * @param {string} url - URL or pathname
   * @returns {string|null} - Extracted token or null
   */  static extractTokenFromUrl(url) {
    const match = url.match(/\/shared\/([^/?#]+)/);
    return match ? match[1] : null;
  }

  /**
   * Check if current URL is a shared dream URL
   * @returns {boolean} - Is shared URL
   */
  static isSharedUrl() {
    return window.location.pathname.includes('/shared/');
  }

  /**
   * Get share token from current URL
   * @returns {string|null} - Share token or null
   */
  static getShareTokenFromUrl() {
    return this.extractTokenFromUrl(window.location.pathname);
  }

  /**
   * Navigate to main app (remove shared URL)
   */
  static navigateToMainApp() {
    window.history.pushState({}, '', '/');
    window.dispatchEvent(new CustomEvent('navigationChange'));
  }

  /**
   * Format share date for display
   * @param {string} dateString - ISO date string
   * @returns {string} - Formatted date
   */  static formatShareDate(dateString) {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'Unknown date';
    }
  }

  /**
   * Get mood emoji for display
   * @param {string} mood - Mood string
   * @returns {string} - Emoji
   */
  static getMoodEmoji(mood) {
    const moodEmojis = {
      wonderful: '🌟',
      peaceful: '😌',
      neutral: '😐',
      strange: '🤔',
      scary: '😨',
      sad: '😢',
    };
    return moodEmojis[mood] || '😐';
  }
}

export default ShareUtils;
