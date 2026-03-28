import { FileText, Download } from 'lucide-react';

import styles from './ProjectContractSummary.module.scss';

import type { Project } from '../../types/projectType';

interface ProjectContractSummaryProps {
  project: Project;
}

export const ProjectContractSummary = ({ project }: ProjectContractSummaryProps) => {
  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <h3>
          <FileText size={18} className={styles.icon} />
          Contract Summary
        </h3>
      </div>
      <div className={styles.filesList}>
        {project.contracts && project.contracts.length > 0 ? (
          project.contracts.map((file, index) => (
            <div key={index} className={styles.fileItem}>
              <div className={styles.fileInfo}>
                <FileText size={16} color="var(--color-primary)" />
                <span>{file.name}</span>
              </div>
              <div className={styles.fileAction}>
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
