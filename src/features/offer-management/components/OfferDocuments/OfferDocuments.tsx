import { FileText, CheckCircle, XCircle } from 'lucide-react';

import { Button } from '../../../../components/common';
import { useOfferDocuments, useVerifyOfferDocument } from '../../hooks/useOffers';

import styles from './OfferDocuments.module.scss';

export const OfferDocuments = ({ offerId }: { offerId: string }) => {
  const { data: response, isLoading } = useOfferDocuments(offerId);
  const documents = response?.data ?? [];
  const { mutate: verifyDoc, isPending } = useVerifyOfferDocument(offerId);

  if (isLoading) return <div className={styles.loading}>Loading documents...</div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>Candidate Documents</h3>
        <p className={styles.subtitle}>
          Review and verify preboarding documents uploaded by the candidate.
        </p>
      </div>

      {documents.length === 0 ? (
        <div className={styles.empty}>
          <FileText size={32} className={styles.emptyIcon} />
          <p>No documents uploaded yet.</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {documents.map((doc: Record<string, unknown>) => (
            <div key={doc.id as string} className={styles.card}>
              <div className={styles.cardHeader}>
                <div className={styles.docInfo}>
                  <FileText size={16} />
                  <span className={styles.docType}>{doc.document_type as string}</span>
                </div>
                <span className={`${styles.status} ${styles[doc.verification_status as string]}`}>
                  {doc.verification_status as string}
                </span>
              </div>

              <div className={styles.fileName}>
                {(doc.original_filename as string) || 'document.pdf'}
              </div>

              <div className={styles.actions}>
                <a
                  href={doc.file_url as string}
                  target="_blank"
                  rel="noreferrer"
                  className={styles.viewLink}
                >
                  View File
                </a>

                {doc.verification_status === 'pending' && (
                  <div className={styles.verifyActions}>
                    <Button
                      variant="outline"
                      className={styles.rejectBtn}
                      disabled={isPending}
                      onClick={() => {
                        const reason = window.prompt('Reason for rejection:');
                        if (reason)
                          verifyDoc({
                            documentId: doc.id as string,
                            params: { status: 'rejected', reason },
                          });
                      }}
                    >
                      <XCircle size={14} /> Reject
                    </Button>
                    <Button
                      variant="primary"
                      className={styles.verifyBtn}
                      disabled={isPending}
                      onClick={() =>
                        verifyDoc({ documentId: doc.id as string, params: { status: 'verified' } })
                      }
                    >
                      <CheckCircle size={14} /> Verify
                    </Button>
                  </div>
                )}
              </div>
              {typeof doc.rejection_reason === 'string' && (
                <div className={styles.rejectionReason}>
                  <strong>Reason:</strong> {doc.rejection_reason}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
