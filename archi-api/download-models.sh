#!/bin/bash
# script para descargar modelos de forma continua
# ejecutar en intervalos desde cron o task scheduler

cd "$(dirname "$0")"

echo "🔄 [$(date)] Descargando modelos GLB..."
php artisan models:download-light --format=glb --limit=3

sleep 5

echo "✅ [$(date)] Descarga completada. Próxima en 5 minutos..."
