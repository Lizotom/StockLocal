const DEFAULT_LOCAL_API = 'http://localhost/stocklocal-pwa/backend/index.php';

export const API_URL = (import.meta.env.VITE_API_URL || DEFAULT_LOCAL_API).trim();

export const APP_STORAGE_KEYS = {
  user: 'stocklocal_user'
};
