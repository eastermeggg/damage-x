import React, { useState } from 'react';
import {
  Sparkles, FileText, BookOpen, Search, Calculator, Inbox, Plus, Briefcase,
  Heart, Scale, Mail, Bell, Settings, User, Trash2, Edit, Filter, Eye,
} from 'lucide-react';
import AlertDialog from '../AlertDialog';
import EmptyState from '../EmptyState';
import PromptSuggestionCard from '../PromptSuggestionCard';
import SuggestionsMenu from '../SuggestionsMenu';
import JPPill from '../jp/JPPill';
import * as P from './previews';

const noop = () => {};

// Available Lucide icons exposed to the icon-type controls.
export const ICON_OPTIONS = {
  Sparkles, FileText, BookOpen, Search, Calculator, Inbox, Plus, Briefcase,
  Heart, Scale, Mail, Bell, Settings, User, Trash2, Edit, Filter, Eye,
};

const sampleDecision = {
  id: 'demo-decision-1',
  jurisdiction: 'CA Paris',
  chambre: '2e ch. civile',
  date: '2024-09-12',
  amounts: [{ poste: 'PGPF', displayValue: '12 450 €' }],
};

// Sandbox frame that scopes `position: fixed` descendants (like AlertDialog's
// fullscreen overlay) to the wrapper instead of the whole viewport.
// The `transform` creates a containing block for fixed-position children.
function ScopedDialogFrame({ width = 640, height = 360, children, onReopen, isOpen }) {
  return (
    <div
      style={{
        position: 'relative',
        width,
        height,
        overflow: 'hidden',
        borderRadius: 12,
        border: '1px dashed #d6d3d1',
        background: '#ffffff',
        backgroundImage: 'radial-gradient(#e7e5e3 1px, transparent 1px)',
        backgroundSize: '12px 12px',
        transform: 'translateZ(0)',
      }}
    >
      {children}
      {!isOpen && (
        <button
          onClick={onReopen}
          style={{
            position: 'absolute', top: 12, left: 12, zIndex: 1,
            padding: '6px 10px', fontSize: 12, fontWeight: 500,
            color: '#44403c', background: '#eeece6',
            border: 'none', borderRadius: 6, cursor: 'pointer',
          }}
        >
          Reopen dialog
        </button>
      )}
    </div>
  );
}

// AlertDialog rendered inline — open by default, contained in the sandbox frame.
function AlertDialogTrigger({ title, description, iconVariant, actionLabel, actionVariant, cancelLabel, warning }) {
  const [open, setOpen] = useState(true);
  // Reset to open whenever any control value changes
  React.useEffect(() => { setOpen(true); }, [title, description, iconVariant, actionLabel, actionVariant, cancelLabel, warning]);
  return (
    <ScopedDialogFrame isOpen={open} onReopen={() => setOpen(true)}>
      <AlertDialog
        open={open}
        onOpenChange={setOpen}
        iconVariant={iconVariant}
        title={title}
        description={description}
        warning={warning || undefined}
        actionLabel={actionLabel}
        actionVariant={actionVariant}
        cancelLabel={cancelLabel}
        onAction={() => setOpen(false)}
      />
    </ScopedDialogFrame>
  );
}

function ModalTrigger(props) {
  const [open, setOpen] = useState(true);
  React.useEffect(() => { setOpen(true); }, [props.title, props.description, props.size]);
  return (
    <ScopedDialogFrame width={520} height={300} isOpen={open} onReopen={() => setOpen(true)}>
      <P.Modal {...props} open={open} onClose={() => setOpen(false)}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <P.Button variant="ghost" label="Cancel" onClick={() => setOpen(false)} />
          <P.Button variant="primary" label="Confirm" onClick={() => setOpen(false)} />
        </div>
      </P.Modal>
    </ScopedDialogFrame>
  );
}

function SheetTrigger(props) {
  const [open, setOpen] = useState(true);
  React.useEffect(() => { setOpen(true); }, [props.title, props.side, props.width]);
  return (
    <ScopedDialogFrame width={560} height={320} isOpen={open} onReopen={() => setOpen(true)}>
      <P.Sheet {...props} open={open} onClose={() => setOpen(false)}>
        <p style={{ margin: 0, fontSize: 14, color: '#78716c', lineHeight: '20px' }}>
          Slide-out panel for secondary content. Click the dim background or the close button to dismiss.
        </p>
      </P.Sheet>
    </ScopedDialogFrame>
  );
}

