import { FileText, Download, Loader2 } from 'lucide-react';

import { useProjectContracts } from '../../hooks/useProjectContracts';

import styles from './ProjectContractSummary.module.scss';

import type { Project } from '../../types/projectType';

interface ProjectContractSummaryProps {
  project: Project;
}

export const ProjectContractSummary = ({ project }: ProjectContractSummaryProps) => {
  const { data: contractsRes, isLoading } = useProjectContracts(project.id);

  if (isLoading) {
    return (
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h3>
            <FileText size={18} className={styles.icon} />
            Contract Summary
          </h3>
        </div>
        <div className={styles.loading}>
          <Loader2 size={24} className={styles.spinner} />
          <span>Loading contracts...</span>
        </div>
      </div>
    );
  }

  const contracts = contractsRes?.data || [];

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <h3>
          <FileText size={18} className={styles.icon} />
          Contract Summary
        </h3>
      </div>
      <div className={styles.filesList}>
        {contracts.length > 0 ? (
          contracts.map((file) => (
            <div key={file.id} className={styles.fileItem}>
              <div className={styles.fileInfo}>
                <FileText size={16} color="var(--color-primary)" />
                <span>{file.file_name}</span>
              </div>
              <div
                className={styles.fileAction}
                onClick={() => window.open(file.file_url, '_blank')}
                style={{ cursor: 'pointer' }}
                title="Download"
              >
                <Download size={16} />
              </div>
            </div>
          ))
        ) : (
          <div className={styles.fileItem}>
            <div className={styles.fileInfo}>
              <FileText size={16} color="var(--color-gray-400)" />
              <span>No contract files uploaded.</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
