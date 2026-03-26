# ANÁLISIS COMPLETO - MODELO QUINUAL

## 1. ID EXACTO DEL MODELO QUINUAL

### Información en Base de Datos:
- **ID en BD**: `213`
- **Nombre**: `Quinual`
- **Descripción**: `Árbol altoandino de 12m de altura / High Andean tree 12m high`

**IMPORTANTE**: El modelo Quinual tiene ID **213**, que está **FUERA del rango 1-75**, por lo que **NO debería estar descargado** según el criterio de descarga automática.

---

## 2. ESTATUS DE ARCHIVO GLB DESCARGADO

❌ **NO TIENE ARCHIVO GLB DESCARGADO**

### Evidencia:
- **Tabla `model_files`**: 0 registros para este modelo
- **Sistema de archivos**: La carpeta `/storage/app/public/models/213/` NO existe
- **Rango de descarga**: ID 213 está fuera del rango 1-75, por lo que no fue procesado

### Metadatos de Disponibilidad (desde Sketchfab):
```json
{
  "archives": {
    "glb": {
      "type": "glb",
      "size": 77337656,      // 73.75 MB
      "textureCount": 8,
      "textureMaxResolution": 256
    },
    "gltf": {
      "type": "gltf",
      "size": 38229264,       // 36.44 MB
      "textureCount": 8,
      "textureMaxResolution": 256
    },
    "usdz": {
      "type": "usdz",
      "size": 38323580        // 36.52 MB
    }
  }
}
```

---

## 3. EMBED_URL PARA SKETCHFAB VIEWER

❌ **NO TIENE EMBED_URL**

### Información en BD:
```
Tabla: models
Campo: embed_url
Valor: NULL
```

### Problema:
El campo `embed_url` está vacío. Aunque el modelo tiene un Sketchfab ID (`9206392b22914e3dbacde3f05b178e7d`), el embed_url no fue poblado.

**Efecto en Frontend**: El visor 3D Sketchfab no se muestra en la página de detalles del modelo.

---

## 4. ESTRUCTURA DE BASE DE DATOS

### Tabla: `models` (información del modelo)

| Campo | Tipo | Valor Quinual | Descripción |
|-------|------|---------------|-------------|
| `id` | bigint(20) | 213 | ID único del modelo |
| `name` | varchar(255) | Quinual | Nombre del modelo |
| `description` | text | Árbol altoandino... | Descripción |
| `price` | decimal(10,2) | 24.99 | Precio en USD |
| `sketchfab_id` | varchar(255) | 9206392b22914e3... | ID de Sketchfab (sin usar) |
| `embed_url` | varchar(255) | NULL | URL para iframe de Sketchfab (VACÍO) |
| `format` | enum | GLTF | Formato original |
| `size_mb` | decimal(6,2) | 73.75 | Tamaño aproximado |
| `metadata` | longtext | {...} | JSON con datos de Sketchfab |
| `category_id` | bigint(20) | 22 | Categoría (ex: Paisajismo) |
| `polygon_count` | int(11) | 812079 | Polígonos del modelo |
| `material_count` | int(11) | 0 | Número de materiales |
| `has_animations` | tinyint(1) | 0 | ¿Tiene animaciones? |
| `has_rigging` | tinyint(1) | 0 | ¿Tiene rigging? |

### Tabla: `model_files` (archivos descargables)

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | bigint(20) | ID único del registro |
| `model_id` | bigint(20) | Referencia a tabla `models` |
| `file_url` | varchar(255) | URL del archivo |
| `file_type` | enum | 'download', 'preview', 'mixed_reality' |
| `format` | varchar(10) | 'GLB', 'OBJ', 'FBX', etc. |
| `size_bytes` | bigint(20) | Tamaño exacto en bytes |
| `original_name` | varchar(255) | Nombre original del archivo |
| `origin` | varchar(255) | Origen ('sketchfab', 'uploaded', etc.) |

**Para Quinual**: 0 registros en esta tabla

---

## 5. CÓMO EL FRONTEND OBTIENE LA INFORMACIÓN

### 5A. ARCHIVO PRINCIPAL: [archi-market-frontend/src/components/models/ModelDetail.jsx]()

