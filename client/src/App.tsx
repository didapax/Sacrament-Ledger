import { useEffect } from 'react';
import type { Bautismo } from './models/Sacramento';
import './styles/design-system.css';
import './App.css';
import Dashboard from './components/Dashboard';
import FormularioBautismo from './components/FormularioBautismo';
import RecordCard from './components/RecordCard';
import useSacraments from './hooks/useSacraments';
import { syncManager } from './services/syncManager';

function App() {
  const { sacraments, loading } = useSacraments();

  useEffect(() => {
    // Iniciar sincronización global al montar la app
    syncManager.startSync();

    return () => {
      syncManager.stopSync();
    };
  }, []);

  return (
    <div className="App" style={{ background: 'var(--color-bg)', minHeight: '100vh' }}>
      <Dashboard />

      <main className="container" style={{ paddingBottom: 'var(--space-xl)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: 'var(--space-xl)', alignItems: 'start' }}>

          <section>
            <FormularioBautismo />
          </section>

          <section>
            <h3 style={{
              fontFamily: "'Playfair Display', serif",
              color: 'var(--color-primary)',
              marginTop: 0,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              Libro de Registros Recientes
              <span style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
                {sacraments.length} documentos
              </span>
            </h3>

            {loading ? (
              <div className="flex-center" style={{ height: '200px', flexDirection: 'column', gap: 'var(--space-md)' }}>
                <div className="animate-pulse-slow" style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--color-primary)' }} />
                <p>Cargando Libro Mayor...</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: 'var(--space-md)' }}>
                {sacraments.length === 0 ? (
                  <div className="card glass flex-center" style={{ padding: 'var(--space-xl)', color: 'var(--color-text-secondary)' }}>
                    No hay registros en este nodo parroquial.
                  </div>
                ) : (
                  sacraments.map((record: Bautismo) => (
                    <RecordCard key={record._id} record={record} />
                  ))
                )}
              </div>
            )}
          </section>

        </div>
      </main>

      <footer className="flex-center" style={{
        padding: 'var(--space-xl)',
        borderTop: '1px solid var(--glass-border)',
        color: 'var(--color-text-secondary)',
        fontSize: '0.8rem'
      }}>
        Sacrament Ledger v1.0.0 • Nodo Distribuido Offline-First • {new Date().getFullYear()}
      </footer>
    </div>
  );
}

export default App;
