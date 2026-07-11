import React, { useMemo } from 'react';

import { useLetterCategories } from '../../hooks/useLetterCategories';
import { useLetterTemplates } from '../../hooks/useLetterTemplates';

import styles from './GenerateLetterDrawer.module.scss';

import type { LetterTemplate } from '../../types/letterTypes';

interface Step2TemplateSelectProps {
  selectedTemplateId?: string;
  onSelect: (id: string) => void;
}

export const Step2TemplateSelect: React.FC<Step2TemplateSelectProps> = ({
  selectedTemplateId,
  onSelect,
}) => {
  const { data: categoriesResponse } = useLetterCategories();
  const { data: templatesResponse, isLoading } = useLetterTemplates({ status: 'PUBLISHED' });

  const categoryList = useMemo(() => categoriesResponse?.data || [], [categoriesResponse]);
  const templateList = useMemo(() => templatesResponse?.data || [], [templatesResponse]);

  const groupedTemplates = useMemo(() => {
    const groups: { categoryId: string; categoryName: string; templates: LetterTemplate[] }[] = [];
    const categoryNameById = Object.fromEntries(categoryList.map((c) => [c.id, c.name]));

    for (const template of templateList) {
      let group = groups.find((g) => g.categoryId === template.category_id);
      if (!group) {
        group = {
          categoryId: template.category_id,
          categoryName: categoryNameById[template.category_id] || 'Uncategorized',
          templates: [],
        };
        groups.push(group);
      }
      group.templates.push(template);
    }
    return groups;
  }, [categoryList, templateList]);

  return (
    <div className={styles.stepContainer}>
      <h3 className={styles.stepTitle}>Select Template</h3>
      <p className={styles.stepDescription}>
        Choose the published letter template to use for this letter.
      </p>

      {isLoading && <p className={styles.mutedText}>Loading templates...</p>}

      {!isLoading && groupedTemplates.length === 0 && (
        <p className={styles.mutedText}>No published templates are available.</p>
      )}

      {groupedTemplates.map((group) => (
        <div key={group.categoryId} className={styles.templateGroup}>
          <div className={styles.templateGroupTitle}>{group.categoryName}</div>
          <div className={styles.templateList}>
            {group.templates.map((template) => (
              <label
                key={template.id}
                className={`${styles.templateOption} ${
                  selectedTemplateId === template.id ? styles.selected : ''
                }`}
              >
                <input
                  type="radio"
                  name="template"
                  value={template.id}
                  checked={selectedTemplateId === template.id}
                  onChange={() => onSelect(template.id)}
                />
                <div className={styles.templateOptionContent}>
                  <span className={styles.templateOptionName}>{template.name}</span>
                  {template.description && (
                    <span className={styles.templateOptionDescription}>{template.description}</span>
                  )}
                </div>
              </label>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Step2TemplateSelect;
