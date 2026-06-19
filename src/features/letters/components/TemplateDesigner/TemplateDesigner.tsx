import { useState, useRef, useCallback, useMemo } from 'react';
import { X, PenLine, Eye, Columns2, Plus, Check } from 'lucide-react';

import { Button } from '../../../../components/common';
import { showToast } from '../../../ToastFeature/ShowToast';
import { LETTER_VARIABLES, VARIABLE_SAMPLE_VALUES } from '../../types/letterTypes';
import {
  DEFAULT_DESIGN,
  DEFAULT_SETTINGS,
  BLOCK_META,
  ACCENT_COLORS,
  FONT_OPTIONS,
  THEME_PRESETS,
  STARTER_TEMPLATES,
  type TemplateDesign,
  type TemplateBlock,
  type BlockType,
  type CustomVariable,
} from '../../types/designerTypes';

import { BlockItem } from './BlockItem';
import { PreviewBlock } from './PreviewBlock';
import { StarterPicker } from './StarterPicker';
import { extractVariables, migrateToDesign } from './utils';
import styles from './TemplateDesigner.module.scss';

import type {
  LetterTemplate,
  CreateLetterTemplateParams,
  UpdateLetterTemplateParams,
} from '../../types/letterTypes';

// ── Constants ──────────────────────────────────────────────────────────────────

const BLOCK_TYPES: BlockType[] = [
  'heading',
  'subject',
  'text',
  'list',
  'table',
  'callout',
  'divider',
  'signature',
];

// ── Types ─────────────────────────────────────────────────────────────────────

type ViewMode = 'editor' | 'split' | 'preview';
type LeftTab = 'blocks' | 'settings' | 'variables';

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (params: CreateLetterTemplateParams | UpdateLetterTemplateParams) => void;
  categoryId: string;
  editing?: LetterTemplate | null;
  isPending?: boolean;
  /** When true, opens in preview-only mode — no editing or saving */
  viewOnly?: boolean;
}

// ── Inner component (always mounted when open=true) ───────────────────────────

