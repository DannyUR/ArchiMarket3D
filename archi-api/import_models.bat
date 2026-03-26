#!/bin/bash
# Script para importar modelos de arquitectura y construcción desde Sketchfab

cd "$(dirname "$0")"

echo "🚀 INICIANDO IMPORTACIÓN DE MODELOS DE ARQUITECTURA Y CONSTRUCCIÓN"
echo "=============================================================="

echo ""
echo "PASO 1️⃣: Importando modelos desde Sketchfab para TODAS las categorías..."
echo "⏳ Esto puede tomar 5-10 minutos..."
php artisan sketchfab:import-all

echo ""
echo "✅ Paso 1 completado"

echo ""
echo "PASO 2️⃣: Obteniendo URLs de descarga desde Sketchfab..."
echo "⏳ Esto puede tomar 2-5 minutos..."
php artisan sketchfab:fetch-download-urls

echo ""
echo "✅ Paso 2 completado"

echo ""
echo "PASO 3️⃣: Descargando archivos 3D (GLB - primeros 50 modelos)..."
echo "⏳ Esto puede tomar 15-30 minutos..."
php artisan models:download-real --format=glb --limit=50

echo ""
echo "✅ IMPORTACIÓN COMPLETADA!"
echo "=============================================================="
echo ""
echo "📊 Resultados esperados:"
echo "  - Múltiples modelos de arquitectura/construcción"
echo "  - Archivos descargables disponibles"
echo "  - Sistema listo para probar descargas"

%
