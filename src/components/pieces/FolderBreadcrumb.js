import React from 'react';
import { ChevronRight, Folder } from 'lucide-react';
import { colors, typography } from '../../design-system/tokens';

// Path navigation matching the Figma design.
// - At root (empty path): "📁 N dossiers" — folder icon + count of root folders, not clickable.
// - Inside a folder: "📁 Dossiers > Folder Name" — "Dossiers" segment is clickable to return to root.

export default function FolderBreadcrumb({ path, onNavigate, rootCount = 0 }) {
  const isAtRoot = path.length === 0;

  return (
    <nav style={{
      display: 'flex',
      alignItems: 'center',
      gap: 4,
      height: 32,
    }}>
      {isAtRoot ? (
        <Segment
          icon={Folder}
          label={`${rootCount} dossier${rootCount > 1 ? 's' : ''}`}
          isLast
        />
      ) : (
        <>
          <Segment
            icon={Folder}
            label="Dossiers"
            onClick={() => onNavigate?.(null)}
          />
          {path.map((node, i) => (
            <React.Fragment key={node.id}>
              <ChevronRight style={{ width: 14, height: 14, color: colors.semantic.foregroundMuted, flexShrink: 0 }} strokeWidth={1.5} />
              <Segment
                label={node.name}
                onClick={() => onNavigate?.(node.id)}
                isLast={i === path.length - 1}
              />
            </React.Fragment>
          ))}
        </>
      )}
    </nav>
  );
}

function Segment({ label, icon: Icon, onClick, isLast }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isLast}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        padding: '4px 8px',
        border: 'none',
        background: 'transparent',
        borderRadius: 6,
        cursor: isLast ? 'default' : 'pointer',
        fontFamily: typography.fontFamily.sans,
        fontSize: 14,
        fontWeight: isLast ? 500 : 400,
        color: isLast ? colors.semantic.foreground : colors.semantic.foregroundSecondary,
        transition: 'background-color 100ms, color 100ms',
        minWidth: 0,
        overflow: 'hidden',
      }}
      onMouseEnter={(e) => {
        if (!isLast) {
          e.currentTarget.style.backgroundColor = colors.semantic.backgroundHover;
          e.currentTarget.style.color = colors.semantic.foreground;
        }
      }}
      onMouseLeave={(e) => {
        if (!isLast) {
          e.currentTarget.style.backgroundColor = 'transparent';
          e.currentTarget.style.color = colors.semantic.foregroundSecondary;
        }
      }}
    >
      {Icon && <Icon style={{ width: 14, height: 14, flexShrink: 0, color: colors.semantic.foregroundSecondary }} strokeWidth={1.5} />}
      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</span>
    </button>
  );
}
