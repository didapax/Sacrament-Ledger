import React from 'react';
import { type Bautismo, verificarIntegridad } from '../models/Sacramento';

interface Props {
    record: Bautismo;
}

const RecordCard: React.FC<Props> = ({ record }) => {
    const isValid = verificarIntegridad(record);

    return (
        <div className="card glass animate-fade-in" style={{
            position: 'relative',
            overflow: 'hidden',
            borderLeft: `4px solid ${isValid ? 'var(--color-success)' : 'var(--color-error)'}`
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h4 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--color-primary)' }}>{record.nombre}</h4>
                    <p style={{ margin: '4px 0', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
                        DNI: {record.dni} • Nacimiento: {new Date(record.fechaNacimiento).toLocaleDateString()}
                    </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <span style={{
                        fontSize: '0.75rem',
                        padding: '2px 8px',
                        borderRadius: 'var(--radius-full)',
                        background: record.syncStatus === 'synced' ? 'rgba(46, 125, 50, 0.1)' : 'rgba(255, 215, 0, 0.1)',
                        color: record.syncStatus === 'synced' ? 'var(--color-success)' : 'var(--color-accent-dark)',
                        fontWeight: 700
                    }}>
                        {record.syncStatus.toUpperCase()}
                    </span>
                </div>
            </div>

            <div style={{ marginTop: 'var(--space-md)', fontSize: '0.9rem' }}>
                <p style={{ margin: '2px 0' }}><strong>Padres:</strong> {record.padres}</p>
                <p style={{ margin: '2px 0' }}><strong>Padrinos:</strong> {record.padrinos}</p>
            </div>

            <div style={{
                marginTop: 'var(--space-md)',
                padding: 'var(--space-sm)',
                background: 'rgba(0,0,0,0.03)',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.7rem',
                fontFamily: 'monospace',
                wordBreak: 'break-all'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                    <span style={{ color: 'var(--color-text-secondary)' }}>BLOCK HASH:</span>
                    <span style={{ color: isValid ? 'var(--color-success)' : 'var(--color-error)' }}>
                        {isValid ? 'VERIFICADO ✓' : 'CORRUPTO ✗'}
                    </span>
                </div>
                {record.hash}
            </div>

            <div style={{
                fontSize: '0.65rem',
                color: 'var(--color-text-secondary)',
                marginTop: 'var(--space-sm)',
                textAlign: 'right'
            }}>
                {record.parroquiaNombre} • {new Date(record.timestamp).toLocaleString()}
            </div>
        </div>
    );
};

export default RecordCard;
