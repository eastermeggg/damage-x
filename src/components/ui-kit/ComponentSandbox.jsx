import React, { useMemo, useState } from 'react';
import { ExternalLink, RotateCcw } from 'lucide-react';
import { colors } from '../../design-system/tokens';
import { ICON_OPTIONS } from './componentDemos';

/**
 * ComponentSandbox — renders a demo entry from componentDemos.jsx with live controls.
 *
 * Each control updates the rendered component immediately. Presets bulk-set
 * control values. "Reset" returns every control to its default.
 */
export default function ComponentSandbox({ demo, componentId }) {
  const defaults = useMemo(() => {
    if (!demo?.controls) return {};
    return Object.fromEntries(Object.entries(demo.controls).map(([k, c]) => [k, c.default]));
  }, [demo]);

  const [values, setValues] = useState(defaults);

  // Sync defaults when demo identity changes (different component expanded)
  React.useEffect(() => { setValues(defaults); }, [defaults]);

  if (!demo) {
    return (
      <PlaceholderBox
        text={`No demo defined for ${componentId}. Tell Claude to add one in src/components/ui-kit/componentDemos.jsx, or paste a Figma URL above so we can build it.`}
      />
    );
  }

  if (demo.placeholder) {
    return <PlaceholderBox text={demo.placeholder} link={demo.link} />;
  }

  const setValue = (k, v) => setValues(prev => ({ ...prev, [k]: v }));
  const applyPreset = (preset) => setValues(prev => ({ ...prev, ...preset.values }));
  const reset = () => setValues(defaults);

  return (
    <div>
      {demo.description && (
        <p style={{ margin: '0 0 12px 0', fontSize: 13, color: colors.semantic.foregroundSecondary, lineHeight: '20px' }}>
          {demo.description}
        </p>
      )}

      {/* Presets */}
      {demo.presets && demo.presets.length > 0 && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center', marginBottom: 12 }}>
          <span style={{ fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 500, color: colors.semantic.foregroundMuted, marginRight: 4 }}>
            Presets
          </span>
          {demo.presets.map(p => (
            <button
              key={p.label}
              onClick={() => applyPreset(p)}
              style={{
                padding: '4px 10px',
                borderRadius: 6,
                fontSize: 12,
                fontWeight: 500,
                color: colors.semantic.foregroundTertiary,
                backgroundColor: colors.semantic.cream,
                border: 'none',
                cursor: 'pointer',
              }}
            >
              {p.label}
            </button>
          ))}
          <button
            onClick={reset}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              padding: '4px 10px',
              borderRadius: 6,
              fontSize: 12,
              fontWeight: 500,
              color: colors.semantic.foregroundSecondary,
              background: 'transparent',
              border: `1px solid ${colors.semantic.border}`,
              cursor: 'pointer',
              marginLeft: 'auto',
            }}
            title="Reset all controls to defaults"
          >
            <RotateCcw style={{ width: 12, height: 12 }} /> Reset
          </button>
        </div>
      )}

      {/* Sandbox preview */}
      <div
        style={{
          padding: 32,
          borderRadius: 12,
          border: `1px solid ${colors.semantic.border}`,
          backgroundColor: colors.semantic.background,
          backgroundImage: `radial-gradient(${colors.semantic.border} 1px, transparent 1px)`,
          backgroundSize: '16px 16px',
          minHeight: 140,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 16,
        }}
      >
        {demo.render ? demo.render(values) : null}
      </div>

      {/* Controls */}
      {demo.controls && Object.keys(demo.controls).length > 0 && (
        <div>
          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, fontWeight: 500, color: colors.semantic.foregroundMuted, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 8 }}>
            Properties
          </div>
          <div style={{ border: `1px solid ${colors.semantic.border}`, borderRadius: 8, overflow: 'hidden', backgroundColor: '#fff' }}>
            {Object.entries(demo.controls).map(([key, control], i) => (
              <ControlRow
                key={key}
                propName={key}
                control={control}
                value={values[key]}
                onChange={v => setValue(key, v)}
                isFirst={i === 0}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ControlRow({ propName, control, value, onChange, isFirst }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '180px 1fr',
        gap: 16,
        padding: '12px 14px',
        borderTop: isFirst ? 'none' : `1px solid ${colors.semantic.border}`,
        alignItems: 'flex-start',
      }}
    >
      {/* Prop name + type */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 13, fontWeight: 500, color: colors.semantic.foreground }}>
          {propName}
        </span>
        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: colors.banner.ai.accent }}>
          {control.type}
        </span>
      </div>

      {/* Control + description */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}>
        <ControlInput control={control} value={value} onChange={onChange} />
        {control.description && (
          <span style={{ fontSize: 12, color: colors.semantic.foregroundSecondary, lineHeight: '16px' }}>
            {control.description}
          </span>
        )}
      </div>
    </div>
  );
}

