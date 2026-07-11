import React, { useEffect } from 'react';

import { Dialog } from '../../../../components/common/Dialog/Dialog';
import { Loader } from '../../../../components/common/Loader/Loader';
import { useTemplatePreview } from '../../hooks/useLetterTemplates';

import styles from './TemplatePreviewModal.module.scss';

import type { RenderModel } from '../../types/letterTypes';

export interface TemplatePreviewModalProps {
  templateId: string;
  templateName: string;
  isOpen: boolean;
  onClose: () => void;
}

const TemplatePreviewContent: React.FC<{ preview: RenderModel }> = ({ preview }) => (
  <div className={styles.previewPanel}>
    {preview.heading && <h4 className={styles.previewHeading}>{preview.heading}</h4>}
    {preview.paragraphs.map((paragraph, index) =>
      paragraph.trim() ? (
        <p key={index} className={styles.previewParagraph}>
          {paragraph}
        </p>
      ) : null,
    )}
    {preview.bulletList.length > 0 && (
      <ul className={styles.previewBulletList}>
        {preview.bulletList.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    )}
    {preview.salaryTable && (
      <table className={styles.previewSalaryTable}>
        <thead>
          <tr>
            <th>Component</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          {preview.salaryTable.components.map((row) => (
            <tr key={row.component_name}>
              <td>{row.component_name}</td>
              <td>{row.amount}</td>
            </tr>
          ))}
          <tr className={styles.previewTotalRow}>
            <td>Total</td>
            <td>{preview.salaryTable.total}</td>
          </tr>
        </tbody>
      </table>
    )}
    {preview.signatory && (
      <div className={styles.previewSignatory}>
        <p>{preview.signatory.name}</p>
        <p className={styles.mutedText}>{preview.signatory.designation}</p>
      </div>
    )}
  </div>
);

export const TemplatePreviewModal: React.FC<TemplatePreviewModalProps> = ({
  templateId,
  templateName,
  isOpen,
  onClose,
}) => {
  const {
    mutate: fetchPreview,
    data: previewResponse,
    isPending,
    reset,
  } = useTemplatePreview(templateId);

  useEffect(() => {
    if (isOpen && templateId) {
      fetchPreview();
    }
    if (!isOpen) {
      reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, templateId]);

  const preview = previewResponse?.data;

  return (
    <Dialog title={`Preview — ${templateName}`} open={isOpen} onClose={onClose} maxWidth="680px">
      {isPending || !preview ? (
        <div className={styles.loaderWrapper}>
          <Loader />
        </div>
      ) : (
        <TemplatePreviewContent preview={preview} />
      )}
    </Dialog>
  );
};

export default TemplatePreviewModal;
