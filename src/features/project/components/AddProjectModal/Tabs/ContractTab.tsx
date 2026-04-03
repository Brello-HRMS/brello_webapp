import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Upload,
  FileText,
  File as FileIcon,
  FileSpreadsheet,
  Eye,
  Trash2,
  Loader2,
} from 'lucide-react';

import {
  useUploadDocumentUrl,
  useUploadDocumentData,
  useDeleteDocument,
} from '../../../../../hooks/useDocuments';
import { getEnterpriseId, getOrganizationId } from '../../../../../utils/authUtils';
import styles from '../../AddProjectModal.module.scss';
import { showToast } from '../../../../ToastFeature/ShowToast';

import type { ProjectFormData } from '../../../schemas/projectSchema';
import type { FieldArrayWithId } from 'react-hook-form';

interface ContractItem {
  name: string;
  file: File;
  documentId?: string;
}

interface ContractTabProps {
  fields: FieldArrayWithId<ProjectFormData, 'contracts'>[];
  append: (data: ContractItem) => void;
  remove: (index: number) => void;
}

export const ContractTab: React.FC<ContractTabProps> = ({ fields, append, remove }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = React.useState(false);
  const { mutateAsync: getUploadUrl } = useUploadDocumentUrl();
  const { mutateAsync: uploadFile } = useUploadDocumentData();
  const { mutateAsync: deleteFile } = useDeleteDocument();

  const enterpriseId = getEnterpriseId();
  const organizationId = getOrganizationId();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setIsUploading(true);
      try {
        for (const file of Array.from(files)) {
          const urlRes = await getUploadUrl({
            folderType: 'ORGANIZATION_DOCUMENT',
            originalName: file.name,
            mimeType: file.type || 'application/octet-stream',
            size: file.size,
            enterpriseId,
            organizationId,
          });

          const documentId = urlRes?.data?.documentId;

          if (documentId) {
            await uploadFile({ documentId, file });
            append({
              name: file.name,
              file: file,
              documentId,
            });
            showToast(`${file.name} uploaded successfully`, 'success');
          }
        }
      } catch {
        showToast('Failed to upload one or more files', 'error');
      } finally {
        setIsUploading(false);
      }
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemoveFile = async (index: number, documentId?: string) => {
    try {
      if (documentId) {
        await deleteFile(documentId);
        showToast('Document deleted successfully', 'success');
      }
      remove(index);
    } catch {
      showToast('Failed to delete document', 'error');
    }
  };

  const handleViewFile = (file: File) => {
    const url = URL.createObjectURL(file);
    window.open(url, '_blank');
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') return <FileText size={20} className={styles.fileIcon} />;
    if (['xls', 'xlsx', 'csv'].includes(ext || ''))
      return <FileSpreadsheet size={20} className={styles.fileIcon} />;
    if (['doc', 'docx'].includes(ext || ''))
      return <FileIcon size={20} className={styles.fileIcon} />;
    return <FileIcon size={20} className={styles.fileIcon} />;
  };

  return (
    <motion.div
      key="contract"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className={styles.contractSection}
    >
      <div className={styles.uploadArea} onClick={() => fileInputRef.current?.click()}>
        <div className={styles.uploadIcon}>
          {isUploading ? <Loader2 size={24} className={styles.spinner} /> : <Upload size={24} />}
        </div>
        <div className={styles.uploadText}>
          <h4>{isUploading ? 'Uploading...' : 'Click to upload contracts'}</h4>
          <p>Support for PDF, Excel, and Word files (max. 10MB)</p>
        </div>
        <input
          type="file"
          multiple
          ref={fileInputRef}
          onChange={handleFileChange}
          style={{ display: 'none' }}
          accept=".pdf,.doc,.docx,.xls,.xlsx,.csv"
        />
      </div>

      {fields.length > 0 && (
        <div className={styles.fileList}>
          <h5 className={styles.sectionTitle}>Uploaded Files ({fields.length})</h5>
          {fields.map((field, index) => (
            <div key={field.id} className={styles.fileItem}>
              <div className={styles.fileInfo}>
                {getFileIcon(field.name)}
                <span className={styles.fileName}>{field.name}</span>
              </div>
              <div className={styles.fileActions}>
                <button
                  type="button"
                  className={`${styles.actionBtn} ${styles.viewBtn}`}
                  onClick={() => handleViewFile(field.file)}
                  title="View"
                >
                  <Eye size={16} />
                </button>
                <button
                  type="button"
                  className={`${styles.actionBtn} ${styles.removeBtn}`}
                  onClick={() => handleRemoveFile(index, field.documentId)}
                  title="Remove"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
};
