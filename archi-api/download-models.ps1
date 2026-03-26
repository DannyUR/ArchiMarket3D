# PowerShell Script - Descargar modelos en lotes
# Uso: .\download-models.ps1 -limit 3 -delay 30

param(
    [int]$limit = 3,           # cuántos modelos por lote
    [int]$delay = 30,          # segundos entre lotes
    [int]$maxLotes = 20        # máximo número de lotes
)

$currentPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location "$currentPath"

Write-Host "================================" -ForegroundColor Cyan
Write-Host "📥 Descargador de Modelos 3D" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Configuración:" -ForegroundColor Yellow
Write-Host "  - Modelos por lote: $limit"
Write-Host "  - Espera entre lotes: $delay segundos"
Write-Host "  - Máximo de lotes: $maxLotes"
Write-Host ""

$lote = 0

while ($lote -lt $maxLotes) {
    $lote++
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    
    Write-Host "[$timestamp] 🔄 Lote $lote/$maxLotes - Descargando $limit modelos..."  -ForegroundColor Cyan
    
    # Ejecutar comando de descarga
    & php artisan models:download-light --format=glb --limit=$limit
    
    if ($? -eq $false) {
        Write-Host "❌ Error en la descarga. Esperando $delay segundos..." -ForegroundColor Red
    } else {
        Write-Host "✅ Lote $lote completado" -ForegroundColor Green
    }
    
    # Si es el último lote, no esperar
    if ($lote -lt $maxLotes) {
        Write-Host "⏳ Esperando $delay segundos para el siguiente lote..." -ForegroundColor Yellow
        Start-Sleep -Seconds $delay
    }
}

Write-Host ""
Write-Host "✅ ¡Descarga completada! ($($lote) lotes procesados)" -ForegroundColor Green
Write-Host "📊 Ahora puedes acceder a Mis Descargas para ver los modelos" -ForegroundColor Cyan
