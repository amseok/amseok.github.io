// Dream Storage Utility - Multiple storage strategies for GitHub Pages
class DreamStorage {
  constructor() {
    this.STORAGE_KEY = 'dream_journal_data'
    this.BACKUP_KEY = 'dream_journal_backup'
    this.VERSION_KEY = 'dream_journal_version'
    this.CURRENT_VERSION = '1.0'
  }

  // Enhanced localStorage with error handling and versioning
  saveDreams(dreams) {
    try {
      const data = {
        dreams,
        version: this.CURRENT_VERSION,
        timestamp: new Date().toISOString(),
        checksum: this.generateChecksum(dreams)
      }
      
      // Save to primary storage
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data))
      
      // Save backup copy
      localStorage.setItem(this.BACKUP_KEY, JSON.stringify(data))
      
      // Save to IndexedDB if available
      this.saveToIndexedDB(data)
      
      console.log(`Dreams saved: ${dreams.length} entries`)
      return true
    } catch (error) {
      console.error('Failed to save dreams:', error)
      return false
    }
  }
  async loadDreams() {
    try {
      // Try primary storage first
      let data = this.loadFromStorage(this.STORAGE_KEY)
      
      // If primary fails, try backup
      if (!data) {
        console.log('Primary storage failed, trying backup...')
        data = this.loadFromStorage(this.BACKUP_KEY)
      }
      
      // If both fail, try IndexedDB
      if (!data) {
        console.log('LocalStorage failed, trying IndexedDB...')
        return await this.loadFromIndexedDB()
      }
      
      // Validate data integrity
      if (data && this.validateData(data)) {
        console.log(`Dreams loaded: ${data.dreams.length} entries`)
        return data.dreams
      }
      
      console.log('No valid dream data found')
      return []
    } catch (error) {
      console.error('Failed to load dreams:', error)
      return []
    }
  }

  loadFromStorage(key) {
    try {
      const stored = localStorage.getItem(key)
      return stored ? JSON.parse(stored) : null
    } catch (error) {
      console.error(`Failed to load from ${key}:`, error)
      return null
    }
  }
  validateData(data) {
    if (!data || !Array.isArray(data.dreams)) return false
    
    // Check version compatibility
    if (data.version && data.version !== this.CURRENT_VERSION) {
      console.log('Data version mismatch, attempting migration...')
      return this.migrateData(data)
    }
    
    // Validate checksum if available (skip for older data without checksums)
    if (data.checksum) {
      const currentChecksum = this.generateChecksum(data.dreams)
      if (currentChecksum !== data.checksum) {
        console.warn('Data integrity check failed, but proceeding anyway...')
        // Don't fail validation for checksum mismatch, just warn
      }
    }
    
    return true
  }
  generateChecksum(dreams) {
    // Enhanced checksum for data integrity that includes more fields
    return dreams.reduce((sum, dream) => {
      return sum + 
        (dream.id || 0) + 
        (dream.title?.length || 0) + 
        (dream.content?.length || 0) +
        (dream.analysis?.length || 0)
    }, 0).toString()
  }

  migrateData(data) {
    // Handle version migrations here
    return true
  }

  // IndexedDB implementation for better persistence
  async saveToIndexedDB(data) {
    if (!window.indexedDB) return false
    
    try {
      const db = await this.openDB()
      const transaction = db.transaction(['dreams'], 'readwrite')
      const store = transaction.objectStore('dreams')
      await store.put(data, 'main')
      console.log('Data saved to IndexedDB')
      return true
    } catch (error) {
      console.error('IndexedDB save failed:', error)
      return false
    }
  }

  async loadFromIndexedDB() {
    if (!window.indexedDB) return []
    
    try {
      const db = await this.openDB()
      const transaction = db.transaction(['dreams'], 'readonly')
      const store = transaction.objectStore('dreams')
      const data = await store.get('main')
      
      if (data && this.validateData(data)) {
        console.log('Data loaded from IndexedDB')
        return data.dreams
      }
      return []
    } catch (error) {
      console.error('IndexedDB load failed:', error)
      return []
    }
  }

  openDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('DreamJournalDB', 1)
      
      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result)
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result
        if (!db.objectStoreNames.contains('dreams')) {
          db.createObjectStore('dreams')
        }
      }
    })
  }

  // Export/Import functionality
  exportDreams(dreams) {
    try {
      const data = {
        dreams,
        exported: new Date().toISOString(),
        version: this.CURRENT_VERSION,
        app: 'Dream Journal'
      }
      
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json'
      })
      
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `dreams-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      return true
    } catch (error) {
      console.error('Export failed:', error)
      return false
    }
  }

  importDreams(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target.result)
          
          if (data.dreams && Array.isArray(data.dreams)) {
            resolve(data.dreams)
          } else {
            reject(new Error('Invalid dream data format'))
          }
        } catch (error) {
          reject(error)
        }
      }
      
      reader.onerror = () => reject(reader.error)
      reader.readAsText(file)
    })
  }

  // Clear all data (for testing/reset)
  clearAll() {
    try {
      localStorage.removeItem(this.STORAGE_KEY)
      localStorage.removeItem(this.BACKUP_KEY)
      localStorage.removeItem(this.VERSION_KEY)
      
      // Clear IndexedDB
      this.clearIndexedDB()
      
      return true
    } catch (error) {
      console.error('Failed to clear data:', error)
      return false
    }
  }

  async clearIndexedDB() {
    try {
      const db = await this.openDB()
      const transaction = db.transaction(['dreams'], 'readwrite')
      const store = transaction.objectStore('dreams')
      await store.clear()
    } catch (error) {
      console.error('Failed to clear IndexedDB:', error)
    }
  }

  // Get storage info for debugging
  getStorageInfo() {
    const info = {
      localStorage: {
        available: !!window.localStorage,
        data: null,
        size: 0
      },
      indexedDB: {
        available: !!window.indexedDB
      }
    }

    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      if (stored) {
        info.localStorage.data = JSON.parse(stored)
        info.localStorage.size = new Blob([stored]).size
      }
    } catch (error) {
      info.localStorage.error = error.message
    }

    return info
  }
}

export default DreamStorage
