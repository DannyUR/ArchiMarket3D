# 📥 Sistema de Descarga Multi-Formato de Modelos 3D - Guía de Implementación

## 🎯 Problema Resuelto

**Antes:** Los usuarios descargaban archivos 3D pero solo veían un cubo vacío en Blender/programas 3D
- ❌ Archivos placeholder de texto (no modelos reales)
- ❌ Sin opciones de formato
- ❌ Archivos descargados no eran válidos

**Ahora:** 
- ✅ Descarga de modelos reales desde Sketchfab
- ✅ Selección de múltiples formatos (GLB, OBJ, FBX, USDZ, GLTF)
- ✅ Los modelos abren correctamente en Blender y otros programas 3D
- ✅ Interface intuitiva con selección visual de formato

---

## 📋 Pasos de Implementación

### 1️⃣ **Backend - Ejecutar Migraciones**

```bash
cd archi-api

# Ejecutar la nueva migración para agregar campos
php artisan migrate
```

**Qué hace:** 
- Agrega campo `format` (GLB, OBJ, FBX, etc)
- Agrega campo `size_bytes` (tamaño del archivo)
- Agrega campos `original_name` y `origin`

---

### 2️⃣ **Backend - Verificar Configuración de Sketchfab**

Asegúrate de que tu API key de Sketchfab esté configurada en `.env`:

```env
SKETCHFAB_API_KEY=tu_api_key_aqui
```

Para obtener tu API key:
1. Ve a https://sketchfab.com/settings/password
2. Genera un Personal Access Token
3. Cópialo a tu `.env`

---

### 3️⃣ **Backend - Descargar Modelos Reales**

**Opción A: Descargar todos los formatos disponibles**
```bash
# En la carpeta archi-api
php artisan models:download-real-fixed --all-formats

# Esto descargará GLB, OBJ, FBX y USDZ de cada modelo
```

**Opción B: Descargar solo un formato (más rápido)**
```bash
php artisan models:download-real-fixed --format=glb

# O para otro formato:
php artisan models:download-real-fixed --format=obj
```

**Resultado esperado:**
```
🔄 Iniciando descarga MEJORADA de modelos reales desde Sketchfab...
📊 Se encontraron 15 modelos para procesar
📦 Procesando: Casa Moderna (ID: 1, Sketchfab: abc123)
   📡 Obteniendo URLs de descarga...
   ✓ URLs obtenidas. Formatos disponibles: glb, obj, fbx, usdz
   📥 Descargando formato: glb...
   ✅ glb descargado: 5.23 MB
   ✅ Modelo procesado: 1 archivo(s) descargado(s)

✅ Descarga completada
   ✅ Éxito: 15
   ❌ Fallos: 0
```

---

### 4️⃣ **Frontend - Ya Está Actualizado ✅**

Los cambios en el frontend ya están hechos:
- `Downloads.jsx` - Obtiene formatos del nuevo endpoint
- `DownloadModal.jsx` - Muestra opciones de formato visualmente

No necesitas hacer nada más en el frontend.

---

## 🔌 Nuevos Endpoints API

### **1. Obtener Formatos Disponibles**
```
GET /api/models/{modelId}/formats
```

**Respuesta:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "format": "GLB",
      "size_bytes": 5242880,
      "size_mb": 5.0,
      "file_url": "/storage/models/1/casa_moderna.glb",
      "created_at": "2026-03-17T10:30:00"
    },
    {
      "id": 2,
      "format": "OBJ",
      "size_bytes": 8388608,
      "size_mb": 8.0,
      "file_url": "/storage/models/1/casa_moderna.obj",
      "created_at": "2026-03-17T10:35:00"
    }
  ],
  "count": 2
}
```

---

### **2. Descargar Modelo con Formato Seleccionado**
```
GET /api/models/{modelId}/download?format=GLB
```

**Headers requeridos:**
```
Authorization: Bearer {token}
```

**Respuesta:** Descarga el archivo binario del modelo

**Códigos de error:**
- `401`: No autenticado
- `403`: Modelo no comprado
- `404`: Formato no disponible
- `422`: Formato no especificado

---

## 📱 Flujo de Usuario

```
Usuario en "Mis Descargas"
    ↓
Hace clic en "Descargar"
    ↓
API obtiene formatos disponibles
    ↓
Modal muestra opciones (GLB, OBJ, FBX)
    ↓
Usuario selecciona formato
    ↓
API descarga el archivo real
    ↓
Archivo se descarga a la carpeta Downloads
    ↓
