import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  // Set base to your repository name for GitHub Pages
  // Change this to '/' if deploying to a custom domain
  base: '/dew-luck/',
})
