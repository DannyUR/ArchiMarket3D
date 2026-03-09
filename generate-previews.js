/**
 * Script para generar capturas PNG de modelos 3D usando Three.js y Puppeteer
 * Uso: node generate-previews.js
 * 
 * Requiere instalación previa:
 * npm install three puppeteer canvas axios
 */

const fs = require('fs');
const path = require('path');

console.log('🎨 Generador de Previews PNG para Modelos 3D\n');
console.log('Instalación requerida. Por favor ejecuta:\n');
console.log('  npm install puppeteer canvas three axios\n');
console.log('Después vuelve a ejecutar este script.\n');

/**
 * Alternativa: Usar Sketchfab API
 * 
 * Sketchfab proporciona previews de modelos directamente.
 * Requisitos:
 * - API Token de Sketchfab (obtener de https://sketchfab.com/settings/password)
 * - UID del modelo (disponible en BD como sketchfab_id)
 * 
 * Endpoints útiles:
 * - https://api.sketchfab.com/v3/models/{uid}/
 * - thumbnails.images contiene URLs de previews
 */

const PREVIEW_STRATEGY = `
=== ESTRATEGIAS PARA GENERAR PREVIEWS ===

1️⃣  OPCIÓN RECOMENDADA: Usar Sketchfab API (FÁCIL)
   - Sketchfab ya genera previews de alta calidad
   - Solo necesita el sketchfab_id de cada modelo
   - URLs de preview disponibles gratuitamente
   - No requiere renderizado local

   Requisitos:
   - API Token: https://sketchfab.com/settings/password
   - Actualizar backend para guardar URLs de preview

2️⃣  OPCIÓN LOCAL: Three.js + Node.js (AVANZADO)
   - Renderizar modelos GLTF localmente
   - Requiere todos los archivos GLTF descargados
   - Más lentitud pero control total

3️⃣  OPCIÓN HIBRIDA: Obtener GLTF de Sketchfab + Renderizar (EQUILIBRADO)
   - Descargar GLTF de Sketchfab API
   - Renderizar con Three.js locally
   - Mejor calidad que previews de Sketchfab

=== RECOMENDACIÓN ===
Usar OPCIÓN 1 (Sketchfab API) - es la más simple y rápida.
`;

console.log(PREVIEW_STRATEGY);

console.log('\n📋 Próximos pasos:\n');
console.log('1. Obtén tu API Token de Sketchfab en:');
console.log('   https://sketchfab.com/settings/password\n');

console.log('2. Crea un archivo .env en archi-api/ con:');
console.log('   SKETCHFAB_API_TOKEN=tu_token_aqui\n');

console.log('3. Corre este comando para generar previews desde Sketchfab:');
console.log('   npm run generate:previews\n');

console.log('4. O actualiza los modelos manualmente con URLs de Sketchfab\n');
