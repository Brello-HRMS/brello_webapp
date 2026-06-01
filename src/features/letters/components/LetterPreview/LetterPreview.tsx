import { useCallback } from 'react';
import { Download } from 'lucide-react';

import { VARIABLE_DISPLAY_LABELS } from '../../types/letterTypes';

import styles from './LetterPreview.module.scss';

interface LetterPreviewProps {
  name: string;
  subject?: string;
  content: string;
  showDownload?: boolean;
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function variableToLabel(key: string): string {
  return (
    VARIABLE_DISPLAY_LABELS[key] ?? key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
  );
}

/** Minimal markdown → HTML converter suitable for letter body text */
function markdownToHtml(text: string): string {
  return (
    text
      // headings
      .replace(/^### (.+)$/gm, '<h3>$1</h3>')
      .replace(/^## (.+)$/gm, '<h2>$1</h2>')
      .replace(/^# (.+)$/gm, '<h1>$1</h1>')
      // bold / italic
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/_(.+?)_/g, '<em>$1</em>')
      // unordered lists: convert consecutive "- item" lines into a <ul>
      .replace(/((?:^- .+\n?)+)/gm, (block) => {
        const items = block
          .trim()
          .split('\n')
          .map((l) => `<li>${l.replace(/^- /, '')}</li>`)
          .join('');
        return `<ul>${items}</ul>`;
      })
      // paragraphs: blank line → paragraph break
      .replace(/\n{2,}/g, '\n\n')
      .split('\n\n')
      .map((para) => {
        const trimmed = para.trim();
        if (!trimmed) return '';
        if (/^<(h[123]|ul|ol|li)/.test(trimmed)) return trimmed;
        return `<p>${trimmed.replace(/\n/g, '<br>')}</p>`;
      })
      .join('\n')
  );
}

/**
 * Processes template content:
 * 1. Replaces {{variable}} with styled [Display Label] spans using a placeholder
 * 2. Converts remaining markdown to HTML
 * 3. Restores the styled spans
 */
function processContent(content: string): string {
  const placeholders: Record<string, string> = {};
  let idx = 0;

  const withPlaceholders = content.replace(/\{\{([^}]+)\}\}/g, (_, key: string) => {
    const trimmed = key.trim();
    const label = variableToLabel(trimmed);
    const ph = `LETTERVAR${idx++}END`;
    placeholders[ph] = `<span class="letter-variable">[${label}]</span>`;
    return ph;
  });

  let html = markdownToHtml(withPlaceholders);

  for (const [ph, span] of Object.entries(placeholders)) {
    html = html.replaceAll(ph, span);
  }

  return html;
}

function buildPrintHtml(name: string, subject: string, bodyHtml: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${name}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Georgia', serif; font-size: 14px; line-height: 1.7; color: #111; background: #fff; padding: 40px; max-width: 760px; margin: 0 auto; }
    .date-line { text-align: right; color: #555; margin-bottom: 32px; font-size: 13px; }
    .logo-area { margin-bottom: 28px; }
    .logo-placeholder { width: 80px; height: 60px; background: #4f46e5; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 22px; font-weight: 900; }
    .subject-line { font-weight: 700; margin-bottom: 24px; font-size: 15px; }
    .body { margin-bottom: 40px; }
    .body p { margin-bottom: 14px; }
    .body ul { padding-left: 20px; margin-bottom: 14px; }
    .body li { margin-bottom: 6px; }
    .body strong { font-weight: 700; }
    .letter-variable { color: #4338ca; font-style: normal; }
    hr { border: none; border-top: 1px solid #e5e7eb; margin: 32px 0 12px; }
    .powered { font-size: 11px; color: #9ca3af; text-align: center; }
  </style>
</head>
<body>
  <div class="date-line">{{date}}</div>
  <div class="logo-area">
    <div class="logo-placeholder">B</div>
  </div>
  ${subject ? `<div class="subject-line">Subject: ${subject}</div>` : ''}
  <div class="body">${bodyHtml}</div>
  <hr>
  <div class="powered">Powered by Brello</div>
</body>
</html>`;
}

// ── Component ────────────────────────────────────────────────────────────────

export const LetterPreview: React.FC<LetterPreviewProps> = ({
  name,
  subject,
  content,
  showDownload = true,
}) => {
  const bodyHtml = processContent(content);
  const processedSubject = subject ? processContent(subject) : '';

  const handleDownload = useCallback(() => {
    const win = window.open('', '_blank', 'width=900,height=700');
    if (!win) return;
    win.document.write(buildPrintHtml(name, processedSubject, bodyHtml));
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 500);
  }, [name, processedSubject, bodyHtml]);

  return (
    <div className={styles.wrapper}>
      <div className={styles.paper}>
        {/* Date — top right */}
        <div className={styles.dateLine}>
          <span className={styles.variable}>[Date]</span>
        </div>

        {/* Company logo */}
        <div className={styles.logoArea}>
          <div className={styles.logoBadge}>B</div>
          <div className={styles.logoMeta}>
            <span className={styles.logoLabel}>Company Logo</span>
            <span className={styles.logoSub}>Will use organisation logo when generating</span>
          </div>
        </div>

        {/* Subject */}
        {subject && (
          <div
            className={styles.subject}
            dangerouslySetInnerHTML={{ __html: `<strong>Subject:</strong> ${processedSubject}` }}
          />
        )}

        {/* Body */}
        {content.trim() ? (
          <div className={styles.body} dangerouslySetInnerHTML={{ __html: bodyHtml }} />
        ) : (
          <div className={styles.bodyEmpty}>
            No content yet — switch to Editor to start writing.
          </div>
        )}

        {/* Footer */}
        <div className={styles.footer}>
          <hr className={styles.divider} />
          <span className={styles.poweredBy}>Powered by Brello</span>
        </div>
      </div>

      {/* Download */}
      {showDownload && (
        <div className={styles.downloadRow}>
          <button className={styles.downloadBtn} onClick={handleDownload}>
            <Download size={15} />
            Download as PDF
          </button>
        </div>
      )}
    </div>
  );
};
