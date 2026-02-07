import React from 'react';
import useSyncStatus from '../hooks/useSyncStatus';

const SyncStatusBadge: React.FC = () => {
    const { status, isOnline, pendingCount } = useSyncStatus();

    const getStatusColor = () => {
        if (!isOnline) return 'var(--color-error)';
        switch (status) {
            case 'syncing': return 'var(--color-warning)';
            case 'online': return 'var(--color-success)';
            case 'error': return 'var(--color-error)';
            default: return 'var(--color-text-secondary)';
        }
    };

    const getStatusLabel = () => {
        if (!isOnline) return 'Desconectado';
        switch (status) {
            case 'syncing': return 'Sincronizando...';
            case 'online': return 'Sincronizado';
            case 'error': return 'Error de Sync';
            default: return 'Inactivo';
        }
    };

    return (
        <div className="glass" style={{
            padding: 'var(--space-sm) var(--space-md)',
            borderRadius: 'var(--radius-full)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-sm)',
            fontSize: '0.875rem',
            fontWeight: 600,
        }}>
            <div style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                backgroundColor: getStatusColor(),
                boxShadow: `0 0 8px ${getStatusColor()}`,
            }} className={status === 'syncing' ? 'animate-pulse-slow' : ''} />

            <span style={{ color: 'var(--color-text)' }}>
                {getStatusLabel()}
            </span>

            {
                pendingCount > 0 && (
                    <span style={{
                        background: 'var(--color-primary)',
                        color: 'white',
                        padding: '2px 8px',
                        borderRadius: '10px',
                        fontSize: '0.75rem',
                        marginLeft: '4px'
                    }}>
                        {pendingCount} pendientes
                    </span>
                )
            }
        </div >
    );
};

export default SyncStatusBadge;
