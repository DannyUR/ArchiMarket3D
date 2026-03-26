#!/usr/bin/env python3
import os
import sys
import subprocess
import json
from pathlib import Path

# Ruta de modelos
models_path = r'C:\Users\Danny\Documents\GitHub\ArchiMarket3D\archi-api\storage\app\public\models'

print("🔍 Escaneando archivos GLB...")

# Encontrar todos los archivos GLB > 1MB
files_to_register = []
for model_dir in os.listdir(models_path):
    model_path = os.path.join(models_path, model_dir)
    
    if not os.path.isdir(model_path) or not model_dir.isdigit():
        continue
    
    for file in os.listdir(model_path):
        if file.endswith('.glb'):
            file_path = os.path.join(model_path, file)
            file_size = os.path.getsize(file_path)
            
            # Solo archivos > 1MB
            if file_size > 1024 * 1024:
                files_to_register.append({
                    'model_id': int(model_dir),
                    'file_name': file,
                    'file_path': file_path,
                    'size_bytes': file_size,
                    'size_mb': round(file_size / (1024 * 1024), 2)
                })

print(f"✅ Encontrados {len(files_to_register)} archivos GLB reales\n")
print("Primeros 30:")
for i, f in enumerate(sorted(files_to_register, key=lambda x: x['model_id'])[:30], 1):
    print(f"  {i}. Model {f['model_id']:3d} - {f['file_name']:40s} - {f['size_mb']:7.2f} MB")

# Generar comando SQL para registrar en BD
print("\n🗄️  Generando comandos SQL para BD...")
sql_commands = []

for f in sorted(files_to_register, key=lambda x: x['model_id']):
    file_url = f"/storage/models/{f['model_id']}/{f['file_name']}"
    sql = f"""INSERT INTO model_files (model_id, format, file_type, file_url, original_name, size_bytes, created_at, updated_at) 
          VALUES ({f['model_id']}, 'GLB', 'download', '{file_url}', '{f['file_name']}', {f['size_bytes']}, NOW(), NOW()) 
          ON DUPLICATE KEY UPDATE size_bytes = {f['size_bytes']}, updated_at = NOW();"""
    sql_commands.append(sql)

# Guardar a archivo temporal
tmp_file = r'C:\Users\Danny\Documents\GitHub\ArchiMarket3D\archi-api\register_downloads.sql'
with open(tmp_file, 'w') as f:
    for sql in sql_commands:
        f.write(sql + '\n')

print(f"✅ SQL guardado en: {tmp_file}")
print(f"📝 Total de registros a insertar: {len(sql_commands)}")

# Mostrar primeros comandos
print("\nPrimeros 3 comandos:")
for sql in sql_commands[:3]:
    print(f"  {sql[:100]}...")
