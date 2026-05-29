import React, { useState } from 'react';
import { Folder, MoreVertical, Check, Download } from 'lucide-react';
import { colors, typography } from '../../design-system/tokens';

// Folder row aligned with Figma "Row Folders" — 52px tall.
// Resting: folder icon + name + documents count + date + invisible action slots.
// Hover: Download + kebab icons fade in to the right (slots reserved → no layout shift).
// Selected: folder icon swaps to a filled stone checkbox; hover icons still appear.

const ROW_HEIGHT = 52;

export default function CategoryHeader({
  label,
  isEmpty = false,
  selected = false,
  lastAdded,
  docCount = 0,
  onOpen,
  onSelectToggle,
  onContextMenu,
  onDownload,
  onOpenMenu,
}) {
  const [hover, setHover] = useState(false);

  const handleClick = (e) => {
    if (e.metaKey || e.ctrlKey) {
      e.preventDefault();
      onSelectToggle?.();
      return;
    }
    onOpen?.();
  };
  const handleContextMenu = (e) => { e.preventDefault(); onContextMenu?.({ x: e.clientX, y: e.clientY }); };
  const handleKebab = (e) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    onOpenMenu?.({ x: rect.right - 4, y: rect.bottom });
  };

  const bg = selected
    ? colors.semantic.backgroundSubtle
    : (hover ? colors.semantic.backgroundHover : colors.semantic.white);

  return (
    <div
      onClick={handleClick}
      onContextMenu={handleContextMenu}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        height: ROW_HEIGHT,
        backgroundColor: bg,
        borderBottom: `1px solid ${colors.semantic.border}`,
        display: 'flex',
        alignItems: 'center',
        cursor: 'pointer',
        transition: 'background-color 100ms',
      }}
    >
      {/* Icon slot — folder at rest, checkbox on hover or when selected */}
      <span
        onClick={(e) => {
          if (!(hover || selected)) return;
          e.stopPropagation();
          onSelectToggle?.();
        }}
        style={{
          width: 40,
          flexShrink: 0,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: (hover || selected) ? 'pointer' : 'default',
          color: isEmpty ? colors.semantic.foregroundMuted : colors.semantic.foregroundTertiary,
        }}
      >
        {(hover || selected) ? (
          <SelectionBox checked={selected} />
        ) : (
          <Folder style={{ width: 16, height: 16 }} strokeWidth={1.5} />
        )}
      </span>

      <span style={{
        flex: 1,
        minWidth: 0,
        paddingRight: 12,
      }}>
        <span style={{
          fontFamily: typography.fontFamily.sans,
          fontWeight: 500,
          fontSize: 14,
          color: isEmpty ? colors.semantic.foregroundMuted : colors.semantic.foreground,
          fontStyle: isEmpty ? 'italic' : 'normal',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          display: 'block',
        }}>
          {label}
        </span>
      </span>

      <span style={{
        width: 130,
        flexShrink: 0,
        paddingRight: 12,
        fontFamily: typography.fontFamily.sans,
        fontSize: 14,
        color: colors.semantic.foreground,
      }}>
        {docCount}
      </span>

      <span style={{
        width: 130,
        flexShrink: 0,
        paddingRight: 12,
        fontFamily: typography.fontFamily.sans,
        fontSize: 14,
        color: colors.semantic.foreground,
      }}>
        {lastAdded ? lastAdded.toLocaleDateString('fr-FR') : '—'}
      </span>

      <span
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 72,
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: 2,
          paddingRight: 12,
        }}
      >
        <HoverSlot visible={hover}>
          <BareIcon icon={Download} title="Télécharger" onClick={(e) => { e.stopPropagation(); onDownload?.(); }} />
        </HoverSlot>
        <HoverSlot visible={hover}>
          <BareIcon icon={MoreVertical} title="Plus d'actions" onClick={handleKebab} />
        </HoverSlot>
      </span>
    </div>
  );
}

// 28×28 reserved slot. Children render only while `visible`, but the slot itself
// always occupies space → no layout shift on hover.
function HoverSlot({ visible, children }) {
  return (
    <span style={{
      width: 28,
      height: 28,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      opacity: visible ? 1 : 0,
      visibility: visible ? 'visible' : 'hidden',
      transition: 'opacity 120ms ease-out',
    }}>
      {children}
    </span>
  );
}

function BareIcon({ icon: Icon, title, onClick }) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      style={{
        width: 28,
        height: 28,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: 'none',
        background: 'transparent',
        cursor: 'pointer',
        color: colors.semantic.foregroundSecondary,
        padding: 0,
        transition: 'color 100ms',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.color = colors.semantic.foreground; }}
      onMouseLeave={(e) => { e.currentTarget.style.color = colors.semantic.foregroundSecondary; }}
    >
      <Icon style={{ width: 16, height: 16 }} strokeWidth={1.5} />
    </button>
  );
}

function SelectionBox({ checked }) {
  return (
    <span style={{
      width: 16,
      height: 16,
      borderRadius: 3,
      border: `1.5px solid ${checked ? colors.semantic.foreground : colors.semantic.foregroundMuted}`,
      backgroundColor: checked ? colors.semantic.foreground : 'transparent',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      {checked && <Check style={{ width: 11, height: 11, color: 'white' }} strokeWidth={3} />}
    </span>
  );
}