Usuario abre en Blender/3D Studio/etc ✅
```

---

## 🧪 Pruebas

### Test 1: Verificar que los arquivos se descargaron
```bash
# En tu servidor
ls -lh storage/app/public/models/*/

# Deberías ver archivos .glb, .obj, .fbx con tamaños reales (MB)
# NO archivos de texto pequeños
```

### Test 2: Verificar la base de datos
```bash
# En tinker o base de datos
select model_id, format, size_bytes, origin from model_files where file_type='download';

# Deberías ver:
# model_id | format | size_bytes | origin
#-----------|--------|-----------|----------
# 1         | GLB    | 5242880   | sketchfab
# 1         | OBJ    | 8388608   | sketchfab
# 2         | GLB    | 3145728   | sketchfab
```

### Test 3: Test desde el Frontend
1. Ve a "Mis Descargas"
2. Haz clic en "Descargar" en un modelo
3. Verifica que aparezca el modal con múltiples opciones
4. Selecciona un formato
5. Descarga y abre en tu programa 3D

---

## 🐛 Solución de Problemas

### ❌ "No hay formatos disponibles"
**Causa:** El comando de descarga no se ejecutó o falló

**Solución:**
```bash
# 1. Verifica el token de Sketchfab
echo $SKETCHFAB_API_KEY

# 2. Ejecuta el comando nuevamente
php artisan models:download-real-fixed --all-formats

# 3. Revisa los logs
tail -f storage/logs/laravel.log
```

### ❌ "Archivo vacío" después de descargar
**Causa:** Archivo no se guardó correctamente

**Solución:**
```bash
# Verifica permisos de carpeta
chmod -R 755 storage/app/public/
chmod -R 755 storage/app/public/models/

# Limpia y vuelve a descargar
php artisan models:download-real-fixed --all-formats
```

### ❌ "Formato no disponible"
**Causa:** El archivo .obj/.fbx no se descargó de Sketchfab

**Solución:**
- Algunos modelos en Sketchfab pueden no tener todos los formatos
- Usa `--format=glb` para descargar solo GLB (más universal)
- Verifica que el modelo tenga esos formatos en Sketchfab

### ❌ API timeout (descarga interrumpida)
**Causa:** Archivo muy grande

**Solución:**
```php
// En DownloadRealModelsFixed.php, aumenta el timeout:
->timeout(600)  // 10 minutos en lugar de 5
```

---

## 📊 Estructura de Archivos

```
storage/app/public/models/
├── 1/
│   ├── casa_moderna.glb          (5.0 MB)
│   ├── casa_moderna.obj          (8.0 MB)
│   ├── casa_moderna.fbx          (6.5 MB)
│   └── casa_moderna.usdz         (4.2 MB)
├── 2/
│   ├── edificio_comercial.glb   (12.0 MB)
│   ├── edificio_comercial.obj   (15.0 MB)
│   └── edificio_comercial.fbx   (14.0 MB)
└── ...
```

---

## ✨ Características Implementadas

- ✅ Descarga de modelos reales desde Sketchfab
- ✅ Soporte para múltiples formatos (GLB, OBJ, FBX, USDZ, GLTF)
- ✅ Información de tamaño de archivo
- ✅ Verificación de compra antes de descargar
- ✅ Modal visual para selección de formato
- ✅ Manejo de errores completo
- ✅ Logs y feedback detallado
- ✅ Reintentos automáticos en caso de timeout
- ✅ Base de datos actualizada con metadatos

---

## 📝 Base de Datos

### Tabla: `model_files`
```sql
ALTER TABLE model_files ADD COLUMN format VARCHAR(50);
ALTER TABLE model_files ADD COLUMN size_bytes BIGINT UNSIGNED;
ALTER TABLE model_files ADD COLUMN original_name VARCHAR(255);
ALTER TABLE model_files ADD COLUMN origin VARCHAR(50);
```

### Datos de ejemplo:
```sql
INSERT INTO model_files VALUES (
  NULL,         -- id (auto)
  1,            -- model_id
  '/storage/models/1/casa.glb',  -- file_url
  'download',   -- file_type
  'GLB',        -- format (NUEVO)
  5242880,      -- size_bytes (NUEVO)
  'casa.glb',   -- original_name (NUEVO)
  'sketchfab',  -- origin (NUEVO)
  NOW(),        -- created_at
  NOW()         -- updated_at
);
```

---

## 🚀 Comandos Útiles

```bash
# Descargar formatos específicos
php artisan models:download-real-fixed --format=glb
php artisan models:download-real-fixed --format=obj
php artisan models:download-real-fixed --format=fbx

# Descargar todos los formatos
php artisan models:download-real-fixed --all-formats

# Ver modelos sin archivos de descarga
php artisan tinker
> App\Models\Model3D::whereDoesntHave('files', fn($q) => $q->where('file_type', 'download'))->pluck('name', 'id')

# Limpiar archivos descargados
rm -rf storage/app/public/models/*
```

---

## 📞 Soporte

Si tienes problemas:
1. Verifica los logs: `storage/logs/laravel.log`
2. Revisa la consola del navegador (F12)
3. Asegúrate de que el token de Sketchfab sea válido
4. Ejecuta: `php artisan models:download-real-fixed --all-formats -vvv` (verbose)

---

**¡Sistema listo para producción!** ✅
