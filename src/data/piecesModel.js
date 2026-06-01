// Pièces & Bordereau — data model + numbering helpers
//
// Phase 1 of US #1: structure de données + numérotation hiérarchique.
// See .context/attachments/e8dIF2/us1-bordereau-reorganisation-spec.md §2-3.
//
// Numbering rules:
//   Level 1 (root)   → Roman:   I, II, III, IV, V…
//   Level 2          → Letter:  I-A, I-B…
//   Level 3+         → Number:  I-A-1, I-A-2, I-A-2-1…
//   Pieces           → Number suffix on parent category (I-A-1)
//   Sans-catégorie   → Flat 1, 2, 3…
//
// Gaps at root level are allowed (MARTINIE pattern: I, II, III, V — no IV).
// They emerge from the `order` field having a hole; we derive the displayed
// numeral from `order + 1` directly, not from the index in the sorted list.

/**
 * @typedef {Object} Piece
 * @property {string} id
 * @property {string} name
 * @property {string|null} docType
 * @property {string|null} date                 // dd/mm/yyyy or ISO — renderer formats
 * @property {string} [uploadedAt]
 * @property {boolean} inclureDansBordereau
 * @property {string|null} categoryId
 * @property {number} orderInCategory
 */

/**
 * @typedef {Object} Category
 * @property {string} id
 * @property {string} name
 * @property {string|null} parentId
 * @property {number} order
 */

// ────────────────────────────────────────────────────────────────────────
// Numeral conversion

