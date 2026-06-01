import { AlignLeft, AlignCenter, AlignRight } from 'lucide-react';

import { CALLOUT_COLORS } from '../../types/designerTypes';

import styles from './TemplateDesigner.module.scss';

import type { TemplateBlock, BlockAlign, BlockSize } from '../../types/designerTypes';

export interface BlockToolbarProps {
  block: TemplateBlock;
  onUpdateProp: (props: Partial<TemplateBlock>) => void;
}

export const BlockToolbar: React.FC<BlockToolbarProps> = ({ block, onUpdateProp }) => {
  if (block.type === 'divider') return null;

  const align = block.align ?? 'left';
  const size = block.size ?? (block.type === 'heading' ? 'lg' : 'md');

  return (
    <div className={styles.blockToolbar}>
      {/* Alignment */}
      {(['left', 'center', 'right'] as const).map((a) => (
        <button
          key={a}
          type="button"
          className={`${styles.toolbarBtn} ${align === a ? styles.toolbarBtnActive : ''}`}
          onMouseDown={(e) => {
            e.preventDefault();
            onUpdateProp({ align: a as BlockAlign });
          }}
          title={`Align ${a}`}
        >
          {a === 'left' ? (
            <AlignLeft size={11} />
          ) : a === 'center' ? (
            <AlignCenter size={11} />
          ) : (
            <AlignRight size={11} />
          )}
        </button>
      ))}

      {/* Size for heading */}
      {block.type === 'heading' && (
        <>
          <div className={styles.toolbarSep} />
          {(['lg', 'md', 'sm'] as BlockSize[]).map((s, i) => (
            <button
              key={s}
              type="button"
              className={`${styles.toolbarBtn} ${size === s ? styles.toolbarBtnActive : ''}`}
              onMouseDown={(e) => {
                e.preventDefault();
                onUpdateProp({ size: s });
              }}
              title={`Heading size ${['H1', 'H2', 'H3'][i]}`}
            >
              {['H1', 'H2', 'H3'][i]}
            </button>
          ))}
        </>
      )}

      {/* Size for paragraph */}
      {block.type === 'text' && (
        <>
          <div className={styles.toolbarSep} />
          {(['sm', 'md', 'lg'] as BlockSize[]).map((s, i) => (
            <button
              key={s}
              type="button"
              className={`${styles.toolbarBtn} ${size === s ? styles.toolbarBtnActive : ''}`}
              onMouseDown={(e) => {
                e.preventDefault();
                onUpdateProp({ size: s });
              }}
              title={['Small', 'Medium', 'Large'][i]}
            >
              {['Sm', 'Md', 'Lg'][i]}
            </button>
          ))}
        </>
      )}

      {/* Callout color swatches */}
      {block.type === 'callout' && (
        <>
          <div className={styles.toolbarSep} />
          {CALLOUT_COLORS.map((c) => (
            <button
              key={c.bg}
              type="button"
              className={`${styles.toolbarColorBtn} ${(block.highlight ?? CALLOUT_COLORS[0].bg) === c.bg ? styles.toolbarColorBtnActive : ''}`}
              style={{ background: c.bg, borderColor: c.border }}
              onMouseDown={(e) => {
                e.preventDefault();
                onUpdateProp({ highlight: c.bg });
              }}
              title={c.label}
            />
          ))}
        </>
      )}
    </div>
  );
};
