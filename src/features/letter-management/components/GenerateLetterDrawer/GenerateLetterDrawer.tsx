import React, { useCallback, useEffect, useRef, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';

import { Button, Dialog } from '../../../../components/common';
import { useIssuedLetterDownload } from '../../hooks/useIssuedLetters';

import { Step1EmployeeSelect } from './Step1EmployeeSelect';
import { Step2TemplateSelect } from './Step2TemplateSelect';
import { Step3ReviewGenerate } from './Step3ReviewGenerate';
import styles from './GenerateLetterDrawer.module.scss';

import type { Step3ReviewGenerateHandle } from './Step3ReviewGenerate';
import type { GenerateLetterResponse } from '../../types/letterTypes';

interface GenerateLetterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

type WizardStep = 1 | 2 | 3;

const createIdempotencyKey = () => crypto.randomUUID();

export const GenerateLetterDrawer: React.FC<GenerateLetterDrawerProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState<WizardStep>(1);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | undefined>(undefined);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | undefined>(undefined);
  const [idempotencyKey, setIdempotencyKey] = useState<string>('');
  const [generatedResult, setGeneratedResult] = useState<GenerateLetterResponse | null>(null);
  const [reviewStatus, setReviewStatus] = useState({ canGenerate: false, isGenerating: false });

  const step3Ref = useRef<Step3ReviewGenerateHandle>(null);
  const { mutate: downloadLetter, isPending: isDownloading } = useIssuedLetterDownload();

  const resetWizard = useCallback(() => {
    setStep(1);
    setSelectedEmployeeId(undefined);
    setSelectedTemplateId(undefined);
    setIdempotencyKey('');
    setGeneratedResult(null);
    setReviewStatus({ canGenerate: false, isGenerating: false });
  }, []);

  // Reset wizard state whenever the drawer is freshly opened
  useEffect(() => {
    if (isOpen) {
      resetWizard();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const handleSelectEmployee = useCallback((id: string) => {
    setSelectedEmployeeId(id);
  }, []);

  const handleSelectTemplate = useCallback((id: string) => {
    setSelectedTemplateId(id);
  }, []);

  const handleClose = useCallback(() => {
    onClose();
    resetWizard();
  }, [onClose, resetWizard]);

  const handleNext = useCallback(() => {
    if (step === 2 && selectedEmployeeId && selectedTemplateId) {
      // Entering review — this is a fresh generation attempt for this employee+template pair
      setIdempotencyKey(createIdempotencyKey());
      setReviewStatus({ canGenerate: false, isGenerating: false });
      setStep(3);
      return;
    }
    setStep((current) => (current < 3 ? ((current + 1) as WizardStep) : current));
  }, [step, selectedEmployeeId, selectedTemplateId]);

  const handleBack = useCallback(() => {
    setStep((current) => (current > 1 ? ((current - 1) as WizardStep) : current));
  }, []);

  const handleGenerate = useCallback(() => {
    step3Ref.current?.generate();
  }, []);

  const handleGenerated = useCallback((result: GenerateLetterResponse) => {
    setGeneratedResult(result);
  }, []);

  const handleReviewStatusChange = useCallback(
    (status: { canGenerate: boolean; isGenerating: boolean }) => {
      setReviewStatus(status);
    },
    [],
  );

  const handleDownload = useCallback(() => {
    if (generatedResult) {
      downloadLetter(generatedResult.letterId);
    }
  }, [generatedResult, downloadLetter]);

  const isSuccessState = !!generatedResult;

  const canGoNextFromStep1 = !!selectedEmployeeId;
  const canGoNextFromStep2 = !!selectedTemplateId;

  const renderActions = () => {
    if (isSuccessState) {
      return (
        <>
          <Button variant="secondary" onClick={handleClose} style={{ flex: 1 }}>
            Close
          </Button>
          <Button
            variant="primary"
            onClick={handleDownload}
            isLoading={isDownloading}
            style={{ flex: 1 }}
          >
            Download
          </Button>
        </>
      );
    }

    return (
      <>
        {step > 1 ? (
          <Button variant="secondary" onClick={handleBack} style={{ flex: 1 }}>
            Back
          </Button>
        ) : (
          <Button variant="secondary" onClick={handleClose} style={{ flex: 1 }}>
            Cancel
          </Button>
        )}

        {step === 1 && (
          <Button
            variant="primary"
            onClick={handleNext}
            disabled={!canGoNextFromStep1}
            style={{ flex: 1 }}
          >
            Next
          </Button>
        )}

        {step === 2 && (
          <Button
            variant="primary"
            onClick={handleNext}
            disabled={!canGoNextFromStep2}
            style={{ flex: 1 }}
          >
            Next
          </Button>
        )}

        {step === 3 && (
          <Button
            variant="primary"
            onClick={handleGenerate}
            disabled={!reviewStatus.canGenerate}
            isLoading={reviewStatus.isGenerating}
            style={{ flex: 1 }}
          >
            Generate
          </Button>
        )}
      </>
    );
  };

  return (
    <Dialog
      open={isOpen}
      onClose={handleClose}
      title="Generate Letter"
      description={!isSuccessState ? `Step ${step} of 3` : undefined}
      position="right"
      maxWidth="560px"
      actions={renderActions()}
    >
      {isSuccessState ? (
        <div className={styles.successState}>
          <CheckCircle2 size={48} className={styles.successIcon} />
          <h3 className={styles.successTitle}>Letter Generated</h3>
          <p className={styles.successDescription}>
            Letter number <strong>{generatedResult.letterNumber}</strong> has been generated
            successfully.
          </p>
        </div>
      ) : (
        <>
          {step === 1 && (
            <Step1EmployeeSelect
              selectedEmployeeId={selectedEmployeeId}
              onSelect={handleSelectEmployee}
            />
          )}
          {step === 2 && (
            <Step2TemplateSelect
              selectedTemplateId={selectedTemplateId}
              onSelect={handleSelectTemplate}
            />
          )}
          {step === 3 && selectedEmployeeId && selectedTemplateId && (
            <Step3ReviewGenerate
              ref={step3Ref}
              employeeId={selectedEmployeeId}
              templateId={selectedTemplateId}
              idempotencyKey={idempotencyKey}
              onGenerated={handleGenerated}
              onStatusChange={handleReviewStatusChange}
            />
          )}
        </>
      )}
    </Dialog>
  );
};

export default GenerateLetterDrawer;
