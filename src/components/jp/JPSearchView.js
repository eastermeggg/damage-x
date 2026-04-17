import React, { useState, useMemo } from 'react';
import {
  Search, X, ChevronDown, ChevronRight, SlidersHorizontal, Landmark,
  Bookmark, BookmarkCheck, Plus, Trash2,
} from 'lucide-react';
import DECISIONS, { getDecisionsByIds, getPrimaryAmount, formatDateShort, formatDateLong } from '../../data/mockDecisions';

const ALL_JURISDICTIONS = [...new Set(DECISIONS.map(d => d.jurisdiction))].sort();
const ALL_POSTES = [...new Set(DECISIONS.flatMap(d => d.amounts.map(a => a.poste)))].sort();
// Build poste→label lookup from actual data
const POSTE_LABEL_MAP = {};
DECISIONS.forEach(d => d.amounts.forEach(a => { if (!POSTE_LABEL_MAP[a.poste]) POSTE_LABEL_MAP[a.poste] = a.label; }));

// ─── Subcomponents (defined before use) ──────────────────────────────

function FilterSection({ title, children }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="mb-3">
      <button onClick={() => setOpen(!open)} className="flex items-center gap-1 w-full text-left mb-1.5">
        {open ? <ChevronDown className="w-3 h-3 text-[#a8a29e]" /> : <ChevronRight className="w-3 h-3 text-[#a8a29e]" />}
        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, fontWeight: 600, color: '#78716c', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          {title}
        </span>
      </button>
      {open && <div className="ml-4 space-y-1">{children}</div>}
    </div>
  );
}

function FilterCheckbox({ label, checked, onChange }) {
  return (
    <label onClick={onChange} className="flex items-center gap-2 py-1 cursor-pointer group">
      <div
        className="w-3.5 h-3.5 rounded border flex items-center justify-center flex-shrink-0 transition-colors"
        style={{
          borderColor: checked ? '#b9703f' : '#d6d3d1',
          backgroundColor: checked ? '#b9703f' : 'white',
        }}
      >
        {checked && (
          <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M1.5 4L3.2 5.7L6.5 2.3" stroke="white" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" /></svg>
        )}
      </div>
      <span className="text-[12px] text-[#44403c] group-hover:text-[#292524] transition-colors leading-tight">{label}</span>
    </label>
  );
}

