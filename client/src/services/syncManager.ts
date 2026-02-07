/**
 * Sync Manager Service
 * Orchestrates synchronization between local PouchDB and remote CouchDB
 * Handles network detection, retry logic, and sync state management
 */

import PouchDB from 'pouchdb';
import localDB from '../database';
import config from '../config';
import { conflictResolver } from './conflictResolver';

export type SyncStatus = 'idle' | 'syncing' | 'error' | 'offline' | 'online';

export interface SyncState {
    status: SyncStatus;
    isOnline: boolean;
    lastSync: number | null;
    pendingCount: number;
    error: string | null;
    syncProgress: number;
}

type SyncEventListener = (state: SyncState) => void;

export class SyncManager {
    private static instance: SyncManager;
    private remoteDB: PouchDB.Database | null = null;
    private syncHandler: PouchDB.Replication.Sync<{}> | null = null;
    private listeners: Set<SyncEventListener> = new Set();
    private state: SyncState = {
        status: 'idle',
        isOnline: navigator.onLine,
        lastSync: null,
        pendingCount: 0,
        error: null,
        syncProgress: 0,
    };
    private retryCount = 0;
    private retryTimeout: number | null = null;

    private constructor() {
        this.initializeNetworkListeners();
    }

    public static getInstance(): SyncManager {
        if (!SyncManager.instance) {
            SyncManager.instance = new SyncManager();
        }
        return SyncManager.instance;
    }

    /**
     * Initialize network status listeners
     */
    private initializeNetworkListeners(): void {
        window.addEventListener('online', () => {
            console.log('🌐 Network online');
            this.updateState({ isOnline: true, status: 'online' });
            this.startSync();
        });

        window.addEventListener('offline', () => {
            console.log('📴 Network offline');
            this.updateState({ isOnline: false, status: 'offline' });
            this.stopSync();
        });
    }

    /**
     * Start synchronization with remote database
     */
    public async startSync(): Promise<void> {
        if (!navigator.onLine) {
            console.log('⚠️ Cannot start sync: offline');
            this.updateState({ status: 'offline', isOnline: false });
            return;
        }

        try {
            // Initialize remote database connection
            const { url, dbName, username, password } = config.couchdb;
            const remoteUrl = `${url}/${dbName}`;

            // Create authenticated URL
            const urlObj = new URL(remoteUrl);
            urlObj.username = username;
            urlObj.password = password;

            this.remoteDB = new PouchDB(urlObj.toString());

            console.log('🔄 Starting sync with remote database...');
            this.updateState({ status: 'syncing', error: null });

            // Start bidirectional sync
            this.syncHandler = localDB.sync(this.remoteDB, {
                live: true,
                retry: true,
                batch_size: 100,
            });

            // Attach event handlers
            this.syncHandler
                .on('change', (info) => {
                    console.log('📥 Sync change:', info);
                    this.handleSyncChange(info);
                })
                .on('paused', (err) => {
                    if (err) {
                        console.error('⏸️ Sync paused with error:', err);
                        this.handleSyncError(err);
                    } else {
                        console.log('⏸️ Sync paused (up to date)');
                        this.updateState({
                            status: 'online',
                            lastSync: Date.now(),
                            syncProgress: 100,
                        });
                        this.retryCount = 0;
                    }
                })
                .on('active', () => {
                    console.log('▶️ Sync active');
                    this.updateState({ status: 'syncing' });
                })
                .on('denied', (err) => {
                    console.error('🚫 Sync denied:', err);
                    this.handleSyncError(err);
                })
                .on('error', (err) => {
                    console.error('❌ Sync error:', err);
                    this.handleSyncError(err);
                })
                .on('complete', (info) => {
                    console.log('✅ Sync complete:', info);
                    this.updateState({
                        status: 'online',
                        lastSync: Date.now(),
                        syncProgress: 100,
                    });
                });

            // Update pending count
            await this.updatePendingCount();
        } catch (error) {
            console.error('Failed to start sync:', error);
            this.handleSyncError(error);
        }
    }

    /**
     * Stop synchronization
     */
    public stopSync(): void {
        if (this.syncHandler) {
            this.syncHandler.cancel();
            this.syncHandler = null;
            console.log('🛑 Sync stopped');
        }

        if (this.retryTimeout) {
            clearTimeout(this.retryTimeout);
            this.retryTimeout = null;
        }
    }

    /**
     * Handle sync change events
     */
    private async handleSyncChange(info: any): Promise<void> {
        // Resolve any conflicts that arise
        if (info.change?.docs) {
            for (const doc of info.change.docs) {
                if (doc._conflicts && doc._conflicts.length > 0) {
                    await conflictResolver.resolveConflict(doc._id);
                }
            }
        }

        await this.updatePendingCount();
    }

    /**
     * Handle sync errors with retry logic
     */
    private handleSyncError(error: any): void {
        const errorMessage = error?.message || 'Unknown sync error';

        this.updateState({
            status: 'error',
            error: errorMessage,
        });

        // Implement exponential backoff retry
        if (this.retryCount < config.features.syncMaxRetries) {
            this.retryCount++;
            const delay = config.features.syncRetryInterval * Math.pow(2, this.retryCount - 1);

            console.log(`🔄 Retrying sync in ${delay}ms (attempt ${this.retryCount}/${config.features.syncMaxRetries})`);

            this.retryTimeout = window.setTimeout(() => {
                this.startSync();
            }, delay);
        } else {
            console.error('❌ Max retry attempts reached');
            this.updateState({ status: 'offline' });
        }
    }

    /**
     * Update count of pending (unsynced) documents
     */
    private async updatePendingCount(): Promise<void> {
        try {
            // This is a simplified approach - in production you'd track sync status per document
            const allDocs = await localDB.allDocs();
            const pendingCount = allDocs.rows.length;

            this.updateState({ pendingCount });
        } catch (error) {
            console.error('Failed to update pending count:', error);
        }
    }

    /**
     * Force a manual sync
     */
    public async forceSync(): Promise<void> {
        this.stopSync();
        this.retryCount = 0;
        await this.startSync();
    }

    /**
     * Get current sync state
     */
    public getState(): SyncState {
        return { ...this.state };
    }

    /**
     * Subscribe to sync state changes
     */
    public subscribe(listener: SyncEventListener): () => void {
        this.listeners.add(listener);

        // Immediately call with current state
        listener(this.getState());

        // Return unsubscribe function
        return () => {
            this.listeners.delete(listener);
        };
    }

    /**
     * Update state and notify listeners
     */
    private updateState(updates: Partial<SyncState>): void {
        this.state = { ...this.state, ...updates };
        this.notifyListeners();
    }

    /**
     * Notify all listeners of state change
     */
    private notifyListeners(): void {
        const state = this.getState();
        this.listeners.forEach((listener) => {
            try {
                listener(state);
            } catch (error) {
                console.error('Error in sync state listener:', error);
            }
        });
    }

    /**
     * Check network connectivity with ping test
     */
    public async checkConnectivity(): Promise<boolean> {
        if (!navigator.onLine) {
            return false;
        }

        try {
            const response = await fetch(`${config.couchdb.url}/_up`, {
                method: 'GET',
                cache: 'no-cache',
            });
            return response.ok;
        } catch {
            return false;
        }
    }
}

// Export singleton instance
export const syncManager = SyncManager.getInstance();
export default syncManager;
