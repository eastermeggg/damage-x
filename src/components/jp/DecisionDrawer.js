import React, { useState, useRef, useEffect } from 'react';
import {
  X, ChevronRight, ChevronDown, ExternalLink, Download, Bookmark, Search, Tag,
  Landmark, Calendar, Hash, FileText, Heart, Scale, LinkIcon,
  User, Check, FileUp, AlertTriangle, Edit3,
} from 'lucide-react';
import { getDecisionById, getPrimaryAmount, formatDateLong } from '../../data/mockDecisions';
import SaveDestinationPopover from './SaveDestinationPopover';

const fmt = (v) => v.toLocaleString('fr-FR');

// Splits "28 €/h", "2 350 €/pt", "42 350 €" → { num, unit }.
const splitValue = (display) => {
  if (!display) return { num: '—', unit: '' };
  const m = display.match(/^([\d\s ,.]+?)\s+([^0-9]+)$/);
  return m ? { num: m[1].trim(), unit: m[2].trim() } : { num: display, unit: '' };
};

// ─── Subcomponents ────────────────────────────────────────────────────

function SidebarSectionHeader({ label, icon }) {
  return (
    <div className="flex items-center gap-1.5">
      {icon && <span className="text-[#78716c]">{icon}</span>}
      <span style={{
        fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, fontWeight: 500,
        color: '#78716c', textTransform: 'uppercase', lineHeight: 'normal',
      }}>
        {label}
      </span>
    </div>
  );
}