const ROMAN_TABLE = [
  [1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'],
  [100,  'C'], [90,  'XC'], [50,  'L'], [40,  'XL'],
  [10,   'X'], [9,   'IX'], [5,   'V'], [4,   'IV'],
  [1,    'I'],
];

export function toRoman(n) {
  if (!Number.isFinite(n) || n < 1) return '';
  let value = Math.floor(n);
  let out = '';
  for (const [v, sym] of ROMAN_TABLE) {
    while (value >= v) { out += sym; value -= v; }
  }
  return out;
}

export function toLetter(n) {
  // 1 → A, 2 → B … 26 → Z, 27 → AA, 28 → AB …
  if (!Number.isFinite(n) || n < 1) return '';
  let x = Math.floor(n);
  let out = '';
  while (x > 0) {
    const rem = (x - 1) % 26;
    out = String.fromCharCode(65 + rem) + out;
    x = Math.floor((x - 1) / 26);
  }
  return out;
}

// ────────────────────────────────────────────────────────────────────────
// Tree helpers

function buildCategoryIndex(categories) {
  const byId = new Map();
  const childrenOf = new Map(); // parentId (or null) → Category[]
  for (const c of categories) {
    byId.set(c.id, c);
  }
  for (const c of categories) {
    const key = c.parentId ?? null;
    if (!childrenOf.has(key)) childrenOf.set(key, []);
    childrenOf.get(key).push(c);
  }
  for (const list of childrenOf.values()) {
    list.sort((a, b) => a.order - b.order);
  }
  return { byId, childrenOf };
}

function categoryDepth(category, byId) {
  let depth = 0;
  let cur = category;
  while (cur && cur.parentId) {
    cur = byId.get(cur.parentId);
    depth += 1;
    if (depth > 50) break; // defensive cycle guard
  }
  return depth;
}

/**
 * Compute the display prefix for a category (e.g. "III", "III-A", "III-A-1").
 * Walks the ancestor chain; each segment uses the roman/letter/number rule
 * for its depth, derived from that ancestor's `order` field (allowing gaps).
 */
export function categoryPrefix(category, categories) {
  if (!category) return '';
  const { byId } = buildCategoryIndex(categories);
  const chain = [];
  let cur = category;
  while (cur) {
    chain.unshift(cur);
    cur = cur.parentId ? byId.get(cur.parentId) : null;
  }
  return chain
    .map((c, i) => {
      const n = c.order + 1;
      if (i === 0) return toRoman(n);
      if (i === 1) return toLetter(n);
      return String(n);
    })
    .join('-');
}

/**
 * Piece display prefix — categoryPrefix + "-" + (orderInCategory + 1).
 * Sans-catégorie pieces are handled separately by the renderer (flat numbering).
 */
export function piecePrefix(piece, categories) {
  if (!piece || piece.categoryId == null) return '';
  const cat = categories.find(c => c.id === piece.categoryId);
  if (!cat) return '';
  return `${categoryPrefix(cat, categories)}-${piece.orderInCategory + 1}`;
}

// ────────────────────────────────────────────────────────────────────────
// Bordereau row builder
//
// Returns a flat ordered list of rows the renderer iterates. Each row carries
// the depth + prefix already computed, so the component only deals with
// presentation.

/**
 * @typedef {Object} BordereauRow
 * @property {'sansCategorieHeader'|'sansCategoriePiece'|'category'|'piece'} kind
 * @property {number} depth                       // 0 for root category / sans-cat header
 * @property {string} [prefix]                    // I, I-A, I-A-1, "1" for sans-cat
 * @property {Category} [category]
 * @property {Piece} [piece]
 * @property {number} [directPieceCount]          // for category rows (direct only)
 * @property {string[]} [ancestorChainIds]        // category ids ABOVE this row, root first;
 *                                                // for piece rows this includes the piece's own category.
 *                                                // BordereauTable hides the row if any id here is collapsed.
 */

/**
 * Build the flat row list for the Bordereau section.
 *
 * @param {Piece[]} pieces
 * @param {Category[]} categories
 * @returns {BordereauRow[]}
 */
export function buildBordereauRows(pieces, categories) {
  const { byId, childrenOf } = buildCategoryIndex(categories);

  const piecesByCategory = new Map(); // categoryId → Piece[] sorted by orderInCategory
  const sansCat = [];
  for (const p of pieces) {
    if (p.categoryId == null) {
      sansCat.push(p);
      continue;
    }
    if (!piecesByCategory.has(p.categoryId)) piecesByCategory.set(p.categoryId, []);
    piecesByCategory.get(p.categoryId).push(p);
  }
  for (const list of piecesByCategory.values()) {
    list.sort((a, b) => a.orderInCategory - b.orderInCategory);
  }
  sansCat.sort((a, b) => a.orderInCategory - b.orderInCategory);

  const rows = [];

  // Sans-catégorie group at the top (per spec §6).
  if (sansCat.length > 0) {
    rows.push({ kind: 'sansCategorieHeader', depth: 0, count: sansCat.length });
    sansCat.forEach((piece, idx) => {
      rows.push({
        kind: 'sansCategoriePiece',
        depth: 0,
        prefix: String(idx + 1),
        piece,
      });
    });
  }

  // Walk categories depth-first by `order` (gaps preserved via order+1 in prefix).
  const visitCategory = (category, ancestorChainAbove) => {
    const depth = categoryDepth(category, byId);
    const prefix = categoryPrefix(category, categories);
    const directPieces = piecesByCategory.get(category.id) || [];
    const subcategoryCount = (childrenOf.get(category.id) || []).length;

    rows.push({
      kind: 'category',
      depth,
      prefix,
      category,
      directPieceCount: directPieces.length,
      subcategoryCount,
      ancestorChainIds: ancestorChainAbove,
    });

    const chainIncludingSelf = [...ancestorChainAbove, category.id];

    // Direct pieces (rendered before subcategories per MARTINIE pattern §3).
    directPieces.forEach(piece => {
      rows.push({
        kind: 'piece',
        depth: depth + 1,
        prefix: `${prefix}-${piece.orderInCategory + 1}`,
        piece,
        ancestorChainIds: chainIncludingSelf,
      });
    });

    const kids = childrenOf.get(category.id) || [];
    kids.forEach(child => visitCategory(child, chainIncludingSelf));
  };

  const roots = childrenOf.get(null) || [];
  roots.forEach(root => visitCategory(root, []));

  return rows;
}

/**
 * Build a flat row list for the tree view — the full hierarchy is walked,
 * but a folder's children are only emitted when its id is in `expandedIds`.
 * Each row carries `depth` (0 at root) so the renderer can indent.
 *
 * Sans-catégorie pieces surface at the top (depth 0).
 *
 * Sorting applies at every level: siblings (folders and direct pieces) are
 * sorted by `sortConfig.col` ('name' | 'date') and `sortConfig.dir`.
 *
 * @param {Piece[]} pieces
 * @param {Category[]} categories
 * @param {Set<string>} expandedIds
 * @param {{ col: 'name'|'date', dir: 'asc'|'desc' }} [sortConfig]
 * @returns {BordereauRow[]}
 */
export function buildTreeViewRows(pieces, categories, expandedIds, sortConfig = { col: 'name', dir: 'asc' }) {
  const { childrenOf } = buildCategoryIndex(categories);
  const rows = [];

  const piecesByCategory = new Map();
  for (const p of pieces) {
    if (p.categoryId == null) continue;
    if (!piecesByCategory.has(p.categoryId)) piecesByCategory.set(p.categoryId, []);
    piecesByCategory.get(p.categoryId).push(p);
  }

  const sansCat = pieces
    .filter(p => p.categoryId == null)
    .sort((a, b) => (a.orderInCategory || 0) - (b.orderInCategory || 0));
  if (sansCat.length > 0) {
    rows.push({ kind: 'sansCategorieHeader', depth: 0, count: sansCat.length });
    sansCat.forEach((piece, idx) => {
      rows.push({ kind: 'sansCategoriePiece', depth: 0, prefix: String(idx + 1), piece });
    });
  }

  const dir = sortConfig.dir === 'desc' ? -1 : 1;
  const sortFolders = (folders) => [...folders].sort((a, b) => {
    if (sortConfig.col === 'date') {
      const sa = folderStats(a.id, pieces, categories).latestDate;
      const sb = folderStats(b.id, pieces, categories).latestDate;
      return ((sa ? sa.getTime() : -Infinity) - (sb ? sb.getTime() : -Infinity)) * dir;
    }
    return a.name.localeCompare(b.name, 'fr') * dir;
  });
  const sortPieces = (pcs) => [...pcs].sort((a, b) => {
    if (sortConfig.col === 'date') {
      const da = parsePieceDate(a.date);
      const db = parsePieceDate(b.date);
      return ((da ? da.getTime() : -Infinity) - (db ? db.getTime() : -Infinity)) * dir;
    }
    const an = a.intitule || a.nom || '';
    const bn = b.intitule || b.nom || '';
    return an.localeCompare(bn, 'fr') * dir;
  });

  const visit = (category, depth) => {
    const directPieces = piecesByCategory.get(category.id) || [];
    const kids = childrenOf.get(category.id) || [];
    const hasChildren = directPieces.length > 0 || kids.length > 0;
    const expanded = expandedIds.has(category.id);
    rows.push({
      kind: 'category',
      depth,
      prefix: categoryPrefix(category, categories),
      category,
      directPieceCount: directPieces.length,
      subcategoryCount: kids.length,
      hasChildren,
      expanded,
    });
    if (!expanded) return;
    // Pieces first, then sub-folders — matches the bordereau ordering.
    sortPieces(directPieces).forEach(piece => {
      rows.push({
        kind: 'piece',
        depth: depth + 1,
        prefix: `${categoryPrefix(category, categories)}-${piece.orderInCategory + 1}`,
        piece,
      });
    });
    sortFolders(kids).forEach(child => visit(child, depth + 1));
  };

  sortFolders(childrenOf.get(null) || []).forEach(root => visit(root, 0));
  return rows;
}

/**
 * Parse a piece's `date` field — supports ISO yyyy-mm-dd and dd/mm/yyyy.
 * Returns null when unparseable.
 * @param {string|null} str
 * @returns {Date|null}
 */
export function parsePieceDate(str) {
  if (!str) return null;
  if (str instanceof Date) return isNaN(str.getTime()) ? null : str;
  const s = String(str);
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) {
    const d = new Date(s);
    return isNaN(d.getTime()) ? null : d;
  }
  const m = s.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (m) return new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]));
  return null;
}

