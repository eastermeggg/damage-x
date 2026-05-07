import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ExternalLink, FileX2, Package, ArrowRight } from 'lucide-react';
import inventory from '../../data/designSystemInventory.json';
import { colors } from '../../design-system/tokens';
import InventoryRow from './InventoryRow';
import { getComponentDemo } from './componentDemos';

const STATUS_FILTERS = [
  { id: 'all',             label: 'All' },
  { id: 'pending',         label: 'Pending' },
  { id: 'validated',       label: 'Validated' },
  { id: 'needs-revision',  label: 'Needs revision' },
  { id: 'missing',         label: 'Missing' },
];

const CATEGORY_ORDER = ['primitive', 'composite', 'layout', 'domain'];
const CATEGORY_LABELS = {
  primitive: 'Primitives',
  composite: 'Composites',
  layout: 'Layout',
  domain: 'Domain-specific',
};

const CATEGORY_FILTERS = [
  { id: 'all',       label: 'All' },
  { id: 'primitive', label: 'Primitives' },
  { id: 'composite', label: 'Composites' },
  { id: 'layout',    label: 'Layout' },
  { id: 'domain',    label: 'Domain' },
];

const DEMO_FILTERS = [
  { id: 'all',         label: 'All' },
  { id: 'live',        label: 'Live demo' },
  { id: 'placeholder', label: 'Placeholder' },
  { id: 'none',        label: 'No demo' },
];

function getDemoState(id) {
  const demo = getComponentDemo(id);
  if (!demo) return 'none';
  if (demo.placeholder) return 'placeholder';
  if (demo.controls || demo.render) return 'live';
  return 'none';
}

