import { useCallback, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Archive, Copy, SendHorizonal } from 'lucide-react';

import { Button, PageHeader, StatusBadge, WarningModal } from '../../components/common';
import { Loader } from '../../components/common/Loader/Loader';
import { TemplateForm } from '../../features/letter-management/components/TemplateForm/TemplateForm';
import { TemplateLivePreview } from '../../features/letter-management/components/TemplateLivePreview/TemplateLivePreview';
import {
  useArchiveLetterTemplate,
  useDuplicateLetterTemplate,
  useLetterTemplate,
  usePublishLetterTemplate,
} from '../../features/letter-management/hooks/useLetterTemplates';
import { showToast } from '../../features/ToastFeature/ShowToast';

import styles from './TemplateEditorPage.module.scss';

import type { LetterTemplateFormInput } from '../../features/letter-management/validation/letterSchemas';
import type { LetterTemplate } from '../../features/letter-management/types/letterTypes';

const TEMPLATES_LIST_PATH = '/organisation/letter-management/templates';

const TemplateEditorPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [previewValues, setPreviewValues] = useState<LetterTemplateFormInput | null>(null);

  const { data: templateResponse, isLoading } = useLetterTemplate(id || '');
  const template = templateResponse?.data;

  const { mutate: publishTemplate, isPending: isPublishing } = usePublishLetterTemplate();
  const { mutate: duplicateTemplate, isPending: isDuplicating } = useDuplicateLetterTemplate();
  const { mutate: archiveTemplate, isPending: isArchiving } = useArchiveLetterTemplate();

  const handleSaved = useCallback(
    (saved: LetterTemplate) => {
      if (isEdit) {
        showToast('Template saved successfully', 'success');
        return;
      }
      // Create mode: hop over to the edit route for the newly created draft so
      // the author can continue working on it (and eventually publish it).
      navigate(`/organisation/letter-management/templates/${saved.id}`, { replace: true });
    },
    [isEdit, navigate],
  );

  const handlePublish = useCallback(() => {
    if (template) publishTemplate(template.id);
  }, [template, publishTemplate]);

  const handleDuplicate = useCallback(() => {
    if (template) {
      duplicateTemplate(template.id, {
        onSuccess: (response) =>
          navigate(`/organisation/letter-management/templates/${response.data.id}`),
      });
    }
  }, [template, duplicateTemplate, navigate]);

  const handleArchive = useCallback(() => {
    if (template) {
      archiveTemplate(template.id, {
        onSuccess: () => {
          setShowArchiveModal(false);
          navigate(TEMPLATES_LIST_PATH);
        },
      });
    }
  }, [template, archiveTemplate, navigate]);

  if (isEdit && isLoading) {
    return (
      <div className={`${styles.container} ${styles.loadingState}`}>
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <button className={styles.backBtn} onClick={() => navigate(TEMPLATES_LIST_PATH)}>
        <ArrowLeft size={16} />
        Letter Templates
      </button>

      <PageHeader
        title={isEdit ? template?.name || 'Edit Template' : 'New Template'}
        titleExtra={
          isEdit && template ? <StatusBadge status={template.template_status} /> : undefined
        }
        subtitle={
          isEdit
            ? 'Update the content and settings for this letter template.'
            : 'Set up a new reusable letter template.'
        }
        actions={
          isEdit && template ? (
            <div className={styles.headerActions}>
              {template.template_status === 'DRAFT' && (
                <Button variant="secondary" onClick={handlePublish} isLoading={isPublishing}>
                  <SendHorizonal size={16} />
                  Publish
                </Button>
              )}
              <Button variant="secondary" onClick={handleDuplicate} isLoading={isDuplicating}>
                <Copy size={16} />
                Duplicate
              </Button>
              {template.template_status !== 'ARCHIVED' && (
                <Button variant="danger" onClick={() => setShowArchiveModal(true)}>
                  <Archive size={16} />
                  Archive
                </Button>
              )}
            </div>
          ) : undefined
        }
      />

      <div className={styles.editorLayout}>
        <div className={styles.formColumn}>
          <TemplateForm
            template={template}
            onSaved={handleSaved}
            onValuesChange={setPreviewValues}
          />
        </div>
        <div className={styles.previewColumn}>
          <TemplateLivePreview
            heading={previewValues?.heading || template?.heading || undefined}
            paragraphs={previewValues?.paragraphs || template?.paragraphs || []}
            bulletList={previewValues?.bullet_list || template?.bullet_list || []}
            includeSalaryTable={
              previewValues?.include_salary_table ?? template?.include_salary_table
            }
          />
        </div>
      </div>

      <WarningModal
        isOpen={showArchiveModal}
        onClose={() => setShowArchiveModal(false)}
        title="Archive Template"
        description={`Are you sure you want to archive "${template?.name}"? Archived templates can no longer be used to generate letters.`}
        actionLabel="Archive"
        actionVariant="danger"
        onAction={handleArchive}
        isActionLoading={isArchiving}
      />
    </div>
  );
};

export default TemplateEditorPage;
