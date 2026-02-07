import { useState, useEffect } from 'react';
import { syncManager, type SyncState } from '../services/syncManager';

/**
 * Hook to access real-time sync state
 */
export const useSyncStatus = () => {
    const [state, setState] = useState<SyncState>(syncManager.getState());

    useEffect(() => {
        // Subscribe to sync manager updates
        const unsubscribe = syncManager.subscribe((newState) => {
            setState(newState);
        });

        return () => unsubscribe();
    }, []);

    const forceSync = () => syncManager.forceSync();

    return {
        ...state,
        forceSync
    };
};

export default useSyncStatus;
