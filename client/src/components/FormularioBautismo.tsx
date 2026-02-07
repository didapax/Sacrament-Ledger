import React, { useState } from 'react';
import localDB from '../database';
import { crearRegistroBautismo } from '../models/Sacramento';

const FormularioBautismo = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    dni: '',
    fechaNacimiento: '',
    padres: '',
    padrinos: '',
    parroquiaId: 'PARROQUIA_001' // Esto vendría de un config local
  });

  const [status, setStatus] = useState('');

  const registrar = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('Procesando...');

    try {
      // 1. Validar si ya existe (Evitar el problema de tu esposa)
      // Buscamos por nombre y fecha si no hay DNI
      const busqueda = await localDB.find({
        selector: {
          nombre: { $eq: formData.nombre },
          fechaNacimiento: { $eq: formData.fechaNacimiento }
        }
      });

      if (busqueda.docs.length > 0) {
        setStatus('⚠️ Error: Esta persona ya tiene un registro de bautismo.');
        return;
      }

      // 2. Obtener el hash del último registro para encadenarlo (Inmutabilidad)
      // Por ahora usaremos '0' si es el primero
      const ultimoHash = '0'; 

      // 3. Crear el objeto con Hash
      const nuevoBautismo = crearRegistroBautismo(
        {
          nombre: formData.nombre,
          dni: formData.dni || `TEMP_${Date.now()}`, // Fallback si no hay DNI
          fechaNacimiento: formData.fechaNacimiento,
          parroquiaId: formData.parroquiaId
          // Nota: Puedes extender el modelo para padres/padrinos
        },
        ultimoHash
      );

      // 4. Guardar en PouchDB (Localmente)
      await localDB.put(nuevoBautismo);
      
      setStatus('✅ Registrado localmente. Se sincronizará al detectar internet.');
      setFormData({ nombre: '', dni: '', fechaNacimiento: '', padres: '', padrinos: '', parroquiaId: 'PARROQUIA_001' });
      
    } catch (err) {
      console.error(err);
      setStatus('❌ Error al guardar en el nodo.');
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '400px', border: '1px solid #ccc' }}>
      <h2>Nuevo Bautismo</h2>
      <form onSubmit={registrar}>
        <input type="text" placeholder="Nombre Completo" value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} required /><br/><br/>
        <input type="text" placeholder="DNI (Opcional)" value={formData.dni} onChange={e => setFormData({...formData, dni: e.target.value})} /><br/><br/>
        <input type="date" value={formData.fechaNacimiento} onChange={e => setFormData({...formData, fechaNacimiento: e.target.value})} required /><br/><br/>
        <button type="submit">Garantizar Sacramento</button>
      </form>
      <p>{status}</p>
    </div>
  );
};

export default FormularioBautismo;