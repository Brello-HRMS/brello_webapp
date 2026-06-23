import React, { useState, useCallback, useMemo } from 'react';
import { Plus, Pencil, Trash2, FolderOpen, LayoutTemplate } from 'lucide-react';

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

import styles from './PlatformLettersPage.module.scss';

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

const PlatformLettersPage: React.FC = () => {
  const [activeDocType, setActiveDocType] = useState<DocumentType>('hr_letter');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  const [categoryFormOpen, setCategoryFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<LetterCategory | null>(null);
  const [deleteCategoryTarget, setDeleteCategoryTarget] = useState<LetterCategory | null>(null);

  const [templateFormOpen, setTemplateFormOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<LetterTemplate | null>(null);
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

  const { mutate: createCategory, isPending: isCreatingCat } = useCreateLetterCategory();
  const { mutate: updateCategory, isPending: isUpdatingCat } = useUpdateLetterCategory();
  const { mutate: deleteCategory } = useDeleteLetterCategory();

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
    setEditingTemplate(null);
    setTemplateFormOpen(true);
  }, []);

  const openEditTemplate = useCallback((tpl: LetterTemplate) => {
    setEditingTemplate(tpl);
    setTemplateFormOpen(true);
  }, []);

  const activeDocMeta = DOCUMENT_TYPE_META[activeDocType];

  return (
    <div className={styles.container}>
      <PageHeader
        title="Document Templates"
        subtitle="Design reusable documents with dynamic variables and a visual block editor."
        actions={
          activeCategoryId && (
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
        {/* Sidebar */}
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
            <ul className={styles.categoryList}>
              {categories.map((cat) => (
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
          )}
        </aside>

        {/* Main content */}
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
              description={`Design your first ${activeDocMeta.label} template with the visual block editor.`}
              buttonText="New Template"
              onButtonClick={openNewTemplate}
              showButtonIcon
            />
          ) : (
            <>
              <div className={styles.contentHeader}>
                <span className={styles.contentCategoryLabel}>{activeCategory?.name}</span>
                <span className={styles.contentCount}>
                  {templates.length} template{templates.length !== 1 ? 's' : ''}
                </span>
              </div>
              <div className={styles.templateGrid}>
                {templates.map((tpl, idx) => (
                  <TemplateCard
                    key={tpl.id}
                    tpl={tpl}
                    index={idx}
                    onEdit={() => openEditTemplate(tpl)}
                    onDelete={() => setDeleteTemplateTarget(tpl)}
                  />
                ))}
              </div>
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

      <WarningModal
        isOpen={!!deleteCategoryTarget}
        onClose={() => setDeleteCategoryTarget(null)}
        title={`Delete "${deleteCategoryTarget?.name}"?`}
        description="All templates in this category will also be removed. This cannot be undone."
        actionLabel="Delete Category"
        onAction={handleDeleteCategory}
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

export default PlatformLettersPage;
