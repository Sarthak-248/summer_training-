import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    dedupe: ['react', 'react-dom'],
  },
  build: {
    rollupOptions: {
      external: ['socket.io-client'],
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
    historyApiFallback: true,
  },

  plugins: [react()],
});
