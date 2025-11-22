import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'url';
import path from 'path';

// Get canister IDs from the generated file
const network = process.env.DFX_NETWORK || 'local';

// Determine the base path based on the network
const getBasePath = () => {
  if (network === 'ic') {
    return 'https://ic0.app';
  }
  return 'http://127.0.0.1:4943';
};

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // Build configuration
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  
  // Resolve configuration
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  
  // Development server configuration
  server: {
    port: 5173,
    strictPort: true,
    hmr: {
      protocol: 'ws',
      host: 'localhost',
      port: 5173,
    },
    cors: true,
  },
  
  // Define global constants
  define: {
    'process.env.DFX_NETWORK': JSON.stringify(network),
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
  },
  
  // Optimize dependencies
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: 'globalThis',
      },
    },
  },
});