function ControlInput({ control, value, onChange }) {
  if (control.type === 'boolean') {
    return <Toggle value={!!value} onChange={onChange} />;
  }

  if (control.type === 'text') {
    return (
      <input
        type="text"
        value={value ?? ''}
        onChange={e => onChange(e.target.value)}
        placeholder={control.default || ''}
        style={{
          width: '100%',
          padding: '6px 10px',
          fontSize: 13,
          color: colors.semantic.foreground,
          border: `1px solid ${colors.semantic.border}`,
          borderRadius: 6,
          background: '#fff',
          outline: 'none',
          fontFamily: 'inherit',
        }}
      />
    );
  }

  if (control.type === 'select') {
    return (
      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
        {control.options.map(opt => {
          const active = value === opt;
          return (
            <button
              key={opt}
              onClick={() => onChange(opt)}
              style={{
                padding: '4px 10px',
                borderRadius: 6,
                fontSize: 12,
                fontWeight: 500,
                color: active ? colors.semantic.white : colors.semantic.foregroundTertiary,
                backgroundColor: active ? colors.semantic.foreground : colors.semantic.cream,
                border: 'none',
                cursor: 'pointer',
                fontFamily: "'IBM Plex Mono', monospace",
              }}
            >
              {opt}
            </button>
          );
        })}
      </div>
    );
  }

  if (control.type === 'icon') {
    const names = Object.keys(ICON_OPTIONS);
    return (
      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
        {names.map(name => {
          const Icon = ICON_OPTIONS[name];
          const active = value === name;
          return (
            <button
              key={name}
              onClick={() => onChange(name)}
              title={name}
              style={{
                width: 30, height: 30,
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                borderRadius: 6,
                color: active ? colors.semantic.white : colors.semantic.foregroundTertiary,
                backgroundColor: active ? colors.semantic.foreground : colors.semantic.cream,
                border: 'none',
                cursor: 'pointer',
              }}
            >
              <Icon style={{ width: 16, height: 16 }} strokeWidth={1.6} />
            </button>
          );
        })}
      </div>
    );
  }

  return <span style={{ fontSize: 12, color: colors.semantic.foregroundMuted }}>(no control for type "{control.type}")</span>;
}

function Toggle({ value, onChange }) {
  return (
    <button
      onClick={() => onChange(!value)}
      style={{
        position: 'relative',
        width: 36,
        height: 20,
        padding: 0,
        borderRadius: 10,
        border: 'none',
        background: value ? colors.semantic.foreground : colors.semantic.cream,
        transition: 'background-color 150ms ease',
        cursor: 'pointer',
        flexShrink: 0,
      }}
      role="switch"
      aria-checked={value}
    >
      <span
        style={{
          position: 'absolute',
          top: 2,
          left: value ? 18 : 2,
          width: 16,
          height: 16,
          borderRadius: 8,
          background: '#fff',
          boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
          transition: 'left 150ms ease',
        }}
      />
    </button>
  );
}

function PlaceholderBox({ text, link }) {
  return (
    <div
      style={{
        padding: 24,
        borderRadius: 12,
        border: `1px dashed ${colors.semantic.border}`,
        backgroundColor: colors.semantic.backgroundSubtle,
      }}
    >
      <p style={{ margin: 0, fontSize: 13, color: colors.semantic.foregroundSecondary, lineHeight: '20px' }}>
        {text}
      </p>
      {link && (
        <a
          href={link}
          style={{
            marginTop: 10,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            fontSize: 12,
            fontWeight: 500,
            color: colors.banner.info.accent,
            textDecoration: 'none',
          }}
        >
          <ExternalLink style={{ width: 12, height: 12 }} /> {link}
        </a>
      )}
    </div>
  );
}
