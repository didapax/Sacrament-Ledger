# Arquitectura de Sincronización - Sistema de Sacramentos

## 📋 Resumen Ejecutivo

El sistema está diseñado con una **arquitectura de Nodo Central** donde todas las parroquias se sincronizan con un servidor CouchDB central. Cada instalación funciona de manera **offline-first**, permitiendo trabajo sin conexión y sincronización automática cuando hay internet.

## 🏗️ Arquitectura Recomendada

### Opción Implementada: Nodo Central

```mermaid
graph TD
    A[Servidor Central CouchDB<br/>IP Fija: 192.168.1.100:5984<br/>DB: sacramentos] 
    B[Parroquia A<br/>Base Local + Sync]
    C[Parroquia B<br/>Base Local + Sync]
    D[Parroquia C<br/>Base Local + Sync]
    E[Parroquia D<br/>Base Local + Sync]
    
    B <-->|Sincronización<br/>Bidireccional| A
    C <-->|Sincronización<br/>Bidireccional| A
    D <-->|Sincronización<br/>Bidireccional| A
    E <-->|Sincronización<br/>Bidireccional| A
    
    style A fill:#4CAF50,stroke:#2E7D32,color:#fff
    style B fill:#2196F3,stroke:#1565C0,color:#fff
    style C fill:#2196F3,stroke:#1565C0,color:#fff
    style D fill:#2196F3,stroke:#1565C0,color:#fff
    style E fill:#2196F3,stroke:#1565C0,color:#fff
```

### Ventajas de esta Arquitectura

✅ **Simplicidad**: Una sola configuración por parroquia  
✅ **Centralización**: Todos los datos en un solo lugar para backups  
✅ **Escalabilidad**: Fácil agregar nuevas parroquias  
✅ **Offline-First**: Cada parroquia funciona sin internet  
✅ **Auto-recuperación**: Sincroniza automáticamente al reconectar  

---

## 🔧 Componentes del Sistema

### 1. Base de Datos Local (PouchDB)

Cada parroquia tiene su propia base de datos local en el navegador:

```typescript
const localDB = new PouchDB('sacramentos_locales');
```

**Características:**
- Almacenamiento en IndexedDB del navegador
- Funciona 100% offline
- Búsquedas rápidas con índices
- No requiere servidor

### 2. Servidor Central (CouchDB)

Un servidor central que todas las parroquias comparten:

```
URL: http://192.168.1.100:5984/sacramentos
Usuario: admin
Contraseña: [configurada en .env]
```

**Requisitos:**
- IP fija o dominio estático
- CouchDB instalado y configurado
- Puerto 5984 accesible en la red
- Credenciales de administrador

### 3. Sincronización Bidireccional

```typescript
localDB.sync(remoteDB, {
  live: true,    // Sincronización continua
  retry: true    // Reintentos automáticos
})
```

**Flujo de datos:**
1. Usuario crea sacramento en Parroquia A → Se guarda localmente
2. Sistema detecta conexión → Envía al servidor central
3. Servidor central recibe → Notifica a otras parroquias
4. Parroquias B, C, D reciben → Actualizan sus bases locales

---

## ⚙️ Configuración por Instalación

### Paso 1: Servidor Central (Una sola vez)

#### Instalación de CouchDB

**En Windows:**
```powershell
# Descargar desde: https://couchdb.apache.org/
# Instalar y configurar:
# - Puerto: 5984
# - Usuario: admin
# - Contraseña: [segura]
# - Modo: Single Node
```

**En Linux:**
```bash
sudo apt update
sudo apt install couchdb
sudo systemctl enable couchdb
sudo systemctl start couchdb
```

#### Configuración de CouchDB

1. Acceder a Fauxton (interfaz web): `http://localhost:5984/_utils`
2. Crear base de datos: `sacramentos`
3. Configurar CORS (permitir acceso desde otras máquinas):

```bash
curl -X PUT http://admin:password@localhost:5984/_node/_local/_config/httpd/enable_cors -d '"true"'
curl -X PUT http://admin:password@localhost:5984/_node/_local/_config/cors/origins -d '"*"'
curl -X PUT http://admin:password@localhost:5984/_node/_local/_config/cors/credentials -d '"true"'
```

4. **Configurar IP fija** en el servidor (importante):
   - Windows: Panel de Control → Red → Propiedades IPv4
   - Linux: Editar `/etc/netplan/` o `/etc/network/interfaces`

