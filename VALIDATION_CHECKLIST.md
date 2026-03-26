# ✅ Checklist de Validación - Sistema de Descarga

## 🚀 Antes de Empezar

- [ ] Tienes acceso a la carpeta `archi-api` 
- [ ] Tienes acceso a `.env` con `SKETCHFAB_API_KEY`
- [ ] Terminal abierta en la carpeta `archi-api`
- [ ] PHP y Composer instalados
- [ ] Acceso a base de datos

---

## 📦 Paso 1: Descargar el Código Nuevo

- [ ] Archivo `DownloadRealModelsFixed.php` existe en `app/Console/Commands/`
- [ ] Archivo migración `2026_03_17_add_format_to_model_files.php` existe en `database/migrations/`
- [ ] Rutas actualizadas en `routes/api.php` (2 nuevas líneas)
- [ ] `ModelFileController.php` tiene nuevos métodos

---

## 🔧 Paso 2: Configuración del Entorno

### API Key de Sketchfab
```bash
# En archi-api/.env verifica que exista:
grep SKETCHFAB_API_KEY .env

# Si no existe, agregalo:
echo "SKETCHFAB_API_KEY=tu_api_key_aqui" >> .env
```

- [ ] Valor de `SKETCHFAB_API_KEY` está presente en `.env`
- [ ] Es un token válido (obtenido de https://sketchfab.com/settings/password)
- [ ] No contiene espacios en blanco innecesarios

---

## 🗄️ Paso 3: Migración de Base de Datos

```bash
php artisan migrate
```

Verificar que los campos fueron agregados:

```bash
php artisan tinker
> Schema::hasColumn('model_files', 'format')
> Schema::hasColumn('model_files', 'size_bytes')
> Schema::hasColumn('model_files', 'original_name')
> Schema::hasColumn('model_files', 'origin')
```

- [ ] Migración ejecutada sin errores
- [ ] Campo `format` agregado a `model_files`
- [ ] Campo `size_bytes` agregado a `model_files`
- [ ] Campo `original_name` agregado a `model_files`
- [ ] Campo `origin` agregado a `model_files`

---

## 📥 Paso 4: Ejecutar Descarga de Modelos

### Opción Rápida (Recomendado para empezar)
```bash
php artisan models:download-real-fixed --format=glb
```

- [ ] Comando ejecutado sin errores
- [ ] Muestra "Procesando: " para cada modelo
- [ ] Al final dice "✅ Descarga completada"
- [ ] Contador de éxito > 0

### Opción Completa (Todos los formatos)
```bash
php artisan models:download-real-fixed --all-formats
```

- [ ] Descarga GLB, OBJ, FBX para cada modelo
- [ ] Tiempo total ~5-10 minutos (según cantidad)
- [ ] Todos los formatos muestran ✅

---

## 🔍 Paso 5: Verificación de Archivos

### Verificar que se descargaron
```bash
ls -lh storage/app/public/models/*/
```

Deberías ver:
```
-rw-r--r-- 5.2M casa_moderna.glb
-rw-r--r-- 8.3M casa_moderna.obj
-rw-r--r-- 6.5M casa_moderna.fbx
```

- [ ] Carpeta `storage/app/public/models/` existe
- [ ] Hay al menos una subcarpeta por modelo (1/, 2/, etc)
- [ ] Cada subcarpeta tiene archivos .glb/.obj/.fbx
- [ ] Los archivos tienen tamaño real (5+ MB, no 0 bytes)
- [ ] Los archivos tienen timestamps recientes

### ❌ Problemas Comunes
- [ ] ❌ Archivos con tamaño 0 bytes = No se descargaron
- [ ] ❌ Archivos .txt pequeños = Aún son placeholders
- [ ] ❌ Sin archivos = Descarga no se ejecutó o falló

---

## 🗄️ Paso 6: Verificación de Base de Datos

```bash
php artisan tinker

# Ver formatos disponibles
> App\Models\ModelFile::where('file_type', 'download')->get()

# Deberías ver una tabla con:
# - model_id, format (GLB/OBJ/FBX), size_bytes, origin (sketchfab)
```

- [ ] Existen registros en `model_files` con `file_type='download'`
- [ ] Campo `format` tiene valores: GLB, OBJ, FBX, USDZ
- [ ] Campo `size_bytes` tiene números > 1000000 (1MB+)
- [ ] Campo `origin` dice "sketchfab"
- [ ] Campo `original_name` tiene nombres de archivos

### SQL Directo
```sql
SELECT model_id, format, size_bytes, origin FROM model_files 
WHERE file_type='download' 
LIMIT 5;
```

- [ ] Resultados muestran múltiples formatos por modelo
- [ ] size_bytes son números reales (5000000+)

---

## 🌐 Paso 7: Verificación de API

### Desde Terminal
```bash
# Obtener token de usuario (reemplaza con token real)
TOKEN="your_bearer_token_here"

# Probar endpoint de formatos
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8000/api/models/1/formats

# Probar descarga
curl -H "Authorization: Bearer $TOKEN" \
  -o /tmp/test_model.glb \
  "http://localhost:8000/api/models/1/download?format=GLB"
```

- [ ] Endpoint `/api/models/{id}/formats` retorna JSON con lista de formatos
- [ ] Status HTTP es 200 (no 404, 401, 403)
- [ ] Respuesta incluye `format`, `size_mb`, `file_url`
- [ ] Endpoint `/api/models/{id}/download?format=GLB` descarga archivo binario
- [ ] Archivo descargado tiene tamaño real (> 1MB)

### Desde Postman/Insomnia
1. [ ] GET http://localhost:8000/api/models/1/formats
   - Auth: Bearer token
   - Status: 200
   - Body: JSON con formatos

2. [ ] GET http://localhost:8000/api/models/1/download?format=GLB
   - Auth: Bearer token
   - Status: 200
   - Response: Archivo binario descargable

---

## 💻 Paso 8: Verificación Frontend

### En la Aplicación Web
1. [ ] Login/autenticación funciona
2. [ ] Ir a "Mis Descargas"
3. [ ] Ver lista de modelos comprados
4. [ ] Click en botón "Descargar"
   - [ ] Se abre modal
   - [ ] Modal muestra múltiples opciones de formato
   - [ ] Cada opción muestra tamaño (5.2 MB, 8.3 MB, etc)
5. [ ] Seleccionar un formato (GLB)
   - [ ] Botón "Descargar" está habilitado
6. [ ] Click en "Descargar"
   - [ ] Aparece "Descargando..."
   - [ ] Archivo se descarga a la carpeta Downloads
   - [ ] Modal se cierra
7. [ ] Archivo descargado:
   - [ ] Tiene nombre: `nombre_modelo.glb`
   - [ ] Tamaño real (5+ MB, no pequeño)
   - [ ] Se puede abrir

---

## 🎨 Paso 9: Verificación en Software 3D

### Blender
1. [ ] Descarga un modelo en formato GLB
2. [ ] Abre Blender
3. [ ] File → Import → glTF 2.0 (.glb/.gltf)
4. [ ] Selecciona el archivo descargado
5. [ ] Click "Import"
   - [ ] ✅ Se importa correctamente el modelo 3D
   - [ ] ❌ NO aparece solo un cubo vacío
   - [ ] Modelo es visible con geometría correcta
   - [ ] Materiales/texturas se ven

### 3D Studio Max (si aplica)
1. [ ] Descarga formato FBX
2. [ ] Import → Select FBX file
3. [ ] ✅ Modelo importa correctamente
4. [ ] ✅ Geometría visible

### Otros (SketchUp, 3DSMAX, CAD, etc)
- [ ] OBJ funciona en todos los programas
- [ ] FBX funciona en la mayoría
- [ ] GLB funciona en software moderno

---

## 🐛 Paso 10: Solución de Problemas

### Problema: "No hay formatos disponibles"
```
[ ] Ejecutar comando nuevamente: php artisan models:download-real-fixed --all-formats
[ ] Revisar logs: tail -f storage/logs/laravel.log
[ ] Verificar API key: echo $SKETCHFAB_API_KEY
```

### Problema: Archivo vacío (0 bytes)
```
[ ] Verificar permisos: chmod 755 storage/app/public/
[ ] Verificar espacio disco: df -h
[ ] Ver logs de descarga: tail storage/logs/laravel.log
```

### Problema: Archivo no se importa en Blender
```
[ ] Verificar tamaño del archivo: ls -lh ~/Downloads/modelo.glb
[ ] Probar con otro formato: descargar .obj en lugar de .glb
[ ] En Blender: Try "Scale" import option differently
```

### Problema: API retorna 403 (Forbidden)
```
[ ] Verificar que el usuario compró el modelo
[ ] Verificar token/autenticación
[ ] Check user_type in database
```

### Problema: API retorna 404 (Not Found)
```
[ ] Verificar que el formato existe: SELECT format FROM model_files WHERE model_id=1
[ ] Usar un formato que existe (GLB siempre debería existir)
```

---

## ✨ Paso 11: Validación Final

### Checklist Completo
- [ ] Archivos nuevos copiados
- [ ] Migración ejecutada ✅
- [ ] Base de datos tiene nuevos campos ✅
- [ ] Modelos descargados desde Sketchfab ✅
- [ ] Archivos existen con tamaño real ✅
- [ ] API endpoints funcionan ✅
- [ ] Frontend muestra Modal con opciones ✅
- [ ] Usuario puede descargar ✅
- [ ] Archivos se abren en Blender ✅
- [ ] Modelo es visible (NO es cubo vacío) ✅

### Status Final
- [ ] ✅ Sistema funcionando 100%
- [ ] ✅ Listo para producción
- [ ] ✅ Usuarios pueden descargar modelos reales

---

## 📝 Notas

```
Fecha de validación: ______________
Usuario validador: ________________
Versión de PHP: ___________________
Versión de Laravel: _______________
Cantidad de modelos: ______________
Formatos descargados: _____________
Problemas encontrados: ____________
Observaciones: ____________________
```

---

## 🎉 ¡Listo!

Si todas las casillas están ✅, tu sistema de descarga está completamente funcional.

**Los usuarios ahora pueden:**
- ✅ Descargar modelos en múltiples formatos
- ✅ Abrirlos en Blender, 3D Max, etc.
- ✅ Ver el modelo completo (no un cubo vacío)
- ✅ Usar los formatos que prefieren

**¡Problema resuelto! 🚀**
