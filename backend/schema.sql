-- Ejecutar en Supabase > SQL Editor > RUN
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS public.cat_productos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    producto_origen_id UUID NOT NULL UNIQUE,
    vendedor_id UUID NOT NULL,
    nombre_vendedor VARCHAR(255) DEFAULT 'Vendedor Oficial USC',
    categoria VARCHAR(100) NOT NULL,
    sku VARCHAR(60) NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    precio NUMERIC(14, 2) NOT NULL CHECK (precio >= 0),
    imagen_url TEXT,
    stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
    activo BOOLEAN DEFAULT TRUE,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_cat_categoria ON public.cat_productos(categoria);
CREATE INDEX IF NOT EXISTS idx_cat_precio ON public.cat_productos(precio);

ALTER TABLE public.cat_productos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "policy_cat_productos" ON public.cat_productos;
CREATE POLICY "policy_cat_productos" ON public.cat_productos FOR ALL USING (true) WITH CHECK (true);
