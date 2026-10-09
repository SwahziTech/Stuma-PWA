// ==============================================================================
// STUMARCOT ERP — Supabase Database Integration & Realtime Sync Engine
// ==============================================================================

/**
 * Maps raw material from Supabase DB (snake_case) to client model (camelCase).
 */
function mapRawMaterialFromDb(row) {
  if (!row) return null;
  return {
    id: row.id,
    no: row.no || 1,
    key: row.id,
    legacyKeys: Array.isArray(row.legacy_keys) ? row.legacy_keys : [],
    category: row.category || 'General',
    name: row.name,
    nameSwahili: row.name_swahili || row.name,
    unit: row.unit || 'units',
    displayUnit: row.display_unit || row.unit || 'units',
    purchaseUnit: row.purchase_unit || row.unit || 'units',
    unitRatio: Number(row.unit_ratio) || 1,
    currentBalance: Number(Number(row.current_balance || 0).toFixed(2)),
    baselineBalance: Number(Number(row.baseline_balance || 0).toFixed(2)),
    purchasePrice: Number(Number(row.purchase_price || 0).toFixed(2)),
    reorderLevel: Number(Number(row.reorder_level || 0).toFixed(2)),
    source: row.source || '',
    notes: row.notes || '',
    baselineDate: row.baseline_date || null,
    lastUpdated: row.last_updated || row.created_at || new Date().toISOString()
  };
}

/**
 * Maps client raw material model (camelCase) to Supabase DB row (snake_case).
 */
function mapRawMaterialToDb(mat) {
  if (!mat) return null;
  const key = mat.key || mat.id;
  return {
    id: key,
    no: mat.no || 1,
    category: mat.category || 'General',
    name: mat.name,
    name_swahili: mat.nameSwahili || mat.name,
    unit: mat.unit || 'units',
    display_unit: mat.displayUnit || mat.unit || 'units',
    purchase_unit: mat.purchaseUnit || mat.unit || 'units',
    unit_ratio: Number(mat.unitRatio) || 1,
    current_balance: Number(Number(mat.currentBalance || 0).toFixed(2)),
    baseline_balance: Number(Number(mat.baselineBalance || 0).toFixed(2)),
    purchase_price: Number(Number(mat.purchasePrice || 0).toFixed(2)),
    reorder_level: Number(Number(mat.reorderLevel || 0).toFixed(2)),
    source: mat.source || '',
    notes: mat.notes || '',
    legacy_keys: Array.isArray(mat.legacyKeys) ? mat.legacyKeys : [],
    baseline_date: mat.baselineDate || null,
    last_updated: mat.lastUpdated || new Date().toISOString()
  };
}

/**
 * Maps raw movement from Supabase DB (snake_case) to client model (camelCase).
 */
function mapRawMovementFromDb(row) {
  if (!row) return null;
  return {
    id: row.id,
    materialKey: row.material_key,
    materialName: row.material_name,
    delta: Number(row.delta),
    quantity: Number(row.quantity),
    unit: row.unit || 'units',
    unitPrice: Number(row.unit_price || 0),
    totalCost: Number(row.total_cost || 0),
    source: row.source || '',
    date: row.date,
    type: row.type,
    relatedBatchId: row.related_batch_id || null,
    note: row.note || '',
    enteredBy: row.entered_by || 'Supervisor',
    createdAt: row.created_at
  };
}

/**
 * Maps client raw movement (camelCase) to Supabase DB row (snake_case).
 */
function mapRawMovementToDb(mov) {
  if (!mov) return null;
  return {
    id: mov.id || (crypto.randomUUID ? crypto.randomUUID() : `raw-mov-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`),
    material_key: mov.materialKey || mov.material_key,
    material_name: mov.materialName || mov.material_name,
    type: mov.type,
    delta: Number(Number(mov.delta).toFixed(2)),
    quantity: Math.abs(Number(Number(mov.quantity || mov.delta).toFixed(2))),
    unit: mov.unit || 'units',
    unit_price: Number(Number(mov.unitPrice || mov.unit_price || 0).toFixed(2)),
    total_cost: Number(Number(mov.totalCost || mov.total_cost || 0).toFixed(2)),
    source: mov.source || '',
    date: mov.date || new Date().toISOString().split('T')[0],
    related_batch_id: mov.relatedBatchId || mov.related_batch_id || null,
    note: mov.note || '',
    entered_by: mov.enteredBy || mov.entered_by || 'Supervisor',
    created_at: mov.createdAt || mov.created_at || new Date().toISOString()
  };
}

/**
 * Offline Outbox Manager (Persisted in localStorage)
 */
const OUTBOX_KEYS = {
  MOVEMENTS: 'stumarcot_pending_movements_queue',
  RAW_MOVEMENTS: 'stumarcot_pending_raw_movements_queue',
  RAW_MATERIALS: 'stumarcot_pending_raw_materials_queue'
};

function getOutbox(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.warn(`[Outbox] Failed to read ${key}:`, e);
    return [];
  }
}

function setOutbox(key, items) {
  try {
    localStorage.setItem(key, JSON.stringify(items));
  } catch (e) {
    console.warn(`[Outbox] Failed to write ${key}:`, e);
  }
}

function enqueueOutbox(key, items) {
  const current = getOutbox(key);
  const existingIds = new Set(current.map(i => i.id));
  const toAdd = items.filter(i => !existingIds.has(i.id));
  const updated = [...current, ...toAdd];
  setOutbox(key, updated);
  return updated.length;
}

function removeFromOutbox(key, successfulIds) {
  const idSet = new Set(successfulIds);
  const current = getOutbox(key);
  const remaining = current.filter(i => !idSet.has(i.id));
  setOutbox(key, remaining);
  return remaining.length;
}

module.exports = {
  mapRawMaterialFromDb,
  mapRawMaterialToDb,
  mapRawMovementFromDb,
  mapRawMovementToDb,
  OUTBOX_KEYS,
  getOutbox,
  setOutbox,
  enqueueOutbox,
  removeFromOutbox
};
