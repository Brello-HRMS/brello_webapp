import styles from './TemplateCard.module.scss';

import type { LetterTemplate } from '../../types/letterTypes';
import type { TemplateDesign, BlockType } from '../../types/designerTypes';

const BLOCK_ICON: Partial<Record<BlockType, string>> = {
  heading: 'H',
  subject: 'S',
  text: 'P',
  list: '•',
  table: '⊞',
  callout: '!',
  signature: '✍',
};

interface Props {
  tpl: LetterTemplate;
}

export const BlockTypeBadges: React.FC<Props> = ({ tpl }) => {
  const design = tpl.design as TemplateDesign | null | undefined;
  const blocks = design?.blocks ?? [];

  const typeCounts = blocks.reduce<Partial<Record<BlockType, number>>>((acc, b) => {
    if (b.type !== 'divider') acc[b.type] = (acc[b.type] ?? 0) + 1;
    return acc;
  }, {});

  const entries = Object.entries(typeCounts) as [BlockType, number][];

  if (entries.length === 0) {
    return <span className={styles.noBlocksHint}>No blocks yet</span>;
  }

  return (
    <div className={styles.blockBadgeStrip}>
      {entries.slice(0, 5).map(([type, count]) => (
        <span key={type} className={styles.blockBadge}>
          {BLOCK_ICON[type] ?? type[0].toUpperCase()}
          {count > 1 && <span className={styles.blockBadgeCount}>×{count}</span>}
        </span>
      ))}
    </div>
  );
};
