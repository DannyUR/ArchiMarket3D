# 🎨 Generador de Previews PNG - Guía de Uso

## 📋 Resumen

Este sistema permite generar **previews PNG reales** de los modelos 3D desde Sketchfab, reemplazando los SVGs genéricos por imágenes de alta calidad.

## 🚀 Paso 1: Obtener API Token de Sketchfab

1. Ve a: https://sketchfab.com/settings/password
2. Inicia sesión con tu cuenta de Sketchfab
3. Copia tu **API Token**
4. Actualiza tu archivo `.env` en `archi-api/`:

```bash
# archi-api/.env
SKETCHFAB_API_KEY=tu_token_aqui_123abc...
```

## 🔄 Paso 2: Ejecutar el Comando

En la carpeta del proyecto, ejecuta:

```bash
cd archi-api
php artisan models:generate-previews
```

## ✅ Qué Hace

1. Conecta a Sketchfab API usando tu token
2. Obtiene la información de cada modelo (sketchfab_id)
3. Descarga la imagen de preview PNG
4. Guarda en: `/storage/app/public/models/{id}/preview.png`
5. Actualiza la base de datos con la URL

## 📊 Monitoreo

El comando mostrará algo como:

```
🎨 Iniciando generación de previews...

📦 Procesando 10 modelos...

📍 Modelo 1393: Construction site dug-out cable trench ditch
   ✅ Preview descargado exitosamente

📍 Modelo 1396: Data line pipes dig
   ✅ Preview descargado exitosamente

...

✨ ¡Proceso completado!
💡 Ejecuta el comando regularmente para actualizar mas modelos
```

## 🔄 Automatizar (Opcional)

Para ejecutar automáticamente cada noche (Linux/Mac):

```bash
# Agregar a crontab
0 2 * * * cd /ruta/archi-api && php artisan models:generate-previews
```

En Windows, usar Task Scheduler:
```
Programa: php.exe
Argumentos: C:\ruta\archi-api\artisan models:generate-previews
```

## 🖼️ Cambios en el Frontend

El frontend **automáticamente**:
- Prefiere PNG sobre SVG si existe
- Mantiene los SVGs coloreados como fallback
- Muestra la leyenda de categorías principales

## ⚙️ Troubleshooting

### Error: "SKETCHFAB_API_KEY no configurado"
✅ Solución: Asegúrate de agregar el token en `.env`

### Error: "No se pudo acceder a Sketchfab"
✅ Solución: Verifica que:
- Tu token sea válido
- Tengas conexión a internet
- Sketchfab API esté disponible

### Algunos modelos no tienen preview en Sketchfab
✅ Solución: Mantienen el SVG colorido por categoría

## 📈 Estadísticas

Después de ejecutar:
- Todos los PNG están en `/storage/app/public/models/`
- Las URLs se actualizan en la BD
- El frontend muestra PNGs en lugar de SVG

## 🎯 Resultados Esperados

Antes (SVG genérico):
```
┌─────────────────┐
│  Cubo gradiente │
│   de colores    │
│  (Categoría)    │
└─────────────────┘
```

Después (PNG real):
```
┌─────────────────┐
│ Vista real del  │
│  modelo 3D de   │
│  Sketchfab      │
└─────────────────┘
```

## 💡 Notas

- El proceso puede tomar tiempo si tienes muchos modelos
- Los PNGs se descargan una sola vez y se cachean
- La calidad depende de las imágenes de Sketchfab
- El comando es seguro: verifica si el archivo ya existe

---

¿Preguntas? Revisa `app/Console/Commands/GenerateModelPreviews.php`
