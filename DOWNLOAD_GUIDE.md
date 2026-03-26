# 📥 Guía: Cómo Descargar Modelos

## ✅ Modelos Actualmente Disponibles

Tienes **174+ modelos** con descargas disponibles en formato GLB (5 MB - 524 MB).

### Top 5 Modelos Recomendados para Probar:

1. **Model 3** - Gilmore Shed
   - Tamaño: 5.16 MB ⭐ Pequeño, ideal para empezar
   - Formato: GLB
   - URL: http://localhost:3000/modelos/3

2. **Model 6** - Pedestrian Bridge  
   - Tamaño: 20.63 MB
   - Útil para arquitectura
   - URL: http://localhost:3000/modelos/6

3. **Model 30** - Brooklyn House
   - Tamaño: 69.1 MB
   - Proyecto residencial completo
   - URL: http://localhost:3000/modelos/30

4. **Model 36** - 3D Portal Frame
   - Tamaño: 59.79 MB
   - Estructura industrial
   - URL: http://localhost:3000/modelos/36

5. **Model 9** - Solar Carport
   - Tamaño: 524.47 MB ⭐ Grande pero espectacular
   - Modelo detallado
   - URL: http://localhost:3000/modelos/9

---

## 🔄 Cómo Expandir las Descargas

### Opción 1: Descargar más formatos desde Sketchfab

```bash
# Descargar GLTF y OBJ para 50 modelos que aún no tienen descargas
php artisan models:download-multi-formats --formats=glb,gltf,obj --limit=50

# Descargar solo GLTF
php artisan models:download-multi-formats --formats=gltf --limit=50
```

### Opción 2: Descargar para todos los 214 modelos (requiere tiempo)

```bash
# Esto puede tomar 1-2 horas
php artisan models:download-light --format=glb --limit=214
```

### Opción 3: Forzar descarga de formatos alternativos

Si un formato no está disponible en Sketchfab, el sistema automáticamente:
1. Intenta el siguiente formato en la lista
2. Descarga lo que esté disponible
3. Registra en BD el formato que conseguiu

---

## 📊 Estado Actual de Descargas

```
Total modelos en BD: 214
Modelos con descargas: 174+ 
Formatos disponibles: GLB, GLTF, OBJ, FBX, USDZ
Espacio total: 4.5+ GB
```

---

## 🎨 Cómo Aparece en el Frontend

Después de descargar más formatos, cada modelo mostrará:

```
✓ Descargas disponibles
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│    GLB      │  │   GLTF      │  │    OBJ      │
│   5.16 MB   │  │   3.2 MB    │  │   8.1 MB    │
└─────────────┘  └─────────────┘  └─────────────┘
```

El usuario puede elegir el formato que necesite en Blender, Unity, Unreal, etc.

---

## ⚙️ Comandos Útiles

### Ver archivos descargados
```bash
php artisan tinker --execute="echo App\Models\ModelFile::where('file_type', 'download')->count() . ' archivos';"
```

### Ver modelos sin descargas
```bash
php artisan tinker --execute="echo App\Models\Model3D::whereDoesntHave('files')->count() . ' sin descargas';"
```

### Registrar archivos que ya existen en disk
```bash
php artisan models:register-downloads --limit=214
```

---

## 📱 En el Navegador

1. Abre: http://localhost:3000/modelos
2. Selecciona un modelo (ej: Gilmore Shed)
3. Verás el visor 3D + badge de "✓ Descargas disponibles"
4. Los formatos disponibles aparecen con su tamaño
5. Haz clic en "Descargar" para obtener el archivo

---

## 🚀 Próximos Pasos

Para tener **TODOS los modelos** con descargas:

1. **Ejecuta:**
   ```bash
   php artisan models:download-light --format=glb --limit=214
   ```

2. **Luego registra en BD:**
   ```bash
   php artisan models:register-downloads --limit=214
   ```

3. **Verifica la cantidad:**
   ```bash
   php artisan tinker --execute="echo App\Models\Model3D::whereHas('files')->count();"
   ```

---

## 💡 Tips para Blender

Los archivos `.glb` que descargas funcionan directamente en Blender:

1. Abre Blender
2. File > Import > glTF 2.0 (.glb/.gltf)
3. Selecciona el archivo descargado
4. ¡Listo! El modelo se renderizará con texturas y materiales

---

✅ **Ahora puedes probar descargar cualquier modelo y abrirlo en Blender!**