#### PASO 1: Cargar modelo 3D
```javascript
// Línea ~300
const fetchModel = async () => {
    const response = await API.get(`/api/models/${id}`);
    const modelData = response.data;
    setModel(modelData);
    // ...luego:
    fetchDownloadInfo(id);  // Cargar info de descargas
};
```

#### PASO 2: Obtener información de descargas
```javascript
// Línea ~316
const fetchDownloadInfo = async (modelId) => {
    const response = await API.get(`/api/models/${modelId}/download-info`);
    const data = response.data?.data || response.data;
    console.log('📥 Download info recibida:', data);
    setDownloadInfo(data);
};
```

#### PASO 3: Renderizar el visor 3D (Sketchfab)
```javascript
// Línea ~29-71
const SketchfabViewer = ({ model }) => {
    const embedUrl = model.embed_url;  // ← Busca este campo
    
    if (!embedUrl) {
        // Muestra placeholder si no hay embedUrl
        return <div>No se pudo cargar el visor 3D</div>;
    }
    
    return (
        <iframe
            src={embedUrl}  // ← Debe ser URL válida de Sketchfab
            allow="autoplay; fullscreen; xr-spatial-tracking"
        />
    );
};
```

#### PASO 4: Renderizar información de descargas
```javascript
// Línea ~1293-1370
{downloadInfo && downloadInfo.available_formats && downloadInfo.available_formats.length > 0 && (
    <motion.div>
        <h4>✓ Descargas disponibles</h4>
        <div>
            {downloadInfo.available_formats.map((format) => (
                <div key={format.format}>
                    <div>{format.format}</div>
                    <div>{(format.size_bytes / 1024 / 1024).toFixed(2)} MB</div>
                </div>
            ))}
        </div>
    </motion.div>
)}

{(!downloadInfo || !downloadInfo.available_formats || downloadInfo.available_formats.length === 0) && (
    <div>
        <div>Descargas no disponibles aún</div>
        <div>El administrador está preparando los archivos para este modelo</div>
    </div>
)}
```

---

## 6. ENDPOINT API DEL BACKEND

### Ubicación: [archi-api/app/Http/Controllers/Api/ModelFileController.php]()

### Endpoint: `GET /api/models/{modelId}/download-info`

```php
public function downloadInfo($modelId)
{
    $model = Model3D::find($modelId);
    
    // Obtener archivos de tipo 'download'
    $files = $model->files()
        ->where('file_type', 'download')
        ->get(['format', 'size_bytes']);
    
    // Si no hay archivos:
    if ($files->isEmpty()) {
        return response()->json([
            'success' => true,
            'is_downloadable' => false,
            'available_formats' => [],
            'message' => 'Este modelo no tiene archivos disponibles para descargar'
        ]);
    }
    
    // Si hay archivos: retornar con detalles agrupados por formato
    $formattedFiles = $files->groupBy('format')->map(function($group) {
        $size = $group->first()->size_bytes;
        return [
            'format' => $group->first()->format,
            'size_bytes' => $size,
            'size_mb' => round($size / 1024 / 1024, 2),
            'count' => $group->count()
        ];
    })->values();
    
    return response()->json([
        'success' => true,
        'is_downloadable' => true,
        'model_name' => $model->name,
        'available_formats' => $formattedFiles,
        'total_formats' => $formattedFiles->count(),
        'total_size_bytes' => $files->sum('size_bytes'),
        'total_size_mb' => round($files->sum('size_bytes') / 1024 / 1024, 2),
        'data' => [
            'available_formats' => $formattedFiles
        ]
    ]);
}
```

### Ruta: [archi-api/routes/api.php]() línea 188
```php
Route::get('/{modelId}/download-info', [ModelFileController::class, 'downloadInfo']);
```

---

## 7. RESPUESTA API ESPERADA

### Para modelo CON descargas (ej: ID 1):
```json
{
  "success": true,
  "is_downloadable": true,
  "model_name": "Casa Moderna 2 Pisos",
  "available_formats": [
    {
      "format": "GLB",
      "size_bytes": 4567890,
      "size_mb": 4.36,
      "count": 1
    },
    {
      "format": "OBJ",
      "size_bytes": 3456789,
      "size_mb": 3.29,
      "count": 1
    }
  ],
  "total_formats": 2,
  "total_size_bytes": 8024679,
  "total_size_mb": 7.65,
  "data": {
    "available_formats": [...]
  }
}
```

