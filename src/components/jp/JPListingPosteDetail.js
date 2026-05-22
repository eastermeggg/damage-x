import React from 'react';
import { Landmark, Search } from 'lucide-react';
import { getDecisionsByIds } from '../../data/mockDecisions';
import JPRow from './JPRow';
import EmptyState from '../EmptyState';

// Section wrapper for PosteDetailView. Renders:
//   - Section header  : "Jurisprudences retenues" + count + search CTA
//   - Empty state     : icon + message + "Rechercher une JP" button
//   - Rows            : stack of JPRow with `asCard` (each row = own card chrome)
//
// Designed for chat-narrow widths where the column-aligned mini-table is too
// dense. Each card stands alone with its own border + shadow.
//
// Props:
//   - pinnedJP[]         : [{ decisionId, posteIds[] }] — used to derive decisions
//   - decisionsOverride[]: skip the lookup and pass decisions directly
//   - selectedDecisionId : id whose card renders in the selected state
//   - currentPosteId     : pick the amount matching this poste
//   - getFavorited(id)   : (decisionId) => bool — show ⭐ for this row
//   - getBookmarked(id)  : (decisionId) => bool — show 🔖 for this row
//   - getRationale(id)   : (decisionId) => string|null — POURQUOI? block content
//   - getPosteChips(id)  : (decisionId) => string[]|null — render poste-acronym chips
//                          on line 2 right (cross-poste view) instead of the quantum
//   - onOpenDrawer(id, ids[]) : open the drawer with the result set
//   - onSearchJP()       : invoked from the header search link
//   - onEmptySearchJP()  : invoked from the empty state CTA (falls back to onSearchJP)
//   - sectionTitle       : optional override (default "Jurisprudences retenues")
//   - emptyMessage       : optional empty-state message override
//   - showHeader         : when false, drops the section header (parent owns it)

export default function JPListingPosteDetail({
  pinnedJP = [],
  decisionsOverride = null,
  selectedDecisionId = null,
  currentPosteId = null,
  getFavorited,
  getBookmarked,
  getRationale,
  getPosteChips,
  onOpenDrawer,
  onRemove,
  removeTitle,
  onSearchJP,
  onEmptySearchJP,
  sectionTitle = 'Jurisprudences retenues',
  emptyMessage = 'Aucune jurisprudence retenue',
  showHeader = true,
}) {
  const decisionIds = pinnedJP.map(p => p.decisionId);
  const decisions = decisionsOverride || getDecisionsByIds(decisionIds);

  const headerLabel = (
    <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, fontWeight: 500, color: '#78716c', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
      {sectionTitle}
    </span>
  );

  if (decisions.length === 0) {
    const emptyAction = onEmptySearchJP || onSearchJP;
    return (
      <div>
        {showHeader && <div style={{ marginBottom: 10 }}>{headerLabel}</div>}
        <div className="flex items-center justify-center" style={{ padding: '24px 0' }}>
          <EmptyState
            icon={Landmark}
            title={emptyMessage}
            description="L'agent privilégie vos JP de référence du cabinet, puis cherche dans Plato JP en fonction du contexte du dossier."
            primaryAction={emptyAction ? { label: 'Rechercher une JP', icon: Search, onClick: emptyAction } : undefined}
          />
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Section header */}
      {showHeader && (
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            {headerLabel}
            <span className="text-[11px] text-[#c8c5c0]">{decisions.length}</span>
          </div>
          {onSearchJP && (
            <button
              onClick={onSearchJP}
              className="inline-flex items-center gap-1.5 transition-colors"
              style={{
                height: 24, padding: '0 8px', borderRadius: 6,
                backgroundColor: 'transparent', color: '#78716c',
                border: 'none',
                fontFamily: "'Inter', system-ui, sans-serif",
                fontSize: 12, fontWeight: 500, lineHeight: '16px',
              }}
              onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#eeece6'; e.currentTarget.style.color = '#292524'; }}
              onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#78716c'; }}
            >
              <Search className="w-3 h-3" strokeWidth={2} />
              Rechercher
            </button>
          )}
        </div>
      )}
      {/* Floating cards — 2-column grid keeps the date/tags compact near the title. */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2" style={{ maxWidth: 960 }}>
        {decisions.map((d) => {
          const chips = getPosteChips ? getPosteChips(d.id) : null;
          return (
            <JPRow
              key={d.id}
              asCard
              decision={d}
              isSelected={d.id === selectedDecisionId}
              currentPosteId={currentPosteId}
              favorited={getFavorited ? !!getFavorited(d.id) : false}
              bookmarked={getBookmarked ? !!getBookmarked(d.id) : false}
              posteChips={chips}
              showAmount={!chips}
              rationale={getRationale ? getRationale(d.id) : null}
              onClick={() => onOpenDrawer?.(d.id, decisionIds)}
              onRemove={onRemove ? (dec) => onRemove(dec.id) : undefined}
              removeTitle={removeTitle}
            />
          );
        })}
      </div>
    </div>
  );
}
