import PouchDB from 'pouchdb-browser';
import PouchDBFind from 'pouchdb-find';

// Polyfill for PouchDB in some environments
if (typeof (window as any).global === 'undefined') {
  (window as any).global = window;
}


PouchDB.plugin(PouchDBFind);

// Base de datos local (en el navegador/disco de la parroquia)
const localDB = new PouchDB('sacramentos_locales');

// Dirección del nodo vecino o central (cuando haya internet)
const remoteDB = new PouchDB('http://admin:password@IP_OTRA_PARROQUIA:5984/sacramentos');

export const iniciarSincronizacion = () => {
  localDB.sync(remoteDB, {
    live: true,       // Se mantiene escuchando cambios
    retry: true       // Si se cae el internet, reintenta automáticamente
  }).on('change', (info: PouchDB.Replication.SyncResult<{}>) => {
    console.log('¡Nuevo sacramento recibido de otro nodo!', info);
  }).on('error', (err: any) => {
    console.error('Error de conexión, trabajando en modo local...', err);
  });
};


export default localDB;