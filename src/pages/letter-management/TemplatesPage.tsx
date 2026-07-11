import React, { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';

import {
  Button,
  ListControls,
  NoDataFound,
  PermissionGate,
  WarningModal,
} from '../../components/common';
import { TemplateListCard } from '../../features/letter-management/components/TemplateListCard/TemplateListCard';
import { TemplatePreviewModal } from '../../features/letter-management/components/TemplatePreviewModal/TemplatePreviewModal';
import { useLetterCategories } from '../../features/letter-management/hooks/useLetterCategories';
import {
  useArchiveLetterTemplate,
  useDuplicateLetterTemplate,
  useLetterTemplates,
  usePublishLetterTemplate,
  useUnarchiveLetterTemplate,
} from '../../features/letter-management/hooks/useLetterTemplates';
import { useDebounce } from '../../hooks/useDebounce';
import { useModuleAccess } from '../../hooks/useModuleAccess';
import { ModuleCode, ActionCode } from '../../enum/modules';

import styles from './TemplatesPage.module.scss';

import type { LetterTemplate } from '../../features/letter-management/types/letterTypes';

interface TemplatesPageProps {
  setHeaderActions: (actions: React.ReactNode) => void;
}

const TemplatesPage: React.FC<TemplatesPageProps> = ({ setHeaderActions }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [showUnarchiveModal, setShowUnarchiveModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<LetterTemplate | null>(null);
  const [previewingTemplate, setPreviewingTemplate] = useState<LetterTemplate | null>(null);

  const { hasCreateAccess, hasDeleteAccess, hasCloneAccess, hasActivateAccess } = useModuleAccess(
    ModuleCode.LETTER_TEMPLATES,
  );

  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const { data: categoriesResponse } = useLetterCategories();
  const categoryList = useMemo(() => categoriesResponse?.data || [], [categoriesResponse]);
  const categoryNameById = useMemo(
    () => Object.fromEntries(categoryList.map((category) => [category.id, category.name])),
    [categoryList],
  );
  const categoryFilterOptions = useMemo(
    () => categoryList.map((category) => ({ label: category.name, value: category.id })),
    [categoryList],
  );

  const { data: response, isLoading } = useLetterTemplates({
    search: debouncedSearchQuery || undefined,
    category_id: selectedCategoryId || undefined,
  });
  const { mutate: publishTemplate } = usePublishLetterTemplate();
  const { mutate: duplicateTemplate } = useDuplicateLetterTemplate();
  const { mutate: archiveTemplate, isPending: isArchiving } = useArchiveLetterTemplate();
  const { mutate: unarchiveTemplate, isPending: isUnarchiving } = useUnarchiveLetterTemplate();

  const templateList = useMemo(() => response?.data || [], [response]);

  const handleAddTemplate = useCallback(() => {
    navigate('/letter-management/templates/new');
  }, [navigate]);

  const handleEditTemplate = useCallback(
    (template: LetterTemplate) => {
      navigate(`/letter-management/templates/${template.id}`);
    },
    [navigate],
  );

  const handlePublish = useCallback(
    (template: LetterTemplate) => {
      publishTemplate(template.id);
    },
    [publishTemplate],
  );

  const handleDuplicate = useCallback(
    (template: LetterTemplate) => {
      duplicateTemplate(template.id);
    },
    [duplicateTemplate],
  );

  const handleArchiveClick = useCallback((template: LetterTemplate) => {
    setSelectedTemplate(template);
    setShowArchiveModal(true);
  }, []);

  const handleUnarchiveClick = useCallback((template: LetterTemplate) => {
    setSelectedTemplate(template);
    setShowUnarchiveModal(true);
  }, []);

  const handlePreviewClick = useCallback((template: LetterTemplate) => {
    setPreviewingTemplate(template);
  }, []);

  const handleArchive = useCallback(() => {
    if (selectedTemplate) {
      archiveTemplate(selectedTemplate.id, {
        onSuccess: () => setShowArchiveModal(false),
      });
    }
  }, [selectedTemplate, archiveTemplate]);

  const handleUnarchive = useCallback(() => {
    if (selectedTemplate) {
      unarchiveTemplate(selectedTemplate.id, {
        onSuccess: () => setShowUnarchiveModal(false),
      });
    }
  }, [selectedTemplate, unarchiveTemplate]);

  const renderContent = () => {
    if (templateList.length === 0) {
      return (
        <NoDataFound
          title="No Templates Found"
          description="We couldn't find any template matching your current search or filter."
        />
      );
    }

    return (
      <div className={styles.grid}>
        {templateList.map((template) => (
          <TemplateListCard
            key={template.id}
            template={template}
            categoryName={categoryNameById[template.category_id] || '—'}
            onPreview={() => handlePreviewClick(template)}
            onEdit={() => handleEditTemplate(template)}
            onPublish={
              hasActivateAccess && template.template_status === 'DRAFT'
                ? () => handlePublish(template)
                : undefined
            }
            onDuplicate={hasCloneAccess ? () => handleDuplicate(template) : undefined}
            onArchive={hasDeleteAccess ? () => handleArchiveClick(template) : undefined}
            onUnarchive={hasDeleteAccess ? () => handleUnarchiveClick(template) : undefined}
          />
        ))}
      </div>
    );
  };

  // Sync header actions
  React.useEffect(() => {
    setHeaderActions(
      <PermissionGate module={ModuleCode.LETTER_TEMPLATES} action={ActionCode.CREATE}>
        <Button variant="primary" onClick={handleAddTemplate}>
          <Plus size={16} />
          New Template
        </Button>
      </PermissionGate>,
    );
  }, [setHeaderActions, handleAddTemplate]);

  if (!isLoading && templateList.length === 0 && !debouncedSearchQuery && !selectedCategoryId) {
    return (
      <NoDataFound
        title="No Letter Templates Yet"
        description="Create your first letter template to start generating letters for your employees."
        buttonText={hasCreateAccess ? 'New Template' : undefined}
        onButtonClick={hasCreateAccess ? handleAddTemplate : undefined}
        showButtonIcon={hasCreateAccess}
      />
    );
  }

  return (
    <div className={`${styles.container} ${isLoading ? styles.loading : ''}`}>
      <ListControls
        showSearch
        showFilters={categoryFilterOptions.length > 0}
        showSort={false}
        showViewSwitcher={false}
        showMultiSelect={false}
        searchPlaceholder="Search templates..."
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filterOptions={categoryFilterOptions}
        filterCount={selectedCategoryId ? 1 : 0}
        filterTitle="Category"
        selectedFilter={selectedCategoryId}
        onFilterChange={setSelectedCategoryId}
      />

      {renderContent()}

      <TemplatePreviewModal
        templateId={previewingTemplate?.id || ''}
        templateName={previewingTemplate?.name || ''}
        isOpen={!!previewingTemplate}
        onClose={() => setPreviewingTemplate(null)}
      />

      <WarningModal
        isOpen={showArchiveModal}
        onClose={() => setShowArchiveModal(false)}
        title="Archive Template"
        description={`Are you sure you want to archive "${selectedTemplate?.name}"? Archived templates can no longer be used to generate letters.`}
        actionLabel="Archive"
        actionVariant="danger"
        onAction={handleArchive}
        isActionLoading={isArchiving}
      />

      <WarningModal
        isOpen={showUnarchiveModal}
        onClose={() => setShowUnarchiveModal(false)}
        title="Restore Template"
        description={`Are you sure you want to restore "${selectedTemplate?.name}"? The template will be moved to draft status.`}
        actionLabel="Restore"
        actionVariant="primary"
        onAction={handleUnarchive}
        isActionLoading={isUnarchiving}
      />
    </div>
  );
};

export default TemplatesPage;
