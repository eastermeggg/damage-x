import React, { useState, useMemo } from 'react';
import { ChevronDown, ChevronRight, Folder } from 'lucide-react';
import { colors, typography } from '../../design-system/tokens';
import AlertDialog from '../AlertDialog';

// Move selected pieces / folders into a destination folder. Tree picker
// with expand/collapse. `excludeIds` hides those nodes (used when moving
// a folder — can't drop inside itself or its descendants).

export default function MoveToFolderModal({
  open,
  onOpenChange,
  categories,
  excludeIds = [],
  onConfirm,
  selectionLabel,
}) {
  const [selectedId, setSelectedId] = useState(null);
  const [expanded, setExpanded] = useState(() => new Set());

  React.useEffect(() => {
    if (open) {
      setSelectedId(null);
      setExpanded(new Set(categories.filter(c => c.parentId === null).map(c => c.id)));
    }
  }, [open, categories]);

  const allExcluded = useMemo(() => {
    const out = new Set(excludeIds);
    const stack = [...excludeIds];
    while (stack.length) {
      const id = stack.pop();
      categories.forEach(c => {
        if (c.parentId === id && !out.has(c.id)) {
          out.add(c.id);
          stack.push(c.id);
        }
      });
    }
    return out;
  }, [excludeIds, categories]);

  const rootCategories = useMemo(
    () => categories.filter(c => c.parentId === null).sort((a, b) => a.order - b.order),
    [categories]
  );
  const childrenOf = useMemo(() => {
    const m = new Map();
    categories.forEach(c => {
      if (!m.has(c.parentId)) m.set(c.parentId, []);
      m.get(c.parentId).push(c);
    });
    m.forEach(list => list.sort((a, b) => a.order - b.order));
    return m;
  }, [categories]);

  const toggleExpand = (id, e) => {
    e?.stopPropagation();
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const renderNode = (cat, depth) => {
    if (allExcluded.has(cat.id)) return null;
    const kids = (childrenOf.get(cat.id) || []).filter(c => !allExcluded.has(c.id));
    const hasKids = kids.length > 0;
    const isExpanded = expanded.has(cat.id);
    const isSelected = selectedId === cat.id;
    const Chevron = isExpanded ? ChevronDown : ChevronRight;

    return (
      <React.Fragment key={cat.id}>
        <div
          onClick={() => setSelectedId(cat.id)}
          style={{
            display: 'flex',
            alignItems: 'center',
            paddingLeft: depth * 14,
            height: 32,
            cursor: 'pointer',
            backgroundColor: isSelected ? colors.semantic.backgroundSubtle : 'transparent',
            borderRadius: 4,
          }}
          onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.backgroundColor = colors.semantic.backgroundHover; }}
          onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent'; }}
        >
          <button
            type="button"
            onClick={(e) => toggleExpand(cat.id, e)}
            style={{
              width: 20,
              height: 32,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'transparent',
              border: 'none',
              cursor: hasKids ? 'pointer' : 'default',
              color: colors.semantic.foregroundMuted,
              visibility: hasKids ? 'visible' : 'hidden',
            }}
          >
            <Chevron style={{ width: 12, height: 12 }} strokeWidth={1.75} />
          </button>
          <Folder
            style={{
              width: 14,
              height: 14,
              color: isSelected ? colors.semantic.foreground : colors.semantic.foregroundTertiary,
              marginRight: 8,
              flexShrink: 0,
            }}
            strokeWidth={1.5}
          />
          <span style={{
            fontFamily: typography.fontFamily.sans,
            fontSize: 13,
            color: colors.semantic.foreground,
            fontWeight: isSelected ? 500 : 400,
            flex: 1,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {cat.name}
          </span>
        </div>
        {hasKids && isExpanded && kids.map(child => renderNode(child, depth + 1))}
      </React.Fragment>
    );
  };

  const subtitle = selectionLabel ? selectionLabel : null;

  return (
    <AlertDialog
      open={open}
      onOpenChange={onOpenChange}
      hideIcon
      title="Déplacer"
      description={subtitle}
      cancelLabel="Annuler"
      actionLabel="Déplacer"
      actionVariant="primary"
      actionDisabled={!selectedId}
      onAction={() => { if (selectedId) { onConfirm?.(selectedId); onOpenChange?.(false); } }}
    >
      <div style={{ marginTop: 2, maxHeight: 280, overflowY: 'auto' }}>
        <div
          onClick={() => setSelectedId('__root__')}
          style={{
            display: 'flex',
            alignItems: 'center',
            height: 32,
            paddingLeft: 0,
            cursor: 'pointer',
            backgroundColor: selectedId === '__root__' ? colors.semantic.backgroundSubtle : 'transparent',
            borderRadius: 4,
          }}
          onMouseEnter={(e) => { if (selectedId !== '__root__') e.currentTarget.style.backgroundColor = colors.semantic.backgroundHover; }}
          onMouseLeave={(e) => { if (selectedId !== '__root__') e.currentTarget.style.backgroundColor = 'transparent'; }}
        >
          <span style={{ width: 20 }} />
          <span style={{ width: 14, height: 14, marginRight: 8 }} />
          <span style={{
            fontFamily: typography.fontFamily.sans,
            fontSize: 13,
            color: colors.semantic.foregroundSecondary,
            fontStyle: 'italic',
            fontWeight: selectedId === '__root__' ? 500 : 400,
          }}>
            Aucun dossier
          </span>
        </div>
        {rootCategories.map(c => renderNode(c, 0))}
      </div>
    </AlertDialog>
  );
}
