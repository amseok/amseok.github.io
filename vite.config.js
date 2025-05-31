import react from '@vitejs/plugin-react-swc'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production'
  
  return {
    plugins: [
      react({
        // Enable Fast Refresh for better development experience
        fastRefresh: true,
      }),
      
      // PWA plugin for offline capabilities and mobile optimization
      VitePWA({
        registerType: 'autoUpdate',
        workbox: {
          // Cache all static assets
          globPatterns: ['**/*.{js,css,html,ico,png,jpg,jpeg,svg,json,vue,txt,woff2}'],
          maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5MB limit
          // Cache dream data for offline access
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
                }
              }
            }
          ]
        },
        includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'logo.png'],
        manifest: {
          name: 'Dream Journal',
          short_name: 'Dreams',
          description: 'Personal dream journal with AI analysis',
          theme_color: '#1a1a2e',
          background_color: '#0f0f1a',
          display: 'standalone',
          orientation: 'portrait',
          scope: '/',
          start_url: '/',
          icons: [
            {
              src: 'web-app-manifest-192x192.png',
              sizes: '192x192',
              type: 'image/png'
            },
            {
              src: 'web-app-manifest-512x512.png',
              sizes: '512x512',
              type: 'image/png'
            }
          ]
        }
      })
    ],
    base: '/', // Root deployment for amseok.github.io
    
    // Build optimizations
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: false,
      minify: 'esbuild',
      target: 'es2015', // Support older browsers while maintaining performance
      
      // Optimize chunk splitting for better caching
      rollupOptions: {
        output: {
          manualChunks: {
            // Separate vendor chunks for better caching
            vendor: ['react', 'react-dom'],
            markdown: ['react-markdown'],
          },
          // Better asset naming for caching
          chunkFileNames: 'assets/[name]-[hash].js',
          entryFileNames: 'assets/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash].[ext]'
        }
      },
      
      // Optimize bundle size
      cssCodeSplit: true,
      reportCompressedSize: false, // Faster builds
      chunkSizeWarningLimit: 1000, // Warn for chunks > 1MB
    },
    
    // Development server optimizations
    server: {
      port: 3000,
      open: true,
      host: true, // Allow external connections (useful for mobile testing)
      hmr: {
        overlay: true // Show errors as overlay
      }
    },
    
    // Preview server optimizations
    preview: {
      port: 4173,
      open: true,
      host: true
    },
    
    // Dependency optimization
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-markdown'
      ],
      // Exclude problematic dependencies from pre-bundling if needed
      // exclude: []
    },
    
    // CSS optimizations
    css: {
      devSourcemap: true, // CSS source maps in development
      preprocessorOptions: {
        // Add global CSS variables if needed
      }
    },
    
    // Performance optimizations
    esbuild: {
      // Remove console logs in production
      drop: isProduction ? ['console', 'debugger'] : [],
      // Use faster transforms
      target: 'es2015'
    },
    
    // Define environment variables
    define: {
      __DEV__: !isProduction,
      __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
    }
  }
})