### Paso 2: Configuración en Cada Parroquia

#### Archivo `.env` (copiar de `.env.example`)

```bash
# En cada laptop de parroquia, crear archivo .env con:

# URL del servidor central (CAMBIAR LA IP)
VITE_COUCHDB_URL=http://192.168.1.100:5984

# Nombre de la base de datos (IGUAL EN TODAS)
VITE_COUCHDB_DB_NAME=sacramentos

# Credenciales del servidor central (IGUALES EN TODAS)
VITE_COUCHDB_USERNAME=admin
VITE_COUCHDB_PASSWORD=TuContraseñaSegura

# Identificación de esta parroquia (ÚNICO POR PARROQUIA)
VITE_PARISH_ID=PARROQUIA_001
VITE_PARISH_NAME=Parroquia San José

# Seguridad (ÚNICO POR PARROQUIA)
VITE_ENCRYPTION_KEY=clave-unica-parroquia-001
```

> [!IMPORTANT]
> **Cada parroquia debe tener:**
> - Mismo `VITE_COUCHDB_URL` (IP del servidor central)
> - Mismo `VITE_COUCHDB_USERNAME` y `VITE_COUCHDB_PASSWORD`
> - Diferente `VITE_PARISH_ID` y `VITE_PARISH_NAME`

---

## 🔐 Seguridad

### Credenciales

- **`admin:password`** en el código es solo un ejemplo
- **DEBES cambiar** la contraseña en producción
- Usar contraseñas fuertes (mínimo 16 caracteres)

### Recomendaciones

1. **No exponer CouchDB a internet** (solo red local)
2. **Usar VPN** si necesitas sincronizar entre ubicaciones remotas
3. **Backups regulares** del servidor central
4. **Firewall** para limitar acceso al puerto 5984

---

## 📡 Escenarios de Uso

### Escenario 1: Trabajo Normal con Internet

```mermaid
sequenceDiagram
    participant U as Usuario
    participant L as Base Local
    participant S as Servidor Central
    participant O as Otras Parroquias
    
    U->>L: Registra bautismo
    L->>L: Guarda localmente
    L->>S: Sincroniza
    S->>O: Notifica cambio
    O->>O: Actualizan datos
```

### Escenario 2: Sin Internet (Offline)

```mermaid
sequenceDiagram
    participant U as Usuario
    participant L as Base Local
    participant S as Servidor Central
    
    U->>L: Registra bautismo
    L->>L: Guarda localmente
    L->>S: ❌ Sin conexión
    Note over L: Datos quedan en cola
    Note over L: Sistema sigue funcionando
```

### Escenario 3: Reconexión

```mermaid
sequenceDiagram
    participant L as Base Local
    participant S as Servidor Central
    
    Note over L,S: Internet se restaura
    L->>S: ✅ Reconexión automática
    L->>S: Envía datos pendientes
    S->>L: Envía datos nuevos
    Note over L: Sincronización completa
```

---

## 🚀 Instalación Paso a Paso

### Para el Administrador de la Diócesis

1. **Preparar Servidor Central**
   ```bash
   # Instalar CouchDB
   # Configurar IP fija: 192.168.1.100
   # Crear base de datos: sacramentos
   # Configurar usuario: admin / contraseña segura
   ```

2. **Documentar Configuración**
   ```
   IP Servidor: 192.168.1.100
   Puerto: 5984
   Usuario: admin
   Contraseña: [guardar en lugar seguro]
   ```

3. **Preparar Paquete de Instalación**
   - Copiar sistema completo
   - Incluir archivo `.env.template` con instrucciones
   - Crear manual de instalación

### Para Cada Parroquia

1. **Instalar Sistema**
   ```bash
   # Copiar archivos del sistema
   # Instalar dependencias
   npm install
   ```

2. **Configurar `.env`**
   ```bash
   # Copiar plantilla
   cp .env.example .env
   
   # Editar con datos del servidor central
   # Cambiar VITE_PARISH_NAME a nombre de esta parroquia
   ```

3. **Iniciar Aplicación**
   ```bash
   npm run dev
   ```

4. **Verificar Sincronización**
   - Abrir consola del navegador (F12)
   - Buscar mensaje: "🔄 Servidor de sincronización configurado"
   - Crear un registro de prueba
   - Verificar en servidor central

