import { Pencil, Trash2, Layers, Lock, Eye } from 'lucide-react';

import { MiniDocPreview } from './MiniDocPreview';
import { BlockTypeBadges } from './BlockTypeBadges';
import styles from './TemplateCard.module.scss';

import type { TemplateDesign } from '../../types/designerTypes';
import type { LetterTemplate } from '../../types/letterTypes';

const CARD_ACCENT_COLORS = [
  '#6941c6',
  '#1d4ed8',
  '#0d9488',
  '#d97706',
  '#dc2626',
  '#059669',
  '#7c3aed',
];

interface Props {
  tpl: LetterTemplate;
  index: number;
  onEdit: () => void;
  onDelete: () => void;
  onPreview?: () => void;
  readOnly?: boolean;
}

export const TemplateCard: React.FC<Props> = ({ tpl, index, onEdit, onDelete, onPreview, readOnly }) => {
  const design = tpl.design as TemplateDesign | null | undefined;
  const blockCount = design?.blocks?.length ?? 0;
  const varCount = tpl.variables.length;
  const primaryColor =
    design?.settings?.primaryColor ?? CARD_ACCENT_COLORS[index % CARD_ACCENT_COLORS.length];

  return (
    <div className={`${styles.templateCard} ${readOnly ? styles.templateCardSystem : ''}`}>
      {/* System badge — pinned to top-right corner */}
      {readOnly && (
        <div className={styles.systemBadge}>
          <Lock size={9} />
          Platform
        </div>
      )}

      {/* Preview area */}
      <div
        className={styles.templateCardPreview}
        onClick={readOnly ? onPreview : onEdit}
        style={{ cursor: readOnly && !onPreview ? 'default' : 'pointer' }}
      >
        <MiniDocPreview tpl={tpl} primaryColor={primaryColor} />

        {readOnly ? (
          <div className={styles.templateCardOverlay}>
            <span className={styles.overlayViewBtn}>
              <Eye size={13} />
              Preview
            </span>
          </div>
        ) : (
          <div className={styles.templateCardOverlay}>
            <span className={styles.overlayEditBtn}>
              <Pencil size={13} />
              Open Designer
            </span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className={styles.templateCardFooter}>
        <div className={styles.templateCardMeta}>
          <h3 className={styles.templateCardName} title={tpl.name}>
            {tpl.name}
          </h3>
          <div className={styles.templateCardStats}>
            {blockCount > 0 && (
              <span className={styles.statChip}>
                <Layers size={10} />
                {blockCount} block{blockCount !== 1 ? 's' : ''}
              </span>
            )}
            {varCount > 0 && (
              <span className={styles.statChip}>
                {`{{}}`} {varCount} var{varCount !== 1 ? 's' : ''}
              </span>
            )}
          </div>
          <BlockTypeBadges tpl={tpl} />
        </div>

        {!readOnly && (
          <div className={styles.templateCardActions}>
            <button className={styles.tplActionBtn} onClick={onEdit} title="Edit template">
              <Pencil size={13} />
            </button>
            <button
              className={`${styles.tplActionBtn} ${styles.tplActionBtnDelete}`}
              onClick={onDelete}
              title="Delete template"
            >
              <Trash2 size={13} />
            </button>
          </div>
        )}
      </div>

      {/* Accent bar */}
      <div className={styles.templateCardAccent} style={{ background: primaryColor }} />
    </div>
  );
};