/**
 * Recursive count + latest-date stats for a folder. Counts all pieces in
 * the folder's subtree (not just direct children).
 * @param {string} categoryId
 * @param {Object[]} pieces
 * @param {Category[]} categories
 * @returns {{ count: number, latestDate: Date|null }}
 */
export function folderStats(categoryId, pieces, categories) {
  const descIds = new Set([categoryId]);
  const stack = [categoryId];
  while (stack.length) {
    const x = stack.pop();
    categories.forEach(c => { if (c.parentId === x && !descIds.has(c.id)) { descIds.add(c.id); stack.push(c.id); } });
  }
  let count = 0;
  let latestDate = null;
  pieces.forEach(p => {
    if (!descIds.has(p.categoryId)) return;
    count += 1;
    const d = parsePieceDate(p.date);
    if (d && (!latestDate || d > latestDate)) latestDate = d;
  });
  return { count, latestDate };
}

// ────────────────────────────────────────────────────────────────────────
// Auto-classification (drop-first flow)
//
// When a piece lands via the drop-first ingest pipeline, we guess which
// existing category it belongs to from its `type` (and a name-keyword
// fallback). Returns a categoryId from the provided categories list, or
// null when no category fits — the renderer puts those in a Sans-catégorie
// group at the top.
//
// This is a heuristic for the demo: in production it'd be backed by an
// agent that reasons over the document content (per the US #3 spec).

