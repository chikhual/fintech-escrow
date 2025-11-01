// Vercel will replace these at build time via environment variables
// Configure in Vercel Dashboard: Settings → Environment Variables
export const environment = {
  production: true,
  // These will be replaced by Vercel's build process
  // Default values for local build testing
  apiUrl: 'https://your-backend-url.railway.app',
  authApiUrl: 'https://your-backend-url.railway.app',
  wsUrl: 'wss://your-backend-url.railway.app/ws'
};
