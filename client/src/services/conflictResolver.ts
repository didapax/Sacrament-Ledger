/**
 * Conflict Resolution Service
 * Implements Last Write Wins (LWW) strategy for multi-master replication conflicts
 */

import localDB from '../database';

export interface ConflictLog {
    _id: string;
    type: 'CONFLICT_LOG';
    originalDocId: string;
    winningRev: string;
    losingRev: string;
    winningDoc: any;
    losingDoc: any;
    timestamp: number;
    resolvedBy: 'LWW' | 'MANUAL';
}

export class ConflictResolver {
    private static instance: ConflictResolver;

    private constructor() { }

    public static getInstance(): ConflictResolver {
        if (!ConflictResolver.instance) {
            ConflictResolver.instance = new ConflictResolver();
        }
        return ConflictResolver.instance;
    }

    /**
     * Resolve conflicts using Last Write Wins (LWW) strategy
     * The document with the most recent timestamp wins
     */
    public async resolveConflict(docId: string): Promise<void> {
        try {
            // Get the document with all conflicting revisions
            const doc = await localDB.get(docId, { conflicts: true });

            if (!doc._conflicts || doc._conflicts.length === 0) {
                // No conflicts to resolve
                return;
            }

            console.log(`🔄 Resolving conflict for document: ${docId}`);

            // Get all conflicting versions
            const conflictingDocs = await Promise.all(
                doc._conflicts.map((rev) => localDB.get(docId, { rev }))
            );

            // Include the current winning revision
            const allVersions = [doc, ...conflictingDocs];

            // Sort by timestamp (most recent first)
            allVersions.sort((a, b) => {
                const timeA = (a as any).timestamp || 0;
                const timeB = (b as any).timestamp || 0;
                return timeB - timeA;
            });

            const winner = allVersions[0];
            const losers = allVersions.slice(1);

            // Log the conflict for audit purposes
            await this.logConflict(docId, winner, losers);

            // Remove losing revisions
            for (const loser of losers) {
                try {
                    await localDB.remove(loser._id, loser._rev);
                    console.log(`✅ Removed losing revision: ${loser._rev}`);
                } catch (error) {
                    console.error(`Failed to remove revision ${loser._rev}:`, error);
                }
            }

            console.log(`✅ Conflict resolved for ${docId}. Winner: ${winner._rev}`);
        } catch (error) {
            console.error(`Failed to resolve conflict for ${docId}:`, error);
            throw error;
        }
    }

    /**
     * Log conflict resolution for audit trail
     */
    private async logConflict(
        docId: string,
        winner: any,
        losers: any[]
    ): Promise<void> {
        try {
            for (const loser of losers) {
                const conflictLog: ConflictLog = {
                    _id: `conflict_${docId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    type: 'CONFLICT_LOG',
                    originalDocId: docId,
                    winningRev: winner._rev,
                    losingRev: loser._rev,
                    winningDoc: winner,
                    losingDoc: loser,
                    timestamp: Date.now(),
                    resolvedBy: 'LWW',
                };

                await localDB.put(conflictLog);
            }
        } catch (error) {
            console.error('Failed to log conflict:', error);
            // Don't throw - logging failure shouldn't stop conflict resolution
        }
    }

    /**
     * Get conflict history for a document
     */
    public async getConflictHistory(docId: string): Promise<ConflictLog[]> {
        try {
            const result = await localDB.find({
                selector: {
                    type: 'CONFLICT_LOG',
                    originalDocId: docId,
                },
                sort: [{ timestamp: 'desc' }],
            });

            return result.docs as unknown as ConflictLog[];
        } catch (error) {
            console.error('Failed to get conflict history:', error);
            return [];
        }
    }

    /**
     * Check if a document has conflicts
     */
    public async hasConflicts(docId: string): Promise<boolean> {
        try {
            const doc = await localDB.get(docId, { conflicts: true });
            return !!(doc._conflicts && doc._conflicts.length > 0);
        } catch (error) {
            return false;
        }
    }

    /**
     * Resolve all pending conflicts in the database
     */
    public async resolveAllConflicts(): Promise<number> {
        try {
            const allDocs = await localDB.allDocs({
                include_docs: true,
                conflicts: true,
            });

            const docsWithConflicts = allDocs.rows.filter(
                (row) => row.doc?._conflicts && row.doc._conflicts.length > 0
            );

            console.log(`Found ${docsWithConflicts.length} documents with conflicts`);

            for (const row of docsWithConflicts) {
                await this.resolveConflict(row.id);
            }

            return docsWithConflicts.length;
        } catch (error) {
            console.error('Failed to resolve all conflicts:', error);
            throw error;
        }
    }
}

// Export singleton instance
export const conflictResolver = ConflictResolver.getInstance();
export default conflictResolver;
