import React, { useMemo, useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { colors, typography } from '../../design-system/tokens';
import StatusPill from './StatusPill';

const STATUS_OPTIONS = ['pending', 'validated', 'needs-revision', 'missing'];

/**
 * Fillable form that pre-fills with the current inventory entry's values and
 * generates a copy-pasteable prompt for Claude Code.
 *
 * Props:
 * - entry: { id, figmaRef, notes, usageRules, status, ... }
 * - kind: 'component' | 'token'
 */
export default function UpdateEntryForm({ entry, kind = 'component' }) {
  const [figmaRef, setFigmaRef] = useState(entry.figmaRef || '');
  const [notes, setNotes] = useState(entry.notes || '');
  const [usageRules, setUsageRules] = useState(entry.usageRules || '');
  const [status, setStatus] = useState(entry.status || 'pending');
  // Default: ON when we'll be building/syncing, OFF for plain validation.
  // Flip ON to backfill docs for an already-existing component.
  const initialGenerateDocs = kind === 'component' && !!entry.figmaRef && (entry.status === 'missing' || entry.status === 'needs-revision');
  const [generateDocs, setGenerateDocs] = useState(initialGenerateDocs);
  const [copied, setCopied] = useState(false);

  const prompt = useMemo(
    () => buildPrompt({ entry, kind, figmaRef, notes, usageRules, status, generateDocs }),
    [entry, kind, figmaRef, notes, usageRules, status, generateDocs],
  );

  const dirty =
    figmaRef !== (entry.figmaRef || '') ||
    notes !== (entry.notes || '') ||
    usageRules !== (entry.usageRules || '') ||
    status !== (entry.status || 'pending');

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch (e) {
      // eslint-disable-next-line no-alert
      window.prompt('Copy this prompt:', prompt);
    }
  };

  return (
    <div
      style={{
        marginTop: 24,
        padding: 20,
        background: '#fff',
        border: `1px solid ${colors.semantic.border}`,
        borderRadius: 12,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: 11, fontFamily: typography.fontFamily.mono, textTransform: 'uppercase', letterSpacing: '0.05em', color: colors.semantic.foregroundMuted, fontWeight: 500 }}>
            Validate / update entry
          </div>
          <div style={{ fontSize: 13, color: colors.semantic.foregroundSecondary, marginTop: 2 }}>
            Fill in the fields below, then copy the generated prompt and paste it back into Claude Code.
          </div>
        </div>
        <StatusPill status={entry.status} />
      </div>

      <Field label="Figma URL">
        <input
          type="url"
          value={figmaRef}
          onChange={e => setFigmaRef(e.target.value)}
          placeholder="https://www.figma.com/design/…?node-id=…"
          style={{
            width: '100%',
            padding: '8px 12px',
            fontSize: 13,
            color: colors.semantic.foreground,
            border: `1px solid ${colors.semantic.border}`,
            borderRadius: 6,
            background: '#fff',
            outline: 'none',
            fontFamily: 'inherit',
          }}
        />
      </Field>

      <Field
        label="Notes"
        hint="Quick context — what looks off, missing variants, links to other refs. Shown in the inventory."
      >
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          rows={2}
          placeholder="What looks off, what variants are needed, links to other refs…"
          style={textareaStyle()}
        />
      </Field>

      <Field
        label="Usage rules"
        hint="When to use, when NOT to use, props that matter. Becomes the sibling .md doc that future agents read before importing or modifying this component."
      >
        <textarea
          value={usageRules}
          onChange={e => setUsageRules(e.target.value)}
          rows={5}
          placeholder={`Use this for: status pills, counts, category tags…\nDon't use for: filter chips (use Tabs), interactive elements (use Button)…\nKey props: variant=success/warning/destructive…, size=sm/md…`}
          style={textareaStyle()}
        />
      </Field>

      <Field label="Status">
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {STATUS_OPTIONS.map(s => {
            const active = status === s;
            return (
              <button
                key={s}
                onClick={() => setStatus(s)}
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
                {s}
              </button>
            );
          })}
        </div>
      </Field>

      {kind === 'component' && (
        <ToggleField
          label="Generate / update docs"
          hint={`Includes the steps to write ${entry.id}.md and update src/components/ui/CLAUDE.md. Turn ON to backfill docs for an already-existing component, OFF to skip docs entirely.`}
          checked={generateDocs}
          onChange={setGenerateDocs}
        />
      )}

      <div style={{ marginTop: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ fontSize: 11, fontFamily: typography.fontFamily.mono, textTransform: 'uppercase', letterSpacing: '0.05em', color: colors.semantic.foregroundMuted, fontWeight: 500 }}>
            Generated prompt {dirty ? <span style={{ color: colors.banner.warning.accent, marginLeft: 6, textTransform: 'none', letterSpacing: 0 }}>· unsaved</span> : null}
          </span>
          <button
            onClick={onCopy}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '6px 12px',
              borderRadius: 6,
              fontSize: 13, fontWeight: 600,
              color: copied ? colors.semantic.white : colors.semantic.foreground,
              background: copied ? colors.banner.success.accent : colors.semantic.cream,
              border: 'none',
              cursor: 'pointer',
              transition: 'background 150ms ease',
            }}
          >
            {copied ? <Check style={{ width: 14, height: 14 }} /> : <Copy style={{ width: 14, height: 14 }} />}
            {copied ? 'Copied' : 'Copy prompt'}
          </button>
        </div>
        <pre
          style={{
            margin: 0,
            padding: '12px 14px',
            background: colors.semantic.backgroundSubtle,
            borderRadius: 8,
            fontFamily: typography.fontFamily.mono,
            fontSize: 12,
            lineHeight: '18px',
            color: colors.semantic.foregroundTertiary,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            border: `1px solid ${colors.semantic.border}`,
          }}
        >
          {prompt}
        </pre>
      </div>
    </div>
  );
}

