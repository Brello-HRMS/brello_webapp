import { CALLOUT_COLORS } from '../../types/designerTypes';
import { VARIABLE_DISPLAY_LABELS } from '../../types/letterTypes';

import { HEADING_SIZES, TEXT_SIZES } from './utils';
import styles from './TemplateDesigner.module.scss';

import type { TemplateBlock } from '../../types/designerTypes';

// ── Inline helper — only used within this component ────────────────────────────

function resolveContent(text: string, sampleValues: Record<string, string>): React.ReactNode {
  return text.split(/(\{\{[^}]+\}\})/g).map((part, i) => {
    if (/^\{\{[^}]+\}\}$/.test(part)) {
      const key = part.slice(2, -2).trim();
      const val = sampleValues[key];
      if (val)
        return (
          <span key={i} className={styles.resolvedVar}>
            {val}
          </span>
        );
      const label = VARIABLE_DISPLAY_LABELS[key] ?? key.replace(/_/g, ' ');
      return (
        <span key={i} className={styles.unknownVar}>
          [{label}]
        </span>
      );
    }
    return part;
  });
}

// ── Types ─────────────────────────────────────────────────────────────────────

export interface PreviewBlockProps {
  block: TemplateBlock;
  primaryColor: string;
  fontFamily: string;
  sampleValues: Record<string, string>;
}

// ── Component ─────────────────────────────────────────────────────────────────

export const PreviewBlock: React.FC<PreviewBlockProps> = ({
  block,
  primaryColor,
  fontFamily,
  sampleValues,
}) => {
  const render = (text: string) => resolveContent(text, sampleValues);
  const align = block.align ?? 'left';
  const size = block.size ?? (block.type === 'heading' ? 'lg' : 'md');
  const base = { fontFamily, textAlign: align as React.CSSProperties['textAlign'] };

  switch (block.type) {
    case 'heading':
      return (
        <div
          style={{
            ...base,
            fontSize: HEADING_SIZES[size],
            fontWeight: 700,
            marginBottom: '0.75rem',
            lineHeight: 1.3,
          }}
        >
          {render(block.content)}
        </div>
      );

    case 'subject':
      return (
        <p style={{ ...base, fontWeight: 700, fontSize: '0.9375rem', marginBottom: '1rem' }}>
          <strong>Subject: </strong>
          {render(block.content.replace(/^Subject:\s*/i, ''))}
        </p>
      );

    case 'text':
      return (
        <p
          style={{
            ...base,
            marginBottom: '0.875rem',
            whiteSpace: 'pre-wrap',
            lineHeight: 1.8,
            fontSize: TEXT_SIZES[size],
          }}
        >
          {render(block.content)}
        </p>
      );

    case 'list':
      return (
        <ul
          style={{ ...base, paddingLeft: '1.5rem', marginBottom: '0.875rem', fontSize: '0.875rem' }}
        >
          {block.content
            .split('\n')
            .filter(Boolean)
            .map((line, i) => (
              <li key={i} style={{ marginBottom: '0.25rem' }}>
                {render(line)}
              </li>
            ))}
        </ul>
      );

    case 'table':
      return (
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            marginBottom: '0.875rem',
            fontSize: '0.875rem',
            fontFamily,
          }}
        >
          <tbody>
            {block.content
              .split('\n')
              .filter(Boolean)
              .map((row, i) => {
                const [label = '', value = ''] = row.split('|').map((s) => s.trim());
                return (
                  <tr key={i} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td
                      style={{
                        padding: '0.5rem 0.75rem',
                        fontWeight: 600,
                        color: '#344054',
                        width: '40%',
                        background: i % 2 === 0 ? '#f9fafb' : '#fff',
                      }}
                    >
                      {render(label)}
                    </td>
                    <td
                      style={{
                        padding: '0.5rem 0.75rem',
                        color: '#111',
                        background: i % 2 === 0 ? '#f9fafb' : '#fff',
                      }}
                    >
                      <span style={{ color: primaryColor, fontWeight: 500 }}>{render(value)}</span>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      );

    case 'callout': {
      const cc =
        CALLOUT_COLORS.find((x) => x.bg === (block.highlight ?? CALLOUT_COLORS[0].bg)) ??
        CALLOUT_COLORS[0];
      return (
        <div
          style={{
            ...base,
            background: cc.bg,
            border: `1px solid ${cc.border}`,
            color: cc.text,
            borderRadius: 6,
            padding: '0.75rem 1rem',
            marginBottom: '0.875rem',
            fontSize: '0.875rem',
            lineHeight: 1.7,
          }}
        >
          {render(block.content)}
        </div>
      );
    }

    case 'divider':
      return <hr style={{ border: 'none', borderTop: '1px solid #e5e7eb', margin: '0.75rem 0' }} />;

    case 'signature':
      return (
        <div style={{ ...base, marginTop: '1.5rem' }}>
          {block.content
            .split('\n')
            .filter(Boolean)
            .map((line, i) => (
              <div
                key={i}
                style={{
                  fontSize: i === 0 ? '0.9375rem' : '0.8125rem',
                  fontWeight: i === 0 ? 600 : 400,
                  color: i === 0 ? primaryColor : '#667085',
                  lineHeight: 1.4,
                }}
              >
                {render(line)}
              </div>
            ))}
        </div>
      );

    default:
      return null;
  }
};