/**
 * Demo registry. Each entry is either:
 *   {
 *     description: string,
 *     controls: { [prop]: { type, default, options?, description? } },
 *     render: (values) => ReactNode,
 *     presets?: [{ label, values }]
 *   }
 * or a placeholder for components we haven't built yet:
 *   { placeholder: string, link?: string }
 *
 * Control types: 'boolean' | 'text' | 'select' | 'icon'
 */
export const componentDemos = {
  // ========================================================================
  // Real Plato components (existing files)
  // ========================================================================
  AlertDialog: {
    description: 'Confirmation dialog. Click the button to open.',
    controls: {
      title:         { type: 'text',    default: 'Confirm action',                                    description: 'Headline.' },
      description:   { type: 'text',    default: 'You are about to apply these changes to the dossier.', description: 'Body text under title.' },
      warning:       { type: 'text',    default: '',                                                   description: 'Optional amber warning block.' },
      iconVariant:   { type: 'select',  default: 'default',  options: ['default', 'destructive', 'warning', 'success', 'info'], description: 'Icon color.' },
      actionLabel:   { type: 'text',    default: 'Confirm',                                            description: 'Primary action button label.' },
      actionVariant: { type: 'select',  default: 'primary',  options: ['primary', 'destructive'],     description: 'Primary action color + matching cancel tone.' },
      cancelLabel:   { type: 'text',    default: 'Cancel',                                             description: 'Cancel button label.' },
    },
    render: v => <AlertDialogTrigger {...v} />,
    presets: [
      { label: 'Primary',     values: { iconVariant: 'default',     actionVariant: 'primary',     title: 'Confirm action',           description: 'You are about to apply these changes to the dossier.', actionLabel: 'Confirm' } },
      { label: 'Destructive', values: { iconVariant: 'destructive', actionVariant: 'destructive', title: 'Delete this dossier?',     description: 'This will permanently delete the dossier and all its pieces.', actionLabel: 'Delete' } },
    ],
  },

  EmptyState: {
    description: 'Centered empty state with icon, title, description, and optional primary/secondary actions.',
    controls: {
      icon:                 { type: 'icon',    default: 'Inbox',                                                description: 'Icon shown in the cream circle.' },
      title:                { type: 'text',    default: 'Aucun dossier',                                        description: 'Headline (serif).' },
      description:          { type: 'text',    default: 'Crée ton premier dossier pour commencer.',             description: 'Supporting copy under title.' },
      primaryActionLabel:   { type: 'text',    default: '',                                                     description: 'Primary action label. Leave empty to hide.' },
      secondaryActionLabel: { type: 'text',    default: '',                                                     description: 'Secondary action label. Leave empty to hide.' },
    },
    render: v => (
      <EmptyState
        icon={ICON_OPTIONS[v.icon]}
        title={v.title}
        description={v.description || undefined}
        primaryAction={v.primaryActionLabel ? { label: v.primaryActionLabel, icon: Plus, onClick: noop } : undefined}
        secondaryAction={v.secondaryActionLabel ? { label: v.secondaryActionLabel, onClick: noop } : undefined}
      />
    ),
    presets: [
      { label: 'No actions',   values: { icon: 'Inbox',     title: 'Aucun dossier',  description: 'Crée ton premier dossier pour commencer.', primaryActionLabel: '',          secondaryActionLabel: '' } },
      { label: 'With actions', values: { icon: 'FileText',  title: 'Aucune pièce',   description: "Importe une pièce pour démarrer l'analyse.", primaryActionLabel: 'Importer', secondaryActionLabel: 'En savoir plus' } },
    ],
  },

  PromptSuggestionCard: {
    description: 'Cold-start prompt card used in the chat sidebar empty state.',
    controls: {
      icon:     { type: 'icon',    default: 'Sparkles',              description: 'Icon shown in the 36px square.' },
      label:    { type: 'text',    default: 'Résume ce dossier',     description: 'Suggestion text.' },
      pinHover: { type: 'boolean', default: false,                   description: 'Force the hover visuals (specimens only).' },
      disabled: { type: 'boolean', default: false,                   description: 'Disabled state.' },
    },
    render: v => (
      <PromptSuggestionCard
        icon={ICON_OPTIONS[v.icon]}
        label={v.label}
        pinHover={v.pinHover}
        disabled={v.disabled}
        onClick={noop}
      />
    ),
    presets: [
      { label: 'Default',        values: { icon: 'Sparkles',   label: 'Résume ce dossier',  pinHover: false, disabled: false } },
      { label: 'Hover (pinned)', values: { icon: 'Calculator', label: 'Calcule la PGPF',     pinHover: true,  disabled: false } },
      { label: 'Disabled',       values: { icon: 'BookOpen',   label: 'Cherche une décision', pinHover: false, disabled: true  } },
    ],
  },

  SuggestionsMenu: {
    description: "Compact popover menu — header bar + icon+label rows.",
    controls: {
      header:       { type: 'text',    default: "Suggestions d'actions", description: 'Mono uppercase header.' },
      itemCount:    { type: 'select',  default: '4', options: ['1', '2', '3', '4', '5'], description: 'Number of items to show.' },
      disabled:     { type: 'boolean', default: false,                   description: 'Disable all rows.' },
    },
    render: v => {
      const allItems = [
        { icon: Sparkles,   label: 'Résume ce dossier' },
        { icon: Calculator, label: 'Calcule la PGPF' },
        { icon: BookOpen,   label: 'Cherche une décision' },
        { icon: Search,     label: "Rechercher dans l'expertise" },
        { icon: FileText,   label: 'Génère une note de synthèse' },
      ];
      return (
        <div style={{ width: 280 }}>
          <SuggestionsMenu
            header={v.header}
            disabled={v.disabled}
            items={allItems.slice(0, parseInt(v.itemCount, 10))}
          />
        </div>
      );
    },
  },

  JPPill: {
    description: 'Inline badge for a single legal decision.',
    controls: {
      jurisdiction: { type: 'text',    default: 'CA Paris',          description: 'Court / jurisdiction.' },
      chambre:      { type: 'text',    default: '2e ch. civile',     description: 'Chamber.' },
      poste:        { type: 'text',    default: 'PGPF',              description: 'Poste label for the leading amount.' },
      amount:       { type: 'text',    default: '12 450 €',          description: 'Leading amount value.' },
      saved:        { type: 'boolean', default: false,               description: 'Show bookmark icon.' },
      isSelected:   { type: 'boolean', default: false,               description: 'Selected state.' },
    },
    render: v => (
      <JPPill
        decision={{ ...sampleDecision, jurisdiction: v.jurisdiction, chambre: v.chambre, amounts: [{ poste: v.poste, displayValue: v.amount }] }}
        saved={v.saved}
        isSelected={v.isSelected}
      />
    ),
    presets: [
      { label: 'Default',  values: { saved: false, isSelected: false } },
      { label: 'Saved',    values: { saved: true,  isSelected: false } },
      { label: 'Selected', values: { saved: false, isSelected: true  } },
    ],
  },

  ReasoningStepper: {
    placeholder: 'Live demo lives in /ui-kit/reasoning. The Reasoning Stepper renders backend tool steps with collapsible groups, color-coded by step type.',
    link: '/ui-kit/reasoning',
  },

  // ========================================================================
  // Missing primitives — using inline preview implementations from previews.jsx
  // (Phase A sketches — to be promoted to real components in src/components/ui/
  // during Phase B once Figma references are validated.)
  // ========================================================================
  Button: {
    description: 'Primary, secondary, ghost, outline, and destructive button variants.',
    controls: {
      label:        { type: 'text',    default: 'Action',                                                   description: 'Button label.' },
      variant:      { type: 'select',  default: 'primary', options: ['primary', 'secondary', 'ghost', 'outline', 'destructive'], description: 'Visual variant.' },
      size:         { type: 'select',  default: 'md',      options: ['sm', 'md', 'lg'],                     description: 'Button size.' },
      icon:         { type: 'icon',    default: 'Plus',                                                     description: 'Optional leading/trailing icon.' },
      iconPosition: { type: 'select',  default: 'leading', options: ['leading', 'trailing', 'none'],        description: 'Icon position.' },
      disabled:     { type: 'boolean', default: false,                                                      description: 'Disabled state.' },
      fullWidth:    { type: 'boolean', default: false,                                                      description: 'Stretch to container width.' },
    },
    render: v => (
      <P.Button
        variant={v.variant}
        size={v.size}
        icon={v.iconPosition === 'none' ? undefined : ICON_OPTIONS[v.icon]}
        iconPosition={v.iconPosition === 'none' ? 'leading' : v.iconPosition}
        label={v.label}
        disabled={v.disabled}
        fullWidth={v.fullWidth}
      />
    ),
    presets: [
      { label: 'Primary',     values: { variant: 'primary',     label: 'Save',     iconPosition: 'none' } },
      { label: 'Secondary',   values: { variant: 'secondary',   label: 'Filter',   icon: 'Filter', iconPosition: 'leading' } },
      { label: 'Outline',     values: { variant: 'outline',     label: 'Cancel',   iconPosition: 'none' } },
      { label: 'Ghost',       values: { variant: 'ghost',       label: 'Skip',     iconPosition: 'none' } },
      { label: 'Destructive', values: { variant: 'destructive', label: 'Delete',   icon: 'Trash2', iconPosition: 'leading' } },
    ],
  },

  Input: {
    description: 'Text input with optional label, leading icon, error state, and helper text.',
    controls: {
      label:       { type: 'text',    default: 'Email',                description: 'Field label above the input.' },
      placeholder: { type: 'text',    default: 'name@hexa.com',        description: 'Placeholder text.' },
      value:       { type: 'text',    default: '',                     description: 'Current value.' },
      size:        { type: 'select',  default: 'md', options: ['sm', 'md'], description: 'Input size.' },
      hasIcon:     { type: 'boolean', default: false,                  description: 'Show leading mail icon.' },
      error:       { type: 'boolean', default: false,                  description: 'Error styling.' },
      disabled:    { type: 'boolean', default: false,                  description: 'Disabled state.' },
      helperText:  { type: 'text',    default: '',                     description: 'Helper text below.' },
    },
    render: v => (
      <P.Input
        label={v.label || undefined}
        placeholder={v.placeholder}
        value={v.value}
        onChange={() => {}}
        size={v.size}
        leadingIcon={v.hasIcon ? Mail : undefined}
        error={v.error}
        disabled={v.disabled}
        helperText={v.helperText || undefined}
      />
    ),
  },

  Textarea: {
    description: 'Multi-line text input.',
    controls: {
      label:       { type: 'text',    default: 'Notes',                                  description: 'Label.' },
      placeholder: { type: 'text',    default: 'Add internal notes about this dossier…', description: 'Placeholder.' },
      value:       { type: 'text',    default: '',                                       description: 'Current value.' },
      rows:        { type: 'select',  default: '4', options: ['2', '4', '6', '8'],       description: 'Visible rows.' },
      error:       { type: 'boolean', default: false,                                    description: 'Error state.' },
      disabled:    { type: 'boolean', default: false,                                    description: 'Disabled.' },
    },
    render: v => (
      <P.Textarea
        label={v.label || undefined}
        placeholder={v.placeholder}
        value={v.value}
        rows={parseInt(v.rows, 10)}
        error={v.error}
        disabled={v.disabled}
        onChange={() => {}}
      />
    ),
  },

  Badge: {
    description: 'Inline status / tag badge. Uses the .badge-* CSS classes from src/index.css.',
    controls: {
      label:    { type: 'text',    default: 'En cours',                                                          description: 'Badge text.' },
      variant:  { type: 'select',  default: 'success', options: ['default', 'secondary', 'outline', 'destructive', 'destructive-subtle', 'ai', 'success', 'info', 'warning'], description: 'Color variant.' },
      size:     { type: 'select',  default: 'md',      options: ['sm', 'md'],                                    description: 'Size.' },
      hasIcon:  { type: 'boolean', default: false,                                                                description: 'Show leading icon.' },
      hasDot:   { type: 'boolean', default: false,                                                                description: 'Show leading dot.' },
    },
    render: v => (
      <P.Badge
        variant={v.variant}
        size={v.size}
        icon={v.hasIcon ? Sparkles : undefined}
        dot={v.hasDot}
        label={v.label}
      />
    ),
    presets: [
      { label: 'Default',     values: { variant: 'default',     label: 'Default' } },
      { label: 'Success',     values: { variant: 'success',     label: 'Validated' } },
      { label: 'Warning',     values: { variant: 'warning',     label: 'À revoir' } },
      { label: 'Destructive', values: { variant: 'destructive', label: 'Erreur' } },
      { label: 'AI',          values: { variant: 'ai',          label: 'IA',     hasIcon: true } },
      { label: 'Info',        values: { variant: 'info',        label: 'Info' } },
    ],
  },

  Checkbox: {
    description: 'Single checkbox with optional label.',
    controls: {
      label:    { type: 'text',    default: 'I agree to the terms', description: 'Optional label.' },
      checked:  { type: 'boolean', default: false,                  description: 'Checked state.' },
      disabled: { type: 'boolean', default: false,                  description: 'Disabled state.' },
    },
    render: v => (
      <P.Checkbox
        checked={v.checked}
        label={v.label || undefined}
        disabled={v.disabled}
        onChange={() => {}}
      />
    ),
  },

  Switch: {
    description: 'Boolean toggle switch with optional label.',
    controls: {
      label:    { type: 'text',    default: 'Enable notifications', description: 'Optional label.' },
      checked:  { type: 'boolean', default: true,                   description: 'Checked state.' },
      disabled: { type: 'boolean', default: false,                  description: 'Disabled state.' },
    },
    render: v => (
      <P.Switch
        checked={v.checked}
        label={v.label || undefined}
        disabled={v.disabled}
        onChange={() => {}}
      />
    ),
  },

  RadioGroup: {
    description: 'Vertical stack of mutually exclusive radio options.',
    controls: {
      value: { type: 'select', default: 'monthly', options: ['monthly', 'yearly', 'enterprise'], description: 'Selected option value.' },
    },
    render: v => (
      <P.RadioGroup
        value={v.value}
        options={[
          { value: 'monthly',    label: 'Monthly billing' },
          { value: 'yearly',     label: 'Yearly billing (save 20%)' },
          { value: 'enterprise', label: 'Enterprise' },
        ]}
        onChange={() => {}}
      />
    ),
  },

  Tooltip: {
    description: 'Tooltip — hover the trigger to reveal.',
    controls: {
      content: { type: 'text',    default: 'Apply changes to the dossier',          description: 'Tooltip text.' },
      side:    { type: 'select',  default: 'top', options: ['top', 'bottom', 'left', 'right'], description: 'Position relative to trigger.' },
    },
    render: v => (
      <P.Tooltip content={v.content} side={v.side}>
        <P.Button variant="outline" label="Hover me" />
      </P.Tooltip>
    ),
  },

  Avatar: {
    description: 'Initials-only or image-backed circular/square avatar.',
    controls: {
      initials: { type: 'text',    default: 'MR',                                                description: 'Initials shown when no image.' },
      size:     { type: 'select',  default: 'md',  options: ['sm', 'md', 'lg', 'xl'],            description: 'Size.' },
      color:    { type: 'select',  default: 'cream', options: ['green', 'blue', 'plum', 'orange', 'rose', 'cream'], description: 'Background color from VI palette.' },
      shape:    { type: 'select',  default: 'circle', options: ['circle', 'rounded'],            description: 'Shape.' },
    },
    render: v => <P.Avatar initials={v.initials} size={v.size} color={v.color} shape={v.shape} />,
  },

  Separator: {
    description: 'Visual divider — horizontal, vertical, or labelled.',
    controls: {
      orientation: { type: 'select', default: 'horizontal', options: ['horizontal', 'vertical'], description: 'Direction.' },
      label:       { type: 'text',   default: '',                                                description: 'Optional centre label (horizontal only).' },
    },
    render: v => (
      <div style={{ width: v.orientation === 'horizontal' ? 280 : 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', height: v.orientation === 'vertical' ? 60 : 'auto' }}>
        <P.Separator orientation={v.orientation} label={v.orientation === 'horizontal' ? (v.label || undefined) : undefined} />
      </div>
    ),
  },

  Skeleton: {
    description: 'Shimmering placeholder for loading states.',
    controls: {
      width:  { type: 'text',    default: '240px',         description: 'Bar width (CSS length).' },
      height: { type: 'text',    default: '14',            description: 'Bar height in px.' },
      count:  { type: 'select',  default: '3', options: ['1', '2', '3', '4'], description: 'Number of bars.' },
    },
    render: v => (
      <P.Skeleton width={v.width} height={parseInt(v.height, 10)} count={parseInt(v.count, 10)} />
    ),
  },

  Tabs: {
    description: 'Tabbed navigation. Underline (default) or pill style.',
    controls: {
      value:   { type: 'select', default: 'overview', options: ['overview', 'pieces', 'chronologie'], description: 'Active tab.' },
      variant: { type: 'select', default: 'underline', options: ['underline', 'pills'],               description: 'Visual variant.' },
    },
    render: v => (
      <P.Tabs
        value={v.value}
        variant={v.variant}
        options={[
          { value: 'overview',    label: 'Overview' },
          { value: 'pieces',      label: 'Pièces' },
          { value: 'chronologie', label: 'Chronologie' },
        ]}
        onChange={() => {}}
      />
    ),
  },

  Select: {
    description: 'Custom dropdown selector. Click to open the option list.',
    controls: {
      value:       { type: 'select', default: 'paris', options: ['paris', 'lyon', 'bordeaux', 'lille'], description: 'Selected value.' },
      placeholder: { type: 'text',   default: 'Select a court…',                                       description: 'Placeholder when nothing is selected.' },
      disabled:    { type: 'boolean', default: false,                                                  description: 'Disabled state.' },
    },
    render: v => (
      <P.Select
        value={v.value}
        placeholder={v.placeholder}
        disabled={v.disabled}
        options={[
          { value: 'paris',    label: 'CA Paris' },
          { value: 'lyon',     label: 'CA Lyon' },
          { value: 'bordeaux', label: 'CA Bordeaux' },
          { value: 'lille',    label: 'CA Lille' },
        ]}
        onChange={() => {}}
      />
    ),
  },

  Combobox: {
    description: 'Searchable selector — type to filter options.',
    controls: {
      placeholder: { type: 'text', default: 'Search a poste…', description: 'Placeholder text.' },
    },
    render: v => (
      <P.Combobox
        placeholder={v.placeholder}
        options={[
          { value: 'pgpf',  label: 'PGPF — Pertes de gains professionnels futurs' },
          { value: 'dfpa',  label: 'DFPA — Déficit fonctionnel permanent' },
          { value: 'sff',   label: 'SFF — Souffrances endurées' },
          { value: 'prej_e',label: 'Préjudice esthétique permanent' },
          { value: 'pgpa',  label: 'PGPA — Pertes de gains professionnels actuels' },
        ]}
        onChange={() => {}}
      />
    ),
  },

  Dropdown: {
    description: 'Context menu / action dropdown. Click the trigger to open.',
    controls: {
      triggerLabel: { type: 'text', default: 'Actions', description: 'Trigger button label.' },
    },
    render: v => (
      <P.Popover
        anchor={<P.Button variant="outline" label={v.triggerLabel} />}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 180 }}>
          {[
            { icon: Edit,   label: 'Renommer' },
            { icon: Eye,    label: 'Voir détails' },
            { icon: Trash2, label: 'Supprimer' },
          ].map((it, i) => (
            <button
              key={i}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '6px 8px', borderRadius: 6,
                fontSize: 14, color: '#292524',
                background: 'transparent', border: 'none', textAlign: 'left',
                cursor: 'pointer',
              }}
            >
              <it.icon style={{ width: 14, height: 14, color: '#44403c' }} strokeWidth={1.75} />
              {it.label}
            </button>
          ))}
        </div>
      </P.Popover>
    ),
  },

  Popover: {
    description: 'Anchored popover — click the trigger to open.',
    controls: {
      side:  { type: 'select', default: 'bottom', options: ['top', 'bottom'],          description: 'Side relative to trigger.' },
      align: { type: 'select', default: 'start',  options: ['start', 'center', 'end'], description: 'Alignment along the side.' },
    },
    render: v => (
      <P.Popover
        side={v.side}
        align={v.align}
        anchor={<P.Button variant="outline" label="Open popover" />}
      >
        <div style={{ fontSize: 13, color: '#292524', maxWidth: 220 }}>
          <strong style={{ display: 'block', marginBottom: 4 }}>Quick actions</strong>
          <p style={{ margin: 0, color: '#78716c' }}>Anchored to the trigger. Click outside to dismiss.</p>
        </div>
      </P.Popover>
    ),
  },

  Modal: {
    description: 'Modal overlay scoped to the sandbox area.',
    controls: {
      title:       { type: 'text',   default: 'Modal title',                                                       description: 'Header.' },
      description: { type: 'text',   default: 'Generic modal body. Replace with the AlertDialog for confirmations.', description: 'Body text.' },
      size:        { type: 'select', default: 'md', options: ['sm', 'md', 'lg'],                                    description: 'Width preset.' },
    },
    render: v => <ModalTrigger title={v.title} description={v.description} size={v.size} />,
  },

  Drawer: {
    description: 'Generic side-mounted drawer. Same primitive as Sheet — semantic alias.',
    controls: {
      side:  { type: 'select', default: 'right', options: ['right', 'left'], description: 'Side.' },
      title: { type: 'text',   default: 'Drawer',                            description: 'Header.' },
      width: { type: 'select', default: '360', options: ['280', '360', '480'], description: 'Width.' },
    },
    render: v => <SheetTrigger side={v.side} title={v.title} width={parseInt(v.width, 10)} />,
  },

  Sheet: {
    description: 'Side / bottom sheet for secondary content.',
    controls: {
      side:  { type: 'select', default: 'right', options: ['right', 'left', 'bottom', 'top'], description: 'Side.' },
      title: { type: 'text',   default: 'Sheet',                                              description: 'Header.' },
    },
    render: v => <SheetTrigger side={v.side} title={v.title} />,
  },

  Sidebar: {
    description: 'Vertical navigation list with active state and optional badge counts.',
    controls: {
      active: { type: 'select', default: 'dossiers', options: ['dossiers', 'jurisprudence', 'redaction', 'settings'], description: 'Active item.' },
      header: { type: 'text',   default: 'Workspace',                                                                  description: 'Optional header.' },
    },
    render: v => (
      <P.Sidebar
        header={v.header}
        active={v.active}
        items={[
          { id: 'dossiers',     label: 'Dossiers',      icon: FileText, badge: 12 },
          { id: 'jurisprudence',label: 'Jurisprudence', icon: BookOpen },
          { id: 'redaction',    label: 'Rédaction',     icon: Edit },
          { id: 'settings',     label: 'Paramètres',    icon: Settings },
        ]}
        onChange={() => {}}
      />
    ),
  },

  ScrollArea: {
    description: 'Bordered scrollable area.',
    controls: {
      height: { type: 'select', default: '160', options: ['120', '160', '240', '320'], description: 'Height in px.' },
    },
    render: v => (
      <P.ScrollArea height={parseInt(v.height, 10)} width={320}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} style={{ fontSize: 13, color: '#292524', padding: '6px 8px', borderRadius: 6, background: i % 2 ? '#fafaf9' : 'transparent' }}>
              Row {i + 1} — sample content for scroll area
            </div>
          ))}
        </div>
      </P.ScrollArea>
    ),
  },

  DropZone: {
    description: 'File drop zone — full-block container variant or compact inline variant.',
    controls: {
      variant:  { type: 'select',  default: 'container', options: ['container', 'inline'], description: 'Visual variant.' },
      label:    { type: 'text',    default: 'Drop a file here or click to upload',          description: 'Primary label.' },
      sublabel: { type: 'text',    default: 'PDF, DOCX up to 20 MB',                        description: 'Secondary label (container variant only).' },
    },
    render: v => <P.DropZone variant={v.variant} label={v.label} sublabel={v.sublabel} />,
  },

  Table: {
    description: 'Tabular data with header + body. Striped variant alternates row backgrounds.',
    controls: {
      variant: { type: 'select', default: 'default', options: ['default', 'striped'], description: 'Row variant.' },
    },
    render: v => (
      <P.Table
        variant={v.variant}
        columns={[
          { key: 'date',   label: 'Date' },
          { key: 'titre',  label: 'Pièce' },
          { key: 'type',   label: 'Type' },
          { key: 'statut', label: 'Statut' },
        ]}
        rows={[
          { date: '12/03/2024', titre: 'Expertise médicale', type: 'Expertise',     statut: <P.Badge variant="success" size="sm" label="Validé" /> },
          { date: '04/04/2024', titre: 'Constat huissier',   type: 'Administratif', statut: <P.Badge variant="warning" size="sm" label="À revoir" /> },
          { date: '22/05/2024', titre: 'Bulletin de salaire', type: 'Revenus',      statut: <P.Badge variant="info"    size="sm" label="Pending" /> },
        ]}
      />
    ),
  },

  TableHeader: {
    description: 'Standalone table header row.',
    controls: {},
    render: () => (
      <P.TableHeader columns={[
        { key: 'date',   label: 'Date' },
        { key: 'titre',  label: 'Pièce' },
        { key: 'type',   label: 'Type' },
        { key: 'statut', label: 'Statut' },
      ]} />
    ),
  },
  TableRow: {
    description: 'Standalone table row with optional left diff strip.',
    controls: {
      diff: { type: 'select', default: 'none', options: ['none', 'add', 'edit', 'delete'], description: 'Diff type — colors the 4px left strip.' },
    },
    render: v => (
      <div style={{ width: 480, border: '1px solid #e7e5e3', borderRadius: 8, overflow: 'hidden', background: '#fff' }}>
        <P.TableRow
          diff={v.diff === 'none' ? undefined : v.diff}
          cells={['12/03/2024', 'Expertise médicale', 'Expertise', '4 500 €']}
        />
      </div>
    ),
  },
  TableCell: {
    description: 'Single cell — supports mono font and alignment.',
    controls: {
      mono:  { type: 'boolean', default: false,    description: 'Mono font.' },
      align: { type: 'select',  default: 'left',   options: ['left', 'center', 'right'], description: 'Text align.' },
    },
    render: v => (
      <div style={{ width: 200 }}>
        <P.TableCell mono={v.mono} align={v.align}>4 500,00 €</P.TableCell>
      </div>
    ),
  },

  PlanCard: {
    description: 'Pricing tier card. Featured variant inverts to dark.',
    controls: {
      name:        { type: 'text',    default: 'Studio',                                              description: 'Plan name.' },
      price:       { type: 'text',    default: '€39',                                                  description: 'Price.' },
      period:      { type: 'text',    default: '/mo',                                                  description: 'Period suffix.' },
      description: { type: 'text',    default: 'Unlimited dossiers + collaboration up to 5 members.', description: 'Tagline.' },
      featured:    { type: 'boolean', default: false,                                                  description: 'Featured (dark) variant.' },
    },
    render: v => (
      <P.PlanCard
        name={v.name}
        price={v.price}
        period={v.period}
        description={v.description}
        featured={v.featured}
        features={[
          'Unlimited dossiers',
          '5 team members',
          'AI assistance',
          'Priority support',
        ]}
        ctaLabel="Choose plan"
      />
    ),
  },

  ChatBubble: {
    description: 'Single chat message bubble — user (filled dark) or assistant (cream).',
    controls: {
      author:  { type: 'select', default: 'assistant', options: ['user', 'assistant'], description: 'Bubble author / alignment.' },
      content: { type: 'text',   default: "Voici un résumé du dossier en 3 points…",  description: 'Message text.' },
      timestamp: { type: 'text', default: '14:32',                                     description: 'Optional timestamp.' },
    },
    render: v => (
      <ChatBubbleWithAvatar author={v.author} content={v.content} timestamp={v.timestamp} />
    ),
  },

  ChatMessageList: {
    description: 'Scrollable list of ChatBubbles representing a conversation.',
    controls: {},
    render: () => (
      <P.ChatMessageList
        messages={[
          { author: 'user',      content: 'Résume ce dossier en 3 points.',                                              timestamp: '14:30' },
          { author: 'assistant', content: 'Voici les éléments saillants : (1) accident de la circulation — (2) hospitalisation 12 jours — (3) ITT 6 mois.', timestamp: '14:30' },
          { author: 'user',      content: 'Quelle est la PGPF probable ?',                                                timestamp: '14:32' },
          { author: 'assistant', content: 'Sous réserve de validation des justificatifs, je projette une PGPF de l\'ordre de 12 450 €.', timestamp: '14:33' },
        ]}
      />
    ),
  },

  ChatComposer: {
    description: 'Chat input with auto-growing textarea + send button.',
    controls: {
      placeholder: { type: 'text',    default: 'Demande à Norma…', description: 'Placeholder.' },
      value:       { type: 'text',    default: '',                  description: 'Current value.' },
      disabled:    { type: 'boolean', default: false,               description: 'Disabled state.' },
    },
    render: v => (
      <P.ChatComposer
        value={v.value}
        placeholder={v.placeholder}
        disabled={v.disabled}
        onChange={() => {}}
        onSend={() => {}}
      />
    ),
  },

  // ========================================================================
  // Domain components — placeholder until we wire mock data
  // ========================================================================
  JPPopoverCard:           { placeholder: 'Live demo TBD — JPPopoverCard positions itself relative to a JPPill anchor and needs a hover trigger. View in app: open a JP pill in any chat thread.', link: '/ui-kit' },
  DecisionDrawer:          { placeholder: 'Live demo TBD — DecisionDrawer is a full-width right drawer that requires decision data and works best in flow.', link: '/dossier' },
  JPAddStepper:            { placeholder: 'Live demo TBD — multi-step modal (search / paste link / upload PDF) wired to scope checkboxes.', link: '/dossier' },
  JPListing:               { placeholder: 'Live demo TBD — list of pinned decisions with stats and empty state. Needs decisions from the active dossier.', link: '/dossier' },
  JPSearchView:            { placeholder: 'Live demo TBD — search UI with filter sidebar + result cards. Needs search index data.', link: '/dossier' },
  SaveDestinationPopover:  { placeholder: 'Live demo TBD — popover used by DecisionDrawer and JPSearchView to save into matter/postes/usuals.', link: '/dossier' },
  SlashCommandPalette:     { placeholder: 'Live demo TBD — keyboard-navigable command palette triggered from the chat input.', link: '/dossier' },
  ActesList:               { placeholder: 'Live demo TBD — table of drafted actes for a dossier. Needs redaction scenarios.', link: '/dossier' },
  RedactionStepper:        { placeholder: 'Live demo TBD — 2x2 grid for selecting document type to draft.', link: '/dossier' },
  ActCanvas:               { placeholder: 'Live demo TBD — markdown-aware canvas with inline pièce badges. Needs redaction scenario data.', link: '/dossier' },
};

function ChatBubbleWithAvatar({ author, content, timestamp }) {
  return (
    <P.ChatBubble
      author={author}
      content={content}
      timestamp={timestamp}
    />
  );
}

export function getComponentDemo(id) {
  return componentDemos[id] || null;
}
