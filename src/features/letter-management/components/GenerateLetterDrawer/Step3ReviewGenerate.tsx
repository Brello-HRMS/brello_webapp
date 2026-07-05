import React, { forwardRef, useEffect, useImperativeHandle } from 'react';
import { AlertTriangle } from 'lucide-react';

import { useGenerateIssuedLetter, useResolveIssuedLetter } from '../../hooks/useIssuedLetters';

import styles from './GenerateLetterDrawer.module.scss';

import type { GenerateLetterResponse, RenderModel } from '../../types/letterTypes';

export interface Step3ReviewGenerateHandle {
  generate: () => void;
}

interface Step3ReviewGenerateProps {
  employeeId: string;
  templateId: string;
  idempotencyKey: string;
  onGenerated: (result: GenerateLetterResponse) => void;
  onStatusChange: (status: { canGenerate: boolean; isGenerating: boolean }) => void;
}

const LetterPreview: React.FC<{ preview: RenderModel }> = ({ preview }) => (
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

export const Step3ReviewGenerate = forwardRef<Step3ReviewGenerateHandle, Step3ReviewGenerateProps>(
  ({ employeeId, templateId, idempotencyKey, onGenerated, onStatusChange }, ref) => {
    const {
      mutate: resolve,
      data: resolveResponse,
      isPending: isResolving,
    } = useResolveIssuedLetter();
    const { mutate: generate, isPending: isGenerating } = useGenerateIssuedLetter();

    useEffect(() => {
      resolve({ employee_id: employeeId, template_id: templateId });
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [employeeId, templateId]);

    const missing = resolveResponse?.data.missing || [];
    const preview = resolveResponse?.data.preview;
    const canGenerate = !isResolving && !!preview && missing.length === 0;

    useEffect(() => {
      onStatusChange({ canGenerate, isGenerating });
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [canGenerate, isGenerating]);

    useImperativeHandle(
      ref,
      () => ({
        generate: () => {
          generate(
            { params: { employee_id: employeeId, template_id: templateId }, idempotencyKey },
            { onSuccess: (response) => onGenerated(response.data) },
          );
        },
      }),
      [generate, employeeId, templateId, idempotencyKey, onGenerated],
    );

    return (
      <div className={styles.stepContainer}>
        <h3 className={styles.stepTitle}>Review &amp; Generate</h3>
        <p className={styles.stepDescription}>
          Review the letter contents before generating. This uses the employee&apos;s actual data.
        </p>

        {isResolving && <p className={styles.mutedText}>Loading preview...</p>}

        {missing.length > 0 && (
          <div className={styles.warningBanner}>
            <AlertTriangle size={18} />
            <div>
              <p className={styles.warningTitle}>Missing required fields</p>
              <p className={styles.warningDescription}>
                The following fields could not be resolved for this employee: {missing.join(', ')}.
                Generation is disabled until these are available.
              </p>
            </div>
          </div>
        )}

        {preview && <LetterPreview preview={preview} />}
      </div>
    );
  },
);

Step3ReviewGenerate.displayName = 'Step3ReviewGenerate';

export default Step3ReviewGenerate;