export default function ComponentsInventorySection() {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [demoFilter, setDemoFilter] = useState('all');
  const [query, setQuery] = useState('');

  const components = inventory.components;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return components.filter(c => {
      if (statusFilter !== 'all' && c.status !== statusFilter) return false;
      if (categoryFilter !== 'all' && c.category !== categoryFilter) return false;
      if (demoFilter !== 'all' && getDemoState(c.id) !== demoFilter) return false;
      if (q) {
        const haystack = `${c.id} ${c.filePath || ''} ${c.notes || ''}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [components, statusFilter, categoryFilter, demoFilter, query]);

  const grouped = useMemo(() => {
    const out = new Map();
    CATEGORY_ORDER.forEach(cat => out.set(cat, []));
    filtered.forEach(c => {
      if (!out.has(c.category)) out.set(c.category, []);
      out.get(c.category).push(c);
    });
    // Drop empty groups
    return [...out.entries()].filter(([, items]) => items.length > 0);
  }, [filtered]);

  const statusCounts = useMemo(() => {
    const counts = { all: components.length, pending: 0, validated: 0, 'needs-revision': 0, missing: 0 };
    components.forEach(c => { counts[c.status] = (counts[c.status] || 0) + 1; });
    return counts;
  }, [components]);

  const demoCounts = useMemo(() => {
    const counts = { all: components.length, live: 0, placeholder: 0, none: 0 };
    components.forEach(c => { counts[getDemoState(c.id)] += 1; });
    return counts;
  }, [components]);

  return (
    <div>
      {/* Status filter pills */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
        {STATUS_FILTERS.map(f => {
          const active = statusFilter === f.id;
          return (
            <button
              key={f.id}
              onClick={() => setStatusFilter(f.id)}
              style={{
                padding: '5px 10px',
                borderRadius: 6,
                fontSize: 12,
                fontWeight: 500,
                color: active ? colors.semantic.white : colors.semantic.foregroundTertiary,
                backgroundColor: active ? colors.semantic.foreground : colors.semantic.cream,
                border: 'none',
                cursor: 'pointer',
              }}
            >
              {f.label}
              <span style={{ marginLeft: 6, opacity: 0.7 }}>{statusCounts[f.id]}</span>
            </button>
          );
        })}
      </div>

      {/* Demo filter pills */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center', marginBottom: 8 }}>
        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, fontWeight: 500, color: colors.semantic.foregroundMuted, textTransform: 'uppercase', letterSpacing: '0.05em', marginRight: 4 }}>
          Demo
        </span>
        {DEMO_FILTERS.map(f => {
          const active = demoFilter === f.id;
          return (
            <button
              key={f.id}
              onClick={() => setDemoFilter(f.id)}
              style={{
                padding: '5px 10px',
                borderRadius: 6,
                fontSize: 12,
                fontWeight: 500,
                color: active ? colors.semantic.white : colors.semantic.foregroundTertiary,
                backgroundColor: active ? colors.semantic.foreground : colors.semantic.cream,
                border: 'none',
                cursor: 'pointer',
              }}
            >
              {f.label}
              <span style={{ marginLeft: 6, opacity: 0.7 }}>{demoCounts[f.id]}</span>
            </button>
          );
        })}
      </div>

      {/* Category filter + search */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 16, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 4 }}>
          {CATEGORY_FILTERS.map(f => {
            const active = categoryFilter === f.id;
            return (
              <button
                key={f.id}
                onClick={() => setCategoryFilter(f.id)}
                style={{
                  padding: '4px 10px',
                  borderRadius: 6,
                  fontSize: 12,
                  fontWeight: 500,
                  color: active ? colors.semantic.foreground : colors.semantic.foregroundSecondary,
                  backgroundColor: active ? colors.semantic.backgroundSubtle : 'transparent',
                  border: `1px solid ${active ? colors.semantic.border : 'transparent'}`,
                  cursor: 'pointer',
                }}
              >
                {f.label}
              </button>
            );
          })}
        </div>

        <div style={{ position: 'relative', flex: 1, maxWidth: 320 }}>
          <Search style={{ position: 'absolute', left: 10, top: 9, width: 14, height: 14, color: colors.semantic.foregroundMuted }} />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search components…"
            style={{
              width: '100%',
              padding: '8px 12px 8px 32px',
              border: `1px solid ${colors.semantic.border}`,
              borderRadius: 6,
              fontSize: 13,
              color: colors.semantic.foreground,
              outline: 'none',
            }}
          />
        </div>
      </div>

      {/* Rows grouped by category */}
      <div style={{ borderTop: `1px solid ${colors.semantic.border}` }}>
        {grouped.map(([cat, items]) => (
          <div key={cat}>
            <div
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 11,
                fontWeight: 500,
                color: colors.semantic.foregroundMuted,
                textTransform: 'uppercase',
                letterSpacing: '1px',
                padding: '20px 0 8px 0',
              }}
            >
              {CATEGORY_LABELS[cat] || cat} <span style={{ opacity: 0.6 }}>· {items.length}</span>
            </div>
            {items.map(c => {
              const preview = c.exists ? (
                <div
                  style={{
                    width: 40, height: 40, borderRadius: 8,
                    backgroundColor: colors.semantic.cream,
                    border: `1px solid ${colors.semantic.border}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: colors.semantic.foregroundTertiary,
                  }}
                >
                  <Package style={{ width: 18, height: 18 }} strokeWidth={1.6} />
                </div>
              ) : (
                <div
                  style={{
                    width: 40, height: 40, borderRadius: 8,
                    backgroundColor: colors.badge.destructiveSubtle.bg,
                    border: `1px dashed ${colors.badge.destructive.bg}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: colors.badge.destructive.bg,
                  }}
                >
                  <FileX2 style={{ width: 18, height: 18 }} strokeWidth={1.6} />
                </div>
              );

              const meta = c.filePath ? (
                <span style={{ fontFamily: "'IBM Plex Mono', monospace" }}>{c.filePath}</span>
              ) : (
                <span style={{ fontStyle: 'italic' }}>Not yet a reusable component</span>
              );

              const goToDetail = () => navigate(`/ui-kit/c/${c.id}`);

              const openPageBtn = (
                <button
                  onClick={goToDetail}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    fontSize: 13, fontWeight: 600,
                    color: colors.semantic.foreground,
                    background: colors.semantic.cream,
                    padding: '6px 12px',
                    borderRadius: 6,
                    border: 'none',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                  title="Open component page"
                >
                  Open page <ArrowRight style={{ width: 14, height: 14 }} />
                </button>
              );

              const editorLink = c.filePath ? (
                <a
                  href={`vscode://file/${encodeURI(c.filePath)}`}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                    fontSize: 12, fontWeight: 500,
                    color: colors.semantic.foregroundSecondary,
                    textDecoration: 'none',
                    padding: '6px 10px',
                    borderRadius: 6,
                    border: `1px solid ${colors.semantic.border}`,
                    whiteSpace: 'nowrap',
                  }}
                  title="Open in editor"
                  onClick={e => e.stopPropagation()}
                >
                  <ExternalLink style={{ width: 12, height: 12 }} /> Code
                </a>
              ) : null;

              const actions = <>{openPageBtn}{editorLink}</>;

              return (
                <div key={c.id} onClick={goToDetail} style={{ cursor: 'pointer' }}>
                  <InventoryRow
                    id={c.id}
                    preview={preview}
                    name={c.id}
                    meta={meta}
                    status={c.status}
                    figmaRef={c.figmaRef}
                    notes={c.notes}
                    actions={actions}
                  />
                </div>
              );
            })}
          </div>
        ))}

        {grouped.length === 0 && (
          <div style={{ padding: '40px 16px', textAlign: 'center', color: colors.semantic.foregroundSecondary, fontSize: 13 }}>
            No components match the current filters.
          </div>
        )}
      </div>
    </div>
  );
}
