// Test script to check URL length limits with long dreams
import ShareUtils from './src/utils/ShareUtils.js'

// Create a very long dream for testing
const longDream = {
  id: 'test-long',
  title: 'An Incredibly Long and Detailed Dream Journey Through Multiple Dimensions',
  content: `This is a very long dream that goes on and on with incredible detail. `.repeat(200) + 
           `I found myself walking through endless corridors of crystalline walls that reflected not my physical form, but the very essence of my thoughts and emotions. Each step I took created ripples of color that danced across the surfaces, telling stories of forgotten memories and future possibilities. The air itself seemed to hum with an otherworldly melody that spoke directly to my soul, bypassing my ears entirely. As I ventured deeper into this maze of consciousness, I encountered beings of pure light who communicated through shared emotions rather than words. They showed me visions of interconnected realities where every decision created branching pathways through time and space. The landscape constantly shifted beneath my feet, transforming from crystal corridors to vast oceanic expanses where islands of memory floated like dreams within dreams. I could taste the colors of the aurora that painted the sky in impossible hues, each one representing a different aspect of human experience - joy tasted like golden honey, sorrow like silver rain, and wonder like the first breath of spring air. In this realm, time moved differently; moments stretched into eternities while years compressed into heartbeats. I met versions of myself from parallel dimensions, each one having made different choices that led to entirely different life paths. We shared our stories through telepathic connection, creating a tapestry of infinite possibilities. The dream continued with me discovering a library that contained every book that had ever been written or ever could be written, where knowledge flowed like liquid light and understanding came not through reading but through pure absorption of wisdom. I spent what felt like centuries exploring the mathematical poetry hidden in the architecture of reality itself, learning that dreams were not mere random neural firing but actual glimpses into the fundamental structure of existence.`.repeat(50),
  mood: 'wonderful',
  tags: ['lucid', 'metaphysical', 'transformative', 'cosmic', 'interdimensional', 'telepathic', 'crystalline', 'oceanic', 'temporal', 'infinite'],
  createdAt: new Date().toISOString(),
  analysis: `This dream represents a profound journey through the collective unconscious, showcasing the dreamer's deep spiritual and philosophical nature. The crystalline corridors symbolize clarity of thought and the multifaceted nature of consciousness. The beings of light represent higher wisdom and spiritual guides. The constantly shifting landscape reflects the fluid nature of the subconscious mind and its ability to transcend physical limitations. The parallel selves encountered in the dream suggest an awareness of infinite possibilities and the impact of choices on life paths. The library of all possible books represents the dreamer's quest for ultimate knowledge and understanding. The mathematical poetry hidden in reality's architecture indicates a deep appreciation for the underlying patterns that govern existence. This dream suggests the dreamer is going through a period of spiritual awakening and expanding consciousness, seeking to understand their place in the larger cosmic order. The telepathic communication and shared emotions point to a desire for deeper, more authentic connections with others. Overall, this is a highly evolved dream that indicates significant spiritual and psychological growth.`.repeat(30)
}

console.log('Original dream content length:', JSON.stringify(longDream).length)

// Test encoding
const encoded = ShareUtils.encodeDream(longDream)
console.log('Encoded length:', encoded ? encoded.length : 'FAILED')

// Test URL generation
const shareUrl = ShareUtils.generateShareUrl(longDream)
console.log('Full URL length:', shareUrl ? shareUrl.length : 'FAILED')
console.log('Share URL:', shareUrl ? shareUrl.substring(0, 200) + '...' : 'FAILED')

// Test decoding
if (encoded) {
  const decoded = ShareUtils.decodeDream(encoded)
  console.log('Decoding successful:', decoded ? 'YES' : 'NO')
  if (decoded) {
    console.log('Decoded title matches:', decoded.title === longDream.title)
    console.log('Decoded content length:', decoded.content.length)
  }
}

// Check browser URL limits
console.log('\nBrowser URL Limits:')
console.log('Internet Explorer: ~2,083 characters')
console.log('Chrome: ~8,190 characters')
console.log('Firefox: ~65,536 characters')
console.log('Most servers: ~2,048-8,192 characters')
