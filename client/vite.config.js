import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    dedupe: ['react', 'react-dom'],
    alias: {
      // Ensure Vite/Rollup resolves socket.io-client to the bundled dist file
      'socket.io-client': 'socket.io-client/dist/socket.io.js',
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        secure: false,
         changeOrigin: true,
      },
      '/uploads': {
        target: 'http://localhost:5000',
        secure: false,
        changeOrigin: true,
      },
    },
  },

  plugins: [react()],
});