const TYPE_TO_CATEGORY_KEY = {
  // Bordereau-side types
  'Facture':        'cat-frais-med',
  'Bulletin':       'cat-bulletins',
  'Rapport':        'cat-expertises',
  'Compte-rendu':   'cat-soins',
  'Ordonnance':     'cat-soins',
  'Attestation':    'cat-indemnites',
  'Décompte':       'cat-indemnites',
  // Drop-first pool types (PIECE_TYPE_OPTIONS in App.js)
  'Expertise':      'cat-expertises',
  'Factures':       'cat-frais-med',
  'Médical':        'cat-soins',
  'Revenus':        'cat-bulletins',
  'Décision':       'cat-procedure',
  'Administratif':  'cat-indemnites',
  // 'Correspondance' falls through → name keyword check, then sans-catégorie
};

const NAME_KEYWORDS = [
  // ordered: first match wins
  { test: /assignation|conclusions|jugement|requête|ordonnance.*juge|procédure/i, cat: 'cat-procedure' },
  { test: /expertise|rapport.*expert|expert/i,           cat: 'cat-expertises' },
  { test: /compte[-\s]?rendu|ordonnance|consult|hospitali|urgence|soins|arrêt.*travail/i, cat: 'cat-soins' },
  { test: /facture|honoraires|note.*frais|chu|pharmacie|kiné|irm|radio/i, cat: 'cat-frais-med' },
  { test: /bulletin.*salaire|fiche.*paie|paie/i,          cat: 'cat-bulletins' },
  { test: /attestation|cpam|décompte|ag2r|ij\b|indemnit/i, cat: 'cat-indemnites' },
];

/**
 * Adapt the drop-first pipeline piece shape (cleanName / originalName /
 * status / poolRef …) into the bordereau-piece shape that BordereauTable
 * expects (nom / nomOriginal / intitule / categoryId / inclureDansBordereau …).
 *
 * Pieces still being processed (status !== 'done') get `_processing = true`
 * and land in Sans-catégorie until classification fires. A `categoryIdOverride`
 * field on the source piece — set when the user manually moves a piece in
 * the drop-first view — wins over auto-classification.
 *
 * @param {Object[]} dfPieces
 * @param {Category[]} categories
 * @returns {Object[]} bordereau-shaped pieces
 */
export function dropFirstAsBordereauPieces(dfPieces, categories) {
  // First classify (or use manual override), then assign orderInCategory.
  const classified = dfPieces.map(df => {
    const isDone = df.status === 'done';
    const overrideCat = df.categoryIdOverride;
    const categoryId = overrideCat !== undefined
      ? overrideCat
      : (isDone ? classifyDropFirstPiece(df, categories) : null);
    return { df, categoryId, isDone };
  });

  const orderCounters = new Map(); // categoryId (or null) → next index
  const result = [];
  classified.forEach(({ df, categoryId, isDone }) => {
    const k = categoryId == null ? '__null__' : categoryId;
    const next = orderCounters.get(k) || 0;
    orderCounters.set(k, next + 1);

    const rawDate = df.date ? new Date(df.date) : null;
    const formattedDate = rawDate && !isNaN(rawDate.getTime())
      ? rawDate.toLocaleDateString('fr-FR')
      : (df.date || null);

    result.push({
      id: df.id,
      nom: df.cleanName || df.originalName || df.id,
      nomOriginal: df.originalName || null,
      intitule: df.cleanName || (df.originalName ? df.originalName.replace(/\.[^/.]+$/, '') : ''),
      type: df.type || null,
      date: formattedDate,
      categoryId,
      inclureDansBordereau: !df.horsBordereau,
      orderInCategory: next,
      _processing: !isDone,
    });
  });
  return result;
}

/**
 * Classify a piece into a categoryId. Looks at piece.type first, then
 * falls back to substring matching on the piece's display name.
 *
 * @param {Object} piece                              dropFirstPiece or Piece
 * @param {Category[]} categories                     available categories
 * @returns {string|null} categoryId or null
 */
export function classifyDropFirstPiece(piece, categories) {
  if (!piece) return null;
  const validId = (key) => categories.some(c => c.id === key) ? key : null;

  // 1. Type-based mapping
  const type = piece.type || piece.docType;
  if (type && TYPE_TO_CATEGORY_KEY[type]) {
    const id = validId(TYPE_TO_CATEGORY_KEY[type]);
    if (id) return id;
  }

  // 2. Name-keyword fallback (drop-first uses cleanName / originalName, bordereau uses nom)
  const nameSources = [piece.cleanName, piece.originalName, piece.nom, piece.intitule, piece.name]
    .filter(Boolean)
    .join(' ');
  if (nameSources) {
    for (const rule of NAME_KEYWORDS) {
      if (rule.test.test(nameSources)) {
        const id = validId(rule.cat);
        if (id) return id;
      }
    }
  }
  return null;
}
