-- ==============================================================================
-- STUMARCOT PRECAST CONCRETE FACTORY — COMPLETE UNIFIED DATABASE SCHEMA
-- Includes:
--   1. items (Finished goods catalog)
--   2. movements (Finished goods production and sales ledger)
--   3. raw_materials (Raw material master catalog)
--   4. raw_movements (Raw material intakes, deductions, and baseline ledger)
--   5. Full RLS policies for public client PWA
--   6. Supabase Realtime publication setup
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ------------------------------------------------------------------------------
-- 1. ITEMS (FACTORY PRODUCT CATALOG)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.items (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    unit TEXT NOT NULL CHECK (unit IN ('pcs', 'sqm')),
    pcs_per_sqm NUMERIC NULL CHECK (pcs_per_sqm IS NULL OR pcs_per_sqm > 0),
    colors TEXT[] NOT NULL DEFAULT '{}',
    reorder_level NUMERIC NULL DEFAULT 100 CHECK (reorder_level IS NULL OR reorder_level >= 0),
    wastani_per_bag NUMERIC NULL,
    "moldCount" NUMERIC NULL,
    mold_size TEXT NULL,
    recipe_id TEXT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_items_category ON public.items (category);
CREATE INDEX IF NOT EXISTS idx_items_name ON public.items (name);

ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public items select" ON public.items;
DROP POLICY IF EXISTS "Public items insert" ON public.items;
DROP POLICY IF EXISTS "Public items update" ON public.items;
DROP POLICY IF EXISTS "Public items delete" ON public.items;

CREATE POLICY "Public items select" ON public.items FOR SELECT USING (true);
CREATE POLICY "Public items insert" ON public.items FOR INSERT WITH CHECK (true);
CREATE POLICY "Public items update" ON public.items FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Public items delete" ON public.items FOR DELETE USING (true);

-- ------------------------------------------------------------------------------
-- 2. MOVEMENTS (FINISHED GOODS PRODUCTION & STOCK LEDGER)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.movements (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    item_id TEXT NOT NULL REFERENCES public.items (id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('opening_balance', 'production_in', 'dispatch_out', 'sale_out', 'adjustment')),
    color TEXT NULL,
    quantity_pcs NUMERIC NOT NULL CHECK (quantity_pcs >= 0),
    quantity_sqm NUMERIC NULL CHECK (quantity_sqm IS NULL OR quantity_sqm >= 0),
    delta NUMERIC NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    note TEXT NULL,
    entered_by TEXT NOT NULL DEFAULT 'Supervisor',
    materials_used JSONB NULL,
    computed_materials_deducted JSONB NULL,
    batch_id TEXT NULL,
    qc_status TEXT NULL,
    expected_cement_bags NUMERIC NULL,
    actual_cement_bags NUMERIC NULL,
    is_residual BOOLEAN NULL DEFAULT false,
    yield_factor_pct NUMERIC NULL,
    unit_sold_as TEXT NULL,
    price_per_unit NUMERIC NULL,
    total_price NUMERIC NULL,
    customer_name TEXT NULL,
    customer_phone TEXT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_movements_item_id ON public.movements (item_id);
CREATE INDEX IF NOT EXISTS idx_movements_date ON public.movements (date);
CREATE INDEX IF NOT EXISTS idx_movements_type ON public.movements (type);
CREATE INDEX IF NOT EXISTS idx_movements_batch_id ON public.movements (batch_id);
CREATE INDEX IF NOT EXISTS idx_movements_created_at ON public.movements (created_at DESC);

ALTER TABLE public.movements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public movements select" ON public.movements;
DROP POLICY IF EXISTS "Public movements insert" ON public.movements;
DROP POLICY IF EXISTS "Public movements update" ON public.movements;
DROP POLICY IF EXISTS "Public movements delete" ON public.movements;

CREATE POLICY "Public movements select" ON public.movements FOR SELECT USING (true);
CREATE POLICY "Public movements insert" ON public.movements FOR INSERT WITH CHECK (true);
CREATE POLICY "Public movements update" ON public.movements FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Public movements delete" ON public.movements FOR DELETE USING (true);

-- ------------------------------------------------------------------------------
-- 3. RAW_MATERIALS (RAW MATERIAL MASTER CATALOG)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.raw_materials (
    id TEXT PRIMARY KEY,
    no INTEGER NOT NULL DEFAULT 1,
    category TEXT NOT NULL,
    name TEXT NOT NULL,
    name_swahili TEXT NULL,
    unit TEXT NOT NULL,
    display_unit TEXT NULL,
    purchase_unit TEXT NULL,
    unit_ratio NUMERIC NOT NULL DEFAULT 1,
    current_balance NUMERIC NOT NULL DEFAULT 0,
    baseline_balance NUMERIC NULL DEFAULT 0,
    purchase_price NUMERIC NOT NULL DEFAULT 0,
    reorder_level NUMERIC NULL DEFAULT 0,
    source TEXT NULL,
    notes TEXT NULL,
    legacy_keys TEXT[] NOT NULL DEFAULT '{}',
    baseline_date DATE NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    last_updated TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_raw_materials_category ON public.raw_materials (category);
CREATE INDEX IF NOT EXISTS idx_raw_materials_no ON public.raw_materials (no);

ALTER TABLE public.raw_materials ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public raw_materials select" ON public.raw_materials;
DROP POLICY IF EXISTS "Public raw_materials insert" ON public.raw_materials;
DROP POLICY IF EXISTS "Public raw_materials update" ON public.raw_materials;
DROP POLICY IF EXISTS "Public raw_materials delete" ON public.raw_materials;

CREATE POLICY "Public raw_materials select" ON public.raw_materials FOR SELECT USING (true);
CREATE POLICY "Public raw_materials insert" ON public.raw_materials FOR INSERT WITH CHECK (true);
CREATE POLICY "Public raw_materials update" ON public.raw_materials FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Public raw_materials delete" ON public.raw_materials FOR DELETE USING (true);

-- ------------------------------------------------------------------------------
-- 4. RAW_MOVEMENTS (RAW MATERIAL MOVEMENTS LEDGER)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.raw_movements (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    material_key TEXT NOT NULL REFERENCES public.raw_materials (id) ON DELETE RESTRICT,
    material_name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('restock_in', 'production_deduction', 'opening_balance', 'adjustment')),
    delta NUMERIC NOT NULL,
    quantity NUMERIC NOT NULL CHECK (quantity >= 0),
    unit TEXT NOT NULL,
    unit_price NUMERIC NULL DEFAULT 0,
    total_cost NUMERIC NULL DEFAULT 0,
    source TEXT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    related_batch_id TEXT NULL,
    note TEXT NULL,
    entered_by TEXT NOT NULL DEFAULT 'Supervisor',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_raw_movements_material_key ON public.raw_movements (material_key);
CREATE INDEX IF NOT EXISTS idx_raw_movements_date ON public.raw_movements (date);
CREATE INDEX IF NOT EXISTS idx_raw_movements_type ON public.raw_movements (type);
CREATE INDEX IF NOT EXISTS idx_raw_movements_batch_id ON public.raw_movements (related_batch_id);
CREATE INDEX IF NOT EXISTS idx_raw_movements_created_at ON public.raw_movements (created_at DESC);

ALTER TABLE public.raw_movements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public raw_movements select" ON public.raw_movements;
DROP POLICY IF EXISTS "Public raw_movements insert" ON public.raw_movements;
DROP POLICY IF EXISTS "Public raw_movements update" ON public.raw_movements;
DROP POLICY IF EXISTS "Public raw_movements delete" ON public.raw_movements;

CREATE POLICY "Public raw_movements select" ON public.raw_movements FOR SELECT USING (true);
CREATE POLICY "Public raw_movements insert" ON public.raw_movements FOR INSERT WITH CHECK (true);
CREATE POLICY "Public raw_movements update" ON public.raw_movements FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Public raw_movements delete" ON public.raw_movements FOR DELETE USING (true);

-- ------------------------------------------------------------------------------
-- 5. REALTIME REPLICATION (INSTANT CROSS-DEVICE SYNC)
-- ------------------------------------------------------------------------------
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'items'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.items;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'movements'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.movements;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'raw_materials'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.raw_materials;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'raw_movements'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.raw_movements;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        NULL;
END $$;
