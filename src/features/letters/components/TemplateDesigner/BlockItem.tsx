import { useState, useEffect } from 'react';
import { ArrowUp, ArrowDown, Trash2, Copy } from 'lucide-react';

import { BLOCK_META, CALLOUT_COLORS } from '../../types/designerTypes';
import { VARIABLE_DISPLAY_LABELS } from '../../types/letterTypes';

import { HEADING_SIZES, TEXT_SIZES } from './utils';
import { BlockToolbar } from './BlockToolbar';
import styles from './TemplateDesigner.module.scss';

import type { TemplateBlock } from '../../types/designerTypes';

// ── Inline helper — only used within this component ────────────────────────────

function highlightVariables(text: string, color?: string): React.ReactNode {
  return text.split(/(\{\{[^}]+\}\})/g).map((part, i) =>
    /^\{\{[^}]+\}\}$/.test(part) ? (
      <span key={i} className={styles.varHighlight} style={color ? { color } : undefined}>
        {part}
      </span>
    ) : (
      part
    ),
  );
}

// ── Types ─────────────────────────────────────────────────────────────────────

export interface BlockItemProps {
  block: TemplateBlock;
  isFirst: boolean;
  isLast: boolean;
  isFocused: boolean;
  fontFamily: string;
  primaryColor: string;
  allVarKeys: string[];
  onFocus: () => void;
  onChange: (content: string) => void;
  onUpdateProp: (props: Partial<TemplateBlock>) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  textareaRef?: React.RefObject<HTMLTextAreaElement | null>;
}

// ── Component ─────────────────────────────────────────────────────────────────

