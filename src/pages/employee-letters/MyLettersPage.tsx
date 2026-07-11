import { useCallback, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { FileCheck2 } from 'lucide-react';

import { NoDataFound, PageHeader } from '../../components/common';
import { getMyLetterDownloadUrl } from '../../features/letter-management/api/issuedLetter';
import { LetterPreviewModal } from '../../features/letter-management/components/LetterPreviewModal/LetterPreviewModal';
import { MyLetterCard } from '../../features/letter-management/components/MyLetterCard/MyLetterCard';
import {
  useAcknowledgeLetter,
  useMyLetterDownload,
  useMyLetters,
} from '../../features/letter-management/hooks/useIssuedLetters';
import { resolveAssetUrl } from '../../utils/assetUrl';

import styles from './MyLettersPage.module.scss';

import type { IssuedLetter } from '../../features/letter-management/types/letterTypes';

const MyLettersPage = () => {
  const [previewingLetter, setPreviewingLetter] = useState<IssuedLetter | null>(null);

  const queryClient = useQueryClient();
  const { data: response, isLoading } = useMyLetters();
  const { mutate: downloadLetter } = useMyLetterDownload();
  const { mutate: acknowledgeLetter } = useAcknowledgeLetter();

  const letterList = useMemo(() => response?.data || [], [response]);

  const handleDownload = useCallback(
    (letter: IssuedLetter) => {
      downloadLetter(letter.id);
    },
    [downloadLetter],
  );

  const handleAcknowledge = useCallback(
    (letter: IssuedLetter) => {
      acknowledgeLetter(letter.id);
    },
    [acknowledgeLetter],
  );

  const handleClosePreview = useCallback(() => setPreviewingLetter(null), []);

  if (!isLoading && letterList.length === 0) {
    return (
      <NoDataFound
        title="No Letters Yet"
        description="You don't have any letters issued to you yet. Once your organization generates a letter for you, it will appear here."
      />
    );
  }

  return (
    <div className={`${styles.container} ${isLoading ? styles.loading : ''}`}>
      <PageHeader
        title="My Letters"
        titleExtra={
          <span className={styles.pageIcon}>
            <FileCheck2 size={20} />
          </span>
        }
        subtitle="View and download letters issued to you."
      />

      <div className={styles.grid}>
        {letterList.map((letter) => (
          <MyLetterCard
            key={letter.id}
            letter={letter}
            onDownload={() => handleDownload(letter)}
            onPreview={() => setPreviewingLetter(letter)}
            onAcknowledge={() => handleAcknowledge(letter)}
          />
        ))}
      </div>

      <LetterPreviewModal
        letterNumber={previewingLetter?.letter_number ?? ''}
        isOpen={!!previewingLetter}
        onClose={handleClosePreview}
        fetchUrl={async () => {
          const { data } = await getMyLetterDownloadUrl(previewingLetter!.id);
          queryClient.invalidateQueries({ queryKey: ['my-letters'] });
          return resolveAssetUrl(data.url) ?? data.url;
        }}
      />
    </div>
  );
};

export default MyLettersPage;
