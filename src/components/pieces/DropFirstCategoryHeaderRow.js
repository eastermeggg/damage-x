import React from 'react';
import { Folder } from 'lucide-react';
import { colors, typography } from '../../design-system/tokens';
import { categoryPrefix } from '../../data/piecesModel';

// Static section label inside the drop-first <table>. Renders as a <tr>
// so it fits in the existing <tbody>. Three special group keys
// (__processing__, __sans_cat__, or a real categoryId) drive the label
// + styling. No interaction — drop-first shows everything as it gets
// classified.

export default function DropFirstCategoryHeaderRow({ groupKey, count, categories }) {
  let prefix = null;
  let label;
  let italic = false;
  let muted = false;
  let showFolderIcon = true;

  if (groupKey === '__processing__') {
    label = "En cours d'analyse";
    italic = true;
    muted = true;
    showFolderIcon = false;
  } else if (groupKey === '__sans_cat__') {
    label = 'Sans catégorie';
    italic = true;
    muted = true;
    showFolderIcon = false;
  } else {
    const cat = categories.find(c => c.id === groupKey);
    if (!cat) return null;
    prefix = categoryPrefix(cat, categories);
    label = cat.name;
  }

  return (
    <tr>
      <td colSpan={6} style={{ padding: 0 }}>
        <div style={{
          height: 36,
          display: 'flex',
          alignItems: 'center',
          backgroundColor: colors.semantic.white,
          borderTop: `1px solid ${colors.semantic.border}`,
          borderBottom: `1px solid ${colors.semantic.border}`,
        }}>
          <span style={{ width: 12, flexShrink: 0 }} />
          <span style={{
            width: 28,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: muted ? colors.semantic.foregroundMuted : colors.semantic.foregroundTertiary,
            flexShrink: 0,
          }}>
            {showFolderIcon && <Folder style={{ width: 16, height: 16 }} strokeWidth={1.5} />}
          </span>

          <div style={{
            flex: 1,
            minWidth: 0,
            display: 'flex',
            alignItems: 'baseline',
            gap: 8,
            overflow: 'hidden',
            paddingRight: 12,
          }}>
            <span style={{
              fontFamily: typography.fontFamily.sans,
              fontWeight: 500,
              fontSize: 14,
              color: muted ? colors.semantic.foregroundMuted : colors.semantic.foreground,
              fontStyle: italic ? 'italic' : 'normal',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}>
              {label}
            </span>
            {prefix && (
              <span style={{
                fontFamily: typography.fontFamily.mono,
                fontSize: 11,
                color: colors.semantic.foregroundMuted,
                letterSpacing: '0.04em',
                flexShrink: 0,
              }}>
                {prefix}
              </span>
            )}
          </div>

          <span style={{
            fontFamily: typography.fontFamily.mono,
            fontSize: 11,
            color: colors.semantic.foregroundMuted,
            paddingRight: 16,
            flexShrink: 0,
          }}>
            {count}
          </span>
        </div>
      </td>
    </tr>
  );
}