export const BlockItem: React.FC<BlockItemProps> = ({
  block,
  isFirst,
  isLast,
  isFocused,
  fontFamily,
  primaryColor,
  allVarKeys,
  onFocus,
  onChange,
  onUpdateProp,
  onMoveUp,
  onMoveDown,
  onDelete,
  onDuplicate,
  textareaRef,
}) => {
  const [acQuery, setAcQuery] = useState<string | null>(null);
  const [acRect, setAcRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    if (isFocused && textareaRef?.current) {
      const ta = textareaRef.current;
      ta.style.height = 'auto';
      ta.style.height = ta.scrollHeight + 'px';
      ta.focus();
      ta.selectionStart = ta.selectionEnd = ta.value.length;
    }
  }, [isFocused, textareaRef]);

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    e.target.style.height = 'auto';
    e.target.style.height = e.target.scrollHeight + 'px';
    onChange(e.target.value);
    const cursor = e.target.selectionStart;
    const textBefore = e.target.value.slice(0, cursor);
    const match = textBefore.match(/\{\{([^}]*)$/);
    if (match) {
      setAcQuery(match[1].toLowerCase());
      setAcRect(e.target.getBoundingClientRect());
    } else {
      setAcQuery(null);
      setAcRect(null);
    }
  };

  const handleSelectSuggestion = (key: string) => {
    const textarea = textareaRef?.current;
    if (!textarea) return;
    const cursor = textarea.selectionStart;
    const textBefore = block.content.slice(0, cursor);
    const match = textBefore.match(/\{\{([^}]*)$/);
    if (!match) return;
    const start = cursor - match[0].length;
    onChange(block.content.slice(0, start) + `{{${key}}}` + block.content.slice(cursor));
    setAcQuery(null);
    setAcRect(null);
    requestAnimationFrame(() => {
      if (textareaRef?.current) {
        const ta = textareaRef.current;
        ta.focus();
        ta.selectionStart = ta.selectionEnd = start + key.length + 4;
        ta.style.height = 'auto';
        ta.style.height = ta.scrollHeight + 'px';
      }
    });
  };

  const acSuggestions =
    acQuery !== null
      ? allVarKeys
          .filter(
            (k) =>
              k.toLowerCase().includes(acQuery) ||
              (VARIABLE_DISPLAY_LABELS[k] ?? '').toLowerCase().includes(acQuery),
          )
          .slice(0, 7)
      : [];

  const align = block.align ?? 'left';
  const size = block.size ?? (block.type === 'heading' ? 'lg' : 'md');
  const alignStyle = { textAlign: align as React.CSSProperties['textAlign'] };

  const blockCls =
    block.type === 'heading'
      ? styles.headingBlock
      : block.type === 'subject'
        ? styles.subjectBlock
        : block.type === 'list'
          ? styles.listBlock
          : block.type === 'signature'
            ? styles.signatureBlock
            : block.type === 'callout'
              ? styles.calloutBlock
              : block.type === 'table'
                ? styles.tableBlock
                : styles.textBlock;

  const fontSizeStyle =
    block.type === 'heading'
      ? { fontSize: HEADING_SIZES[size] }
      : block.type === 'text'
        ? { fontSize: TEXT_SIZES[size] }
        : {};

  const calloutStyle =
    block.type === 'callout'
      ? (() => {
          const c =
            CALLOUT_COLORS.find((x) => x.bg === (block.highlight ?? CALLOUT_COLORS[0].bg)) ??
            CALLOUT_COLORS[0];
          return { background: c.bg, borderColor: c.border, color: c.text };
        })()
      : {};

  const controls = (
    <div className={styles.blockControls}>
      <span className={styles.blockBadge}>{BLOCK_META[block.type].label}</span>
      {!isFirst && (
        <button
          type="button"
          className={styles.blockControlBtn}
          onClick={(e) => {
            e.stopPropagation();
            onMoveUp();
          }}
          title="Move up"
        >
          <ArrowUp size={10} />
        </button>
      )}
      {!isLast && (
        <button
          type="button"
          className={styles.blockControlBtn}
          onClick={(e) => {
            e.stopPropagation();
            onMoveDown();
          }}
          title="Move down"
        >
          <ArrowDown size={10} />
        </button>
      )}
      <button
        type="button"
        className={styles.blockControlBtn}
        onClick={(e) => {
          e.stopPropagation();
          onDuplicate();
        }}
        title="Duplicate"
      >
        <Copy size={10} />
      </button>
      <button
        type="button"
        className={`${styles.blockControlBtn} ${styles.blockControlBtnDelete}`}
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        title="Delete"
      >
        <Trash2 size={10} />
      </button>
    </div>
  );

  if (block.type === 'divider') {
    return (
      <div
        className={`${styles.blockWrapper} ${isFocused ? styles.blockWrapperFocused : ''}`}
        onClick={onFocus}
      >
        <hr className={styles.dividerBlock} />
        {controls}
      </div>
    );
  }

  const renderViewContent = () => {
    if (!block.content) {
      return (
        <span className={styles.blockPlaceholder}>
          {BLOCK_META[block.type].placeholder.split('\n')[0] || 'Click to edit…'}
        </span>
      );
    }
    if (block.type === 'list') {
      return block.content
        .split('\n')
        .filter(Boolean)
        .map((line, i) => (
          <div key={i} className={styles.listItem}>
            • {highlightVariables(line, primaryColor)}
          </div>
        ));
    }
    if (block.type === 'table') {
      return (
        <table className={styles.tableEl}>
          <tbody>
            {block.content
              .split('\n')
              .filter(Boolean)
              .map((row, i) => {
                const [label = '', value = ''] = row.split('|').map((s) => s.trim());
                return (
                  <tr key={i}>
                    <td className={styles.tableLabel}>{highlightVariables(label, primaryColor)}</td>
                    <td className={styles.tableValue}>{highlightVariables(value, primaryColor)}</td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      );
    }
    if (block.type === 'subject') {
      return (
        <>
          <strong>Subject: </strong>
          {highlightVariables(block.content.replace(/^Subject:\s*/i, ''), primaryColor)}
        </>
      );
    }
    return highlightVariables(block.content, primaryColor);
  };

  return (
    <div className={`${styles.blockWrapper} ${isFocused ? styles.blockWrapperFocused : ''}`}>
      {isFocused && <BlockToolbar block={block} onUpdateProp={onUpdateProp} />}

      {isFocused && block.type !== 'table' ? (
        <textarea
          ref={textareaRef}
          className={`${styles.blockTextarea} ${blockCls}`}
          value={block.content}
          onChange={handleInput}
          placeholder={BLOCK_META[block.type].placeholder}
          style={{ fontFamily, ...alignStyle, ...fontSizeStyle, ...calloutStyle }}
          rows={1}
        />
      ) : (
        <div
          className={`${styles.blockContent} ${blockCls}`}
          onClick={onFocus}
          style={{
            fontFamily,
            ...alignStyle,
            ...fontSizeStyle,
            ...(block.type === 'callout' ? calloutStyle : {}),
          }}
        >
          {block.type === 'table' && isFocused ? (
            <textarea
              ref={textareaRef}
              className={styles.tableTextarea}
              value={block.content}
              onChange={handleInput}
              placeholder={BLOCK_META.table.placeholder}
              style={{ fontFamily }}
              rows={4}
            />
          ) : (
            renderViewContent()
          )}
        </div>
      )}

      {controls}

      {/* Autocomplete popup */}
      {isFocused && acSuggestions.length > 0 && acRect && (
        <div className={styles.acPopup} style={{ top: acRect.bottom + 4, left: acRect.left }}>
          {acSuggestions.map((key) => (
            <button
              key={key}
              type="button"
              className={styles.acItem}
              onMouseDown={(e) => {
                e.preventDefault();
                handleSelectSuggestion(key);
              }}
            >
              <span className={styles.acKey}>{`{{${key}}}`}</span>
              <span className={styles.acLabel}>
                {VARIABLE_DISPLAY_LABELS[key] ?? key.replace(/_/g, ' ')}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
