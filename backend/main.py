from datetime import datetime, timezone
from typing import Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from database import supabase

app = FastAPI(title="Servicio de Catálogo - Equipo 7", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def inicio():
    return {"servicio": "Catálogo - Equipo 7", "docs": "/docs", "catalogo": "/api/catalogo"}


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
        # Busca en nombre y en descripción (quitamos signos que rompen el filtro)
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

    # Enriquecer con flag de agotado
    for item in items:
        item["agotado"] = item.get("stock", 0) <= 0

    return items


@app.post("/api/catalogo/sincronizar")
def sincronizar_producto(payload: dict):
    # Invocado por Equipo 4 cuando se crea o modifica un producto
    obligatorios = ["id", "vendedor_id", "sku", "nombre", "precio", "stock"]
    faltan = [c for c in obligatorios if c not in payload]
    if faltan:
        raise HTTPException(status_code=400, detail="Faltan campos: " + ", ".join(faltan))

    supabase.table("cat_productos").upsert(
        {
            "producto_origen_id": payload["id"],
            "vendedor_id": payload["vendedor_id"],
            "nombre_vendedor": payload.get("nombre_vendedor", "Vendedor Oficial USC"),
            "sku": payload["sku"],
            "nombre": payload["nombre"],
            "descripcion": payload.get("descripcion", ""),
            "categoria": payload.get("categoria", "General"),
            "precio": payload["precio"],
            "stock": payload["stock"],
            "imagen_url": payload.get("imagen_url", ""),
            "activo": payload.get("activo", True),
            "actualizado_en": datetime.now(timezone.utc).isoformat(),
        },
        on_conflict="producto_origen_id",
    ).execute()
    return {"message": "Catálogo sincronizado exitosamente"}
