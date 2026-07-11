import React, { useMemo } from 'react';

import styles from './TemplateLivePreview.module.scss';

interface TemplateLivePreviewProps {
  heading?: string;
  paragraphs: string[];
  bulletList: string[];
  includeSalaryTable?: boolean;
}

// Client-side sample data used purely for instant, no-network preview feedback
// while a template is being authored. Mirrors (conceptually) the backend's
// SAMPLE_VALUES constant used by POST /letter-management/templates/:id/preview,
// but this component never calls that endpoint — it is a local approximation so
// authors get live feedback as they type.
const SAMPLE_VALUES: Record<string, string> = {
  employee_name: 'John Doe',
  designation: 'Software Engineer',
  department: 'Engineering',
  organization_name: 'Acme Pvt Ltd',
  today_date: new Date().toDateString(),
  doj: '01 Jan 2026',
  ctc: '7,20,000',
  signatory_name: 'Sarah Thomas',
  signatory_designation: 'HR Manager',
};

const substitute = (text: string): string =>
  text.replace(/\{\{(\w+)\}\}/g, (_match, key: string) => SAMPLE_VALUES[key] ?? '');

const SAMPLE_SALARY_ROWS = [
  { component_name: 'Basic', amount: '25,000' },
  { component_name: 'HRA', amount: '15,000' },
];
const SAMPLE_SALARY_TOTAL = '4,80,000';

export const TemplateLivePreview: React.FC<TemplateLivePreviewProps> = ({
  heading,
  paragraphs,
  bulletList,
  includeSalaryTable,
}) => {
  const renderedHeading = useMemo(() => (heading ? substitute(heading) : ''), [heading]);
  const renderedParagraphs = useMemo(() => paragraphs.map(substitute), [paragraphs]);
  const renderedBulletList = useMemo(() => bulletList.map(substitute), [bulletList]);

  const isEmpty =
    !renderedHeading &&
    renderedParagraphs.every((p) => !p.trim()) &&
    renderedBulletList.length === 0;

  return (
    <div className={styles.container}>
      <div className={styles.documentPanel}>
        {isEmpty ? (
          <div className={styles.emptyState}>
            Start filling in the heading, paragraphs or bullet list to see a live preview here.
          </div>
        ) : (
          <>
            {renderedHeading && <h2 className={styles.heading}>{renderedHeading}</h2>}

            {renderedParagraphs.map((paragraph, index) =>
              paragraph.trim() ? (
                <p key={index} className={styles.paragraph}>
                  {paragraph}
                </p>
              ) : null,
            )}

            {renderedBulletList.length > 0 && (
              <ul className={styles.bulletList}>
                {renderedBulletList.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            )}

            {includeSalaryTable && (
              <table className={styles.salaryTable}>
                <thead>
                  <tr>
                    <th>Component</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {SAMPLE_SALARY_ROWS.map((row) => (
                    <tr key={row.component_name}>
                      <td>{row.component_name}</td>
                      <td>₹{row.amount}</td>
                    </tr>
                  ))}
                  <tr className={styles.totalRow}>
                    <td>Total</td>
                    <td>₹{SAMPLE_SALARY_TOTAL}</td>
                  </tr>
                </tbody>
              </table>
            )}
          </>
        )}
      </div>
    </div>
  );
};
