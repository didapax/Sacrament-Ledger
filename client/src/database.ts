import PouchDB from 'pouchdb-browser';
import PouchDBFind from 'pouchdb-find';

declare global {
  interface Window {
    global: Window;
  }
}

// Polyfill for PouchDB in some environments
if (typeof window.global === 'undefined') {
  window.global = window;
}


PouchDB.plugin(PouchDBFind);

// Base de datos local (en el navegador/disco de la parroquia)
const localDB = new PouchDB('sacramentos_locales');

// Función para inicializar índices necesarios para búsquedas y ordenamiento
export const setupIndexes = async () => {
  try {
    await localDB.createIndex({
      index: {
        fields: ['tipo', 'timestamp']
      }
    });
    // Índice específico para ordenamiento por tiempo
    await localDB.createIndex({
      index: {
        fields: ['timestamp']
      }
    });
    console.log('Índices creados exitosamente');
  } catch (err) {
    console.error('Error al crear índices:', err);
  }
};

// Ejecutar la creación de índices al iniciar
setupIndexes();

// Configuración del servidor de sincronización central
// Se obtiene de las variables de entorno (.env)
const getSyncServerURL = (): string | null => {
  const url = import.meta.env.VITE_COUCHDB_URL;
  const dbName = import.meta.env.VITE_COUCHDB_DB_NAME;
  const username = import.meta.env.VITE_COUCHDB_USERNAME;
  const password = import.meta.env.VITE_COUCHDB_PASSWORD;

  // Si no hay configuración, retornar null (modo solo local)
  if (!url || !dbName) {
    console.warn('⚠️ No hay servidor de sincronización configurado. Trabajando en modo local únicamente.');
    return null;
  }

  // Construir URL completa
  // Formato: http://usuario:contraseña@servidor:puerto/base_datos
  const urlObj = new URL(url);
  if (username && password) {
    urlObj.username = username;
    urlObj.password = password;
  }

  const fullURL = `${urlObj.origin}/${dbName}`;
  console.log(`🔄 Servidor de sincronización configurado: ${urlObj.origin}/${dbName}`);

  return fullURL;
};

const syncServerURL = getSyncServerURL();
const remoteDB = syncServerURL ? new PouchDB(syncServerURL) : null;

export const iniciarSincronizacion = () => {
  // Si no hay servidor remoto configurado, no intentar sincronizar
  if (!remoteDB) {
    console.warn('⚠️ Sincronización no disponible: No hay servidor configurado');
    console.info('💡 Para habilitar sincronización, configura las variables de entorno en .env');
    return null;
  }

  console.log('🔄 Iniciando sincronización con servidor central...');

  return localDB.sync(remoteDB, {
    live: true,       // Se mantiene escuchando cambios
    retry: true       // Si se cae el internet, reintenta automáticamente
  }).on('change', (info: PouchDB.Replication.SyncResult<object>) => {
    const parishName = import.meta.env.VITE_PARISH_NAME || 'Esta parroquia';
    console.log(`✅ ${parishName}: Sincronización exitosa`, info);
  }).on('error', (err: PouchDB.Core.Error) => {
    console.error('❌ Error de conexión, trabajando en modo local...', err);
  }).on('paused', () => {
    console.log('⏸️ Sincronización pausada (esperando cambios)');
  }).on('active', () => {
    console.log('▶️ Sincronización activa');
  });
};


export default localDB;