export default function DecisionDrawer({
  decisionId,
  resultSet = [],
  resultIndex = 0,
  isPinned = false,
  onClose,
  onPrev,
  onNext,
  onPin,
  onUnpin,
  onAttachToPoste,
  // Org-level (workspace / JP de référence du cabinet) save state + toggle
  workspacePinned = false,
  onToggleWorkspace,
  // Matter-transverse save state + toggle (attached to the dossier without a
  // specific poste). Independent from per-poste attachments.
  matterPinned = false,
  onToggleMatter,
  posteOptions = [],
  pinnedPosteIds = [],
  // When true, render as a canvas page (full-area, no fixed positioning, no
  // backdrop, no slide-in). When false (default), render as a right-side overlay.
  inline = false,
  // Full attachment list for the Attachements section.
  attachments = [],
  onRemoveAttachment,
  // Postes the user asked about (from chat prompt context or current poste view).
  // When set, the "Montants retenus" sidebar section filters to only these
  // postes — answers the user's question first. Empty/undefined = show all.
  highlightPosteIds = null,
  // Fiche cabinet preview mode — drives a PDF preview + metadata sidebar
  // when the decision is a non-canonical customJP completed via the modal.
  customJP = null,
  onEditFiche,
  // Rationale ("POURQUOI ?") for the most-relevant attachment scope.
  // App wires this from the matter+highlightedPoste attachment when available,
  // else matter-transverse. Empty = no rationale yet (shows "add" affordance).
  rationale = null,
  onSaveRationale,
  // When true (with autoOpenSaveKey changing), mount the Sauver popover open.
  // Used by JP Tab cards to route "remove" intent through the popover.
  autoOpenSavePopover = false,
  autoOpenSaveKey = 0,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSection, setActiveSection] = useState(null);
  const [showPosteDropdown, setShowPosteDropdown] = useState(false);

  // Honor autoOpenSavePopover whenever the open-nonce changes — covers the case
  // where the user clicks two different JP-Tab cards in a row.
  useEffect(() => {
    if (autoOpenSavePopover) setShowPosteDropdown(true);
  }, [autoOpenSavePopover, autoOpenSaveKey]);
  const [searchMatchCount, setSearchMatchCount] = useState(0);
  const [rationaleEditing, setRationaleEditing] = useState(false);
  const [rationaleDraft, setRationaleDraft] = useState(rationale || '');
  // Per-section collapse state — start with all open
  const [collapsedSections, setCollapsedSections] = useState({});
  const textPanelRef = useRef(null);
  const sectionRefs = useRef({});

  // Keep draft in sync if parent rationale changes (different scope / save from chat)
  useEffect(() => { setRationaleDraft(rationale || ''); }, [rationale]);

  const ficheMode = !!customJP && !customJP.canonicalId;
  const decision = ficheMode ? customJP : getDecisionById(decisionId);

  const hasResultSet = resultSet.length > 1;
  const canPrev = resultIndex > 0;
  const canNext = resultIndex < resultSet.length - 1;
  const hasDate = !!decision?.date && /^\d{4}-\d{2}-\d{2}/.test(decision.date);

  const sections = decision?.textSections || [];
  const themes = decision?.themes || [];
  const med = decision?.donneesMedicales;
  const prejudices = decision?.prejudices;
  const victime = decision?.victimProfile;
  const primaryAmount = decision ? getPrimaryAmount(decision) : null;

  // Highlight search matches
  const highlightText = (text) => {
    if (!searchQuery.trim()) return text;
    try {
      const regex = new RegExp(`(${searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
      const parts = text.split(regex);
      return parts.map((part, i) =>
        regex.test(part)
          ? <mark key={i} style={{ backgroundColor: '#fde68a', borderRadius: 2, padding: '0 2px', color: '#292524' }}>{part}</mark>
          : part
      );
    } catch { return text; }
  };

  // Count matches when search changes
  useEffect(() => {
    if (!decision || !searchQuery.trim()) { setSearchMatchCount(0); return; }
    try {
      const regex = new RegExp(searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
      const allText = (decision.fullText || '') + ' ' + sections.map(s => s.content).join(' ');
      const matches = allText.match(regex);
      setSearchMatchCount(matches ? matches.length : 0);
    } catch { setSearchMatchCount(0); }
  }, [searchQuery, decision, sections]);

  const scrollToSection = (sectionId) => {
    setActiveSection(sectionId);
    const el = sectionRefs.current[sectionId];
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Keyboard nav for drawer
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') onClose?.();
      if (e.key === 'ArrowLeft' && canPrev) onPrev?.();
      if (e.key === 'ArrowRight' && canNext) onNext?.();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose, onPrev, onNext, canPrev, canNext]);

  if (!decision) return null;

  // ─── Fiche cabinet preview mode ─────────────────────────────────────
  if (ficheMode) {
    const refLabel = customJP.reference || `${customJP.jurisdiction || ''} ${customJP.numero || ''}`.trim();
    const showPdf = !!customJP.pdfDataURL;
    const showUrl = !showPdf && !!customJP.url;
    return (
      <>
        <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 29, backgroundColor: 'rgba(41, 37, 36, 0.12)' }} />
        <div className="fixed right-0 top-0 h-screen bg-white border-l border-[#e7e5e3] shadow-xl z-30 flex flex-col"
             style={{ width: 820, animation: 'slideInRight 0.2s ease-out' }}>

          {/* Top bar */}
          <div className="px-4 py-2.5 border-b border-[#e7e5e3] flex items-center justify-between flex-shrink-0 bg-white">
            <div className="flex items-center gap-1.5">
              <Landmark className="w-3.5 h-3.5 text-[#b9703f]" />
              <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, fontWeight: 600, color: '#b9703f', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                Fiche cabinet
              </span>
            </div>
            <div className="flex items-center gap-0.5">
              {onEditFiche && (
                <button
                  onClick={() => onEditFiche(customJP)}
                  className="inline-flex items-center gap-1.5 px-2 py-1.5 rounded-md text-[12px] font-medium text-[#78716c] hover:text-[#292524] hover:bg-[#eeece6] transition-colors"
                >
                  <Edit3 className="w-3 h-3" /> Modifier
                </button>
              )}
              <div className="w-px h-4 bg-[#e7e5e3] mx-1" />
              <button onClick={onClose} className="p-1.5 text-[#a8a29e] hover:text-[#78716c] hover:bg-[#eeece6] rounded-md transition-colors">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Two-column body: PDF preview (left) + metadata sidebar (right) */}
          <div className="flex flex-1 min-h-0 overflow-hidden">
            {/* Left: PDF preview */}
            <div className="flex-1 overflow-hidden border-r border-[#e7e5e3]" style={{ backgroundColor: '#fafaf9' }}>
              {showPdf ? (
                <iframe
                  title="PDF de la décision"
                  src={customJP.pdfDataURL}
                  className="w-full h-full"
                  style={{ border: 'none' }}
                />
              ) : showUrl ? (
                <div className="flex flex-col items-center justify-center h-full px-6 text-center">
                  <ExternalLink className="w-8 h-8 text-[#d6d3d1] mb-3" strokeWidth={1.5} />
                  <p className="text-[13px] text-[#44403c] mb-1">Décision hébergée en ligne</p>
                  <a href={customJP.url} target="_blank" rel="noopener noreferrer"
                     className="text-[12px] text-[#1e3a8a] underline break-all max-w-[400px]">
                    {customJP.url}
                  </a>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full px-6 text-center">
                  <FileText className="w-8 h-8 text-[#d6d3d1] mb-3" strokeWidth={1.5} />
                  <p className="text-[13px] text-[#78716c]">Aucun PDF ou lien fourni</p>
                  {customJP.pdfFileName && (
                    <p className="text-[12px] text-[#a8a29e] mt-1">Référence : {customJP.pdfFileName}</p>
                  )}
                </div>
              )}
            </div>

            {/* Right: metadata sidebar */}
            <div className="w-[300px] flex-shrink-0 overflow-y-auto bg-white">
              <div className="px-5 py-4 border-b border-[#f0efed]">
                <SidebarSectionHeader label="Référence" />
                <p style={{ fontFamily: "'EB Garamond', Georgia, serif", fontSize: 18, fontWeight: 400, color: '#292524', lineHeight: '24px', marginTop: 8 }}>
                  {customJP.jurisdiction}{customJP.chambre ? ` · ${customJP.chambre}` : ''}
                </p>
                <div className="mt-2 space-y-1">
                  {customJP.numero && (
                    <div className="flex items-center gap-1.5">
                      <Hash className="w-3 h-3 text-[#a8a29e]" />
                      <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: '#78716c' }}>{customJP.numero}</span>
                    </div>
                  )}
                  {customJP.date && (
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3 h-3 text-[#a8a29e]" />
                      <span style={{ fontSize: 12, color: '#78716c' }}>{customJP.date}</span>
                    </div>
                  )}
                </div>
                {refLabel && refLabel !== `${customJP.jurisdiction} ${customJP.numero}` && (
                  <p style={{ fontSize: 11, color: '#a8a29e', marginTop: 8, fontStyle: 'italic' }}>
                    {refLabel}
                  </p>
                )}
              </div>

              {customJP.impact && (
                <div className="px-5 py-4 border-b border-[#f0efed]">
                  <SidebarSectionHeader label="Apport de la décision" />
                  <p style={{ fontSize: 13, color: '#44403c', lineHeight: '20px', marginTop: 8 }}>
                    {customJP.impact}
                  </p>
                </div>
              )}

              <div className="px-5 py-4 border-b border-[#f0efed]">
                <SidebarSectionHeader label="Source" />
                <div className="mt-2 space-y-1.5">
                  {customJP.pdfFileName && (
                    <div className="flex items-center gap-1.5">
                      <FileText className="w-3 h-3 text-[#a8a29e] flex-shrink-0" />
                      <span style={{ fontSize: 12, color: '#44403c' }} className="truncate">{customJP.pdfFileName}</span>
                    </div>
                  )}
                  {customJP.url && (
                    <div className="flex items-center gap-1.5">
                      <ExternalLink className="w-3 h-3 text-[#a8a29e] flex-shrink-0" />
                      <a href={customJP.url} target="_blank" rel="noopener noreferrer"
                         style={{ fontSize: 12, color: '#1e3a8a' }} className="truncate underline">
                        {customJP.url}
                      </a>
                    </div>
                  )}
                  {!customJP.pdfFileName && !customJP.url && (
                    <p style={{ fontSize: 12, color: '#a8a29e' }}>Aucune source attachée</p>
                  )}
                </div>
              </div>

              <div className="px-5 py-4">
                <SidebarSectionHeader label="Statut" />
                <div className="mt-2">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium"
                    style={{ backgroundColor: '#fdf3ec', color: '#b9703f' }}>
                    <Check className="w-2.5 h-2.5" strokeWidth={2.5} />
                    Fiche cabinet
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  const tempTotal = prejudices?.temporaires?.reduce((s, p) => s + p.montant, 0) || 0;
  const permTotal = prejudices?.permanents?.reduce((s, p) => s + p.montant, 0) || 0;

  return (
    <>
      {/* Backdrop — overlay mode only */}
      {!inline && (
        <div
          onClick={onClose}
          style={{ position: 'fixed', inset: 0, zIndex: 29, backgroundColor: 'rgba(41, 37, 36, 0.12)' }}
        />
      )}

      {/* Drawer — fixed overlay (default) OR inline canvas page.
          Inline uses `flex-1 min-h-0` (not `h-full`) so it sits BELOW the matter
          top bar + tab strip in the parent flex column instead of overlapping
          them — otherwise the tabs become unclickable. */}
      <div
        className={inline
          ? 'w-full flex-1 min-h-0 bg-white flex flex-col'
          : 'fixed right-0 top-0 h-screen bg-white border-l border-[#e7e5e3] shadow-xl z-30 flex flex-col'
        }
        style={inline
          ? { animation: 'slideInRightSubtle 0.22s ease-out' }
          : { width: 820, animation: 'slideInRight 0.2s ease-out' }}
      >
        {/* ═══════════ TOP BAR ═══════════
            Row 1: prev/next (left) ······································· close (right)
            Row 2: Title (serif)
            Row 3: Subline (date · n° · Légifrance) ················· Sauvegarder button */}
        <div
          className="px-5 pt-3 pb-4 border-b border-[#e7e5e3] flex flex-col gap-2 flex-shrink-0"
          style={{ backgroundColor: '#f8f7f5' }}
        >
          {/* Row 1 — prev/next (left) · close (right) */}
          <div className="flex items-center justify-between">
            {hasResultSet ? (
              <div className="flex items-center gap-1 -ml-1">
                <button onClick={onPrev} disabled={!canPrev}
                  className={`p-1 rounded-md transition-colors ${canPrev ? 'text-[#78716c] hover:text-[#292524] hover:bg-[#eeece6]' : 'text-[#d6d3d1] cursor-not-allowed'}`}>
                  <ChevronRight className="w-3.5 h-3.5 rotate-180" />
                </button>
                <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: '#a8a29e', minWidth: 36, textAlign: 'center' }}>
                  {resultIndex + 1}/{resultSet.length}
                </span>
                <button onClick={onNext} disabled={!canNext}
                  className={`p-1 rounded-md transition-colors ${canNext ? 'text-[#78716c] hover:text-[#292524] hover:bg-[#eeece6]' : 'text-[#d6d3d1] cursor-not-allowed'}`}>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : <span />}
            <button
              onClick={onClose}
              title="Fermer"
              aria-label="Fermer"
              className="p-1.5 -mr-1 rounded-md text-[#78716c] hover:text-[#292524] hover:bg-[#eeece6] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Row 2 — Title (serif) */}
          <h1
            className="truncate"
            style={{
              fontFamily: "'RL Para Trial Central', Georgia, 'Times New Roman', serif",
              fontSize: 18, fontWeight: 500, color: '#292524',
              letterSpacing: '-0.5px', lineHeight: '20px', margin: 0,
            }}
          >
            {decision.jurisdiction}
            {decision.chambre ? ` - ${decision.chambre}` : ''}
            {hasDate ? ` - ${formatDateLong(decision.date)}` : ''}
          </h1>

          {/* Row 3 — Subline (left) · Sauvegarder (right) */}
          <div className="flex items-end justify-between gap-3">
            <div className="flex items-center flex-wrap min-w-0" style={{ gap: 16, minHeight: 18 }}>
              {hasDate && (
                <div className="flex items-center" style={{ gap: 6 }}>
                  <Calendar className="w-3 h-3 flex-shrink-0" style={{ color: '#78716c' }} />
                  <span style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: 12, lineHeight: '18px', color: '#292524', whiteSpace: 'nowrap' }}>
                    {formatDateLong(decision.date)}
                  </span>
                </div>
              )}
              {decision.numero && (
                <div className="flex items-center" style={{ gap: 6 }}>
                  <Hash className="w-3 h-3 flex-shrink-0" style={{ color: '#78716c' }} />
                  <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, lineHeight: '18px', color: '#78716c', whiteSpace: 'nowrap' }}>
                    {decision.numero}
                  </span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {/* PDF — outlined pill action */}
              {decision.legifranceUrl && (
                <a
                  href={decision.legifranceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Télécharger le PDF"
                  aria-label="Télécharger le PDF"
                  className="inline-flex items-center gap-1.5 transition-all"
                  style={{
                    height: 32, padding: '0 10px', borderRadius: 8,
                    backgroundColor: 'transparent', color: '#44403c',
                    border: '1px solid #d6d3d1', fontSize: 13, fontWeight: 500,
                  }}
                  onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#eeece6'; }}
                  onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                >
                  <Download className="w-4 h-4" strokeWidth={1.75} />
                  PDF
                </a>
              )}
              {/* Sauver — outlined pill (default) / filled dark (saved) */}
              <div className="relative">
                <button
                  onClick={() => setShowPosteDropdown(!showPosteDropdown)}
                  title={(isPinned || workspacePinned) ? 'Sauvegardée — modifier' : 'Sauver'}
                  aria-label={(isPinned || workspacePinned) ? 'Sauvegardée — modifier' : 'Sauver'}
                  className="inline-flex items-center gap-1.5 transition-all"
                  style={(isPinned || workspacePinned)
                    ? {
                        height: 32, padding: '0 10px', borderRadius: 8,
                        backgroundColor: '#292524', color: 'white',
                        border: '1px solid #292524', fontSize: 13, fontWeight: 500,
                      }
                    : {
                        height: 32, padding: '0 10px', borderRadius: 8,
                        backgroundColor: 'transparent', color: '#44403c',
                        border: '1px solid #d6d3d1', fontSize: 13, fontWeight: 500,
                      }}
                  onMouseOver={(e) => {
                    if (isPinned || workspacePinned) {
                      e.currentTarget.style.backgroundColor = '#1c1917';
                      e.currentTarget.style.borderColor = '#1c1917';
                    } else {
                      e.currentTarget.style.backgroundColor = '#eeece6';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (isPinned || workspacePinned) {
                      e.currentTarget.style.backgroundColor = '#292524';
                      e.currentTarget.style.borderColor = '#292524';
                    } else {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  <Bookmark className="w-4 h-4" strokeWidth={1.75} style={(isPinned || workspacePinned) ? { fill: 'currentColor' } : {}} />
                  {(isPinned || workspacePinned) ? 'Sauvegardée' : 'Sauver'}
                </button>
                {showPosteDropdown && (
                  <SaveDestinationPopover
                    workspacePinned={workspacePinned}
                    onToggleWorkspace={onToggleWorkspace ? () => onToggleWorkspace(decision.id) : undefined}
                    matterPinned={matterPinned}
                    onToggleMatter={onToggleMatter ? () => onToggleMatter(decision.id) : undefined}
                    assignedPosteIds={pinnedPosteIds}
                    posteOptions={posteOptions}
                    onTogglePoste={(posteId) => onAttachToPoste?.(decision.id, posteId)}
                    onClose={() => setShowPosteDropdown(false)}
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ═══════════ SEARCH BAR — flat row (Figma 36765:49265) ═══════════ */}
        <div className="flex items-center gap-2 px-5 py-3 border-b border-[#e7e5e3] flex-shrink-0">
          <Search className="w-4 h-4 flex-shrink-0" strokeWidth={1.5} style={{ color: '#78716c', opacity: 0.6 }} />
          <input
            type="text" placeholder="Rechercher dans la décision…"
            value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent focus:outline-none"
            style={{
              fontFamily: "'Inter', system-ui, sans-serif",
              fontSize: 14, fontWeight: 400, lineHeight: '20px', color: '#292524',
            }}
          />
          {searchQuery && (
            <div className="flex items-center gap-2 flex-shrink-0">
              <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: '#78716c' }}>
                {searchMatchCount} résultat{searchMatchCount !== 1 ? 's' : ''}
              </span>
              <button onClick={() => setSearchQuery('')} className="p-0.5 hover:bg-[#eeece6] rounded transition-colors">
                <X className="w-3 h-3 text-[#a8a29e]" />
              </button>
            </div>
          )}
        </div>

        {/* ═══════════ TWO-COLUMN BODY ═══════════ */}
        <div className="flex flex-1 min-h-0 overflow-hidden">

          {/* ── LEFT: Résumé + themes + texte intégral (Figma 36765:49265) ─────────── */}
          <div ref={textPanelRef} className="flex-1 overflow-y-auto border-r border-[#e7e5e3]" style={{ minWidth: 0 }}>

            {/* Résumé */}
            <div className="border-b border-[#e7e5e3]" style={{ padding: '20px 24px' }}>
              <div style={{ marginBottom: 10 }}>
                <SidebarSectionHeader label="Résumé" />
              </div>
              <p style={{
                fontFamily: "'Inter', system-ui, sans-serif",
                fontSize: 14, fontWeight: 400, lineHeight: '24px',
                color: '#292524', margin: 0,
              }}>
                {highlightText(decision.resume)}
              </p>
            </div>

            {/* Themes */}
            {themes.length > 0 && (
              <div className="border-b border-[#e7e5e3]" style={{ padding: '20px 24px' }}>
                <div style={{ marginBottom: 10 }}>
                  <SidebarSectionHeader label="Thèmes" />
                </div>
                <div className="flex flex-wrap" style={{ gap: 8 }}>
                  {themes.map((t, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center justify-center"
                      style={{
                        backgroundColor: '#dfe8f5',
                        color: '#1e3a8a',
                        fontFamily: "'Inter', system-ui, sans-serif",
                        fontSize: 12, fontWeight: 500, lineHeight: '16px',
                        padding: '2px 8px', borderRadius: 6,
                      }}
                    >
                      {t.label}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* TEXTE INTÉGRAL — tabs */}
            {sections.length > 0 && (
              <div className="sticky top-0 z-10 border-b border-[#e7e5e3] bg-white" style={{ padding: '20px 24px 0 24px' }}>
                <div style={{ marginBottom: 10 }}>
                  <SidebarSectionHeader label="Texte intégral" />
                </div>
                <div className="flex items-start" style={{ gap: 16 }}>
                  {sections.map((s) => {
                    const isActive = activeSection === s.id;
                    return (
                      <button
                        key={s.id}
                        onClick={() => {
                          scrollToSection(s.id);
                          setCollapsedSections(prev => ({ ...prev, [s.id]: false }));
                        }}
                        className="flex flex-col items-center"
                        style={{ gap: 10 }}
                      >
                        <div className="flex items-center" style={{ gap: 6, paddingTop: 10 }}>
                          <span style={{
                            fontFamily: "'Inter', system-ui, sans-serif",
                            fontSize: 14, fontWeight: 500, lineHeight: '20px',
                            color: isActive ? '#292524' : '#78716c',
                            transition: 'color 0.15s',
                          }}>
                            {s.title}
                          </span>
                        </div>
                        <div
                          style={{
                            height: 2, width: '100%',
                            backgroundColor: isActive ? '#292524' : '#d6d3d1',
                            opacity: isActive ? 1 : 0,
                            borderTopLeftRadius: 30, borderTopRightRadius: 30,
                            transition: 'opacity 0.15s, background-color 0.15s',
                          }}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Sections — each with accent bar + chevron + Inter title */}
            {sections.length > 0 ? (
              <div>
                {sections.map((section) => {
                  const isCollapsed = !!collapsedSections[section.id];
                  return (
                    <div
                      key={section.id}
                      ref={(el) => sectionRefs.current[section.id] = el}
                      className="border-b border-[#f0efed] flex flex-col items-start w-full"
                      style={{ padding: 24, gap: 24 }}
                    >
                      <button
                        onClick={() => setCollapsedSections(prev => ({ ...prev, [section.id]: !prev[section.id] }))}
                        className="flex items-center w-full text-left"
                        style={{ gap: 8 }}
                      >
                        <div style={{ width: 2, alignSelf: 'stretch', backgroundColor: '#b9703f', opacity: 0.6 }} />
                        <ChevronDown
                          className="flex-shrink-0"
                          style={{
                            width: 16, height: 16, color: '#78716c',
                            transform: isCollapsed ? 'rotate(-90deg)' : 'none',
                            transition: 'transform 0.15s',
                          }}
                          strokeWidth={1.75}
                        />
                        <span style={{
                          fontFamily: "'Inter', system-ui, sans-serif",
                          fontSize: 14, fontWeight: 500, lineHeight: '20px',
                          color: '#292524',
                        }}>
                          {section.title}
                        </span>
                      </button>
                      {!isCollapsed && (
                        <p style={{
                          fontFamily: "'Inter', system-ui, sans-serif",
                          fontSize: 14, fontWeight: 400, lineHeight: '24px',
                          color: '#44403c', whiteSpace: 'pre-wrap', margin: 0,
                        }}>
                          {highlightText(section.content)}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Fallback: raw fullText */
              <div style={{ padding: 24 }}>
                <p style={{
                  fontFamily: "'Inter', system-ui, sans-serif",
                  fontSize: 14, fontWeight: 400, lineHeight: '24px',
                  color: '#44403c', whiteSpace: 'pre-wrap', margin: 0,
                }}>
                  {highlightText(decision.fullText || 'Texte intégral non disponible.')}
                </p>
              </div>
            )}
          </div>

          {/* ── RIGHT: sidebar ────────────── */}
          <div className="overflow-y-auto flex-shrink-0" style={{ width: 300, backgroundColor: '#fafaf9' }}>

            {/* POURQUOI ? — editable rationale for the current scope.
                Only shown when the JP has been saved at least once — without a save
                there's no attachment to attach the rationale to. */}
            {onSaveRationale && attachments.length > 0 && (
              <div className="px-4 pt-4 pb-3 border-b border-[#f0efed]">
                <div className="flex items-center justify-between mb-2">
                  <SidebarSectionHeader label="Note de pertinence" />
                  {!rationaleEditing && rationale && (
                    <button
                      onClick={() => setRationaleEditing(true)}
                      className="p-1 rounded text-[#a8a29e] hover:text-[#78716c] hover:bg-[#eeece6] transition-colors"
                      title="Modifier"
                    >
                      <Edit3 className="w-3 h-3" />
                    </button>
                  )}
                </div>
                {rationaleEditing ? (
                  <div className="bg-white border border-[#e7e5e3] rounded-md p-2">
                    <textarea
                      autoFocus
                      value={rationaleDraft}
                      onChange={(e) => setRationaleDraft(e.target.value)}
                      placeholder="En quoi cette décision est-elle pertinente pour ce poste ?"
                      rows={4}
                      style={{
                        width: '100%',
                        border: 'none',
                        outline: 'none',
                        resize: 'vertical',
                        fontFamily: "'Inter', system-ui, sans-serif",
                        fontSize: 12, lineHeight: '18px', color: '#44403c',
                        backgroundColor: 'transparent',
                      }}
                    />
                    <div className="flex items-center justify-end gap-1.5 mt-1.5 pt-1.5 border-t border-[#f0efed]">
                      <button
                        onClick={() => { setRationaleDraft(rationale || ''); setRationaleEditing(false); }}
                        className="px-2 py-1 text-[12px] text-[#78716c] hover:text-[#292524] rounded transition-colors"
                      >
                        Annuler
                      </button>
                      <button
                        onClick={() => { onSaveRationale(rationaleDraft.trim() || null); setRationaleEditing(false); }}
                        className="px-2.5 py-1 text-[12px] font-medium text-white bg-[#292524] hover:opacity-90 rounded transition-opacity"
                      >
                        Enregistrer
                      </button>
                    </div>
                  </div>
                ) : rationale ? (
                  <div style={{ borderLeft: '2px solid #ac9e8b', paddingLeft: 12, paddingTop: 4, paddingBottom: 4 }}>
                    <p style={{
                      fontFamily: "'Inter', system-ui, sans-serif",
                      fontSize: 12, lineHeight: '18px', color: '#44403c', margin: 0,
                    }}>
                      {rationale}
                    </p>
                  </div>
                ) : (
                  <button
                    onClick={() => setRationaleEditing(true)}
                    className="w-full text-left px-3 py-2 bg-white border border-dashed border-[#d6d3d1] hover:border-[#b9703f] hover:bg-[#fdf8f4] rounded-md transition-colors"
                    style={{
                      fontFamily: "'Inter', system-ui, sans-serif",
                      fontSize: 12, color: '#a8a29e',
                    }}
                  >
                    + Ajouter une note sur la pertinence
                  </button>
                )}
              </div>
            )}

            {/* Montants retenus — dynamic: filters to the postes the user asked about */}
            {(() => {
              const allAmounts = decision.amounts || [];
              const norm = (s) => String(s || '').toLowerCase();
              const filtered = highlightPosteIds && highlightPosteIds.length > 0
                ? allAmounts.filter(a => highlightPosteIds.some(p => norm(p) === norm(a.poste)))
                : allAmounts;
              const visible = filtered.length > 0 ? filtered : allAmounts;
              const isFiltered = filtered.length > 0 && filtered.length < allAmounts.length;
              return (
                <div className="px-4 pt-4 pb-3 border-b border-[#f0efed]">
                  <SidebarSectionHeader label="Montants retenus" />
                  {isFiltered && (
                    <p style={{ fontSize: 11, color: '#a8a29e', marginTop: 4, marginBottom: 6 }}>
                      Filtré sur le{filtered.length > 1 ? 's' : ''} poste{filtered.length > 1 ? 's' : ''} demandé{filtered.length > 1 ? 's' : ''}
                    </p>
                  )}
                  <div className="mt-2 bg-white border border-[#f0efed] rounded-md overflow-hidden">
                    {visible.map((amt, i) => {
                      const { num, unit } = splitValue(amt.displayValue);
                      return (
                        <div key={i} className="flex items-center justify-between px-3 py-2"
                          style={{ borderBottom: i < visible.length - 1 ? '1px solid #f0efed' : 'none' }}>
                          <span title={amt.label} style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, fontWeight: 500, color: '#44403c' }}>
                            {amt.poste}
                          </span>
                          <span className="flex-shrink-0" style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 14, fontWeight: 600, color: '#292524' }}>
                            {num}{unit && <span style={{ color: '#b9703f', marginLeft: 4, fontWeight: 500 }}>{unit}</span>}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}

            {/* Profil victime */}
            <div className="px-4 py-3 border-b border-[#f0efed]">
              <SidebarSectionHeader label="Profil victime" />
              {victime ? (
                <div className="mt-2 bg-white border border-[#f0efed] rounded-md overflow-hidden">
                  <div className="flex items-center justify-between px-3 py-2" style={{ borderBottom: '1px solid #f0efed' }}>
                    <span style={{ fontSize: 12, color: '#78716c' }}>Victime</span>
                    <span style={{ fontSize: 14, fontWeight: 500, color: '#292524' }}>{victime}</span>
                  </div>
                  {decision.category && (
                    <div className="flex items-center justify-between px-3 py-2" style={{ borderBottom: decision.status ? '1px solid #f0efed' : 'none' }}>
                      <span style={{ fontSize: 12, color: '#78716c' }}>Catégorie</span>
                      <span style={{ fontSize: 14, fontWeight: 500, color: '#292524' }}>{decision.category}</span>
                    </div>
                  )}
                  {decision.status && (
                    <div className="flex items-center justify-between px-3 py-2">
                      <span style={{ fontSize: 12, color: '#78716c' }}>Statut</span>
                      <span style={{ fontSize: 14, fontWeight: 500, color: '#292524' }}>{decision.status}</span>
                    </div>
                  )}
                </div>
              ) : (
                <p style={{ fontSize: 12, color: '#a8a29e', marginTop: 8 }}>Données non disponibles.</p>
              )}
            </div>

            {/* Consolidation + données médicales */}
            {(med?.consolidation || med?.items?.length > 0) && (
              <div className="px-4 py-3 border-b border-[#f0efed]">
                <SidebarSectionHeader label="Données médicales" />
                <div className="mt-2 bg-white border border-[#f0efed] rounded-md overflow-hidden">
                  {med?.consolidation && (
                    <div className="flex items-center justify-between px-3 py-2"
                      style={{ borderBottom: med?.items?.length > 0 ? '1px solid #f0efed' : 'none' }}>
                      <span style={{ fontSize: 12, color: '#78716c' }}>Consolidation</span>
                      <span style={{ fontSize: 14, fontWeight: 500, color: '#292524' }}>{med.consolidation}</span>
                    </div>
                  )}
                  {med?.items?.map((item, i) => (
                    <div key={i} className="px-3 py-2"
                      style={{ borderBottom: i < med.items.length - 1 ? '1px solid #f0efed' : 'none' }}>
                      <div style={{ fontSize: 14, fontWeight: 500, color: '#292524' }}>{item.label}</div>
                      <div style={{ fontSize: 12, color: '#78716c', marginTop: 1 }}>{item.detail}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Préjudices temporaires */}
            {prejudices?.temporaires?.length > 0 && (
              <div className="px-4 py-3 border-b border-[#f0efed]">
                <SidebarSectionHeader label="Extra-patrimoniaux temporaires" />
                <div className="mt-2 bg-white border border-[#f0efed] rounded-md overflow-hidden">
                  {prejudices.temporaires.map((p, i) => (
                    <div key={i} className="flex items-center justify-between px-3 py-2"
                      style={{ borderBottom: '1px solid #f0efed' }}>
                      <span title={p.label} style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, fontWeight: 500, color: '#44403c' }}>
                        {p.label.split(' — ')[0]}
                      </span>
                      <span className="flex-shrink-0" style={{ fontSize: 14, fontWeight: 600, color: p.highlighted ? '#b9703f' : '#292524' }}>
                        {fmt(p.montant)} €
                      </span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between px-3 py-2" style={{ backgroundColor: '#fafaf9' }}>
                    <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, fontWeight: 600, color: '#78716c', textTransform: 'uppercase' }}>Total</span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#292524' }}>{fmt(tempTotal)} €</span>
                  </div>
                </div>
              </div>
            )}

            {/* Préjudices permanents */}
            {prejudices?.permanents?.length > 0 && (
              <div className="px-4 py-3 border-b border-[#f0efed]">
                <SidebarSectionHeader label="Extra-patrimoniaux permanents" />
                <div className="mt-2 bg-white border border-[#f0efed] rounded-md overflow-hidden">
                  {prejudices.permanents.map((p, i) => (
                    <div key={i} className="flex items-center justify-between px-3 py-2"
                      style={{ borderBottom: '1px solid #f0efed' }}>
                      <span title={p.label} style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, fontWeight: 500, color: '#44403c' }}>
                        {p.label.split(' — ')[0]}
                      </span>
                      <span className="flex-shrink-0" style={{ fontSize: 14, fontWeight: 600, color: p.highlighted ? '#b9703f' : '#292524' }}>
                        {fmt(p.montant)} €
                      </span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between px-3 py-2" style={{ backgroundColor: '#fafaf9' }}>
                    <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, fontWeight: 600, color: '#78716c', textTransform: 'uppercase' }}>Total</span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#292524' }}>{fmt(permTotal)} €</span>
                  </div>
                </div>
              </div>
            )}

            {/* Bottom spacer */}
            <div className="h-4" />
          </div>
        </div>

      </div>
    </>
  );
}
