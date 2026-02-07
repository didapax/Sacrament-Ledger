#descripcion:
Un Distributed Ledger (Libro Mayor Distribuido) o una Base de Datos con Replicación Multi-Maestro

#Lenguaje: 
Node.js (TypeScript). para manejar procesos en segundo plano (nodos) y comunicación de red.

#Base de Datos:
CouchDB:  Está diseñada específicamente para sincronizar bases de datos entre servidores que se desconectan. Tiene un protocolo de replicación nativo.
PouchDB: Es la versión que corre en el navegador o en una app de escritorio. Puede guardar los datos localmente y, en cuanto detecta internet, los "empuja" a la base de datos central o a otros nodos.

#Arquitectura de Sincronización:
Nodo Local.
El software usa un sistema de Conflict Resolution (generalmente gana el registro con el timestamp más reciente).
Se pueden usar CRDTs (Conflict-free Replicated Data Types)
