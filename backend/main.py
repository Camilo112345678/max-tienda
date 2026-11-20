from datetime import datetime, timezone
from typing import Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from database import supabase

app = FastAPI(title="Servicio de Catálogo - Equipo 7", version="1.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)




@app.get("/health")
def health():
    return {
        "status": "healthy",
        "service": "catalogo",
        "team": "Equipo 7",
        "version": "1.0.0",
    }

@app.get("/")
def inicio():
    return {
        "servicio": "Catálogo - Equipo 7",
        "docs": "/docs",
        "catalogo": "/api/catalogo",
        "detalle": "/api/catalogo/{id}",
    }


@app.get("/api/catalogo")
def obtener_catalogo(
    buscar: Optional[str] = None,
    categoria: Optional[str] = None,
    precio_max: Optional[float] = None,
    orden: Optional[str] = "recent",
):
    query = supabase.table("cat_productos").select("*").eq("activo", True)

    if categoria:
        query = query.eq("categoria", categoria)
    if precio_max is not None:
        query = query.lte("precio", precio_max)
    if buscar:
        texto = buscar.replace(",", " ").replace("(", " ").replace(")", " ").strip()
        if texto:
            query = query.or_(f"nombre.ilike.%{texto}%,descripcion.ilike.%{texto}%")

    if orden == "price_asc":
        query = query.order("precio", desc=False)
    elif orden == "price_desc":
        query = query.order("precio", desc=True)
    elif orden == "name_asc":
        query = query.order("nombre", desc=False)
    else:
        query = query.order("creado_en", desc=True)

    res = query.execute()
    items = res.data or []

    for item in items:
        item["agotado"] = item.get("stock", 0) <= 0

    return items


@app.get("/api/catalogo/{id}")
def obtener_producto(id: str):
    res = (
        supabase.table("cat_productos")
        .select("*")
        .eq("id", id)
        .eq("activo", True)
        .limit(1)
        .execute()
    )

    if not res.data:
        raise HTTPException(status_code=404, detail="Producto no encontrado")

    producto = res.data[0]
    producto["agotado"] = producto.get("stock", 0) <= 0
    return producto


@app.post("/api/catalogo/sincronizar")
def sincronizar_producto(payload):
    # Permite sincronizar un producto individual o una lista de productos.
    productos = payload if isinstance(payload, list) else [payload]
    if not all(isinstance(p, dict) for p in productos):
        raise HTTPException(status_code=400, detail="El payload debe ser un producto o una lista de productos")

    importados = 0
    errores = []
    for p in productos:
        origen_id = p.get("id") or p.get("producto_origen_id")
        vendedor_id = p.get("vendedor_id")
        nombre = p.get("nombre")
        precio = p.get("precio")
        stock = p.get("stock", 0)
        if not origen_id or not vendedor_id or not nombre or precio is None:
            errores.append({"id": origen_id, "error": "Faltan id, vendedor_id, nombre o precio"})
            continue
        try:
            supabase.table("cat_productos").upsert(
                {
                    "producto_origen_id": origen_id,
                    "vendedor_id": vendedor_id,
                    "nombre_vendedor": p.get("nombre_vendedor", "Vendedor Oficial USC"),
                    "sku": str(p.get("sku") or origen_id),
                    "nombre": nombre,
                    "descripcion": p.get("descripcion", ""),
                    "categoria": p.get("categoria", "General"),
                    "precio": precio,
                    "stock": stock,
                    "imagen_url": p.get("imagen_url") or p.get("imagen") or "",
                    "activo": p.get("activo", True),
                    "actualizado_en": datetime.now(timezone.utc).isoformat(),
                },
                on_conflict="producto_origen_id",
            ).execute()
            importados += 1
        except Exception as exc:
            errores.append({"id": origen_id, "error": str(exc)})

    return {"importados": importados, "errores": errores}


@app.post("/api/catalogo/sincronizar-equipo4")
def sincronizar_equipo4():
    import json
    from urllib.request import urlopen
    from urllib.error import URLError

    url = "https://marketplace-equipo4.onrender.com/api/productos"
    try:
        with urlopen(url, timeout=25) as response:
            data = json.loads(response.read().decode("utf-8"))
    except (URLError, TimeoutError, ValueError) as exc:
        raise HTTPException(status_code=502, detail=f"No se pudo consultar Equipo 4: {exc}")

    productos = data if isinstance(data, list) else data.get("productos", [])
    if not isinstance(productos, list):
        raise HTTPException(status_code=502, detail="Respuesta inesperada de Equipo 4")

    # Se mapean nombres alternos conocidos; vendedor_id debe venir en origen.
    normalizados = []
    for p in productos:
        if not isinstance(p, dict):
            continue
        normalizados.append({
            "id": p.get("id") or p.get("producto_origen_id"),
            "vendedor_id": p.get("vendedor_id"),
            "nombre_vendedor": p.get("nombre_vendedor"),
            "sku": p.get("sku"),
            "nombre": p.get("nombre"),
            "descripcion": p.get("descripcion", ""),
            "categoria": p.get("categoria", "General"),
            "precio": p.get("precio"),
            "stock": p.get("stock", 0),
            "imagen_url": p.get("imagen_url") or p.get("imagen") or "",
            "activo": p.get("activo", True),
        })
    return sincronizar_producto(normalizados)
