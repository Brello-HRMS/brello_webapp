import React, { useEffect, useState } from 'react';

import { Button } from '../../../../components/common/Button/Button';
import { Dialog } from '../../../../components/common/Dialog/Dialog';
import { Loader } from '../../../../components/common/Loader/Loader';

import styles from './LetterPreviewModal.module.scss';

export interface LetterPreviewModalProps {
  letterNumber: string;
  isOpen: boolean;
  onClose: () => void;
  fetchUrl: () => Promise<string>;
}

export const LetterPreviewModal: React.FC<LetterPreviewModalProps> = ({
  letterNumber,
  isOpen,
  onClose,
  fetchUrl,
}) => {
  const [url, setUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setUrl(null);
      setError(null);
      setIsLoading(false);
      return;
    }

    let isCancelled = false;
    setIsLoading(true);
    setError(null);

    fetchUrl()
      .then((resolvedUrl) => {
        if (!isCancelled) {
          setUrl(resolvedUrl);
        }
      })
      .catch(() => {
        if (!isCancelled) {
          setError('Failed to load the letter preview. Please try again.');
        }
      })
      .finally(() => {
        if (!isCancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      isCancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const handleDownload = () => {
    if (url) {
      window.open(url, '_blank');
    }
  };

  return (
    <Dialog
      title={`Preview — ${letterNumber}`}
      open={isOpen}
      onClose={onClose}
      maxWidth="900px"
      actions={
        <Button variant="secondary" onClick={handleDownload} disabled={!url}>
          Download
        </Button>
      }
    >
      {isLoading && (
        <div className={styles.loaderWrapper}>
          <Loader />
        </div>
      )}
      {!isLoading && error && <p className={styles.errorText}>{error}</p>}
      {!isLoading && !error && url && (
        <iframe src={url} title={`Preview of ${letterNumber}`} className={styles.previewFrame} />
      )}
    </Dialog>
  );
};

export default LetterPreviewModal;
