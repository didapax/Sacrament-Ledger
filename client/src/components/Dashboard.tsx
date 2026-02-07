import React from 'react';
import useSyncStatus from '../hooks/useSyncStatus';
import useSacraments from '../hooks/useSacraments';
import SyncStatusBadge from './SyncStatusBadge';
import config from '../config';

const Dashboard: React.FC = () => {
    const { isOnline, lastSync, forceSync } = useSyncStatus();
    const { sacraments, loading } = useSacraments();

    return (
        <div className="container animate-fade-in" style={{ padding: 'var(--space-xl) 0' }}>
            <header style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 'var(--space-xl)'
            }}>
                <div>
                    <h1 style={{
                        fontFamily: "'Playfair Display', serif",
                        color: 'var(--color-primary)',
                        margin: 0,
                        fontSize: '2.5rem'
                    }}>
                        {config.parish.name}
                    </h1>
                    <p style={{ color: 'var(--color-text-secondary)', margin: '4px 0 0 0' }}>
                        Libro de Registro Civil Eclesiástico
                    </p>
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-md)', alignItems: 'center' }}>
                    <SyncStatusBadge />
                    <button
                        onClick={() => forceSync()}
                        className="btn btn-glass"
                        disabled={!isOnline}
                        style={{
                            background: 'transparent',
                            border: '1px solid var(--color-primary)',
                            color: 'var(--color-primary)',
                            padding: 'var(--space-sm) var(--space-md)'
                        }}
                    >
                        Sincronizar Ahora
                    </button>
                </div>
            </header>

            <div className="grid-cols">
                <div className="card glass">
                    <h3 style={{ marginTop: 0, color: 'var(--color-primary-light)' }}>Estado del Nodo</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Conectividad:</span>
                            <span style={{ color: isOnline ? 'var(--color-success)' : 'var(--color-error)', fontWeight: 600 }}>
                                {isOnline ? 'Online' : 'Offline'}
                            </span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Última Sincronización:</span>
                            <span>{lastSync ? new Date(lastSync).toLocaleTimeString() : 'Nunca'}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>ID Parroquia:</span>
                            <code style={{ background: 'rgba(0,0,0,0.05)', padding: '2px 4px' }}>{config.parish.id}</code>
                        </div>
                    </div>
                </div>

                <div className="card glass">
                    <h3 style={{ marginTop: 0, color: 'var(--color-primary-light)' }}>Resumen de Registros</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-lg)' }}>
                        <div style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--color-primary)' }}>
                            {loading ? '...' : sacraments.length}
                        </div>
                        <div>
                            <p style={{ margin: 0, fontWeight: 600 }}>Registros Totales</p>
                            <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
                                En este nodo local
                            </p>
                        </div>
                    </div>
                </div>

                <div className="card glass" style={{ borderColor: 'var(--accent)', borderStyle: 'dashed' }}>
                    <h3 style={{ marginTop: 0, color: 'var(--color-primary-light)' }}>Seguridad</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Cifrado AES-256:</span>
                            <span style={{ color: config.security.encryptionEnabled ? 'var(--color-success)' : 'var(--color-error)' }}>
                                {config.security.encryptionEnabled ? 'Activado' : 'Desactivado'}
                            </span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Libro Mayor:</span>
                            <span style={{ color: 'var(--color-success)' }}>Protegido (Hash Chain)</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
