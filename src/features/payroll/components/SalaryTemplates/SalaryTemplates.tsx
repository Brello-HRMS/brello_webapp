import React from 'react';
import { Pencil, Trash2 } from 'lucide-react';

import { Button } from '../../../../components/common/Button/Button';

import styles from './SalaryTemplates.module.scss';

import type { SalaryTemplate } from '../../types/payrollConfigTypes';

interface SalaryTemplatesProps {
  templates: SalaryTemplate[];
  onCreateTemplate: () => void;
  onEditTemplate: (template: SalaryTemplate) => void;
  onDeleteTemplate: (template: SalaryTemplate) => void;
}

export const SalaryTemplates: React.FC<SalaryTemplatesProps> = ({
  templates,
  onCreateTemplate,
  onEditTemplate,
  onDeleteTemplate,
}) => {
  return (
    <div className={styles.container}>
      <div className={styles.toolbar}>
        <Button variant="primary" onClick={onCreateTemplate}>
          + Create template
        </Button>
      </div>

      <div className={styles.templateList}>
        {templates.map((template) => (
          <TemplateCard
            key={template.id}
            template={template}
            onEdit={() => onEditTemplate(template)}
            onDelete={() => onDeleteTemplate(template)}
          />
        ))}
      </div>
    </div>
  );
};

interface TemplateCardProps {
  template: SalaryTemplate;
  onEdit: () => void;
  onDelete: () => void;
}

const TemplateCard: React.FC<TemplateCardProps> = ({ template, onEdit, onDelete }) => {
  const isActive = template.is_active;

  const earningCount =
    template.components?.filter((c) => c.component?.component_type === 'earning').length || 0;
  const deductionCount =
    template.components?.filter((c) => c.component?.component_type === 'deduction').length || 0;
  const totalComponents = template.components?.length || 0;

  return (
    <div className={styles.card}>
      <div className={styles.cardContent}>
        <div className={styles.cardInfo}>
          <h3 className={styles.cardTitle}>{template.name}</h3>
          <p className={styles.cardDescription}>{template.description}</p>

          <div className={styles.tagRow}>
            <span className={`${styles.tag} ${styles.tagBlue}`}>{totalComponents} Components</span>
            <span className={`${styles.tag} ${styles.tagGreen}`}>{earningCount} Earning</span>
            <span className={`${styles.tag} ${styles.tagRed}`}>{deductionCount} Deductions</span>
            <span className={`${styles.tag} ${styles.tagActive}`}>
              ● {isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>

        <div className={styles.cardActions}>
          <button className={styles.iconButton} aria-label="Edit template" onClick={onEdit}>
            <Pencil size={18} />
          </button>
          <button
            className={`${styles.iconButton} ${styles.iconButtonDanger}`}
            aria-label="Delete template"
            onClick={onDelete}
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};
