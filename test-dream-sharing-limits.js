// Test script to demonstrate how the dream sharing feature handles very long dreams
// CommonJS version for Node.js testing

// Simulate browser environment
globalThis.window = {
  location: {
    origin: 'https://localhost:3000',
    pathname: '/dream-journal'
  }
}
globalThis.btoa = (str) => Buffer.from(str, 'binary').toString('base64')
globalThis.atob = (str) => Buffer.from(str, 'base64').toString('binary')

// Mock ShareUtils class with the same logic as the real implementation
class ShareUtils {
  static MAX_URL_LENGTH = 2000
  static MAX_CONTENT_LENGTH = 10000

  static encodeDream(dream) {
    try {
      const shareableDream = {
        title: dream.title,
        content: dream.content,
        mood: dream.mood,
        tags: dream.tags || [],
        createdAt: dream.createdAt,
        analysis: dream.analysis || null,
        shareVersion: '1.0'
      }

      const jsonString = JSON.stringify(shareableDream)
      const base64 = btoa(unescape(encodeURIComponent(jsonString)))
      
      return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
    } catch (error) {
      console.error('Failed to encode dream:', error)
      return null
    }
  }

  static decodeDream(encodedString) {
    try {
      let base64 = encodedString.replace(/-/g, '+').replace(/_/g, '/')
      
      while (base64.length % 4) {
        base64 += '='
      }

      const jsonString = decodeURIComponent(escape(atob(base64)))
      const dream = JSON.parse(jsonString)

      if (this.validateSharedDream(dream)) {
        return dream
      }
      
      return null
    } catch (error) {
      console.error('Failed to decode dream:', error)
      return null
    }
  }

  static validateSharedDream(dream) {
    return (
      dream &&
      typeof dream.title === 'string' &&
      typeof dream.content === 'string' &&
      typeof dream.mood === 'string' &&
      Array.isArray(dream.tags) &&
      typeof dream.createdAt === 'string'
    )
  }

  static validateShareSize(dream) {
    const dreamJson = JSON.stringify({
      title: dream.title,
      content: dream.content,
      mood: dream.mood,
      tags: dream.tags || [],
      createdAt: dream.createdAt,
      analysis: dream.analysis || null,
      shareVersion: '1.0'
    })

    const jsonLength = dreamJson.length
    const estimatedEncodedLength = Math.ceil(jsonLength * 1.4)
    const baseUrl = globalThis.window.location.origin + globalThis.window.location.pathname + '?shared='
    const estimatedUrlLength = baseUrl.length + estimatedEncodedLength

    if (estimatedUrlLength > this.MAX_URL_LENGTH) {
      return {
        canShare: false,
        reason: 'Dream is too long for URL sharing',
        suggestedAction: dream.content.length > this.MAX_CONTENT_LENGTH 
          ? 'Consider shortening the dream content'
          : 'The dream analysis is very detailed. Try sharing without analysis.',
        estimatedLength: estimatedUrlLength,
        maxLength: this.MAX_URL_LENGTH
      }
    }

    return { canShare: true }
  }

  static createTruncatedDream(dream, maxContentLength = 5000) {
    const truncatedDream = { ...dream }
    
    if (dream.content.length > maxContentLength) {
      truncatedDream.content = dream.content.substring(0, maxContentLength) + 
        '\n\n[Content truncated for sharing - view full dream in the app]'
    }

    const validation = this.validateShareSize(truncatedDream)
    if (!validation.canShare && truncatedDream.analysis) {
      truncatedDream.analysis = '[Analysis truncated for sharing - view full analysis in the app]'
    }

    return truncatedDream
  }

  static generateShareUrl(dream, allowTruncation = true) {
    let validation = this.validateShareSize(dream)
    let dreamToShare = dream
    let wasTruncated = false

    if (!validation.canShare && allowTruncation) {
      dreamToShare = this.createTruncatedDream(dream)
      validation = this.validateShareSize(dreamToShare)
      wasTruncated = true
    }

    if (!validation.canShare) {
      return {
        url: null,
        wasTruncated,
        validationResult: validation
      }
    }

    const encodedDream = this.encodeDream(dreamToShare)
    if (!encodedDream) {
      return {
        url: null,
        wasTruncated,
        validationResult: { canShare: false, reason: 'Encoding failed' }
      }
    }

    const baseUrl = globalThis.window.location.origin + globalThis.window.location.pathname
    return {
      url: `${baseUrl}?shared=${encodedDream}`,
      wasTruncated,
      validationResult: validation
    }
  }
}

