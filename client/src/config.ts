/**
 * Application Configuration
 * Centralized configuration management with environment variables
 */

export const config = {
  // CouchDB Configuration
  couchdb: {
    url: import.meta.env.VITE_COUCHDB_URL || 'http://localhost:5984',
    dbName: import.meta.env.VITE_COUCHDB_DB_NAME || 'sacramentos',
    username: import.meta.env.VITE_COUCHDB_USERNAME || 'admin',
    password: import.meta.env.VITE_COUCHDB_PASSWORD || 'password',
  },

  // Parish Configuration
  parish: {
    id: import.meta.env.VITE_PARISH_ID || 'PARROQUIA_001',
    name: import.meta.env.VITE_PARISH_NAME || 'Parroquia Local',
  },

  // Security
  security: {
    encryptionEnabled: import.meta.env.VITE_ENCRYPTION_ENABLED === 'true',
    encryptionKey: import.meta.env.VITE_ENCRYPTION_KEY || 'default-key-change-me',
  },

  // Features
  features: {
    enableServiceWorker: import.meta.env.VITE_ENABLE_SERVICE_WORKER !== 'false',
    syncRetryInterval: parseInt(import.meta.env.VITE_SYNC_RETRY_INTERVAL || '5000', 10),
    syncMaxRetries: parseInt(import.meta.env.VITE_SYNC_MAX_RETRIES || '3', 10),
  },

  // Development
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
};

export default config;
