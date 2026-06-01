export type BlockType =
  | 'heading'
  | 'subject'
  | 'text'
  | 'list'
  | 'divider'
  | 'signature'
  | 'callout'
  | 'table';

export type FontFamily = 'Georgia, serif' | 'Arial, sans-serif' | 'system-ui, sans-serif';

export type BlockAlign = 'left' | 'center' | 'right';
export type BlockSize = 'sm' | 'md' | 'lg';
export type PageMargin = 'compact' | 'standard' | 'wide';

export interface TemplateBlock {
  id: string;
  type: BlockType;
  content: string;
  align?: BlockAlign;
  size?: BlockSize;
  highlight?: string;
}

export interface CustomVariable {
  id: string;
  key: string;
  label: string;
  sampleValue: string;
}

export interface TemplateSettings {
  primaryColor: string;
  fontFamily: FontFamily;
  showDate: boolean;
  showFooter: boolean;
  pageMargin: PageMargin;
}

export interface TemplateDesign {
  version: 1;
  settings: TemplateSettings;
  blocks: TemplateBlock[];
  customVariables: CustomVariable[];
}

// ── Defaults ──────────────────────────────────────────────────────────────────

export const DEFAULT_SETTINGS: TemplateSettings = {
  primaryColor: '#6941c6',
  fontFamily: 'Georgia, serif',
  showDate: true,
  showFooter: true,
  pageMargin: 'standard',
};

export const DEFAULT_DESIGN: TemplateDesign = {
  version: 1,
  settings: DEFAULT_SETTINGS,
  blocks: [],
  customVariables: [],
};

// ── Block metadata ─────────────────────────────────────────────────────────────

export const BLOCK_META: Record<
  BlockType,
  { label: string; description: string; placeholder: string; icon: string }
> = {
  heading: {
    label: 'Heading',
    description: 'Bold section title',
    placeholder: 'e.g. Employment Offer Letter',
    icon: 'H',
  },
  subject: {
    label: 'Subject Line',
    description: 'Letter subject in bold',
    placeholder: 'e.g. Employment Offer – {{company_name}}',
    icon: 'S',
  },
  text: {
    label: 'Paragraph',
    description: 'Body text with {{variables}}',
    placeholder:
      'Dear {{employee_name}},\n\nWe are pleased to offer you the position of {{designation}} in the {{department}} department...',
    icon: 'P',
  },
  list: {
    label: 'Bullet List',
    description: 'One item per line',
    placeholder:
      'Basic Salary: {{salary_amount}}\nJoining Date: {{joining_date}}\nDesignation: {{designation}}',
    icon: '•',
  },
  table: {
    label: 'Table',
    description: 'Two-column key | value rows',
    placeholder:
      'Designation | {{designation}}\nDepartment | {{department}}\nMonthly CTC | {{salary_currency}} {{salary_amount}}\nDate of Joining | {{joining_date}}',
    icon: '⊞',
  },
  callout: {
    label: 'Callout',
    description: 'Highlighted information box',
    placeholder:
      'Note: This offer is conditional upon successful completion of background verification and document submission.',
    icon: '!',
  },
  divider: {
    label: 'Divider',
    description: 'Horizontal separator',
    placeholder: '',
    icon: '—',
  },
  signature: {
    label: 'Signature',
    description: 'Closing name and title',
    placeholder: '{{hr_name}}\nHuman Resources Manager',
    icon: '✍',
  },
};

// ── Callout highlight colors ───────────────────────────────────────────────────

export const CALLOUT_COLORS: Array<{ bg: string; border: string; text: string; label: string }> = [
  { bg: '#fef9c3', border: '#fde047', text: '#854d0e', label: 'Yellow' },
  { bg: '#dbeafe', border: '#93c5fd', text: '#1e40af', label: 'Blue' },
  { bg: '#d1fae5', border: '#6ee7b7', text: '#065f46', label: 'Green' },
  { bg: '#fce7f3', border: '#f9a8d4', text: '#9d174d', label: 'Pink' },
  { bg: '#f3f4f6', border: '#d1d5db', text: '#374151', label: 'Gray' },
];

