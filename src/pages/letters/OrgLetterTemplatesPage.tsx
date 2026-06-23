import React, { useState, useCallback, useMemo } from 'react';
import { Plus, Pencil, Trash2, FolderOpen, LayoutTemplate, Globe, Building2 } from 'lucide-react';

import { Button, NoDataFound, PageHeader, WarningModal } from '../../components/common';
import {
  useLetterCategories,
  useCreateLetterCategory,
  useUpdateLetterCategory,
  useDeleteLetterCategory,
} from '../../features/letters/hooks/useLetterCategories';
import {
  useLetterTemplates,
  useCreateLetterTemplate,
  useUpdateLetterTemplate,
  useDeleteLetterTemplate,
} from '../../features/letters/hooks/useLetterTemplates';
import { CategoryFormModal } from '../../features/letters/components/CategoryFormModal/CategoryFormModal';
import { TemplateDesigner } from '../../features/letters/components/TemplateDesigner/TemplateDesigner';
import { TemplateCard } from '../../features/letters/components/TemplateCard/TemplateCard';
import { DOCUMENT_TYPES, DOCUMENT_TYPE_META } from '../../features/letters/types/letterTypes';
import styles from '../platform/PlatformLettersPage.module.scss';

import pageStyles from './OrgLetterTemplatesPage.module.scss';

import type {
  LetterCategory,
  LetterTemplate,
  DocumentType,
} from '../../features/letters/types/letterTypes';
import type {
  CreateLetterCategoryParams,
  CreateLetterTemplateParams,
  UpdateLetterTemplateParams,
} from '../../features/letters/types/letterTypes';

// ── Page ──────────────────────────────────────────────────────────────────────

