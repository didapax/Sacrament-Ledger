import { v4 as uuidv4 } from 'uuid';
import encryptionService from '../services/encryptionService';
import config from '../config';

export type SyncStatus = 'local' | 'synced' | 'conflict' | 'error';

export interface Bautismo {
  _id: string;          // UUID único
  _rev?: string;        // PouchDB revision
  tipo: 'BAUTISMO';
  nombre: string;
  dni: string;
  fechaNacimiento: string;
  padres: string;
  padrinos: string;
  parroquiaId: string;
  parroquiaNombre: string;
  hashAnterior: string; // Enlace a la cadena
  hash: string;         // Sello de este registro
  timestamp: number;
  syncStatus: SyncStatus;
  _encryptedFields?: string[];
}

/**
 * Crea un nuevo registro de bautismo con cifrado y hash de integridad
 */
export const crearRegistroBautismo = (
  datos: Omit<Bautismo, '_id' | 'hash' | 'timestamp' | 'hashAnterior' | 'syncStatus' | 'tipo' | 'parroquiaId' | 'parroquiaNombre'>,
  ultimoHash: string
): Bautismo => {
  const registroBase: Bautismo = {
    ...datos,
    _id: `bautismo_${datos.dni}_${uuidv4()}`,
    tipo: 'BAUTISMO',
    parroquiaId: config.parish.id,
    parroquiaNombre: config.parish.name,
    timestamp: Date.now(),
    hashAnterior: ultimoHash,
    syncStatus: 'local',
    hash: '',
  };

  // 1. Generar el Hash de integridad ANTES del cifrado para que sea verificable
  const dataToHash = JSON.stringify({
    nombre: registroBase.nombre,
    dni: registroBase.dni,
    fechaNacimiento: registroBase.fechaNacimiento,
    padres: registroBase.padres,
    padrinos: registroBase.padrinos,
    hashAnterior: registroBase.hashAnterior,
    timestamp: registroBase.timestamp
  });

  registroBase.hash = encryptionService.generateHash(dataToHash);

  // 2. Aplicar cifrado a campos sensibles si está habilitado
  if (config.security.encryptionEnabled) {
    return encryptionService.encryptFields(registroBase, ['nombre', 'padres', 'padrinos', 'dni']) as Bautismo;
  }

  return registroBase;
};

/**
 * Verifica la integridad de un registro comparando su hash
 */
export const verificarIntegridad = (registro: Bautismo): boolean => {
  // Primero desciframos para obtener los datos originales si están cifrados
  const data = encryptionService.decryptFields(registro);

  const dataToHash = JSON.stringify({
    nombre: data.nombre,
    dni: data.dni,
    fechaNacimiento: data.fechaNacimiento,
    padres: data.padres,
    padrinos: data.padrinos,
    hashAnterior: data.hashAnterior,
    timestamp: data.timestamp
  });

  const calculatedHash = encryptionService.generateHash(dataToHash);
  return calculatedHash === data.hash;
};