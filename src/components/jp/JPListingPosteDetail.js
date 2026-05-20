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
//   - onSearchJP()       : invoked from the empty state CTA + header link
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
  sectionTitle = 'Jurisprudences retenues',
  emptyMessage = 'Aucune jurisprudence retenue',
  showHeader = true,
}) {
  const decisionIds = pinnedJP.map(p => p.decisionId);
  const decisions = decisionsOverride || getDecisionsByIds(decisionIds);

  const headerLabel = (
    <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, fontWeight: 500, color: '#78716c', textTransform: 'uppercase', letterSpacing: '1px' }}>
      {sectionTitle}
    </span>
  );

  if (decisions.length === 0) {
    return (
      <div>
        {showHeader && <div style={{ marginBottom: 10 }}>{headerLabel}</div>}
        <div className="flex items-center justify-center" style={{ padding: '24px 0' }}>
          <EmptyState
            icon={Landmark}
            title={emptyMessage}
            description="L'agent privilégie vos JP de référence du cabinet, puis cherche dans Plato JP en fonction du contexte du dossier."
            primaryAction={onSearchJP ? { label: 'Rechercher une JP', icon: Search, onClick: onSearchJP } : undefined}
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
            <span className="text-[12px] text-[#c8c5c0]">{decisions.length}</span>
          </div>
          {onSearchJP && (
            <button
              onClick={onSearchJP}
              className="inline-flex items-center gap-1 text-[12px] font-medium text-[#a8a29e] hover:text-[#78716c] transition-colors"
            >
              <Search className="w-3 h-3" />
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
