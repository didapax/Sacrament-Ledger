import React, { useState } from 'react';
import useSacraments from '../hooks/useSacraments';

const FormularioBautismo: React.FC = () => {
  const { addSacrament } = useSacraments();
  const [formData, setFormData] = useState({
    nombre: '',
    dni: '',
    fechaNacimiento: '',
    padres: '',
    padrinos: '',
  });

  const [status, setStatus] = useState<{ type: 'idle' | 'loading' | 'success' | 'error', message: string }>({
    type: 'idle',
    message: ''
  });

  const registrar = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus({ type: 'loading', message: 'Sellando registro en el Libro Mayor...' });

    try {
      const result = await addSacrament({
        ...formData,
        dni: formData.dni || `TEMP_${Date.now()}`
      });

      if (result.success) {
        setStatus({ type: 'success', message: '✅ Sacramento Registrado con Éxito e Integridad Garantizada.' });
        setFormData({ nombre: '', dni: '', fechaNacimiento: '', padres: '', padrinos: '' });

        // Reset status after 5 seconds
        setTimeout(() => setStatus({ type: 'idle', message: '' }), 5000);
      } else {
        setStatus({ type: 'error', message: `❌ Error: ${result.error}` });
      }
    } catch (err) {
      setStatus({ type: 'error', message: '❌ Error crítico en el nodo parroquial.' });
    }
  };

  return (
    <div className="card glass animate-fade-in" style={{ maxWidth: '600px', margin: '0 auto var(--space-xl)' }}>
      <h2 style={{
        fontFamily: "'Playfair Display', serif",
        color: 'var(--color-primary)',
        marginTop: 0,
        textAlign: 'center'
      }}>
        Nuevo Registro de Bautismo
      </h2>

      <form onSubmit={registrar} style={{ display: 'grid', gap: 'var(--space-md)' }}>
        <div className="form-group">
          <label style={{ display: 'block', marginBottom: 'var(--space-xs)', fontWeight: 600 }}>Nombre Completo del Bautizado</label>
          <input
            type="text"
            placeholder="Ej. Juan Pérez García"
            value={formData.nombre}
            onChange={e => setFormData({ ...formData, nombre: e.target.value })}
            required
            style={{ width: '100%', padding: 'var(--space-md)', borderRadius: 'var(--radius-md)', border: '1px solid #ddd' }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
          <div className="form-group">
            <label style={{ display: 'block', marginBottom: 'var(--space-xs)', fontWeight: 600 }}>DNI / Cédula</label>
            <input
              type="text"
              placeholder="Opcional"
              value={formData.dni}
              onChange={e => setFormData({ ...formData, dni: e.target.value })}
              style={{ width: '100%', padding: 'var(--space-md)', borderRadius: 'var(--radius-md)', border: '1px solid #ddd' }}
            />
          </div>
          <div className="form-group">
            <label style={{ display: 'block', marginBottom: 'var(--space-xs)', fontWeight: 600 }}>Fecha de Nacimiento</label>
            <input
              type="date"
              value={formData.fechaNacimiento}
              onChange={e => setFormData({ ...formData, fechaNacimiento: e.target.value })}
              required
              style={{ width: '100%', padding: 'var(--space-md)', borderRadius: 'var(--radius-md)', border: '1px solid #ddd' }}
            />
          </div>
        </div>

        <div className="form-group">
          <label style={{ display: 'block', marginBottom: 'var(--space-xs)', fontWeight: 600 }}>Padres</label>
          <input
            type="text"
            placeholder="Nombres de los padres"
            value={formData.padres}
            onChange={e => setFormData({ ...formData, padres: e.target.value })}
            required
            style={{ width: '100%', padding: 'var(--space-md)', borderRadius: 'var(--radius-md)', border: '1px solid #ddd' }}
          />
        </div>

        <div className="form-group">
          <label style={{ display: 'block', marginBottom: 'var(--space-xs)', fontWeight: 600 }}>Padrinos</label>
          <input
            type="text"
            placeholder="Nombres de los padrinos"
            value={formData.padrinos}
            onChange={e => setFormData({ ...formData, padrinos: e.target.value })}
            required
            style={{ width: '100%', padding: 'var(--space-md)', borderRadius: 'var(--radius-md)', border: '1px solid #ddd' }}
          />
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          disabled={status.type === 'loading'}
          style={{ width: '100%', marginTop: 'var(--space-md)', justifyContent: 'center' }}
        >
          {status.type === 'loading' ? 'Procesando...' : 'Garantizar Sacramento'}
        </button>
      </form>

      {status.message && (
        <div style={{
          marginTop: 'var(--space-md)',
          padding: 'var(--space-md)',
          borderRadius: 'var(--radius-md)',
          textAlign: 'center',
          backgroundColor: status.type === 'success' ? 'rgba(46, 125, 50, 0.1)' : status.type === 'error' ? 'rgba(198, 40, 40, 0.1)' : 'transparent',
          color: status.type === 'success' ? 'var(--color-success)' : status.type === 'error' ? 'var(--color-error)' : 'inherit',
          fontWeight: 600
        }}>
          {status.message}
        </div>
      )}
    </div>
  );
};

export default FormularioBautismo;
