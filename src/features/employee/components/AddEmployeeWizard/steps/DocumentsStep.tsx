import React, { useState } from 'react';
import { Upload, X, FileText, Plus, Trash2 } from 'lucide-react';

import { Button } from '../../../../../components/common';
import { useWizard } from '../WizardContext';
import { useEmployeeWizard } from '../../../hooks/useEmployeeWizard';
import { getUploadUrl } from '../../../api/employee';
import { uploadDocumentData } from '../../../../../api/documents';
import { getEnterpriseId, getOrganizationId } from '../../../../../utils/authUtils';

import styles from './DocumentsStep.module.scss';

interface UploadedFile {
  name: string;
  docId: string;
  category: string;
  fileName: string;
  uploading?: boolean;
}

interface DocumentsStepProps {
  onClose: () => void;
}

export const DocumentsStep: React.FC<DocumentsStepProps> = ({ onClose }) => {
  const { employeeId, formData, updateFormData, nextStep } = useWizard();
  const { linkDocumentsMutation } = useEmployeeWizard();
  const [otherDocumentName, setOtherDocumentName] = useState('');
  const [files, setFiles] = useState<Record<string, UploadedFile | null>>(
    formData.documentsState || {
      AADHAAR: null,
      PAN: null,
      OFFER_LETTER: null,
    },
  );

  // Auto-save documents state to context
  React.useEffect(() => {
    updateFormData({ documentsState: files });
  }, [files, updateFormData]);

  const handleFileUpload = async (category: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !employeeId) return;

    // Set loading state
    setFiles((prev) => ({
      ...prev,
      [category]: { name: category, docId: '', category, fileName: file.name, uploading: true },
    }));

    try {
      const urlRes = await getUploadUrl({
        folderType: 'EMPLOYEE_DOCUMENT',
        enterpriseId: getEnterpriseId(),
        organizationId: getOrganizationId(),
        employeeId: employeeId,
        originalName: file.name,
        mimeType: file.type,
        size: file.size,
      });

      const { documentId } = urlRes.data;

      // 2. Binary upload
      await uploadDocumentData(documentId, file);

      // 3. Update state
      setFiles((prev) => ({
        ...prev,
        [category]: {
          name: category,
          docId: documentId,
          category,
          fileName: file.name,
          uploading: false,
        },
      }));
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('File upload failed', error);
      setFiles((prev) => ({ ...prev, [category]: null }));
    }
  };

  const removeFile = (category: string) => {
    setFiles((prev) => ({ ...prev, [category]: null }));
  };

  const onSubmit = () => {
    if (!employeeId) return;

    const documentsToLink = Object.values(files)
      .filter((f): f is UploadedFile => !!f && !f.uploading)
      .map((f) => ({
        name:
          f.category === 'AADHAAR'
            ? 'Aadhaar Card'
            : f.category === 'PAN'
              ? 'PAN Card'
              : f.category === 'OFFER_LETTER'
                ? 'Offer Letter'
                : otherDocumentName || 'Other Document',
        docId: f.docId,
        category: f.category === 'OTHER_TEMP' ? 'OTHER' : f.category,
      }));

    if (documentsToLink.length === 0) {
      nextStep();
      return;
    }

    linkDocumentsMutation.mutate(
      { id: employeeId, data: { documents: documentsToLink } },
      {
        onSuccess: () => {
          nextStep();
        },
      },
    );
  };

  const isPending = linkDocumentsMutation.isPending;

  const renderUploadBox = (category: string) => {
    const file = files[category];

    if (file) {
      if (file.uploading) {
        return (
          <div className={`${styles.fileBox} ${styles.uploadingBox}`}>
            <div className={styles.fileIconUploading}>
              <FileText size={20} />
            </div>
            <div className={styles.fileInfo}>
              <p className={styles.fileName}>{file.fileName}</p>
              <div className={styles.progressContainer}>
                <span className={styles.fileSize}>240 KB</span> {/* Placeholder */}
                <span className={styles.dot}>•</span>
                <span className={styles.uploadingText}>Uploading...</span>
              </div>
              <div className={styles.progressBar}>
                <div className={styles.progressFill} style={{ width: '50%' }}></div>
              </div>
            </div>
            <button className={styles.removeBtn} onClick={() => removeFile(category)}>
              <X size={16} />
            </button>
          </div>
        );
      }

      return (
        <div className={`${styles.fileBox} ${styles.uploadedBox}`}>
          <div className={styles.fileIconUploaded}>
            <FileText size={20} />
          </div>
          <div className={styles.fileInfo}>
            <p className={styles.fileName}>{file.fileName}</p>
            <p className={styles.uploadedText}>Upload complete</p>
          </div>
          <button className={styles.deleteBtn} onClick={() => removeFile(category)}>
            <Trash2 size={16} />
          </button>
        </div>
      );
    }

    return (
      <div className={styles.uploadBox}>
        <input
          type="file"
          id={`file-${category}`}
          className={styles.hiddenInput}
          onChange={(e) => handleFileUpload(category, e)}
        />
        <label htmlFor={`file-${category}`} className={styles.uploadLabel}>
          <Upload size={20} className={styles.uploadIcon} />
          <p className={styles.uploadText}>Click to upload</p>
          <p className={styles.uploadSubtitle}>PNG, JPG upto 5MB</p>
        </label>
      </div>
    );
  };

  return (
    <div className={styles.container}>
      <div className={styles.documentCard}>
        <div className={styles.cardHeader}>
          <h3 className={styles.cardTitle}>Aadhaar Card</h3>
          <span className={styles.cardSubtitle}>(Front & Back)</span>
        </div>
        {renderUploadBox('AADHAAR')}
      </div>

      <div className={styles.documentCard}>
        <div className={styles.cardHeader}>
          <h3 className={styles.cardTitle}>Pan Card</h3>
          <span className={styles.cardSubtitle}>(Official ID)</span>
        </div>
        {renderUploadBox('PAN')}
      </div>

      <div className={styles.documentCard}>
        <div className={styles.cardHeader}>
          <h3 className={styles.cardTitle}>Offer Letter</h3>
          <span className={styles.cardSubtitle}>(Signed Copy)</span>
        </div>
        {renderUploadBox('OFFER_LETTER')}
      </div>

      <div className={styles.otherSection}>
        <div className={styles.otherHeader}>
          <div className={styles.otherTitles}>
            <h3 className={styles.cardTitle}>Other Documents</h3>
            <span className={styles.cardSubtitle}>Add additional</span>
          </div>
          <Button variant="secondary" className={styles.addBtn}>
            <Plus size={14} /> Add
          </Button>
        </div>
        <div className={styles.documentCard}>
          <input
            className={styles.documentNameInput}
            placeholder="Type document name here..."
            value={otherDocumentName}
            onChange={(e) => setOtherDocumentName(e.target.value)}
          />
          {renderUploadBox('OTHER_TEMP')}
        </div>
      </div>

      <div className={styles.actions}>
        <Button
          variant="secondary"
          onClick={onClose}
          className={styles.saveDraftButton}
          disabled={isPending}
        >
          Save draft
        </Button>
        <Button
          variant="primary"
          onClick={onSubmit}
          className={styles.nextButton}
          isLoading={isPending}
        >
          Next
        </Button>
      </div>
    </div>
  );
};