const OrgLetterTemplatesPage: React.FC = () => {
  const [activeDocType, setActiveDocType] = useState<DocumentType>('hr_letter');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  const [categoryFormOpen, setCategoryFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<LetterCategory | null>(null);
  const [deleteCategoryTarget, setDeleteCategoryTarget] = useState<LetterCategory | null>(null);

  const [templateFormOpen, setTemplateFormOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<LetterTemplate | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<LetterTemplate | null>(null);
  const [deleteTemplateTarget, setDeleteTemplateTarget] = useState<LetterTemplate | null>(null);

  const { data: categories = [], isLoading: isCatsLoading } = useLetterCategories(activeDocType);

  const activeCategoryId = selectedCategoryId ?? categories[0]?.id ?? null;

  const { data: templates = [], isLoading: isTemplatesLoading } = useLetterTemplates(
    activeCategoryId ?? undefined,
  );

  const activeCategory = useMemo(
    () => categories.find((c) => c.id === activeCategoryId) ?? null,
    [categories, activeCategoryId],
  );

  const systemCategories = useMemo(() => categories.filter((c) => c.is_system), [categories]);
  const orgCategories = useMemo(() => categories.filter((c) => !c.is_system), [categories]);

  const systemTemplates = useMemo(() => templates.filter((t) => t.is_system), [templates]);
  const orgTemplates = useMemo(() => templates.filter((t) => !t.is_system), [templates]);

  const { mutate: createCategory, isPending: isCreatingCat } = useCreateLetterCategory();
  const { mutate: updateCategory, isPending: isUpdatingCat } = useUpdateLetterCategory();
  const { mutate: deleteCategory, isPending: isDeletingCat } = useDeleteLetterCategory();

  const { mutate: createTemplate, isPending: isCreatingTpl } = useCreateLetterTemplate(
    activeCategoryId ?? '',
  );
  const { mutate: updateTemplate, isPending: isUpdatingTpl } = useUpdateLetterTemplate(
    activeCategoryId ?? '',
  );
  const { mutate: deleteTemplate } = useDeleteLetterTemplate(activeCategoryId ?? '');

  const switchDocType = useCallback((type: DocumentType) => {
    setActiveDocType(type);
    setSelectedCategoryId(null);
  }, []);

  const handleSaveCategory = useCallback(
    (params: CreateLetterCategoryParams) => {
      if (editingCategory) {
        updateCategory(
          { id: editingCategory.id, params },
          { onSuccess: () => setCategoryFormOpen(false) },
        );
      } else {
        createCategory(params, {
          onSuccess: (cat) => {
            setCategoryFormOpen(false);
            setSelectedCategoryId((cat as LetterCategory).id);
          },
        });
      }
    },
    [editingCategory, createCategory, updateCategory],
  );

  const handleDeleteCategory = useCallback(() => {
    if (!deleteCategoryTarget) return;
    deleteCategory(deleteCategoryTarget.id, {
      onSuccess: () => {
        setDeleteCategoryTarget(null);
        if (activeCategoryId === deleteCategoryTarget.id) setSelectedCategoryId(null);
      },
    });
  }, [deleteCategoryTarget, deleteCategory, activeCategoryId]);

  const handleSaveTemplate = useCallback(
    (params: CreateLetterTemplateParams | UpdateLetterTemplateParams) => {
      if (editingTemplate) {
        updateTemplate(
          { id: editingTemplate.id, params: params as UpdateLetterTemplateParams },
          { onSuccess: () => setTemplateFormOpen(false) },
        );
      } else {
        createTemplate(params as CreateLetterTemplateParams, {
          onSuccess: () => setTemplateFormOpen(false),
        });
      }
    },
    [editingTemplate, createTemplate, updateTemplate],
  );

  const handleDeleteTemplate = useCallback(() => {
    if (!deleteTemplateTarget) return;
    deleteTemplate(deleteTemplateTarget.id, { onSuccess: () => setDeleteTemplateTarget(null) });
  }, [deleteTemplateTarget, deleteTemplate]);

  const openNewTemplate = useCallback(() => {
    if (!activeCategoryId) return;
    setEditingTemplate(null);
    setTemplateFormOpen(true);
  }, [activeCategoryId]);

  const openEditTemplate = useCallback((tpl: LetterTemplate) => {
    setEditingTemplate(tpl);
    setTemplateFormOpen(true);
  }, []);

  const activeDocMeta = DOCUMENT_TYPE_META[activeDocType];
  const canCreateTemplate = !!activeCategoryId && !activeCategory?.is_system;

  return (
    <div className={styles.container}>
      <PageHeader
        title="Letter Templates"
        subtitle="Create and manage your organisation's letter templates."
        actions={
          canCreateTemplate && (
            <Button variant="primary" onClick={openNewTemplate}>
              <Plus size={16} />
              New Template
            </Button>
          )
        }
      />

      {/* Document type tab bar */}
      <div className={styles.typeTabBar}>
        {DOCUMENT_TYPES.map((type) => {
          const meta = DOCUMENT_TYPE_META[type];
          const isActive = activeDocType === type;
          return (
            <button
              key={type}
              className={`${styles.typeTab} ${isActive ? styles.typeTabActive : ''}`}
              style={
                isActive
                  ? ({ '--tab-color': meta.color, '--tab-bg': meta.bg } as React.CSSProperties)
                  : undefined
              }
              onClick={() => switchDocType(type)}
            >
              <span className={styles.typeTabEmoji}>{meta.emoji}</span>
              <span className={styles.typeTabLabel}>{meta.label}</span>
            </button>
          );
        })}
      </div>

      <div className={styles.layout}>
        {/* ── Sidebar ──────────────────────────────────────────────────────── */}
        <aside className={styles.sidebar}>
          <div className={styles.sidebarHeader}>
            <div className={styles.sidebarHeaderLeft}>
              <FolderOpen size={14} className={styles.sidebarIcon} />
              <span className={styles.sidebarTitle}>Categories</span>
            </div>
            <button
              className={styles.addCategoryBtn}
              onClick={() => {
                setEditingCategory(null);
                setCategoryFormOpen(true);
              }}
              title="Add category"
            >
              <Plus size={13} />
            </button>
          </div>

          {isCatsLoading ? (
            <div className={styles.sidebarSkeleton}>
              {[1, 2, 3].map((n) => (
                <div key={n} className={styles.skeletonItem} />
              ))}
            </div>
          ) : categories.length === 0 ? (
            <div className={styles.sidebarEmpty}>
              <LayoutTemplate size={28} className={styles.sidebarEmptyIcon} />
              <p>No categories yet</p>
              <button className={styles.inlineCta} onClick={() => setCategoryFormOpen(true)}>
                Create first category
              </button>
            </div>
          ) : (
            <div>
              {/* Platform (system) categories */}
              {systemCategories.length > 0 && (
                <div className={pageStyles.sidebarSection}>
                  <div className={pageStyles.sidebarSectionHeader}>
                    <Globe size={10} />
                    Platform
                  </div>
                  <ul className={styles.categoryList}>
                    {systemCategories.map((cat) => (
                      <li key={cat.id}>
                        <button
                          className={`${styles.categoryItem} ${pageStyles.categoryItemSystem} ${activeCategoryId === cat.id ? styles.categoryItemActive : ''}`}
                          onClick={() => setSelectedCategoryId(cat.id)}
                        >
                          <span className={styles.categoryDot} />
                          <span className={styles.categoryName}>{cat.name}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Org-created categories */}
              {orgCategories.length > 0 && (
                <div className={pageStyles.sidebarSection}>
                  <div className={pageStyles.sidebarSectionHeader}>
                    <Building2 size={10} />
                    Your Categories
                  </div>
                  <ul className={styles.categoryList}>
                    {orgCategories.map((cat) => (
                      <li key={cat.id}>
                        <button
                          className={`${styles.categoryItem} ${activeCategoryId === cat.id ? styles.categoryItemActive : ''}`}
                          onClick={() => setSelectedCategoryId(cat.id)}
                        >
                          <span className={styles.categoryDot} />
                          <span className={styles.categoryName}>{cat.name}</span>
                          <span className={styles.categoryActions}>
                            <span
                              role="button"
                              className={styles.categoryActionBtn}
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingCategory(cat);
                                setCategoryFormOpen(true);
                              }}
                              title="Edit"
                            >
                              <Pencil size={11} />
                            </span>
                            <span
                              role="button"
                              className={`${styles.categoryActionBtn} ${styles.categoryActionBtnDelete}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteCategoryTarget(cat);
                              }}
                              title="Delete"
                            >
                              <Trash2 size={11} />
                            </span>
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </aside>

        {/* ── Main content ─────────────────────────────────────────────────── */}
        <main className={styles.content}>
          {!activeCategoryId ? (
            <NoDataFound
              title="Select a category"
              description={`Choose a ${activeDocMeta.label} category from the sidebar or create one to get started.`}
            />
          ) : isTemplatesLoading ? (
            <div className={styles.skeletonGrid}>
              {[1, 2, 3].map((n) => (
                <div key={n} className={styles.skeletonCard} />
              ))}
            </div>
          ) : templates.length === 0 ? (
            <NoDataFound
              title={`No templates in "${activeCategory?.name ?? 'this category'}"`}
              description={
                activeCategory?.is_system
                  ? 'This is a platform category. No templates have been added yet — your organisation can still create templates here.'
                  : `Design your first ${activeDocMeta.label} template with the visual block editor.`
              }
              buttonText={activeCategory?.is_system ? undefined : 'New Template'}
              onButtonClick={activeCategory?.is_system ? undefined : openNewTemplate}
              showButtonIcon={!activeCategory?.is_system}
            />
          ) : (
            <>
              <div className={styles.contentHeader}>
                <span className={styles.contentCategoryLabel}>{activeCategory?.name}</span>
                <span className={styles.contentCount}>
                  {templates.length} template{templates.length !== 1 ? 's' : ''}
                </span>
              </div>

              {/* Platform templates section */}
              {systemTemplates.length > 0 && (
                <div className={pageStyles.templateSection}>
                  <div className={pageStyles.templateSectionHeader}>
                    <div className={pageStyles.templateSectionTitle}>
                      <Globe size={13} />
                      Platform Templates
                    </div>
                    <span className={pageStyles.templateSectionHint}>
                      Read-only · Available to all organisations
                    </span>
                  </div>
                  <div className={styles.templateGrid}>
                    {systemTemplates.map((tpl, idx) => (
                      <TemplateCard
                        key={tpl.id}
                        tpl={tpl}
                        index={idx}
                        onEdit={() => {}}
                        onDelete={() => {}}
                        onPreview={() => setPreviewTemplate(tpl)}
                        readOnly
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Org templates section */}
              {orgTemplates.length > 0 && (
                <div className={pageStyles.templateSection}>
                  <div className={pageStyles.templateSectionHeader}>
                    <div className={pageStyles.templateSectionTitle}>
                      <Building2 size={13} />
                      Your Organisation's Templates
                    </div>
                    <span className={pageStyles.templateSectionHint}>
                      Editable · Visible only to your organisation
                    </span>
                  </div>
                  <div className={styles.templateGrid}>
                    {orgTemplates.map((tpl, idx) => (
                      <TemplateCard
                        key={tpl.id}
                        tpl={tpl}
                        index={idx}
                        onEdit={() => openEditTemplate(tpl)}
                        onDelete={() => setDeleteTemplateTarget(tpl)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* Modals */}
      <CategoryFormModal
        open={categoryFormOpen}
        onClose={() => setCategoryFormOpen(false)}
        onSave={handleSaveCategory}
        editing={editingCategory}
        isPending={isCreatingCat || isUpdatingCat}
        documentType={activeDocType}
        documentTypeMeta={activeDocMeta}
      />

      <TemplateDesigner
        open={templateFormOpen}
        onClose={() => setTemplateFormOpen(false)}
        onSave={handleSaveTemplate}
        categoryId={activeCategoryId ?? ''}
        editing={editingTemplate}
        isPending={isCreatingTpl || isUpdatingTpl}
      />

      <TemplateDesigner
        open={!!previewTemplate}
        onClose={() => setPreviewTemplate(null)}
        onSave={() => {}}
        categoryId={previewTemplate?.category_id ?? ''}
        editing={previewTemplate}
        viewOnly
      />

      <WarningModal
        isOpen={!!deleteCategoryTarget}
        onClose={() => setDeleteCategoryTarget(null)}
        title={`Delete "${deleteCategoryTarget?.name}"?`}
        description="All templates in this category will be permanently removed. This cannot be undone."
        actionLabel="Delete Category"
        onAction={handleDeleteCategory}
        isActionLoading={isDeletingCat}
      />

      <WarningModal
        isOpen={!!deleteTemplateTarget}
        onClose={() => setDeleteTemplateTarget(null)}
        title={`Delete "${deleteTemplateTarget?.name}"?`}
        description="This template will be permanently removed."
        actionLabel="Delete Template"
        onAction={handleDeleteTemplate}
      />
    </div>
  );
};

export default OrgLetterTemplatesPage;