// ── Theme presets ──────────────────────────────────────────────────────────────

export const THEME_PRESETS: Array<{
  id: string;
  name: string;
  primaryColor: string;
  fontFamily: FontFamily;
  emoji: string;
}> = [
  {
    id: 'modern',
    name: 'Modern',
    primaryColor: '#6941c6',
    fontFamily: 'system-ui, sans-serif',
    emoji: '✨',
  },
  {
    id: 'classic',
    name: 'Classic',
    primaryColor: '#1d4ed8',
    fontFamily: 'Georgia, serif',
    emoji: '📋',
  },
  {
    id: 'minimal',
    name: 'Minimal',
    primaryColor: '#111827',
    fontFamily: 'Arial, sans-serif',
    emoji: '⬛',
  },
  {
    id: 'warm',
    name: 'Warm',
    primaryColor: '#d97706',
    fontFamily: 'Georgia, serif',
    emoji: '🌿',
  },
  {
    id: 'ocean',
    name: 'Ocean',
    primaryColor: '#0d9488',
    fontFamily: 'system-ui, sans-serif',
    emoji: '🌊',
  },
  {
    id: 'rose',
    name: 'Rose',
    primaryColor: '#e11d48',
    fontFamily: 'Arial, sans-serif',
    emoji: '🌸',
  },
];

// ── Accent colors (for manual picker) ────────────────────────────────────────

export const ACCENT_COLORS = [
  '#6941c6',
  '#1d4ed8',
  '#0d9488',
  '#059669',
  '#d97706',
  '#dc2626',
  '#111827',
];

export const FONT_OPTIONS: { label: string; value: FontFamily }[] = [
  { label: 'Serif (Georgia)', value: 'Georgia, serif' },
  { label: 'Sans-serif (Arial)', value: 'Arial, sans-serif' },
  { label: 'Modern (System)', value: 'system-ui, sans-serif' },
];

// ── Starter templates ──────────────────────────────────────────────────────────

export interface StarterTemplate {
  id: string;
  name: string;
  description: string;
  emoji: string;
  blocks: Array<{ type: BlockType; content: string; align?: BlockAlign; highlight?: string }>;
}

