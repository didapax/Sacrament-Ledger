import React, { useEffect, useState } from 'react';
import FormularioBautismo from './components/FormularioBautismo';
import localDB, { iniciarSincronizacion } from './database';

function App() {
  const [registros, setRegistros] = useState<any[]>([]);

  useEffect(() => {
    // Iniciar la escucha de otros nodos
    iniciarSincronizacion();

    // Cargar datos iniciales y escuchar cambios locales
    const fetchDocs = () => {
      localDB.allDocs({ include_docs: true }).then(res => {
        setRegistros(res.rows.map(r => r.doc));
      });
    };

    fetchDocs();
    
    // Si entra un dato de otro nodo, actualizamos la vista
    const changes = localDB.changes({ since: 'now', live: true, include_docs: true })
      .on('change', fetchDocs);

    return () => changes.cancel();
  }, []);

  return (
    <div className="App">
      <h1>Sacrament Ledger 📜</h1>
      <FormularioBautismo />
      
      <h3>Libro de Registro (Nodo Local)</h3>
      <ul>
        {registros.map(reg => (
          <li key={reg._id}>
            {reg.nombre} - <b>Hash:</b> {reg.hash?.substring(0, 10)}...
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