const TemplateDesignerInner: React.FC<Omit<Props, 'open'>> = ({
  onClose,
  onSave,
  categoryId,
  editing,
  isPending,
  viewOnly,
}) => {
  const [name, setName] = useState(editing?.name ?? '');
  const [design, setDesign] = useState<TemplateDesign>(() => {
    const incoming = editing?.design as TemplateDesign | null | undefined;
    const loaded = editing ? (incoming ?? migrateToDesign(editing)) : DEFAULT_DESIGN;
    return {
      ...loaded,
      customVariables: loaded.customVariables ?? [],
      settings: { ...DEFAULT_SETTINGS, ...loaded.settings },
    };
  });
  const [focusedBlockId, setFocusedBlockId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>(viewOnly ? 'preview' : 'editor');
  const [leftTab, setLeftTab] = useState<LeftTab>('blocks');
  const [cvKey, setCvKey] = useState('');
  const [cvLabel, setCvLabel] = useState('');
  const [cvSample, setCvSample] = useState('');
  const [cvKeyError, setCvKeyError] = useState('');

  const focusedTextareaRef = useRef<HTMLTextAreaElement | null>(null);

  // ── Derived ────────────────────────────────────────────────────────────────

  const allVarKeys = useMemo(
    () => [
      ...LETTER_VARIABLES.flatMap((g) => g.vars),
      ...design.customVariables.map((cv) => cv.key),
    ],
    [design.customVariables],
  );

  const sampleValues = useMemo<Record<string, string>>(
    () => ({
      ...VARIABLE_SAMPLE_VALUES,
      ...Object.fromEntries(design.customVariables.map((cv) => [cv.key, cv.sampleValue])),
    }),
    [design.customVariables],
  );

  const allContent = design.blocks.map((b) => b.content).join('\n\n');
  const usedVarCount = extractVariables(allContent).length;
  const wordCount = allContent.trim().split(/\s+/).filter(Boolean).length;

  const { primaryColor, fontFamily, showDate, showFooter, pageMargin } = design.settings;

  // ── Block operations ────────────────────────────────────────────────────────

  const addBlock = useCallback(
    (type: BlockType) => {
      const block: TemplateBlock = { id: crypto.randomUUID(), type, content: '' };
      setDesign((d) => ({ ...d, blocks: [...d.blocks, block] }));
      setFocusedBlockId(block.id);
      if (viewMode === 'preview') setViewMode('editor');
    },
    [viewMode],
  );

  const updateBlock = useCallback((id: string, content: string) => {
    setDesign((d) => ({
      ...d,
      blocks: d.blocks.map((b) => (b.id === id ? { ...b, content } : b)),
    }));
  }, []);

  const updateBlockProp = useCallback((id: string, props: Partial<TemplateBlock>) => {
    setDesign((d) => ({
      ...d,
      blocks: d.blocks.map((b) => (b.id === id ? { ...b, ...props } : b)),
    }));
  }, []);

  const moveBlock = useCallback((id: string, dir: -1 | 1) => {
    setDesign((d) => {
      const blocks = [...d.blocks];
      const idx = blocks.findIndex((b) => b.id === id);
      const next = idx + dir;
      if (idx < 0 || next < 0 || next >= blocks.length) return d;
      [blocks[idx], blocks[next]] = [blocks[next], blocks[idx]];
      return { ...d, blocks };
    });
  }, []);

  const duplicateBlock = useCallback((id: string) => {
    setDesign((d) => {
      const idx = d.blocks.findIndex((b) => b.id === id);
      if (idx < 0) return d;
      const copy: TemplateBlock = { ...d.blocks[idx], id: crypto.randomUUID() };
      return { ...d, blocks: [...d.blocks.slice(0, idx + 1), copy, ...d.blocks.slice(idx + 1)] };
    });
  }, []);

  const deleteBlock = useCallback((id: string) => {
    setDesign((d) => ({ ...d, blocks: d.blocks.filter((b) => b.id !== id) }));
    setFocusedBlockId((prev) => (prev === id ? null : prev));
  }, []);

  const updateSettings = useCallback((partial: Partial<TemplateDesign['settings']>) => {
    setDesign((d) => ({ ...d, settings: { ...d.settings, ...partial } }));
  }, []);

  const applyTheme = useCallback(
    (preset: (typeof THEME_PRESETS)[0]) => {
      updateSettings({ primaryColor: preset.primaryColor, fontFamily: preset.fontFamily });
    },
    [updateSettings],
  );

  const applyStarter = useCallback((id: string) => {
    if (id === 'blank') {
      setDesign((d) => ({ ...d, blocks: [] }));
      return;
    }
    const starter = STARTER_TEMPLATES.find((t) => t.id === id);
    if (!starter) return;
    setDesign((d) => ({
      ...d,
      blocks: starter.blocks.map((b) => ({ ...b, id: crypto.randomUUID() })),
    }));
  }, []);

  // ── Custom variables ───────────────────────────────────────────────────────

  const addCustomVar = useCallback(() => {
    const key = cvKey
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '_')
      .replace(/[^a-z0-9_]/g, '');
    if (!key) {
      setCvKeyError('Key is required');
      return;
    }
    if (allVarKeys.includes(key)) {
      setCvKeyError('This key already exists');
      return;
    }
    const cv: CustomVariable = {
      id: crypto.randomUUID(),
      key,
      label: cvLabel.trim() || key.replace(/_/g, ' '),
      sampleValue: cvSample.trim() || `[${key}]`,
    };
    setDesign((d) => ({ ...d, customVariables: [...d.customVariables, cv] }));
    setCvKey('');
    setCvLabel('');
    setCvSample('');
    setCvKeyError('');
  }, [cvKey, cvLabel, cvSample, allVarKeys]);

  const deleteCustomVar = useCallback((id: string) => {
    setDesign((d) => ({ ...d, customVariables: d.customVariables.filter((cv) => cv.id !== id) }));
  }, []);

  const insertVariable = useCallback(
    (varKey: string) => {
      const textarea = focusedTextareaRef.current;
      if (textarea && focusedBlockId) {
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const snippet = `{{${varKey}}}`;
        setDesign((d) => ({
          ...d,
          blocks: d.blocks.map((b) =>
            b.id === focusedBlockId
              ? { ...b, content: b.content.slice(0, start) + snippet + b.content.slice(end) }
              : b,
          ),
        }));
        requestAnimationFrame(() => {
          if (focusedTextareaRef.current) {
            const ta = focusedTextareaRef.current;
            ta.focus();
            ta.selectionStart = ta.selectionEnd = start + snippet.length;
            ta.style.height = 'auto';
            ta.style.height = ta.scrollHeight + 'px';
          }
        });
      } else {
        navigator.clipboard
          .writeText(`{{${varKey}}}`)
          .then(() => showToast(`Copied {{${varKey}}}`, 'success'))
          .catch(() => showToast('Could not copy to clipboard', 'error'));
      }
    },
    [focusedBlockId],
  );

  // ── Save ───────────────────────────────────────────────────────────────────

  const handleSave = useCallback(() => {
    if (!name.trim()) {
      showToast('Template name is required', 'error');
      return;
    }
    const variables = extractVariables(allContent);
    const subject =
      design.blocks.find((b) => b.type === 'subject')?.content?.replace(/^Subject:\s*/i, '') ?? '';
    if (editing) {
      onSave({
        name,
        subject,
        content: allContent,
        variables,
        design,
      } satisfies UpdateLetterTemplateParams);
    } else {
      onSave({
        category_id: categoryId,
        name,
        subject,
        content: allContent,
        variables,
        design,
      } satisfies CreateLetterTemplateParams);
    }
  }, [name, design, allContent, editing, categoryId, onSave]);

  // ── Derived UI values ──────────────────────────────────────────────────────

  const paperMarginCls =
    pageMargin === 'compact'
      ? styles.paperCompact
      : pageMargin === 'wide'
        ? styles.paperWide
        : styles.paperStandard;

  const paperHeader = (
    <>
      {showDate && (
        <div className={styles.paperDate}>
          <span style={{ color: primaryColor }}>[Date]</span>
        </div>
      )}
      <div className={styles.paperLogo}>
        <div className={styles.paperLogoBadge} style={{ background: primaryColor }}>
          B
        </div>
        <div className={styles.paperLogoMeta}>
          <span className={styles.paperLogoLabel}>Company Logo</span>
          <span className={styles.paperLogoSub}>Organisation logo shown when generating</span>
        </div>
      </div>
    </>
  );

  const showStarterPicker = design.blocks.length === 0 && viewMode !== 'preview';

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className={styles.overlay}>
      {/* Top bar */}
      <div className={styles.topBar}>
        <button className={styles.closeBtn} onClick={onClose}>
          <X size={14} />
          Close
        </button>
        <div className={styles.topBarDivider} />
        {viewOnly ? (
          <span className={styles.nameInputReadOnly}>{name || 'Platform Template'}</span>
        ) : (
          <input
            className={styles.nameInput}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Template name…"
          />
        )}
        <div className={styles.topBarSpacer} />
        {viewOnly ? (
          <span className={styles.viewOnlyBadge}>
            <Check size={12} />
            Platform Template — View Only
          </span>
        ) : (
          <>
            <div className={styles.modeToggleGroup}>
              {(
                [
                  ['editor', 'Editor', PenLine],
                  ['split', 'Split', Columns2],
                  ['preview', 'Preview', Eye],
                ] as const
              ).map(([mode, label, Icon]) => (
                <button
                  key={mode}
                  className={`${styles.modeToggleBtn} ${viewMode === mode ? styles.modeToggleBtnActive : ''}`}
                  onClick={() => setViewMode(mode)}
                >
                  <Icon size={13} />
                  {label}
                </button>
              ))}
            </div>
            <Button variant="primary" onClick={handleSave} disabled={isPending}>
              {isPending ? 'Saving…' : editing ? 'Update Template' : 'Create Template'}
            </Button>
          </>
        )}
      </div>

      {/* Body */}
      <div className={styles.body}>
        {/* Left panel */}
        {viewMode !== 'preview' && (
          <aside className={styles.leftPanel}>
            <div className={styles.panelTabs}>
              {(['blocks', 'settings', 'variables'] as const).map((tab) => (
                <button
                  key={tab}
                  className={`${styles.panelTab} ${leftTab === tab ? styles.panelTabActive : ''}`}
                  onClick={() => setLeftTab(tab)}
                >
                  {tab === 'blocks' ? 'Blocks' : tab === 'settings' ? 'Design' : 'Variables'}
                </button>
              ))}
            </div>

            <div className={styles.panelContent}>
              {/* Blocks tab */}
              {leftTab === 'blocks' && (
                <div className={styles.blockPalette}>
                  {BLOCK_TYPES.map((type) => (
                    <button
                      key={type}
                      className={styles.blockTypeBtn}
                      onClick={() => addBlock(type)}
                    >
                      <div className={styles.blockTypeIcon}>{BLOCK_META[type].icon}</div>
                      <div>
                        <div className={styles.blockTypeLabel}>{BLOCK_META[type].label}</div>
                        <div className={styles.blockTypeDesc}>{BLOCK_META[type].description}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Design tab */}
              {leftTab === 'settings' && (
                <DesignPanel
                  primaryColor={primaryColor}
                  fontFamily={fontFamily}
                  pageMargin={pageMargin}
                  showDate={showDate}
                  showFooter={showFooter}
                  onUpdateSettings={updateSettings}
                  onApplyTheme={applyTheme}
                />
              )}

              {/* Variables tab */}
              {leftTab === 'variables' && (
                <VariablesPanel
                  focusedBlockId={focusedBlockId}
                  customVariables={design.customVariables}
                  cvKey={cvKey}
                  cvLabel={cvLabel}
                  cvSample={cvSample}
                  cvKeyError={cvKeyError}
                  onSetCvKey={(v) => {
                    setCvKey(v);
                    setCvKeyError('');
                  }}
                  onSetCvLabel={setCvLabel}
                  onSetCvSample={setCvSample}
                  onInsertVariable={insertVariable}
                  onAddCustomVar={addCustomVar}
                  onDeleteCustomVar={deleteCustomVar}
                />
              )}
            </div>
          </aside>
        )}

        {/* Editor canvas */}
        {viewMode !== 'preview' && (
          <div
            className={`${styles.canvas} ${viewMode === 'split' ? styles.canvasSplit : ''}`}
            onClick={() => setFocusedBlockId(null)}
          >
            <div className={styles.canvasInner}>
              <div
                className={`${styles.paper} ${paperMarginCls}`}
                style={{ fontFamily }}
                onClick={(e) => e.stopPropagation()}
              >
                {paperHeader}

                {showStarterPicker ? (
                  <StarterPicker onSelect={applyStarter} />
                ) : (
                  design.blocks.map((block, idx) => (
                    <BlockItem
                      key={block.id}
                      block={block}
                      isFirst={idx === 0}
                      isLast={idx === design.blocks.length - 1}
                      isFocused={focusedBlockId === block.id}
                      fontFamily={fontFamily}
                      primaryColor={primaryColor}
                      allVarKeys={allVarKeys}
                      onFocus={() => setFocusedBlockId(block.id)}
                      onChange={(content) => updateBlock(block.id, content)}
                      onUpdateProp={(props) => updateBlockProp(block.id, props)}
                      onMoveUp={() => moveBlock(block.id, -1)}
                      onMoveDown={() => moveBlock(block.id, 1)}
                      onDuplicate={() => duplicateBlock(block.id)}
                      onDelete={() => deleteBlock(block.id)}
                      textareaRef={focusedBlockId === block.id ? focusedTextareaRef : undefined}
                    />
                  ))
                )}

                {showFooter && <div className={styles.paperFooter}>Powered by Brello</div>}
              </div>

              {design.blocks.length > 0 && (
                <div className={styles.statusBar}>
                  <span className={styles.statusItem}>{design.blocks.length} blocks</span>
                  <span className={styles.statusDot}>·</span>
                  <span className={styles.statusItem}>{usedVarCount} variables</span>
                  <span className={styles.statusDot}>·</span>
                  <span className={styles.statusItem}>~{wordCount} words</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Preview panel */}
        {(viewMode === 'split' || viewMode === 'preview') && (
          <div
            className={`${styles.previewPanel} ${viewMode === 'preview' ? styles.previewPanelFull : ''}`}
          >
            <div className={styles.previewPanelHeader}>
              <span className={styles.previewPanelLabel}>Sample Data Preview</span>
              <span className={styles.previewPanelHint}>Variables resolved with sample values</span>
            </div>
            <div className={styles.previewPanelCanvas} onClick={() => setFocusedBlockId(null)}>
              <div className={`${styles.previewPaper} ${paperMarginCls}`} style={{ fontFamily }}>
                {paperHeader}
                {design.blocks.length === 0 ? (
                  <p className={styles.previewEmpty}>
                    No blocks yet — switch to Editor to start designing.
                  </p>
                ) : (
                  design.blocks.map((block) => (
                    <PreviewBlock
                      key={block.id}
                      block={block}
                      primaryColor={primaryColor}
                      fontFamily={fontFamily}
                      sampleValues={sampleValues}
                    />
                  ))
                )}
                {showFooter && <div className={styles.paperFooter}>Powered by Brello</div>}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ── DesignPanel — left panel "Design" tab ──────────────────────────────────────

interface DesignPanelProps {
  primaryColor: string;
  fontFamily: string;
  pageMargin: TemplateDesign['settings']['pageMargin'];
  showDate: boolean;
  showFooter: boolean;
  onUpdateSettings: (partial: Partial<TemplateDesign['settings']>) => void;
  onApplyTheme: (preset: (typeof THEME_PRESETS)[0]) => void;
}

const DesignPanel: React.FC<DesignPanelProps> = ({
  primaryColor,
  fontFamily,
  pageMargin,
  showDate,
  showFooter,
  onUpdateSettings,
  onApplyTheme,
}) => (
  <div>
    <div className={styles.settingGroup}>
      <span className={styles.settingLabel}>Theme Presets</span>
      <div className={styles.themeGrid}>
        {THEME_PRESETS.map((preset) => {
          const active = primaryColor === preset.primaryColor && fontFamily === preset.fontFamily;
          return (
            <button
              key={preset.id}
              className={`${styles.themeCard} ${active ? styles.themeCardActive : ''}`}
              onClick={() => onApplyTheme(preset)}
            >
              <span className={styles.themeEmoji}>{preset.emoji}</span>
              <div className={styles.themeColorDot} style={{ background: preset.primaryColor }} />
              <span className={styles.themeName}>{preset.name}</span>
              {active && <Check size={10} className={styles.themeCheck} />}
            </button>
          );
        })}
      </div>
    </div>

    <div className={styles.settingDivider} />

    <div className={styles.settingGroup}>
      <span className={styles.settingLabel}>Accent Color</span>
      <div className={styles.colorRow}>
        {ACCENT_COLORS.map((color) => (
          <button
            key={color}
            type="button"
            className={`${styles.colorSwatch} ${primaryColor === color ? styles.colorSwatchActive : ''}`}
            style={{ background: color }}
            onClick={() => onUpdateSettings({ primaryColor: color })}
          />
        ))}
      </div>
      <input
        type="text"
        className={styles.colorInput}
        value={primaryColor}
        onChange={(e) => onUpdateSettings({ primaryColor: e.target.value })}
        placeholder="#6941c6"
      />
    </div>

    <div className={styles.settingGroup}>
      <span className={styles.settingLabel}>Font Family</span>
      {FONT_OPTIONS.map((opt) => (
        <label key={opt.value} className={styles.fontOption}>
          <input
            type="radio"
            name="fontFamily"
            value={opt.value}
            checked={fontFamily === opt.value}
            onChange={() => onUpdateSettings({ fontFamily: opt.value })}
          />
          <span style={{ fontFamily: opt.value }}>{opt.label}</span>
        </label>
      ))}
    </div>

    <div className={styles.settingDivider} />

    <div className={styles.settingGroup}>
      <span className={styles.settingLabel}>Page Margin</span>
      <div className={styles.marginOptions}>
        {(['compact', 'standard', 'wide'] as const).map((m) => (
          <button
            key={m}
            className={`${styles.marginOption} ${pageMargin === m ? styles.marginOptionActive : ''}`}
            onClick={() => onUpdateSettings({ pageMargin: m })}
          >
            {m.charAt(0).toUpperCase() + m.slice(1)}
          </button>
        ))}
      </div>
    </div>

    <div className={styles.settingGroup}>
      <span className={styles.settingLabel}>Letter Elements</span>
      <div className={styles.toggleRow}>
        <span className={styles.toggleLabel}>Show Date Line</span>
        <button
          className={`${styles.toggle} ${showDate ? styles.toggleOn : ''}`}
          onClick={() => onUpdateSettings({ showDate: !showDate })}
        >
          <div className={styles.toggleThumb} />
        </button>
      </div>
      <div className={styles.toggleRow}>
        <span className={styles.toggleLabel}>Show Footer</span>
        <button
          className={`${styles.toggle} ${showFooter ? styles.toggleOn : ''}`}
          onClick={() => onUpdateSettings({ showFooter: !showFooter })}
        >
          <div className={styles.toggleThumb} />
        </button>
      </div>
    </div>
  </div>
);

// ── VariablesPanel — left panel "Variables" tab ────────────────────────────────

interface VariablesPanelProps {
  focusedBlockId: string | null;
  customVariables: CustomVariable[];
  cvKey: string;
  cvLabel: string;
  cvSample: string;
  cvKeyError: string;
  onSetCvKey: (v: string) => void;
  onSetCvLabel: (v: string) => void;
  onSetCvSample: (v: string) => void;
  onInsertVariable: (key: string) => void;
  onAddCustomVar: () => void;
  onDeleteCustomVar: (id: string) => void;
}

const VariablesPanel: React.FC<VariablesPanelProps> = ({
  focusedBlockId,
  customVariables,
  cvKey,
  cvLabel,
  cvSample,
  cvKeyError,
  onSetCvKey,
  onSetCvLabel,
  onSetCvSample,
  onInsertVariable,
  onAddCustomVar,
  onDeleteCustomVar,
}) => (
  <div>
    <p className={styles.varHint}>
      {focusedBlockId
        ? 'Click to insert at cursor · Or type {{ in a block'
        : 'Select a block first, then click · Or type {{ anywhere'}
    </p>

    {LETTER_VARIABLES.map((group) => (
      <div key={group.group} className={styles.varGroupSection}>
        <div className={styles.varGroupTitle}>{group.group}</div>
        <div className={styles.varChipList}>
          {group.vars.map((v) => (
            <button
              key={v}
              type="button"
              className={styles.varChip}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => onInsertVariable(v)}
            >
              {`{{${v}}}`}
            </button>
          ))}
        </div>
      </div>
    ))}

    <div className={styles.customVarSection}>
      <div className={styles.varGroupTitle}>Custom Variables</div>
      {customVariables.length > 0 && (
        <div className={styles.customVarList}>
          {customVariables.map((cv) => (
            <div key={cv.id} className={styles.customVarItem}>
              <button
                type="button"
                className={styles.varChip}
                style={{ background: '#fef3c7', borderColor: '#fcd34d', color: '#92400e' }}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => onInsertVariable(cv.key)}
              >
                {`{{${cv.key}}}`}
              </button>
              <span className={styles.customVarMeta}>{cv.label}</span>
              <button
                type="button"
                className={styles.customVarDeleteBtn}
                onClick={() => onDeleteCustomVar(cv.id)}
              >
                <X size={10} />
              </button>
            </div>
          ))}
        </div>
      )}
      <div className={styles.customVarForm}>
        <div className={styles.customVarFormTitle}>
          <Plus size={11} />
          Add custom variable
        </div>
        <input
          className={styles.customVarInput}
          value={cvKey}
          onChange={(e) => onSetCvKey(e.target.value)}
          placeholder="key (e.g. start_date)"
        />
        {cvKeyError && <span className={styles.customVarError}>{cvKeyError}</span>}
        <input
          className={styles.customVarInput}
          value={cvLabel}
          onChange={(e) => onSetCvLabel(e.target.value)}
          placeholder="Label (e.g. Start Date)"
        />
        <input
          className={styles.customVarInput}
          value={cvSample}
          onChange={(e) => onSetCvSample(e.target.value)}
          placeholder="Sample value (for preview)"
        />
        <button
          type="button"
          className={styles.customVarAddBtn}
          onClick={onAddCustomVar}
          disabled={!cvKey.trim()}
        >
          <Check size={11} />
          Add Variable
        </button>
      </div>
    </div>
  </div>
);

// ── Public export — remounts inner on open/editing change ─────────────────────

export const TemplateDesigner: React.FC<Props> = ({ open, editing, ...props }) => {
  if (!open) return null;
  return <TemplateDesignerInner key={editing?.id ?? 'new'} editing={editing} {...props} />;
};
