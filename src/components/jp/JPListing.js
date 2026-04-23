import React from 'react';
import { Plus, Landmark, ChevronRight, Search } from 'lucide-react';
import DECISIONS, { getDecisionsByIds, getPrimaryAmount, formatDateShort, getStats } from '../../data/mockDecisions';

const POSTE_LABEL_MAP = {};
DECISIONS.forEach(d => d.amounts.forEach(a => { if (!POSTE_LABEL_MAP[a.poste]) POSTE_LABEL_MAP[a.poste] = a.label; }));

export default function JPListing({
  pinnedJP = [],
  selectedDecisionId = null,
  showStats = false,
  onOpenDrawer,
  onAddClick,
  onSearchJP,
  posteLabel = '',
  compact = false,
}) {
  const decisionIds = pinnedJP.map(p => p.decisionId);
  const decisions = getDecisionsByIds(decisionIds);
  const posteIdsByDecision = Object.fromEntries(pinnedJP.map(p => [p.decisionId, p.posteIds || []]));
  const stats = showStats && decisions.length > 0 ? getStats(decisions) : null;

  const sectionTitle = 'Jurisprudences retenues';

  if (decisions.length === 0) {
    return (
      <div className={compact ? '' : 'p-4'} style={compact ? {} : { backgroundColor: '#F8F7F5' }}>
        <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, fontWeight: 500, color: '#78716c', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 10 }}>
          {sectionTitle}
        </div>
        <div className="flex flex-col items-center" style={{ padding: '16px 0' }}>
          <Landmark style={{ width: 18, height: 18, color: '#d6d3d1' }} strokeWidth={1.5} />
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: '#a8a29e', marginTop: 8 }}>
            Aucune jurisprudence retenue
          </span>
          {onSearchJP && (
            <button
              onClick={onSearchJP}
              className="inline-flex items-center justify-center transition-colors hover:opacity-90"
              style={{
                backgroundColor: '#292524',
                color: 'white',
                fontFamily: "'Inter', sans-serif",
                fontSize: 12,
                fontWeight: 500,
                height: 30,
                paddingLeft: 12,
                paddingRight: 12,
                borderRadius: 6,
                gap: 6,
                border: 'none',
                cursor: 'pointer',
                marginTop: 12,
              }}
            >
              <Search style={{ width: 13, height: 13 }} />
              Laisser Plato trouver une JP
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={compact ? '' : 'p-4'} style={compact ? {} : { backgroundColor: '#F8F7F5' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, fontWeight: 500, color: '#78716c', textTransform: 'uppercase', letterSpacing: '1px' }}>
            {sectionTitle}
          </span>
          <span className="text-[11px] text-[#c8c5c0]">{decisions.length}</span>
        </div>
        <div className="flex items-center gap-2">
          {onSearchJP && (
            <button
              onClick={onSearchJP}
              className="inline-flex items-center gap-1 text-[11px] font-medium text-[#a8a29e] hover:text-[#78716c] transition-colors"
            >
              <Search className="w-3 h-3" />
              Rechercher
            </button>
          )}
          {onAddClick && (
            <button
              onClick={onAddClick}
              className="inline-flex items-center gap-1 text-[11px] font-medium text-[#a8a29e] hover:text-[#78716c] transition-colors"
            >
              <Plus className="w-3 h-3" />
              Ajouter
            </button>
          )}
        </div>
      </div>

      {/* Cards */}
      <div className="space-y-1.5">
        {decisions.map((d) => {
          const isSelected = d.id === selectedDecisionId;
          const amt = getPrimaryAmount(d);
          const pIds = posteIdsByDecision[d.id] || [];
          return (
            <div
              key={d.id}
              onClick={() => onOpenDrawer?.(d.id, decisionIds)}
              className="group bg-white rounded cursor-pointer flex items-center gap-3 px-3 py-2.5"
              style={{
                boxShadow: isSelected
                  ? '0 0 0 1px #b9703f, 0 1px 4px rgba(185,112,63,0.08)'
                  : '0 1px 2px rgba(41,37,36,0.05)',
                transition: 'box-shadow 0.15s ease',
              }}
              onMouseOver={(e) => { if (!isSelected) e.currentTarget.style.boxShadow = '0 2px 6px rgba(41,37,36,0.07)'; }}
              onMouseOut={(e) => { if (!isSelected) e.currentTarget.style.boxShadow = '0 1px 2px rgba(41,37,36,0.05)'; }}
            >
              <Landmark className="w-3 h-3 text-[#b9703f] flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span style={{ fontSize: 14, color: '#292524', fontWeight: 500 }}>
                    {d.jurisdiction}{d.chambre ? ` · ${d.chambre}` : ''}
                  </span>
                  <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: '#c8c5c0', textTransform: 'uppercase' }}>
                    {formatDateShort(d.date)}
                  </span>
                  {pIds.length > 0 && pIds.slice(0, 3).map(pid => (
                    <span key={pid} className="badge badge-sm badge-secondary" title={POSTE_LABEL_MAP[pid] || pid}>
                      {pid.toUpperCase()}
                    </span>
                  ))}
                  {pIds.length > 3 && (
                    <span style={{ fontSize: 11, color: '#a8a29e' }}>+{pIds.length - 3}</span>
                  )}
                </div>
                <div className="truncate" style={{ fontSize: 12, color: '#a8a29e', marginTop: 1 }}>
                  {d.category}{d.victimProfile ? ` · ${d.victimProfile}` : ''}
                </div>
              </div>
              {amt && (
                <span className="badge badge-sm badge-secondary flex-shrink-0" title={POSTE_LABEL_MAP[amt.poste] || amt.poste}>
                  {amt.poste} : <span style={{ fontFamily: "'IBM Plex Mono', monospace", color: '#b9703f' }}>{amt.displayValue}</span>
                </span>
              )}
              <ChevronRight className="w-3 h-3 text-[#d6d3d1] group-hover:text-[#a8a29e] flex-shrink-0 transition-colors" />
            </div>
          );
        })}
      </div>

      {/* Footer stats */}
      {stats && (
        <div className="mt-2.5 flex items-center gap-3 text-[11px] text-[#a8a29e]">
          <span>Mediane <strong style={{ color: '#292524' }}>{stats.mediane}</strong></span>
          <span style={{ color: '#d6d3d1' }}>|</span>
          <span>Fourchette <strong style={{ color: '#292524' }}>{stats.fourchette}</strong></span>
        </div>
      )}
    </div>
  );
}
