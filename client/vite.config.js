import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    dedupe: ['react', 'react-dom'],
  },
  optimizeDeps: {
    include: ['socket.io-client'],
  },
  build: {
    commonjsOptions: {
      include: [/socket\.io-client/, /node_modules/],
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
