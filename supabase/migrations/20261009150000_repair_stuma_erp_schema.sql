-- ==============================================================================
-- STUMARCOT PRECAST CONCRETE FACTORY — ERP SUPABASE REPAIR MIGRATION
-- Migration: 20261009150000_repair_stuma_erp_schema.sql
-- Description:
--   1. Reconcile missing catalog items (item-hb-01, item-hb-02, item-pb-13)
--   2. Expand movements.type constraint to permit sale_out alongside dispatch_out
--   3. Create public.raw_materials table with RLS and seed canonical materials
--   4. Create public.raw_movements table with RLS and foreign keys
--   5. Enable Supabase Realtime publication for multi-device synchronization
-- ==============================================================================

-- Enable pgcrypto extension for UUID generation if needed
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ------------------------------------------------------------------------------
-- 1. RECONCILE CANONICAL CATALOG ITEMS IN public.items
-- ------------------------------------------------------------------------------
-- Inserts the 3 items that were previously missing from Supabase, preventing
-- foreign key violation 23503 when logging production or sales for them.
-- Uses ON CONFLICT (id) DO NOTHING to ensure zero impact on existing rows.
INSERT INTO public.items (
    id, name, category, unit, pcs_per_sqm, colors, reorder_level, wastani_per_bag, "moldCount", mold_size, recipe_id, created_at, updated_at
) VALUES 
('item-hb-01', '6" (plain)', 'Hollow Blocks', 'pcs', NULL, ARRAY['White'], 150, 40, 150, '46x21x15', 'press_sand_54', now(), now()),
('item-hb-02', '6" Dust', 'Hollow Blocks', 'pcs', NULL, ARRAY['White'], 150, 40, 150, '46x21x15', 'press_chip_40_14', now(), now()),
('item-pb-13', 'MPA-30', 'Paving Blocks', 'sqm', 50, ARRAY[]::TEXT[], 50, 225, 225, '20x10x6', 'press_heavy_14_10', now(), now())
ON CONFLICT (id) DO UPDATE SET
    updated_at = now();

-- ------------------------------------------------------------------------------
-- 2. EXPAND MOVEMENTS TYPE CHECK CONSTRAINT
-- ------------------------------------------------------------------------------
-- Allows 'sale_out' in addition to 'dispatch_out', 'production_in', 'opening_balance', 'adjustment'
ALTER TABLE public.movements DROP CONSTRAINT IF EXISTS movements_type_check;
ALTER TABLE public.movements ADD CONSTRAINT movements_type_check 
    CHECK (type IN ('opening_balance', 'production_in', 'dispatch_out', 'sale_out', 'adjustment'));

