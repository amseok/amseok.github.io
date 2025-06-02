// API Service for Dream Journal
// Manages all HTTP requests to the backend server

class ApiService {
  constructor() {
    // Flask backend URL
    // this.baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:35001/api';
    this.baseUrl = 'https://dreamjournal-api.fly.dev/api';
    this.token = localStorage.getItem('dreamjournal_token');
  }

  // Helper method to get headers with auth token
  getHeaders(contentType = 'application/json') {
    const headers = {
      'Content-Type': contentType,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  // Generic request method
  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const config = {
      headers: this.getHeaders(),
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      // Handle authentication errors
      if (response.status === 401) {
        this.clearAuth();
        window.dispatchEvent(new CustomEvent('auth:logout'));
        throw new Error('Authentication required');
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API Request failed: ${endpoint}`, error);
      throw error;
    }
  }
  // Authentication methods
  async login(email, password) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (response.access_token) {
      this.setAuth(response.access_token, response.user);
    }

    return response;
  }

  async signup(email, password, name, bio = '', timezone = 'UTC') {
    const response = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name, bio, timezone }),
    });

    if (response.access_token) {
      this.setAuth(response.access_token, response.user);
    }

    return response;
  }

  async logout() {
    try {
      await this.request('/auth/logout', {
        method: 'POST',
      });
    } catch (error) {
      console.warn('Logout request failed:', error);
    } finally {
      this.clearAuth();
    }
  }
  async refreshToken() {
    try {
      // Flask JWT doesn't have refresh endpoint by default
      // For now, we'll just validate the current token
      const response = await this.request('/auth/profile', {
        method: 'GET',
      });
      
      return response;
    } catch (error) {
      this.clearAuth();
      throw error;
    }
  }
  // User profile methods
  async getProfile() {
    return await this.request('/auth/profile');
  }

  async updateProfile(profileData) {
    return await this.request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  async uploadAvatar(file) {
    const formData = new FormData();
    formData.append('avatar', file);

    return await this.request('/user/avatar', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`,
      },
      body: formData,
    });
  }
  // Dream management methods
  async getDreams(page = 1, per_page = 20, sort_by = 'date', order = 'desc') {
    return await this.request(`/dreams?page=${page}&per_page=${per_page}&sort_by=${sort_by}&order=${order}`);
  }

  async createDream(dreamData) {
    return await this.request('/dreams', {
      method: 'POST',
      body: JSON.stringify(dreamData),
    });
  }

  async updateDream(dreamId, dreamData) {
    return await this.request(`/dreams/${dreamId}`, {
      method: 'PUT',
      body: JSON.stringify(dreamData),
    });
  }

  async deleteDream(dreamId) {
    return await this.request(`/dreams/${dreamId}`, {
      method: 'DELETE',
    });
  }

  async getDream(dreamId) {
    return await this.request(`/dreams/${dreamId}`);
  }

  async analyzeDream(dreamId) {
    return await this.request(`/dreams/${dreamId}/analyze`, {
      method: 'POST',
    });
  }
  // Dream sharing methods
  async shareDream(dreamId) {
    return await this.request(`/dreams/${dreamId}/share`, {
      method: 'POST',
    });
  }

  async unshareDream(dreamId) {
    return await this.request(`/dreams/${dreamId}/unshare`, {
      method: 'POST',
    });
  }  async getSharedDream(shareToken) {
    return await this.request(`/dreams/shared/${shareToken}`);
  }
  // Search and filtering
  async searchDreams(query, page = 1, per_page = 20) {
    const params = new URLSearchParams({
      q: query,
      page: page,
      per_page: per_page
    });
    return await this.request(`/dreams/search?${params}`);
  }

  // Statistics and insights
  async getDreamStats(days = 30) {
    return await this.request(`/dreams/stats?days=${days}`);
  }

  // Tags
  async getUserTags() {
    return await this.request('/dreams/tags');
  }

  // Auth helper methods
  setAuth(token, user = null) {
    this.token = token;
    localStorage.setItem('dreamjournal_token', token);
    
    if (user) {
      localStorage.setItem('dreamjournal_user', JSON.stringify(user));
    }
    
    window.dispatchEvent(new CustomEvent('auth:login', { detail: { user } }));
  }

  clearAuth() {
    this.token = null;
    localStorage.removeItem('dreamjournal_token');
    localStorage.removeItem('dreamjournal_user');
    window.dispatchEvent(new CustomEvent('auth:logout'));
  }

  getStoredUser() {
    const userStr = localStorage.getItem('dreamjournal_user');
    return userStr ? JSON.parse(userStr) : null;
  }

  isAuthenticated() {
    return !!this.token;
  }

  // Health check
  async healthCheck() {
    try {
      return await this.request('/health');
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  }
}

// Export a singleton instance
export default new ApiService();