function Field({ label, hint, children }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: colors.semantic.foregroundTertiary, marginBottom: 4 }}>
        {label}
      </label>
      {hint && (
        <div style={{ fontSize: 11, color: colors.semantic.foregroundMuted, marginBottom: 6, lineHeight: '15px' }}>
          {hint}
        </div>
      )}
      {children}
    </div>
  );
}

function ToggleField({ label, hint, checked, onChange }) {
  return (
    <div style={{ marginBottom: 12, padding: '10px 12px', background: colors.semantic.backgroundSubtle, borderRadius: 8, border: `1px solid ${colors.semantic.border}` }}>
      <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
        <button
          type="button"
          onClick={() => onChange(!checked)}
          style={{
            position: 'relative', width: 36, height: 20, padding: 0,
            borderRadius: 10, border: 'none',
            background: checked ? colors.semantic.foreground : colors.semantic.cream,
            transition: 'background 150ms ease',
            cursor: 'pointer', flexShrink: 0,
          }}
          role="switch"
          aria-checked={checked}
        >
          <span style={{
            position: 'absolute', top: 2, left: checked ? 18 : 2,
            width: 16, height: 16, borderRadius: 8, background: '#fff',
            boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
            transition: 'left 150ms ease',
          }} />
        </button>
        <span style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <span style={{ fontSize: 13, fontWeight: 500, color: colors.semantic.foreground }}>{label}</span>
          {hint && <span style={{ fontSize: 11, color: colors.semantic.foregroundMuted, lineHeight: '15px' }}>{hint}</span>}
        </span>
      </label>
    </div>
  );
}

function textareaStyle() {
  return {
    width: '100%',
    resize: 'vertical',
    padding: '8px 12px',
    fontSize: 13, lineHeight: '20px',
    color: colors.semantic.foreground,
    border: `1px solid ${colors.semantic.border}`,
    borderRadius: 6,
    background: '#fff',
    outline: 'none',
    fontFamily: 'inherit',
  };
}

