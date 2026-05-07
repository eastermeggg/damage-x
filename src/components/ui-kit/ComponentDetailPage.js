import React from 'react';
import { ChevronLeft, ExternalLink } from 'lucide-react';
import inventory from '../../data/designSystemInventory.json';
import { colors, typography } from '../../design-system/tokens';
import StatusPill from './StatusPill';
import ComponentSandbox from './ComponentSandbox';
import UpdateEntryForm from './UpdateEntryForm';
import { getComponentDemo } from './componentDemos';

export default function ComponentDetailPage({ componentId, navigate }) {
  const component = inventory.components.find(c => c.id === componentId);
  const demo = getComponentDemo(componentId);

  if (!component) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: colors.semantic.backgroundCanvas, padding: '40px 48px', fontFamily: typography.fontFamily.sans }}>
        <button
          onClick={() => navigate('/ui-kit/inventory')}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            fontSize: 13, fontWeight: 500,
            color: colors.semantic.foregroundSecondary,
            background: 'transparent', border: 'none', cursor: 'pointer', padding: 0,
            marginBottom: 16,
          }}
        >
          <ChevronLeft style={{ width: 16, height: 16 }} /> Back to inventory
        </button>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: colors.semantic.foreground, margin: 0 }}>
          Component not found
        </h1>
        <p style={{ marginTop: 8, fontSize: 14, color: colors.semantic.foregroundSecondary }}>
          No component with id <code style={{ fontFamily: typography.fontFamily.mono }}>{componentId}</code> in the inventory.
        </p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: colors.semantic.backgroundCanvas, fontFamily: typography.fontFamily.sans }}>
      {/* Header bar */}
      <div style={{ borderBottom: `1px solid ${colors.semantic.border}`, backgroundColor: '#fff', padding: '20px 48px' }}>
        <button
          onClick={() => navigate('/ui-kit/inventory')}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            fontSize: 13, fontWeight: 500,
            color: colors.semantic.foregroundSecondary,
            background: 'transparent', border: 'none', cursor: 'pointer', padding: 0,
            marginBottom: 12,
          }}
        >
          <ChevronLeft style={{ width: 16, height: 16 }} /> Back to inventory
        </button>

        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, flexWrap: 'wrap' }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: colors.semantic.foreground, margin: 0, letterSpacing: '-0.4px' }}>
            {component.id}
          </h1>
          <StatusPill status={component.status} />
          <span style={{
            fontSize: 11,
            fontFamily: typography.fontFamily.mono,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: colors.semantic.foregroundMuted,
            paddingBottom: 4,
          }}>
            {component.category}
          </span>
        </div>

        {/* Meta strip */}
        <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 4 }}>
          {component.filePath ? (
            <div style={{ fontSize: 12, color: colors.semantic.foregroundSecondary }}>
              <span style={{ color: colors.semantic.foregroundTertiary, fontWeight: 500 }}>File: </span>
              <code style={{ fontFamily: typography.fontFamily.mono }}>{component.filePath}</code>
              {' · '}
              <a
                href={`vscode://file/${encodeURI(component.filePath)}`}
                style={{ color: colors.banner.info.accent, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 2 }}
              >
                Open in editor <ExternalLink style={{ width: 11, height: 11 }} />
              </a>
            </div>
          ) : (
            <div style={{ fontSize: 12, color: colors.semantic.foregroundSecondary, fontStyle: 'italic' }}>
              Not yet a reusable component
            </div>
          )}
          {component.figmaRef && (
            <div style={{ fontSize: 12, color: colors.semantic.foregroundSecondary }}>
              <span style={{ color: colors.semantic.foregroundTertiary, fontWeight: 500 }}>Figma: </span>
              <a href={component.figmaRef} target="_blank" rel="noreferrer" style={{ color: colors.banner.info.accent, textDecoration: 'underline', wordBreak: 'break-all' }}>
                {component.figmaRef}
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Sandbox area */}
      <div style={{ padding: '32px 48px', maxWidth: 1200 }}>
        <ComponentSandbox demo={demo} componentId={componentId} />

        <UpdateEntryForm entry={component} kind="component" />
      </div>
    </div>
  );
}