---

## 🔍 Diagnóstico de Problemas

### Problema: No sincroniza

**Verificar:**

1. **Conectividad**
   ```bash
   # Desde la laptop de la parroquia:
   ping 192.168.1.100
   curl http://192.168.1.100:5984
   ```

2. **Credenciales**
   ```bash
   # Verificar acceso:
   curl http://admin:password@192.168.1.100:5984/sacramentos
   ```

3. **Consola del navegador**
   - Abrir DevTools (F12)
   - Ver mensajes de error
   - Buscar "❌" en los logs

### Problema: Datos duplicados

**Causa:** Conflictos de sincronización  
**Solución:** PouchDB maneja automáticamente, pero revisar:

```typescript
// En database.ts, los conflictos se resuelven automáticamente
// Si persisten, verificar que cada documento tenga _id único
```

### Problema: Sincronización lenta

**Optimizar:**

1. Reducir frecuencia de sincronización
2. Usar índices apropiados
3. Verificar ancho de banda de red

---

## 📊 Monitoreo

### Logs en Consola del Navegador

```
🔄 Servidor de sincronización configurado: http://192.168.1.100:5984/sacramentos
🔄 Iniciando sincronización con servidor central...
▶️ Sincronización activa
✅ Parroquia San José: Sincronización exitosa
⏸️ Sincronización pausada (esperando cambios)
```

### Dashboard de CouchDB

Acceder a: `http://192.168.1.100:5984/_utils`

Ver:
- Número de documentos
- Tamaño de base de datos
- Actividad de replicación

---

## 🎯 Respuestas a tus Preguntas

### ¿Cómo funcionaría la instalación?

**Respuesta:** Cada parroquia instala el sistema y configura su archivo `.env` apuntando al servidor central. No necesitan modificar código, solo configuración.

### ¿Necesitamos un nodo central?

**Respuesta:** **Sí, es la opción recomendada** porque:
- Más simple de administrar
- Backups centralizados
- Fácil agregar parroquias
- Mejor control de datos

### ¿Qué es `admin:password`?

**Respuesta:** Son las credenciales del servidor CouchDB central. Todas las parroquias usan las mismas credenciales para conectarse.

### ¿Qué es `IP_OTRA_PARROQUIA`?

**Respuesta:** Es la IP del servidor central (no de otra parroquia). Debe ser **fija** o usar un dominio local como `sync.diocesis.local`.

### ¿Qué es `/sacramentos`?

**Respuesta:** Es el **nombre de la base de datos** en CouchDB, no una carpeta compartida. Es una base de datos NoSQL donde se almacenan todos los registros.

---

## 💡 Alternativa: Sin Servidor Central

Si no quieres un servidor central, puedes usar **sincronización P2P**, pero es más complejo:

```typescript
// Cada parroquia necesitaría conocer todas las demás
const parroquias = [
  'http://admin:pass@192.168.1.101:5984/sacramentos', // Parroquia A
  'http://admin:pass@192.168.1.102:5984/sacramentos', // Parroquia B
  'http://admin:pass@192.168.1.103:5984/sacramentos', // Parroquia C
];

// Sincronizar con todas
parroquias.forEach(url => {
  localDB.sync(new PouchDB(url), { live: true, retry: true });
});
```

**Desventajas:**
- Configuración compleja
- Difícil de mantener
- Problemas si una parroquia cambia de IP
- No escalable

---

## 📝 Checklist de Implementación

### Servidor Central
- [ ] Instalar CouchDB
- [ ] Configurar IP fija
- [ ] Crear base de datos `sacramentos`
- [ ] Configurar CORS
- [ ] Configurar credenciales seguras
- [ ] Probar acceso desde otra máquina
- [ ] Configurar backups automáticos

### Cada Parroquia
- [ ] Instalar sistema
- [ ] Copiar `.env.example` a `.env`
- [ ] Configurar IP del servidor central
- [ ] Configurar credenciales
- [ ] Configurar nombre de parroquia
- [ ] Probar conexión
- [ ] Verificar sincronización
- [ ] Capacitar usuarios

---

## 🔗 Recursos Adicionales

- [Documentación CouchDB](https://docs.couchdb.org/)
- [Documentación PouchDB](https://pouchdb.com/guides/)
- [Guía de Replicación](https://pouchdb.com/guides/replication.html)