function buildPrompt({ entry, kind, figmaRef, notes, usageRules, status, generateDocs }) {
  if (kind === 'token') {
    return [
      'Update the design-system inventory.',
      '',
      `In src/data/designSystemInventory.json, find the token entry with id "${entry.id}" inside tokens (look in colors / typography / spacing / radius / shadows / motion arrays).`,
      'Set the following fields exactly:',
      `- figmaRef: ${JSON.stringify(figmaRef || '')}`,
      `- notes: ${JSON.stringify(notes || '')}`,
      `- status: "${status}"`,
      '',
      `Leave all other fields unchanged. Then verify curl /ui-kit/tokens returns 200 and commit with message:`,
      `chore(ds): validate ${entry.id}`,
    ].join('\n');
  }

  const shouldBuild = !!figmaRef && (status === 'missing' || status === 'needs-revision');
  const componentExists = !!entry.filePath;
  const filePath = entry.filePath || `src/components/ui/${entry.id}.js`;
  const newFilePath = `src/components/ui/${entry.id}.js`;
  const docPath = `src/components/ui/${entry.id}.md`;
  const indexPath = `src/components/ui/CLAUDE.md`;
  const today = new Date().toISOString().slice(0, 10);

  const steps = [];

  // Always: STEP — Update inventory entry
  steps.push({
    title: 'Update inventory entry.',
    body: [
      `In src/data/designSystemInventory.json, find the component entry with id "${entry.id}" inside the components array.`,
      'Set the following fields exactly:',
      `- figmaRef: ${JSON.stringify(figmaRef || '')}`,
      `- notes: ${JSON.stringify(notes || '')}`,
      `- usageRules: ${JSON.stringify(usageRules || '')}`,
      `- status: "${status}"`,
      'Leave all other fields unchanged.',
    ],
  });

  // Conditional: STEP — Build / sync component
  if (shouldBuild) {
    if (!componentExists) {
      steps.push({
        title: 'Integrate the component as a real React wrapper that matches the Figma exactly.',
        body: [
          `The component "${entry.id}" does not yet exist as a reusable file. An inline preview lives in src/components/ui-kit/previews.jsx (function ${entry.id}).`,
          'Do the following:',
          `1. Open the Figma node above and inspect every variant, default state, and design token (colors, spacing, radius, typography, shadows). Use mcp__figma__get_design_context (or mcp__figma__get_screenshot for a visual reference) on the URL.`,
          `2. Create ${newFilePath} as a real React wrapper that renders the component pixel-accurate to Figma. Reference src/design-system/tokens.js for any color, spacing, radius, typography, or shadow value — do not hardcode hex / px / shadow strings. Cover every variant shown in the Figma.`,
          `3. Replace the inline implementation in src/components/ui-kit/previews.jsx so the existing /ui-kit/c/${entry.id} sandbox keeps working. Use a default-import alias pattern (e.g. \`import ${entry.id}Real from '../ui/${entry.id}'; export const ${entry.id} = ${entry.id}Real;\`) so the local PREVIEWS map at the bottom of the file still resolves.`,
          `4. On the same inventory entry, set filePath: "${newFilePath}" and exists: true.`,
        ],
      });
    } else {
      steps.push({
        title: 'Align the existing component with the Figma.',
        body: [
          `The component already exists at ${entry.filePath}. Per ${indexPath} rule #3, BEFORE editing the file: post the intended diff to chat (props added/removed, visual changes, affected call sites) and wait for explicit user confirmation. Then:`,
          `1. Open the Figma node above and diff visually against the current implementation.`,
          `2. Apply changes to make the React component match the Figma. Reference src/design-system/tokens.js for tokens — do not hardcode values.`,
          `3. Preserve the existing public API (prop names, exported component) unless the Figma demands a new variant — in that case add the prop and update the demo controls in src/components/ui-kit/componentDemos.jsx.`,
        ],
      });
    }
  }

  // Conditional: STEP — Doc generation
  if (generateDocs) {
    steps.push({
      title: `Write or update the sibling doc at ${docPath}.`,
      body: [
        'Use this exact template (fill in the parts in <angle brackets> from the Usage rules above and the Figma reference):',
        '',
        '```markdown',
        `# ${entry.id}`,
        '',
        '<one-line description from the Figma>.',
        '',
        `- **File:** \`${filePath}\``,
        `- **Inventory id:** \`${entry.id}\``,
        `- **Figma:** ${figmaRef || '<paste URL>'}`,
        `- **Status:** ${status} (last validated ${today})`,
        '',
        '## When to use',
        '<bullet list — taken from the Usage rules above>',
        '',
        '## When NOT to use',
        '<bullet list — taken from the Usage rules above; if not provided, infer sensible boundaries from the Figma>',
        '',
        '## Variants',
        '<list every variant from the Figma>',
        '',
        '## Examples',
        '```jsx',
        `import ${entry.id} from 'src/components/ui/${entry.id}';`,
        '// 2-3 example call sites covering the main variants/modes',
        '```',
        '',
        '## Tokens used',
        '<list the tokens from src/design-system/tokens.js this component reads>',
        '',
        '## Sandbox',
        `\`/ui-kit/c/${entry.id}\` — live controls.`,
        '```',
        '',
        'Use the Usage rules text above verbatim where it fits. If the user did not provide Usage rules, write a first draft based on the Figma + your judgment, then ask the user to refine it.',
      ],
    });

    steps.push({
      title: `Update the primitives index at ${indexPath}.`,
      body: [
        `Add (or update) a row in the "Index of primitives" table for ${entry.id} with: file link, doc link, Figma node id, and the modes/variants in one short cell. Keep the table sorted alphabetically by component name.`,
      ],
    });
  }

  // Always: STEP — Verify
  const verify = [
    `- curl http://localhost:3000/ui-kit/c/${entry.id} returns 200 and the sandbox renders correctly.`,
    '- curl http://localhost:3000/ui-kit/inventory returns 200.',
    '- npm run build succeeds with no new warnings in the new code.',
  ];
  if (generateDocs) {
    verify.push(`- ${docPath} exists and reflects the Usage rules.`);
    verify.push(`- ${indexPath} index has a row for ${entry.id}.`);
  }
  steps.push({ title: 'Verify.', body: verify });

  // Commit message
  let commitMsg;
  if (shouldBuild && !componentExists) {
    commitMsg = `feat(ui): build ${entry.id} from Figma`;
  } else if (shouldBuild) {
    commitMsg = `fix(ui): align ${entry.id} with Figma`;
  } else if (generateDocs) {
    commitMsg = `docs(ui): document ${entry.id}`;
  } else {
    commitMsg = `chore(ds): validate ${entry.id}${status === 'validated' ? '' : ' (' + status + ')'}`;
  }

  // Render
  const out = [];
  out.push('Update the design-system inventory and (where applicable) the component code + docs.');
  out.push('');
  out.push(`Read ${indexPath} first — it contains the hard rules for this folder (always reuse, ask before creating, warn before updating). Follow them.`);
  steps.forEach((step, i) => {
    out.push('');
    out.push(`STEP ${i + 1} — ${step.title}`);
    step.body.forEach(line => out.push(line));
  });
  out.push('');
  out.push(`Commit with message: ${commitMsg}`);

  return out.join('\n');
}
