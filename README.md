# MAX TIENDA — Catálogo (Equipo 7)

Catálogo público con motor de búsqueda para el Marketplace USC.
- **frontend/**: la página (HTML, CSS y JavaScript puro).
- **backend/**: el servicio del catálogo (FastAPI + Supabase), para desplegar en Render.

```
max-tienda/
├── frontend/
│   ├── index.html
│   ├── style.css
│   ├── script.js
│   ├── config.js      <- aquí va la URL de la API
│   └── img/
├── backend/
│   ├── main.py        <- endpoints del catálogo
│   ├── database.py    <- conexión con Supabase
│   ├── requirements.txt
│   ├── schema.sql     <- tabla cat_productos
│   ├── seed.sql       <- productos de ejemplo (opcional)
│   └── .env.example
└── README.md
```

## 1. Base de datos en Supabase
1. Crea el proyecto `marketplace-usc-catalogo` en [supabase.com](https://supabase.com).
2. En **SQL Editor**, pega el contenido de `backend/schema.sql` y pulsa **RUN**.
3. (Opcional) Pega `backend/seed.sql` y pulsa **RUN** una sola vez para tener productos de prueba.
4. En **Project Settings > API** copia la **Project URL** y una key. La key va solo en el backend, nunca en el frontend.

## 2. Probar el backend en tu computador
```bash
cd backend
python -m venv venv
venv\Scripts\activate          # en Mac/Linux: source venv/bin/activate
pip install -r requirements.txt
copy .env.example .env         # en Mac/Linux: cp .env.example .env
# abre .env y pega tu SUPABASE_URL y tu SUPABASE_KEY
uvicorn main:app --reload
```
Abre http://127.0.0.1:8000/docs para ver el Swagger y probar `GET /api/catalogo`.

## 3. Subir el backend a Render
1. Sube todo el proyecto a GitHub (`.env` no se sube, ya está en `.gitignore`).
2. En [render.com](https://render.com): **New > Web Service** y elige tu repositorio.
3. Configura:
   - **Root Directory:** `backend`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - **Environment:** `SUPABASE_URL`, `SUPABASE_KEY` y `PYTHON_VERSION` = `3.11.9`
4. Cuando termine, tendrás:
   - **URL Base:** `https://tu-servicio-catalogo.onrender.com/api`
   - **Swagger:** `https://tu-servicio-catalogo.onrender.com/docs`

> En el plan gratis, Render duerme el servicio si no lo usan. La primera petición puede tardar hasta un minuto.

## 4. Subir la página (frontend)
1. Abre `frontend/config.js` y pon la URL base de Render:
   ```js
   var API_URL = "https://tu-servicio-catalogo.onrender.com/api";
   ```
2. En Render: **New > Static Site**, elige el mismo repositorio y configura:
   - **Root Directory:** `frontend`
   - **Build Command:** déjalo vacío
   - **Publish Directory:** `.`
3. Render te da la URL pública de la página. (También sirve GitHub Pages o Netlify con la carpeta `frontend`.)

Si `API_URL` está vacío, la página funciona sola en tu computador con productos de ejemplo y con el panel de vendedor (guardado en `localStorage`).

## Endpoints
| Método | Ruta | Qué hace |
|---|---|---|
| GET | `/api/catalogo` | Lista productos. Filtros: `buscar` (nombre y descripción), `categoria`, `precio_max`, `orden` (`price_asc`, `price_desc`, `name_asc`, `recent`) |
| POST | `/api/catalogo/sincronizar` | Lo llama el Equipo 4 al crear o modificar un producto |

Cada producto trae `agotado: true` cuando `stock` es 0, y la página bloquea la compra.

Ejemplo para `sincronizar`:
```json
{
  "id": "UUID-del-producto",
  "vendedor_id": "UUID-del-vendedor",
  "sku": "ROP-001",
  "nombre": "Chaqueta de mezclilla",
  "descripcion": "Chaqueta azul talla M",
  "categoria": "Ropa",
  "precio": 85000,
  "stock": 10,
  "imagen_url": "https://..."
}
```