-- ------------------------------------------------------------------------------
-- 3. CREATE public.raw_materials (RAW MATERIAL MASTER)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.raw_materials (
    id TEXT PRIMARY KEY,                       -- Unique material key (e.g. 'cement', 'mchanga_laini')
    no INTEGER NOT NULL DEFAULT 1,            -- Display ordering number
    category TEXT NOT NULL,                   -- Category (e.g. 'Cement', 'Mchanga (sand)', 'Rangi')
    name TEXT NOT NULL,                       -- English / primary name (e.g. 'Cement', 'Mchanga Laini')
    name_swahili TEXT NULL,                   -- Swahili name (e.g. 'Saruji (Mifuko)', 'Mchanga Laini (Ndoo)')
    unit TEXT NOT NULL,                       -- Factory consumption / balance unit (e.g. 'bags', 'ndoo', 'kg')
    display_unit TEXT NULL,                   -- Display unit in UI
    purchase_unit TEXT NULL,                  -- Purchasing unit from supplier (e.g. 'Trip (20 Cbm)', 'Barrel 200L')
    unit_ratio NUMERIC NOT NULL DEFAULT 1,    -- Conversion ratio (e.g. 2500 ndoo per trip)
    current_balance NUMERIC NOT NULL DEFAULT 0, -- Live available balance
    baseline_balance NUMERIC NULL DEFAULT 0,  -- Initial physical baseline count
    purchase_price NUMERIC NOT NULL DEFAULT 0,-- Last purchase price / unit cost
    reorder_level NUMERIC NULL DEFAULT 0,     -- Reorder alert threshold
    source TEXT NULL,                         -- Default quarry / supplier / location
    notes TEXT NULL,                          -- Operational notes / specs
    legacy_keys TEXT[] NOT NULL DEFAULT '{}', -- Compatible aliases (e.g. ['cement_50kg'])
    baseline_date DATE NULL,                  -- Date of baseline stocktaking
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    last_updated TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for fast query performance
CREATE INDEX IF NOT EXISTS idx_raw_materials_category ON public.raw_materials (category);
CREATE INDEX IF NOT EXISTS idx_raw_materials_no ON public.raw_materials (no);

-- Row Level Security (RLS)
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
-- 4. SEED CANONICAL RAW MATERIALS
-- ------------------------------------------------------------------------------
INSERT INTO public.raw_materials (
    id, no, category, name, name_swahili, unit, display_unit, purchase_unit, unit_ratio, current_balance, baseline_balance, purchase_price, reorder_level, source, notes, legacy_keys
) VALUES
('cement', 1, 'Cement', 'Cement', 'Saruji (Mifuko)', 'bags', '50 kg bags', '50 kg bags', 1, 0, 0, 0, 80, 'Whole sallers', 'Cement is purchased as 50 kg bags.', ARRAY['cement_50kg']),
('mchanga_laini', 2, 'Mchanga (sand)', 'Mchanga Laini', 'Mchanga Laini (Ndoo)', 'ndoo', 'Trip (20 Cbm)', 'Trip (20 Cbm)', 2500, 0, 0, 0, 100, 'Msanga (27km)', '1 Trip = 20 Cbm = 2,500 ndoo/buckets', ARRAY['sand_bucket']),
('mchanga_mweupe', 3, 'Mchanga (sand)', 'Mchanga Mweupe', 'Mchanga Mweupe (Ndoo)', 'ndoo', 'Trip (20 Cbm)', 'Trip (20 Cbm)', 2500, 0, 0, 0, 100, 'Msanga (27km)', '1 Trip = 20 Cbm = 2,500 ndoo/buckets', ARRAY[]::TEXT[]),
('mchanga_mnene', 4, 'Mchanga (sand)', 'Mchanga Mnene', 'Mchanga Mnene (Ndoo)', 'ndoo', 'Trip (20 Cbm)', 'Trip (20 Cbm)', 2500, 0, 0, 0, 100, 'Kikombo (21km)', '1 Trip = 20 Cbm = 2,500 ndoo/buckets', ARRAY[]::TEXT[]),
('dust', 5, 'Dust', 'Dust', 'Dust / Vumbi (Ndoo)', 'ndoo', 'Trip (20 Cbm)', 'Trip (20 Cbm)', 2500, 0, 0, 0, 100, 'Manchali (20km)', '1 Trip = 20 Cbm = 2,500 ndoo/buckets', ARRAY[]::TEXT[]),
('chipping', 6, 'Chipping', 'Chipping', 'Chipping (Ndoo)', 'ndoo', 'Trip (20 Cbm)', 'Trip (20 Cbm)', 2500, 0, 0, 0, 100, 'Manchali (20km)', '1 Trip = 20 Cbm = 2,500 ndoo/buckets', ARRAY['chipping_bucket']),
('kokoto', 7, 'Kokoto / Aggregate', 'Kokoto / Aggregate', 'Kokoto (Ndoo)', 'ndoo', 'Trip (20 Cbm)', 'Trip (20 Cbm)', 2500, 0, 0, 0, 100, 'Manchali (20km)', '1 Trip = 20 Cbm = 2,500 ndoo/buckets', ARRAY['aggregate_bucket']),
('dawa', 8, 'Chemical additive / hardener', 'Dawa', 'Dawa ya Kuimarisha', 'Liters', 'Barrel of 200L', 'Barrel of 200L', 200, 0, 0, 0, 50, 'Dar', 'Barrel of 200L each', ARRAY['chemical_liter']),
('rangi_red', 9, 'Rangi', 'Rangi Red', 'Rangi Nyekundu', 'kg', 'Bags of 25kg', 'Bags of 25kg', 25, 0, 0, 0, 25, 'Dar', 'Bags of 25kg each', ARRAY['pigment_red_kg']),
('rangi_black', 10, 'Rangi', 'Rangi Black', 'Rangi Nyeusi', 'kg', 'Bags of 25kg', 'Bags of 25kg', 25, 0, 0, 0, 25, 'Dar', 'Bags of 25kg each', ARRAY['pigment_black_kg']),
('mafuta', 11, 'Mafuta/oil', 'Mafuta/oil', 'Mafuta / Oil', 'Liters', 'Dumu of 20L', 'Dumu of 20L', 20, 0, 0, 0, 20, 'Shop', 'Dumu of 20L each', ARRAY[]::TEXT[]),
('steel_r6', 12, 'Steel', 'R6', 'Nondo R6', 'bars', 'Pcs / Bars (12m)', 'Pcs / Bars (12m)', 1, 0, 0, 0, 50, 'Local Hardware', 'Steel reinforcement R6 (12m bars)', ARRAY[]::TEXT[]),
('steel_10mm', 13, 'Steel', '10mm', 'Nondo 10mm', 'bars', 'Pcs / Bars (12m)', 'Pcs / Bars (12m)', 1, 0, 0, 0, 50, 'Local Hardware', 'Steel reinforcement 10mm (12m bars)', ARRAY[]::TEXT[])
ON CONFLICT (id) DO NOTHING;

-- ------------------------------------------------------------------------------
-- 5. CREATE public.raw_movements (RAW MATERIAL MOVEMENTS LEDGER)
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

-- Indexes for high-performance ledger querying
CREATE INDEX IF NOT EXISTS idx_raw_movements_material_key ON public.raw_movements (material_key);
CREATE INDEX IF NOT EXISTS idx_raw_movements_date ON public.raw_movements (date);
CREATE INDEX IF NOT EXISTS idx_raw_movements_type ON public.raw_movements (type);
CREATE INDEX IF NOT EXISTS idx_raw_movements_batch_id ON public.raw_movements (related_batch_id);
CREATE INDEX IF NOT EXISTS idx_raw_movements_created_at ON public.raw_movements (created_at DESC);

-- Row Level Security (RLS)
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
-- 6. ENABLE SUPABASE REALTIME REPLICATION
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
