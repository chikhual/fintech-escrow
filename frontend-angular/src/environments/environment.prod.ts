export const environment = {
  production: true,
  apiUrl: process.env['API_URL'] || 'https://your-backend-url.railway.app',
  authApiUrl: process.env['AUTH_API_URL'] || 'https://your-backend-url.railway.app',
  wsUrl: process.env['WS_URL'] || 'wss://your-backend-url.railway.app/ws'
};
