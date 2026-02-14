# Guía Rápida de Instalación - Sistema de Sacramentos

## 📦 Para el Administrador: Preparar Servidor Central

### 1. Instalar CouchDB en el Servidor Central

**Windows:**
1. Descargar de: https://couchdb.apache.org/
2. Ejecutar instalador
3. Configurar:
   - Modo: Single Node
   - Puerto: 5984
   - Usuario: `admin`
   - Contraseña: `[crear contraseña segura]`

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install couchdb
sudo systemctl enable couchdb
sudo systemctl start couchdb
```

### 2. Configurar IP Fija en el Servidor

**Opción A: IP Fija**
- Asignar IP estática: `192.168.1.100` (ejemplo)
- Configurar en router para que no cambie

**Opción B: Dominio Local**
- Configurar DNS local: `sync.diocesis.local`
- Apuntar al servidor

### 3. Crear Base de Datos

```bash
# Acceder a Fauxton: http://localhost:5984/_utils
# O crear por comando:
curl -X PUT http://admin:TuContraseña@localhost:5984/sacramentos
```

### 4. Configurar CORS (Permitir Acceso Remoto)

```bash
curl -X PUT http://admin:TuContraseña@localhost:5984/_node/_local/_config/httpd/enable_cors -d '"true"'
curl -X PUT http://admin:TuContraseña@localhost:5984/_node/_local/_config/cors/origins -d '"*"'
curl -X PUT http://admin:TuContraseña@localhost:5984/_node/_local/_config/cors/credentials -d '"true"'
```

### 5. Probar Acceso

Desde otra computadora en la red:
```bash
curl http://admin:TuContraseña@192.168.1.100:5984/sacramentos
```

Deberías ver: `{"db_name":"sacramentos",...}`

---

## 💻 Para Cada Parroquia: Instalación del Sistema

### 1. Copiar Archivos del Sistema

```bash
# Copiar toda la carpeta Sacrament-Ledger a la laptop
# O clonar desde repositorio si usas Git
```

### 2. Instalar Dependencias

```bash
cd Sacrament-Ledger/client
npm install
```

### 3. Configurar Variables de Entorno

```bash
# Copiar plantilla
cp .env.example .env

# Editar .env con los datos del servidor central
```

**Archivo `.env` para Parroquia San José (ejemplo):**
```bash
# Servidor Central (IGUAL EN TODAS)
VITE_COUCHDB_URL=http://192.168.1.100:5984
VITE_COUCHDB_DB_NAME=sacramentos
VITE_COUCHDB_USERNAME=admin
VITE_COUCHDB_PASSWORD=TuContraseñaSegura

# Esta Parroquia (ÚNICO)
VITE_PARISH_ID=PARROQUIA_001
VITE_PARISH_NAME=Parroquia San José

# Seguridad (ÚNICO)
VITE_ENCRYPTION_KEY=clave-unica-san-jose-2024
```

**Archivo `.env` para Parroquia Santa María (ejemplo):**
```bash
# Servidor Central (IGUAL EN TODAS)
VITE_COUCHDB_URL=http://192.168.1.100:5984
VITE_COUCHDB_DB_NAME=sacramentos
VITE_COUCHDB_USERNAME=admin
VITE_COUCHDB_PASSWORD=TuContraseñaSegura

# Esta Parroquia (ÚNICO)
VITE_PARISH_ID=PARROQUIA_002
VITE_PARISH_NAME=Parroquia Santa María

# Seguridad (ÚNICO)
VITE_ENCRYPTION_KEY=clave-unica-santa-maria-2024
```

### 4. Iniciar Aplicación

```bash
npm run dev
```

### 5. Verificar Sincronización

1. Abrir navegador: `http://localhost:5173`
2. Presionar F12 (abrir DevTools)
3. Ver consola, debe aparecer:
   ```
   🔄 Servidor de sincronización configurado: http://192.168.1.100:5984/sacramentos
   🔄 Iniciando sincronización con servidor central...
   ▶️ Sincronización activa
   ```

4. Crear un sacramento de prueba
5. Verificar en otra parroquia que aparezca

---

## ✅ Checklist de Instalación

### Servidor Central (Una vez)
- [ ] CouchDB instalado
- [ ] IP fija configurada: `______________`
- [ ] Base de datos `sacramentos` creada
- [ ] Usuario admin configurado
- [ ] Contraseña guardada en lugar seguro
- [ ] CORS habilitado
- [ ] Acceso probado desde otra máquina

### Cada Parroquia
- [ ] Sistema copiado
- [ ] `npm install` ejecutado
- [ ] Archivo `.env` creado
- [ ] IP del servidor configurada
- [ ] Contraseña configurada
- [ ] Nombre de parroquia configurado
- [ ] ID único asignado
- [ ] Aplicación iniciada
- [ ] Sincronización verificada

---

## 🔧 Solución de Problemas Comunes

### "No hay servidor de sincronización configurado"

**Causa:** Archivo `.env` no existe o está mal configurado

**Solución:**
1. Verificar que existe `client/.env` (no `.env.example`)
2. Verificar que tiene las variables correctas
3. Reiniciar la aplicación

### "Error de conexión, trabajando en modo local"

**Causa:** No puede conectar al servidor central

**Solución:**
1. Verificar que el servidor está encendido
2. Hacer ping: `ping 192.168.1.100`
3. Verificar que el puerto 5984 está abierto
4. Verificar credenciales en `.env`

### "401 Unauthorized"

**Causa:** Credenciales incorrectas

**Solución:**
1. Verificar `VITE_COUCHDB_USERNAME` y `VITE_COUCHDB_PASSWORD` en `.env`
2. Verificar que coinciden con las del servidor CouchDB

---

## 📋 Datos a Documentar

Al instalar el servidor central, documenta:

```
CONFIGURACIÓN DEL SERVIDOR CENTRAL
==================================
Fecha de instalación: ___________
IP del servidor: ___________
Puerto: 5984
Usuario: admin
Contraseña: ___________ (guardar en lugar seguro)
Base de datos: sacramentos

PARROQUIAS INSTALADAS
====================
1. Parroquia: ___________ | ID: PARROQUIA_001 | Fecha: ___________
2. Parroquia: ___________ | ID: PARROQUIA_002 | Fecha: ___________
3. Parroquia: ___________ | ID: PARROQUIA_003 | Fecha: ___________
```

---

## 🎯 Próximos Pasos

Después de instalar:

1. **Capacitar usuarios** en cada parroquia
2. **Configurar backups** del servidor central
3. **Monitorear sincronización** regularmente
4. **Documentar procedimientos** específicos de tu diócesis
