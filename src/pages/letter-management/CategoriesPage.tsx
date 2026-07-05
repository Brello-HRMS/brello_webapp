import { useCallback, useMemo, useState } from 'react';
import { FolderTree, Plus } from 'lucide-react';

import {
  Button,
  ListControls,
  NoDataFound,
  PageHeader,
  PermissionGate,
  WarningModal,
} from '../../components/common';
import { CategoryCard } from '../../features/letter-management/components/CategoryCard/CategoryCard';
import { CategoryFormModal } from '../../features/letter-management/components/CategoryFormModal/CategoryFormModal';
import {
  useArchiveLetterCategory,
  useLetterCategories,
} from '../../features/letter-management/hooks/useLetterCategories';
import { useDebounce } from '../../hooks/useDebounce';
import { useModuleAccess } from '../../hooks/useModuleAccess';
import { ModuleCode, ActionCode } from '../../enum/modules';

import styles from './CategoriesPage.module.scss';

import type { LetterCategory } from '../../features/letter-management/types/letterTypes';

const CategoriesPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<LetterCategory | null>(null);
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<LetterCategory | null>(null);

  const { hasCreateAccess, hasEditAccess, hasDeleteAccess } = useModuleAccess(
    ModuleCode.LETTER_CATEGORIES,
  );

  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const { data: response, isLoading } = useLetterCategories(debouncedSearchQuery || undefined);
  const { mutate: archiveCategory, isPending: isArchiving } = useArchiveLetterCategory();

  const categoryList = useMemo(() => response?.data || [], [response]);

  const handleAddCategory = useCallback(() => {
    setEditingCategory(null);
    setIsFormOpen(true);
  }, []);

  const handleEditCategory = useCallback((category: LetterCategory) => {
    setEditingCategory(category);
    setIsFormOpen(true);
  }, []);

  const handleArchiveClick = useCallback((category: LetterCategory) => {
    setSelectedCategory(category);
    setShowArchiveModal(true);
  }, []);

  const handleArchive = useCallback(() => {
    if (selectedCategory) {
      archiveCategory(selectedCategory.id, {
        onSuccess: () => setShowArchiveModal(false),
      });
    }
  }, [selectedCategory, archiveCategory]);

  const renderContent = () => {
    if (categoryList.length === 0) {
      return (
        <NoDataFound
          title="No Categories Found"
          description="We couldn't find any category matching your current search. Try adjusting your search term."
        />
      );
    }

    return (
      <div className={styles.grid}>
        {categoryList.map((category) => (
          <CategoryCard
            key={category.id}
            category={category}
            onEdit={hasEditAccess ? () => handleEditCategory(category) : undefined}
            onArchive={hasDeleteAccess ? () => handleArchiveClick(category) : undefined}
          />
        ))}
      </div>
    );
  };

  if (!isLoading && categoryList.length === 0 && !debouncedSearchQuery) {
    return (
      <>
        <NoDataFound
          title="No Categories Added Yet"
          description="Set up your first letter category to start organizing your letter templates."
          buttonText={hasCreateAccess ? 'Add Category' : undefined}
          onButtonClick={hasCreateAccess ? handleAddCategory : undefined}
          showButtonIcon={hasCreateAccess}
        />
        <CategoryFormModal
          key={isFormOpen ? editingCategory?.id || 'new' : 'closed'}
          isOpen={isFormOpen}
          onClose={() => {
            setIsFormOpen(false);
            setEditingCategory(null);
          }}
          category={editingCategory}
        />
      </>
    );
  }

  return (
    <div className={`${styles.container} ${isLoading ? styles.loading : ''}`}>
      <PageHeader
        title="Letter Categories"
        titleExtra={
          <span className={styles.pageIcon}>
            <FolderTree size={20} />
          </span>
        }
        subtitle="Define and manage categories used to organize letter templates."
        actions={
          <PermissionGate module={ModuleCode.LETTER_CATEGORIES} action={ActionCode.CREATE}>
            <Button variant="primary" onClick={handleAddCategory}>
              <Plus size={16} />
              Add Category
            </Button>
          </PermissionGate>
        }
      />

      <ListControls
        showSearch
        showFilters={false}
        showSort={false}
        showMultiSelect={false}
        showViewSwitcher={false}
        searchPlaceholder="Search categories..."
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {renderContent()}

      <WarningModal
        isOpen={showArchiveModal}
        onClose={() => setShowArchiveModal(false)}
        title="Archive Category"
        description={`Are you sure you want to archive the "${selectedCategory?.name}" category? Templates using this category must be reassigned before it can be archived.`}
        actionLabel="Archive"
        actionVariant="danger"
        onAction={handleArchive}
        isActionLoading={isArchiving}
      />

      <CategoryFormModal
        key={isFormOpen ? editingCategory?.id || 'new' : 'closed'}
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingCategory(null);
        }}
        category={editingCategory}
      />
    </div>
  );
};

export default CategoriesPage;