export const STARTER_TEMPLATES: StarterTemplate[] = [
  {
    id: 'offer-letter',
    name: 'Offer Letter',
    description: 'Employment offer with role & compensation',
    emoji: '📄',
    blocks: [
      { type: 'subject', content: 'Employment Offer – {{company_name}}' },
      {
        type: 'text',
        content:
          'Dear {{employee_name}},\n\nWe are delighted to extend this offer of employment for the position of {{designation}} at {{company_name}}, effective {{joining_date}}.',
      },
      {
        type: 'heading',
        content: 'Compensation & Benefits',
        size: 'md' as BlockSize,
      } as TemplateBlock,
      {
        type: 'table',
        content:
          'Designation | {{designation}}\nDepartment | {{department}}\nReporting To | {{manager_name}}\nMonthly CTC | {{salary_currency}} {{salary_amount}}\nDate of Joining | {{joining_date}}',
      },
      {
        type: 'callout',
        content:
          'Note: This offer is conditional upon successful completion of background verification and submission of all required documents before the joining date.',
        highlight: '#dbeafe',
      },
      {
        type: 'text',
        content:
          'Please sign and return a copy of this letter to confirm your acceptance. We look forward to welcoming you to the {{company_name}} family.',
      },
      { type: 'divider', content: '' },
      { type: 'signature', content: '{{hr_name}}\nHuman Resources\n{{company_name}}' },
    ],
  },
  {
    id: 'experience-letter',
    name: 'Experience Letter',
    description: 'Certificate of employment verification',
    emoji: '🏆',
    blocks: [
      { type: 'subject', content: 'Certificate of Employment' },
      { type: 'text', content: 'To Whom It May Concern,' },
      {
        type: 'text',
        content:
          'This is to certify that {{employee_name}} (Employee ID: {{employee_id}}) has been employed with {{company_name}} as {{designation}} in the {{department}} department since {{joining_date}}.',
      },
      {
        type: 'table',
        content:
          'Employee Name | {{employee_name}}\nEmployee ID | {{employee_id}}\nDesignation | {{designation}}\nDepartment | {{department}}\nDate of Joining | {{joining_date}}',
      },
      {
        type: 'text',
        content:
          'During their tenure, {{employee_name}} has consistently demonstrated dedication and professionalism. We wish them the very best in their future endeavours.',
      },
      { type: 'divider', content: '' },
      { type: 'signature', content: '{{hr_name}}\nHuman Resources Manager\n{{company_name}}' },
    ],
  },
  {
    id: 'relieving-letter',
    name: 'Relieving Letter',
    description: 'Formal release from employment duties',
    emoji: '👋',
    blocks: [
      { type: 'subject', content: 'Relieving Letter – {{employee_name}}' },
      { type: 'text', content: 'Dear {{employee_name}},' },
      {
        type: 'text',
        content:
          'This is to confirm that {{employee_name}} (Employee ID: {{employee_id}}) has been officially relieved from the services of {{company_name}} with effect from {{effective_date}}, as per their resignation submitted and accepted.',
      },
      {
        type: 'table',
        content:
          'Employee Name | {{employee_name}}\nLast Working Day | {{effective_date}}\nDesignation | {{designation}}\nDepartment | {{department}}',
      },
      {
        type: 'callout',
        content:
          'All company property, access cards, and credentials have been returned and system access has been revoked.',
        highlight: '#d1fae5',
      },
      {
        type: 'text',
        content: 'We wish {{employee_name}} all the very best in future endeavours.',
      },
      { type: 'divider', content: '' },
      { type: 'signature', content: '{{hr_name}}\nHuman Resources\n{{company_name}}' },
    ],
  },
  {
    id: 'promotion-letter',
    name: 'Promotion Letter',
    description: 'Promotion announcement with new role',
    emoji: '🎉',
    blocks: [
      { type: 'subject', content: 'Promotion – {{designation}}' },
      { type: 'text', content: 'Dear {{employee_name}},' },
      {
        type: 'text',
        content:
          'We are pleased to inform you that, in recognition of your outstanding performance and contributions, you have been promoted to the position of {{designation}} in the {{department}} department, effective {{effective_date}}.',
      },
      {
        type: 'heading',
        content: 'Revised Compensation',
        size: 'md' as BlockSize,
      } as TemplateBlock,
      {
        type: 'table',
        content:
          'New Designation | {{designation}}\nDepartment | {{department}}\nRevised Monthly CTC | {{salary_currency}} {{salary_amount}}\nEffective Date | {{effective_date}}',
      },
      {
        type: 'callout',
        content:
          'Congratulations on this well-deserved achievement! Your performance and dedication have been truly remarkable.',
        highlight: '#d1fae5',
      },
      { type: 'divider', content: '' },
      { type: 'signature', content: '{{hr_name}}\nHuman Resources\n{{company_name}}' },
    ],
  },
  {
    id: 'salary-increment',
    name: 'Salary Increment',
    description: 'Salary revision notification letter',
    emoji: '💰',
    blocks: [
      { type: 'subject', content: 'Salary Revision – Effective {{effective_date}}' },
      { type: 'text', content: 'Dear {{employee_name}},' },
      {
        type: 'text',
        content:
          'We are pleased to inform you that your compensation has been revised effective {{effective_date}}, in recognition of your valuable contributions to {{company_name}}.',
      },
      {
        type: 'heading',
        content: 'Revised Compensation Details',
        size: 'md' as BlockSize,
      } as TemplateBlock,
      {
        type: 'table',
        content:
          'Employee Name | {{employee_name}}\nDesignation | {{designation}}\nRevised Monthly CTC | {{salary_currency}} {{salary_amount}}\nEffective Date | {{effective_date}}',
      },
      {
        type: 'text',
        content:
          'We appreciate your dedication and look forward to your continued success at {{company_name}}.',
      },
      { type: 'divider', content: '' },
      { type: 'signature', content: '{{hr_name}}\nHuman Resources Manager\n{{company_name}}' },
    ],
  },
];