function JPSearchResultCard({ decision: d, isPinned, isSelected, onOpen, onPin }) {
  return (
    <div
      onClick={onOpen}
      className="group bg-white border rounded-md cursor-pointer"
      style={{
        borderColor: isSelected ? '#b9703f' : '#e7e5e3',
        boxShadow: isSelected
          ? '0 0 0 1px rgba(185,112,63,0.15)'
          : '0 1px 3px rgba(41,37,36,0.04)',
        transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
      }}
      onMouseOver={(e) => { if (!isSelected) { e.currentTarget.style.borderColor = '#d6d3d1'; e.currentTarget.style.boxShadow = '0 2px 6px rgba(41,37,36,0.06)'; } }}
      onMouseOut={(e) => { if (!isSelected) { e.currentTarget.style.borderColor = '#e7e5e3'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(41,37,36,0.04)'; } }}
    >
      {/* Header: jurisdiction — pin */}
      <div className="px-3.5 pt-3 pb-1 flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: '#a8a29e' }}>
            {d.numero}
          </span>
          <Landmark className="w-3 h-3 text-[#b9703f] flex-shrink-0" />
          <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, fontWeight: 600, color: '#b9703f', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
            {d.jurisdiction}{d.chambre ? ` · ${d.chambre}` : ''}
          </span>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onPin?.(); }}
          className="p-1.5 -mr-1 rounded-md transition-colors hover:bg-[#eeece6] flex-shrink-0"
          title={isPinned ? 'Déjà épinglée' : 'Épingler au dossier'}
        >
          {isPinned
            ? <BookmarkCheck className="w-3.5 h-3.5" style={{ color: '#b9703f', fill: '#b9703f' }} />
            : <Bookmark className="w-3.5 h-3.5 text-[#d6d3d1] group-hover:text-[#a8a29e] transition-colors" />
          }
        </button>
      </div>

      {/* Title + victim */}
      <div className="px-3.5 pb-2">
        <div style={{ fontFamily: "'EB Garamond', 'Georgia', serif", fontSize: 16, color: '#292524', lineHeight: '22px' }}>
          Arrêt du {formatDateLong(d.date)}
        </div>
        {d.victimProfile && (
          <span style={{ fontSize: 12, fontWeight: 500, color: '#78716c', marginTop: 2, display: 'block' }}>{d.victimProfile}</span>
        )}
      </div>

      {/* Tags: category, status, contentieux, amounts */}
      <div className="px-3.5 pb-2 flex items-center gap-1.5 flex-wrap">
        {d.category && (
          <span className="badge badge-sm badge-outline">{d.category}</span>
        )}
        {d.status && (
          <span className="badge badge-sm" style={{ backgroundColor: '#f5f5f4', color: '#57534e' }}>{d.status}</span>
        )}
        {d.contentieuxType && (
          <span className="badge badge-sm badge-outline">{d.contentieuxType}</span>
        )}
        {d.amounts.map((amt, i) => (
          <span key={i} className="badge badge-sm badge-secondary" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
            {amt.poste} : {amt.displayValue}
          </span>
        ))}
      </div>

      {/* Résumé — separated zone */}
      <div className="mx-3.5 mb-3 rounded px-2.5 py-2" style={{ backgroundColor: '#fafaf9' }}>
        <p style={{ fontSize: 14, lineHeight: '20px', color: '#78716c', margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {d.resume}
        </p>
      </div>
    </div>
  );
}

// ─── Main component ──────────────────────────────────────────────────

export default function JPSearchView({
  pinnedJP = [],
  selectedDecisionId = null,
  onOpenDrawer,
  onPin,
  onUnpin,
  onAddClick,
}) {
  const [query, setQuery] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(true);
  const [savedCollapsed, setSavedCollapsed] = useState(false);
  const [filters, setFilters] = useState({
    jurisdictions: [],
    postes: [],
    dateFrom: '',
    dateTo: '',
  });

  const pinnedIds = useMemo(() => new Set(pinnedJP.map(p => p.decisionId)), [pinnedJP]);
  const savedDecisions = useMemo(() => getDecisionsByIds(pinnedJP.map(p => p.decisionId)), [pinnedJP]);
  // Filter + search
  const results = useMemo(() => {
    let filtered = [...DECISIONS];

    if (query.trim()) {
      const q = query.toLowerCase();
      filtered = filtered.filter(d =>
        d.jurisdiction.toLowerCase().includes(q) ||
        d.category.toLowerCase().includes(q) ||
        d.resume.toLowerCase().includes(q) ||
        d.numero.toLowerCase().includes(q) ||
        (getPrimaryAmount(d)?.displayValue || '').toLowerCase().includes(q) ||
        (d.chambre && d.chambre.toLowerCase().includes(q))
      );
    }

    if (filters.jurisdictions.length > 0) {
      filtered = filtered.filter(d => filters.jurisdictions.includes(d.jurisdiction));
    }
    if (filters.postes.length > 0) {
      filtered = filtered.filter(d => d.amounts.some(a => filters.postes.includes(a.poste)));
    }
    if (filters.dateFrom) {
      filtered = filtered.filter(d => d.date >= filters.dateFrom);
    }
    if (filters.dateTo) {
      filtered = filtered.filter(d => d.date <= filters.dateTo);
    }

    filtered.sort((a, b) => b.date.localeCompare(a.date));
    return filtered;
  }, [query, filters]);

  const toggleFilter = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: prev[key].includes(value)
        ? prev[key].filter(v => v !== value)
        : [...prev[key], value],
    }));
  };

  const clearFilters = () => {
    setFilters({ jurisdictions: [], postes: [], dateFrom: '', dateTo: '' });
    setQuery('');
  };

  const activeFilterCount =
    filters.jurisdictions.length + filters.postes.length +
    (filters.dateFrom ? 1 : 0) + (filters.dateTo ? 1 : 0);

  return (
    <div className="flex-1 flex flex-col" style={{ backgroundColor: '#F8F7F5' }}>

      {/* ═══════════ STICKY TOP BAR: Search + Add ═══════════ */}
      <div className="flex-shrink-0 sticky top-0 z-20 border-b border-[#e7e5e3] px-6 py-3" style={{ backgroundColor: '#F8F7F5' }}>
        <div className="flex items-center gap-3">
          <div className="flex-1 flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white border border-[#e7e5e3] transition-colors"
            style={query ? { borderColor: '#b9a07a', boxShadow: '0 0 0 1px rgba(185,160,122,0.15)' } : {}}>
            <Search className="w-4 h-4 text-[#a8a29e] flex-shrink-0" />
            <input
              type="text"
              placeholder="Rechercher par juridiction, contexte, montant, n° de décision…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 bg-transparent text-[14px] text-[#292524] placeholder-[#a8a29e] focus:outline-none"
            />
            {query && (
              <button onClick={() => setQuery('')} className="p-0.5 hover:bg-[#eeece6] rounded transition-colors">
                <X className="w-3.5 h-3.5 text-[#a8a29e]" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ═══════════ SAVED JP SECTION ═══════════ */}
      <div className="flex-shrink-0 border-b border-[#e7e5e3]" style={{ backgroundColor: '#fafaf9' }}>
        <div className="px-6 py-3">
          {/* Header row */}
          <div className="flex items-center justify-between">
            <button onClick={() => setSavedCollapsed(!savedCollapsed)} className="flex items-center gap-2 group">
              {savedCollapsed ? <ChevronRight className="w-3 h-3 text-[#a8a29e]" /> : <ChevronDown className="w-3 h-3 text-[#a8a29e]" />}
              <div className="flex items-center gap-2">
                <Bookmark className="w-3.5 h-3.5" style={{ color: '#b9703f', fill: '#b9703f' }} />
                <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, fontWeight: 600, color: '#292524', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Jurisprudences sauvegardées
                </span>
                <span className="inline-flex items-center justify-center px-1.5 py-0.5 rounded-full text-[10px] font-bold"
                  style={{ backgroundColor: savedDecisions.length > 0 ? '#292524' : '#d6d3d1', color: 'white', minWidth: 18 }}>
                  {savedDecisions.length}
                </span>
              </div>
            </button>
          </div>

          {/* Saved table */}
          {!savedCollapsed && (
            <div className="mt-3">
              {savedDecisions.length === 0 ? (
                <div className="flex items-center justify-center py-6 bg-white border border-[#e7e5e3] rounded-md">
                  <span className="text-[14px] text-[#a8a29e]">Aucune jurisprudence sauvegardée — épinglez depuis la recherche ou le chat</span>
                </div>
              ) : (
                <div className="bg-white border border-[#e7e5e3] rounded-md overflow-hidden">
                  {/* Table header */}
                  <div className="grid gap-0 px-3 py-2 border-b border-[#e7e5e3]"
                    style={{ gridTemplateColumns: '120px 80px 80px 1fr 100px 28px', backgroundColor: '#fafaf9' }}>
                    {['Juridiction', 'Date', 'Poste', 'Contexte', 'Montant', ''].map((h, i) => (
                      <span key={i} style={{
                        fontSize: 10, fontWeight: 500, fontFamily: "'IBM Plex Mono', monospace",
                        color: '#a8a29e', textTransform: 'uppercase',
                        textAlign: h === 'Montant' ? 'right' : 'left',
                      }}>{h}</span>
                    ))}
                  </div>
                  {/* Table rows */}
                  {savedDecisions.map((d, i) => {
                    const isSelected = d.id === selectedDecisionId;
                    return (
                      <div
                        key={d.id}
                        onClick={() => onOpenDrawer?.(d.id, savedDecisions.map(s => s.id))}
                        className="grid gap-0 px-3 py-2 cursor-pointer transition-colors hover:bg-[#fafaf9] items-center"
                        style={{
                          gridTemplateColumns: '120px 80px 80px 1fr 100px 28px',
                          backgroundColor: isSelected ? '#fdf8f4' : 'transparent',
                          borderLeft: isSelected ? '3px solid #b9703f' : '3px solid transparent',
                          borderBottom: i < savedDecisions.length - 1 ? '1px solid #f0efed' : 'none',
                        }}
                      >
                        <span style={{ fontSize: 14, color: '#292524', fontWeight: 500 }}>{d.jurisdiction}{d.chambre ? ` · ${d.chambre}` : ''}</span>
                        <span style={{ fontSize: 12, fontFamily: "'IBM Plex Mono', monospace", color: '#78716c' }}>{formatDateShort(d.date)}</span>
                        <span className="inline-flex items-center">
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold"
                            style={{ fontFamily: "'IBM Plex Mono', monospace", backgroundColor: '#f5f5f4', color: '#44403c', border: '1px solid #e7e5e3' }}>
                            {getPrimaryAmount(d)?.poste}
                          </span>
                        </span>
                        <span style={{ fontSize: 14, color: '#44403c', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.category}</span>
                        <span style={{ fontSize: 14, fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600, color: '#b9703f', textAlign: 'right' }}>{getPrimaryAmount(d)?.displayValue}</span>
                        <button
                          onClick={(e) => { e.stopPropagation(); onUnpin?.(d.id); }}
                          className="p-1 rounded-md text-[#d6d3d1] hover:text-[#ef4444] hover:bg-[#fef2f2] transition-colors"
                          title="Retirer du dossier"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
              {onAddClick && (
                <button
                  onClick={onAddClick}
                  className="inline-flex items-center gap-1.5 mt-2 px-2.5 py-1.5 rounded-md text-[12px] font-medium text-[#78716c] hover:text-[#44403c] hover:bg-[#eeece6] transition-colors"
                >
                  <Plus className="w-3 h-3" />
                  Ajouter manuellement
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ═══════════ SEARCH RESULTS ═══════════ */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex-1 flex min-h-0 overflow-hidden">

          {/* Filter sidebar */}
          <div className="flex-shrink-0 overflow-y-auto border-r border-[#e7e5e3]" style={{ width: filtersOpen ? 220 : 0, transition: 'width 0.15s ease', backgroundColor: '#fafaf9' }}>
            {filtersOpen && (
              <div className="px-4 py-3">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1.5">
                    <SlidersHorizontal className="w-3 h-3 text-[#a8a29e]" />
                    <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, fontWeight: 600, color: '#a8a29e', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Filtres
                    </span>
                    {activeFilterCount > 0 && (
                      <span className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full text-[10px] font-bold text-white" style={{ backgroundColor: '#b9703f' }}>
                        {activeFilterCount}
                      </span>
                    )}
                  </div>
                  {activeFilterCount > 0 && (
                    <button onClick={clearFilters} className="text-[10px] text-[#b9703f] hover:underline font-medium">
                      Réinitialiser
                    </button>
                  )}
                </div>

                <FilterSection title="Juridiction">
                  {ALL_JURISDICTIONS.map(j => (
                    <FilterCheckbox key={j} label={j} checked={filters.jurisdictions.includes(j)} onChange={() => toggleFilter('jurisdictions', j)} />
                  ))}
                </FilterSection>

                <FilterSection title="Poste">
                  {ALL_POSTES.map(p => (
                    <FilterCheckbox
                      key={p}
                      label={<span><strong style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10 }}>{p}</strong> <span className="text-[#78716c]">{POSTE_LABEL_MAP[p] || p}</span></span>}
                      checked={filters.postes.includes(p)}
                      onChange={() => toggleFilter('postes', p)}
                    />
                  ))}
                </FilterSection>

                <FilterSection title="Période">
                  <div className="space-y-2">
                    <div>
                      <label className="text-[10px] text-[#a8a29e] uppercase font-medium" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>Du</label>
                      <input type="date" value={filters.dateFrom} onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                        className="w-full mt-1 px-2 py-1.5 rounded-md border border-[#e7e5e3] bg-white text-[12px] text-[#292524] focus:outline-none focus:border-[#b9a07a]" />
                    </div>
                    <div>
                      <label className="text-[10px] text-[#a8a29e] uppercase font-medium" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>Au</label>
                      <input type="date" value={filters.dateTo} onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                        className="w-full mt-1 px-2 py-1.5 rounded-md border border-[#e7e5e3] bg-white text-[12px] text-[#292524] focus:outline-none focus:border-[#b9a07a]" />
                    </div>
                  </div>
                </FilterSection>
              </div>
            )}
          </div>

          {/* Results area */}
          <div className="flex-1 overflow-y-auto min-w-0">
            {/* Toolbar */}
            <div className="sticky top-0 z-10 px-5 py-2.5 border-b border-[#e7e5e3] flex items-center justify-between" style={{ backgroundColor: '#F8F7F5' }}>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setFiltersOpen(!filtersOpen)}
                  className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[12px] font-medium text-[#78716c] hover:bg-[#eeece6] transition-colors"
                >
                  <SlidersHorizontal className="w-3 h-3" />
                  Filtres
                  {activeFilterCount > 0 && (
                    <span className="ml-0.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-[10px] font-bold text-white" style={{ backgroundColor: '#b9703f' }}>
                      {activeFilterCount}
                    </span>
                  )}
                </button>
                <span className="text-[12px] text-[#a8a29e]">
                  {results.length} résultat{results.length !== 1 ? 's' : ''}
                </span>
              </div>
              </div>

            {/* Cards grid */}
            <div className="px-5 py-3">
              {results.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <Search className="w-8 h-8 text-stone-300 mb-3" strokeWidth={1.5} />
                  <p className="text-[14px] text-[#a8a29e]">Aucun résultat trouvé</p>
                  <p className="text-[12px] text-[#d6d3d1] mt-1">Essayez d'élargir vos critères de recherche</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 10 }}>
                  {results.map(d => {
                    const isPinned = pinnedIds.has(d.id);
                    const isSelected = d.id === selectedDecisionId;
                    return (
                      <JPSearchResultCard
                        key={d.id}
                        decision={d}
                        isPinned={isPinned}
                        isSelected={isSelected}
                        onOpen={() => onOpenDrawer?.(d.id, results.map(r => r.id))}
                        onPin={() => isPinned ? onUnpin?.(d.id) : onPin?.(d.id)}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
