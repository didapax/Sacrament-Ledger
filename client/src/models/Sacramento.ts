import CryptoJS from 'crypto-js';
import { v4 as uuidv4 } from 'uuid';

export interface Bautismo {
  _id: string;          // UUID único
  tipo: 'BAUTISMO';
  nombre: string;
  dni: string;          // Documento de identidad (clave para evitar duplicados)
  fechaNacimiento: string;
  parroquiaId: string;
  hashAnterior: string; // El enlace a la "cadena"
  hash: string;         // El sello de este registro
  timestamp: number;
}

export const crearRegistroBautismo = (datos: Omit<Bautismo, '_id' | 'hash' | 'timestamp' | 'hashAnterior'>, ultimoHash: string): Bautismo => {
  const registro: Partial<Bautismo> = {
    ...datos,
    _id: `bautismo_${datos.dni}_${uuidv4()}`,
    tipo: 'BAUTISMO',
    timestamp: Date.now(),
    hashAnterior: ultimoHash
  };

  // Generamos el Hash del registro para asegurar inmutabilidad
  // Si alguien cambia un solo dato después, el hash no coincidirá
  const dataString = JSON.stringify(registro);
  registro.hash = CryptoJS.SHA256(dataString).toString();

  return registro as Bautismo;
};