### Para modelo SIN descargas (Quinual ID 213):
```json
{
  "success": true,
  "is_downloadable": false,
  "available_formats": [],
  "message": "Este modelo no tiene archivos disponibles para descargar"
}
```

---

## 8. CÓMO SE DETERMINA "HAY DESCARGAS DISPONIBLES" EN UI

### En ModelDetail.jsx (página de detalle):

**Condición para mostrar GREEN badge "✓ Descargas disponibles":**
```javascript
downloadInfo.available_formats && downloadInfo.available_formats.length > 0
```

**Condición para mostrar YELLOW warning "Descargas no disponibles aún":**
```javascript
!downloadInfo || !downloadInfo.available_formats || downloadInfo.available_formats.length === 0
```

### En ModelList.jsx (lista de productos):

**Función que carga la información:**
```javascript
// Línea ~174
const loadDownloadInfo = async (modelsToLoad) => {
    const batchSize = 5;  // Máximo 5 simultáneas
    for (let i = 0; i < modelsToLoad.length; i += batchSize) {
        const batch = modelsToLoad.slice(i, i + batchSize);
        
        const promises = batch.map(model =>
            API.get(`/models/${model.id}/download-info`)
                .then(response => {
                    downloadInfoMap[model.id] = {
                        is_downloadable: response.data.data?.is_downloadable || false,
                        available_formats: response.data.data?.available_formats || [],
                        total_size_mb: response.data.data?.total_size_mb || 0
                    };
                })
        );
        
        await Promise.all(promises);
    }
    setDownloadInfo(downloadInfoMap);
};
```

**Badge mostrado:**
```javascript
// Línea ~983-1015
{downloadInfo[model.id] && (
    <div style={{
        background: downloadInfo[model.id].is_downloadable 
            ? '#d1fae5'  // Verde
            : '#fef3c7'  // Amarillo
    }}>
        {downloadInfo[model.id].is_downloadable ? (
            <>
                <FiCheckCircle /> ✓ {downloadInfo[model.id].available_formats?.length || 0} formato(s)
            </>
        ) : (
            <>
                <FiDownload /> ⏳ Sin descargas
            </>
        )}
    </div>
)}
```

---

## 9. RESUMEN DEL FLUJO COMPLETO

```
┌─────────────────────────────────────────────────────────────────┐
│ USUARIO ACCEDE A MODELO EN FRONTEND (ej: /models/213)          │
└──────────────────────────┬────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────────┐
│ ModelDetail.jsx ejecuta:                                        │
│ 1. fetchModel() → GET /api/models/213                           │
│ 2. fetchDownloadInfo(213) → GET /api/models/213/download-info   │
└──────────────────────────┬────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────────┐
│ Backend (ModelFileController::downloadInfo)                     │
│ Busca en tabla model_files donde:                              │
│   - model_id = 213                                              │
│   - file_type = 'download'                                      │
│   → Resultado: 0 registros                                      │
└──────────────────────────┬────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────────┐
│ API retorna:                                                    │
│ {                                                               │
│   "is_downloadable": false,                                     │
│   "available_formats": []                                       │
│ }                                                               │
└──────────────────────────┬────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────────┐
│ Frontend renderiza:                                             │
│ - embed_url: NULL → No muestra visor 3D                         │
│ - available_formats: [] → Muestra badge amarillo "Sin descargas"│
└─────────────────────────────────────────────────────────────────┘
```

---

## 10. ESTADÍSTICAS ACTUALES

- **Total de modelos en BD**: 214
- **Modelos en rango 1-75** (con descargas automáticas): 75
- **Modelos con archivos descargables**: 77
- **Modelos 1-75 CON descargas**: 75 ✅
- **Modelos > 75 SIN descargas**: Muchos (ej: Quinual 213)

---

## RESUMEN FINAL - QUINUAL (ID 213)

| Aspecto | Valor | Estado |
|---------|-------|--------|
| **ID exacto** | 213 | ✅ |
| **Rango 1-75** | NO | ❌ |
| **GLB descargado** | NO | ❌ |
| **embed_url** | NULL | ❌ |
| **Archivos BD** | 0 | ❌ |
| **Sketchfab ID** | Sí | ✅ |
| **Metadatos** | Completos | ✅ |
| **Ver en frontend** | "Sin descargas" | ⚠️ |
| **Visor 3D** | No aparece | ❌ |