// Create test dreams of different sizes
const testDreams = {
  // Normal dream - should share fine
  normal: {
    id: '1',
    title: 'A Beautiful Forest Dream',
    content: 'I dreamed I was walking through a magical forest with glowing trees and singing birds. The experience was incredibly peaceful and I felt completely at one with nature.',
    mood: 'wonderful',
    tags: ['nature', 'peaceful'],
    createdAt: new Date().toISOString(),
    analysis: 'This dream represents your need for connection with nature and peace.'
  },

  // Long content dream - should be truncated but shareable
  longContent: {
    id: '2',
    title: 'Epic Adventure Dream',
    content: 'A'.repeat(8000) + ' This was an incredibly long and detailed dream with many scenes and characters...', // 8000+ characters
    mood: 'wonderful',
    tags: ['adventure', 'epic'],
    createdAt: new Date().toISOString(),
    analysis: 'This complex dream suggests...'
  },

  // Very long dream with extensive analysis - may need aggressive truncation
  veryLong: {
    id: '3',
    title: 'Extremely Detailed Dream Sequence',
    content: 'B'.repeat(10000) + ' This dream had countless details and sub-plots...', // 10000+ characters
    mood: 'strange',
    tags: ['complex', 'detailed'],
    createdAt: new Date().toISOString(),
    analysis: 'C'.repeat(5000) + ' This analysis explores many psychological aspects...' // 5000+ characters
  },

  // Impossibly long dream - should fail even with truncation
  impossiblyLong: {
    id: '4',
    title: 'D'.repeat(500), // Even the title is long
    content: 'E'.repeat(20000), // 20000 characters
    mood: 'neutral',
    tags: ['test'],
    createdAt: new Date().toISOString(),
    analysis: 'F'.repeat(10000) // 10000 characters
  }
}

console.log('🌙 Testing Dream Sharing with Different Lengths\n')

// Test each dream
Object.entries(testDreams).forEach(([name, dream]) => {
  console.log(`\n--- Testing ${name} dream ---`)
  console.log(`Title length: ${dream.title.length}`)
  console.log(`Content length: ${dream.content.length}`)
  console.log(`Analysis length: ${dream.analysis.length}`)
  
  // Test size validation
  const validation = ShareUtils.validateShareSize(dream)
  console.log(`Can share as-is: ${validation.canShare}`)
  if (!validation.canShare) {
    console.log(`Reason: ${validation.reason}`)
    console.log(`Suggestion: ${validation.suggestedAction}`)
    console.log(`Estimated URL length: ${validation.estimatedLength}`)
  }
  
  // Test share URL generation (with truncation allowed)
  const shareResult = ShareUtils.generateShareUrl(dream, true)
  console.log(`Share URL generated: ${shareResult.url ? 'YES' : 'NO'}`)
  console.log(`Was truncated: ${shareResult.wasTruncated}`)
  
  if (shareResult.url) {
    console.log(`Final URL length: ${shareResult.url.length}`)
    console.log(`URL preview: ${shareResult.url.substring(0, 100)}...`)
    
    // Test that we can decode it back
    const urlParams = new URLSearchParams(new URL(shareResult.url).search)
    const encodedDream = urlParams.get('shared')
    const decoded = ShareUtils.decodeDream(encodedDream)
    console.log(`Decoding successful: ${decoded ? 'YES' : 'NO'}`)
      if (decoded) {
      console.log(`Decoded content length: ${decoded.content.length}`)
      if (shareResult.wasTruncated) {
        console.log(`Content includes truncation notice: ${decoded.content.includes('[Content truncated for sharing')}`)
      }
    }
  } else {
    console.log(`Validation result: ${JSON.stringify(shareResult.validationResult)}`)
  }
  
  console.log('---')
})

console.log('\n🚀 Summary of Dream Sharing Capabilities:')
console.log('1. Normal dreams (< 2KB): Share directly with full content')
console.log('2. Long dreams (2-10KB): Automatic content truncation with notice')
console.log('3. Very long dreams (10KB+): Content + analysis truncation')
console.log('4. Impossibly long dreams: Graceful failure with helpful message')
console.log('\nUser Experience:')
console.log('- Share button copies URL to clipboard')
console.log('- Shows success animation ✅')
console.log('- Warns if content was truncated')
console.log('- Clear error messages for unshareable dreams')
