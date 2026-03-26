# Review Button Fix - March 13, 2026

## 🎯 Problema
El botón de reseña no aparecía en la página de detalle del modelo, incluso cuando el usuario ya había comprado el modelo y tenía licencia activa.

## ✅ Solución Implementada

### 1. Mejoras en el Backend

#### Archivo: `archi-api/app/Http/Controllers/Api/ModelController.php` (show method)

**Cambios:**
- ✅ Mejorada la verificación de compra para revisar AMBAS tablas:
  - `user_licenses` con `is_active = true`
  - `shopping_details` con estado no-cancelado
- ✅ Agregado nuevo campo `reviewer_status` que retorna:
  - `'not_logged_in'` - Usuario no autenticado
  - `'not_purchased'` - Usuario logueado pero sin compra
  - `'can_review'` - Usuario puede escribir reseña (compró y no reseñó)
  - `'already_reviewed'` - Usuario ya escribió reseña
- ✅ Agregado logging detallado para debugging

**Respuesta JSON ahora incluye:**
```json
{
  "access": {
    "can_download": boolean,
    "can_preview": true,
    "can_review": boolean,       // Backward compatibility
    "has_license": boolean,
    "has_reviewed": boolean,
    "is_viewer_logged_in": boolean,
    "can_write_review": boolean, // Nuevo, más explícito
    "reviewer_status": "not_logged_in|not_purchased|can_review|already_reviewed"
  }
}
```

#### Archivo: `archi-api/app/Http/Controllers/Api/ReviewController.php` (store method)

**Cambios:**
- ✅ Actualizada verificación de compra para revisar AMBAS tablas (ahora coincide con ModelController)
- ✅ Agregado logging cuando una reseña es bloqueada

---

### 2. Cambios en el Frontend

#### Archivo: `archi-market-frontend/src/components/models/ModelDetail.jsx`

**Cambios:**

1. **Nuevo Estado** (línea ~149):
   ```javascript
   const [showPurchaseRequiredModal, setShowPurchaseRequiredModal] = useState(false);
   ```

2. **Nueva Función Helper** (línea ~340):
   ```javascript
   const getReviewerStatus = () => {
     // Mapea reviewer_status a estado del botón
     // Retorna: buttonText, buttonColor, isDisabled, onClick, title
   }
   ```

3. **Botón SIEMPRE VISIBLE** (línea ~1445):
   - Antes: Solo aparecía si `isLoggedIn`
   - Ahora: Siempre aparece con estado dinámico
   - Estados del botón:
     - **No logueado**: Botón gris → Click lleva a login
     - **No compró**: Botón naranja → Click abre modal
     - **Puede reseñar**: Botón primario → Click abre formulario
     - **Ya reseñó**: Botón primario → Click abre editor

4. **Nuevo Modal** (línea ~2173):
   - Aparece cuando usuario no comprado intenta escribir reseña
   - Muestra: Título, descripción, e icono de carrito
   - Opciones: "Comprar ahora" o "Cancelar"
   - Click en "Comprar ahora" llama a `handleBuyNow()`

---

## 🎨 Flujo de Estados del Botón

```
┌─────────────────────────┐
│  Cargar página modelo   │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│ Backend retorna         │
│ reviewer_status         │
└────────┬────────────────┘
         │
    ┌────┴─────────────────┬─────────────────┬──────────────────┐
    │                      │                 │                  │
    ▼                      ▼                 ▼                  ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│not_logged_in │ │not_purchased │ │ can_review   │ │already_review│
└──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘
│              │              │              │
│ Botón Gris   │ Botón Naranja│ Botón Primario│ Botón Primario
│ "Iniciar"    │ "Necesitas"  │ "Escribir"   │ "Editar"
│ sesión"      │ "comprar"    │ "reseña"     │ "reseña"
│              │              │              │
│ Click: Ir a  │ Click: Abrir │ Click: Abre  │ Click: Abre
│ login        │ MODAL        │ formulario   │ formulario
└──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘
                      │
                      ▼
                 ┌──────────────────────────────┐
                 │ MODAL DE COMPRA REQUERIDA    │
                 │ "Necesitas comprar primero   │
                 │ para comentar"               │
                 │ [Comprar ahora] [Cancelar]   │
                 └──────────────────────────────┘
```

---

## 🔍 Debugging

**Logs agregados en backend:**
- `=== DEBUG MODEL DETAIL ===` - Info básica del request
- `=== PURCHASE VERIFICATION ===` - Detalle de verificación de compra
- `=== REVIEW STATUS ===` - Estado de reseña
- `=== RESPONSE ACCESS ===` - Estructura final del access object

Estos logs aparecerán en los archivos de log de Laravel (`storage/logs/laravel.log`)

---

## 🧪 Cómo Probar

### Caso 1: Usuario no logueado
1. Abre la página de detalle de un modelo SIN estar logueado
2. Desplázate a la sección de "Reseñas"
3. ✅ Verás botón gris "Iniciar sesión para reseñar"
4. ✅ Click abre página de login

### Caso 2: Usuario compró
1. Logueate como usuario con compra activa
2. Abre detalle de modelo que compraste
3. ✅ Verás botón primario "Escribir reseña" o "Editar reseña"
4. ✅ Click abre formulario

### Caso 3: Usuario SIN compra
1. Logueate como usuario SIN compra en este modelo
2. Abre detalle del modelo
3. ✅ Verás botón naranja "Necesitas comprar primero"
4. ✅ Click abre modal con mensaje
5. ✅ Modal muestra opción "Comprar ahora"

---

## 📝 Cambios Compatibles

✅ **Backward Compatible**: Los campos anteriores (`can_review`, `has_license`, etc.) siguen siendo retornados por el backend para no romper otras partes del código.

✅ **Fallback**: El componente tiene un estado default ("Cargando...") por si acaso no llega el `reviewer_status`.

---

## 🚀 Próximos Pasos (Opcional)

1. Verificar que los logs aparezcan correctamente en `storage/logs/laravel.log`
2. Probar los tres casos de uso mencionados arriba
3. Si hay issues con mensajes de error, revisar los logs
4. Considerar agregar animaciones al abrirse/cerrarse el modal (ya implementadas con Framer Motion)

