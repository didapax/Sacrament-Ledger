import { useState, useEffect, useCallback } from 'react';
import localDB from '../database';
import { crearRegistroBautismo } from '../models/Sacramento';
import type { Bautismo } from '../models/Sacramento';
import encryptionService from '../services/encryptionService';

/**
 * Hook for managing sacrament records with real-time updates and PouchDB integration
 */
export const useSacraments = () => {
    const [sacraments, setSacraments] = useState<Bautismo[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchSacraments = useCallback(async () => {
        try {
            setLoading(true);
            const result = await localDB.allDocs({
                include_docs: true,
                descending: true,
            });

            const docs = result.rows
                .map(row => row.doc as any)
                .filter(doc => doc && doc.tipo === 'BAUTISMO')
                .map(doc => encryptionService.decryptFields(doc) as Bautismo);

            setSacraments(docs);
            setError(null);
        } catch (err: any) {
            console.error('Failed to fetch sacraments:', err);
            setError(err.message || 'Error al cargar registros');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSacraments();

        // Listen for live changes
        const changes = localDB.changes({
            since: 'now',
            live: true,
            include_docs: true
        }).on('change', () => {
            fetchSacraments();
        });

        return () => changes.cancel();
    }, [fetchSacraments]);

    const addSacrament = async (datos: any) => {
        try {
            // 1. Get last record for hash chaining
            const allDocs = await localDB.find({
                selector: { tipo: 'BAUTISMO' },
                sort: [{ timestamp: 'desc' }],
                limit: 1
            });

            const lastHash = allDocs.docs.length > 0 ? (allDocs.docs[0] as any).hash : '0';

            // 2. Create new record
            const nuevoRegistro = crearRegistroBautismo(datos, lastHash);

            // 3. Save to local DB
            await localDB.put(nuevoRegistro);
            return { success: true };
        } catch (err: any) {
            console.error('Error adding sacrament:', err);
            return { success: false, error: err.message };
        }
    };

    const getRecordById = async (id: string) => {
        try {
            const doc = await localDB.get(id);
            return encryptionService.decryptFields(doc as any) as Bautismo;
        } catch (err) {
            return null;
        }
    };

    return {
        sacraments,
        loading,
        error,
        addSacrament,
        getRecordById,
        refresh: fetchSacraments
    };
};

export default useSacraments;
