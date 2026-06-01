import styles from './TemplateCard.module.scss';

import type { LetterTemplate } from '../../types/letterTypes';
import type { TemplateDesign, BlockType } from '../../types/designerTypes';

const BLOCK_PREVIEW_COLORS: Record<BlockType, string> = {
  heading: '#1d2939',
  subject: '#344054',
  text: '#d0d5dd',
  list: '#d0d5dd',
  table: '#e5e7eb',
  callout: '#dbeafe',
  divider: '#f2f4f7',
  signature: '#c4b5fd',
};

interface Props {
  tpl: LetterTemplate;
  primaryColor: string;
}

export const MiniDocPreview: React.FC<Props> = ({ tpl, primaryColor }) => {
  const design = tpl.design as TemplateDesign | null | undefined;
  const blocks = design?.blocks ?? [];

  return (
    <div className={styles.miniDoc}>
      <div className={styles.miniHeader}>
        <div className={styles.miniLogo} style={{ background: primaryColor }} />
        <div className={styles.miniHeaderLines}>
          <div
            className={styles.miniHeaderLine}
            style={{ width: '55%', background: primaryColor, opacity: 0.25 }}
          />
          <div className={styles.miniHeaderLine} style={{ width: '35%', background: '#e5e7eb' }} />
        </div>
      </div>

      <div className={styles.miniBlocks}>
        {blocks.length === 0
          ? [70, 90, 60, 80, 55, 75].map((w, i) => (
              <div
                key={i}
                className={styles.miniLine}
                style={{ width: `${w}%`, background: '#e5e7eb' }}
              />
            ))
          : blocks.slice(0, 7).map((b) => {
              if (b.type === 'divider') return <div key={b.id} className={styles.miniDivider} />;

              if (b.type === 'heading') {
                return (
                  <div
                    key={b.id}
                    className={styles.miniHeadingLine}
                    style={{ background: BLOCK_PREVIEW_COLORS.heading }}
                  />
                );
              }
              if (b.type === 'subject') {
                return (
                  <div
                    key={b.id}
                    className={styles.miniSubjectLine}
                    style={{ background: BLOCK_PREVIEW_COLORS.subject }}
                  />
                );
              }
              if (b.type === 'table') {
                return (
                  <div key={b.id} className={styles.miniTable}>
                    {[1, 2, 3].map((r) => (
                      <div key={r} className={styles.miniTableRow}>
                        <div className={styles.miniTableCell} style={{ background: '#f9fafb' }} />
                        <div className={styles.miniTableCell} style={{ background: '#fff' }} />
                      </div>
                    ))}
                  </div>
                );
              }
              if (b.type === 'callout') {
                return (
                  <div
                    key={b.id}
                    className={styles.miniCallout}
                    style={{ background: BLOCK_PREVIEW_COLORS.callout, borderColor: '#93c5fd' }}
                  />
                );
              }
              if (b.type === 'signature') {
                return (
                  <div key={b.id} className={styles.miniSig}>
                    <div
                      className={styles.miniSigLine}
                      style={{ background: primaryColor, opacity: 0.6 }}
                    />
                    <div
                      className={styles.miniSigLine}
                      style={{ width: '45%', background: '#e5e7eb' }}
                    />
                  </div>
                );
              }
              return (
                <div key={b.id} className={styles.miniTextBlock}>
                  <div
                    className={styles.miniLine}
                    style={{ width: '92%', background: BLOCK_PREVIEW_COLORS.text }}
                  />
                  <div
                    className={styles.miniLine}
                    style={{ width: '75%', background: BLOCK_PREVIEW_COLORS.text }}
                  />
                </div>
              );
            })}
      </div>
    </div>
  );
};
