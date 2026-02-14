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

// Dirección del nodo vecino o central (cuando haya internet)
const remoteDB = new PouchDB('http://admin:password@IP_OTRA_PARROQUIA:5984/sacramentos');

export const iniciarSincronizacion = () => {
  localDB.sync(remoteDB, {
    live: true,       // Se mantiene escuchando cambios
    retry: true       // Si se cae el internet, reintenta automáticamente
  }).on('change', (info: PouchDB.Replication.SyncResult<object>) => {
    console.log('¡Nuevo sacramento recibido de otro nodo!', info);
  }).on('error', (err: PouchDB.Core.Error) => {
    console.error('Error de conexión, trabajando en modo local...', err);
  });
};


export default localDB;