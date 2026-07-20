import React, { useState } from 'react';
import { UploadCloud, CheckCircle, Loader2 } from 'lucide-react';

import { uploadOnboardingDocument } from '../../features/offer-management/api/offerPortal.api';

import styles from './OfferPortalPage.module.scss';

interface Props {
  token: string;
  requiredDocuments: Array<{ name: string; is_required: boolean; description?: string }>;
  uploadedDocuments: Array<{ name: string; url: string; uploaded_at: string }>;
  refetchPortal: () => void;
}

export const OnboardingDocumentUpload = ({
  token,
  requiredDocuments,
  uploadedDocuments,
  refetchPortal,
}: Props) => {
  const [uploadingName, setUploadingName] = useState<string | null>(null);

  const handleUpload = async (docName: string, file: File) => {
    setUploadingName(docName);
    try {
      await uploadOnboardingDocument(token, docName, file);
      // Wait a moment then refetch so it appears in the uploaded list
      setTimeout(refetchPortal, 500);
    } catch {
      alert('Upload failed. Please try again.');
    } finally {
      setUploadingName(null);
    }
  };

  const hasUploaded = (name: string) => uploadedDocuments.some((doc) => doc.name === name);

  return (
    <div
      style={{ marginTop: 32, paddingTop: 24, borderTop: '1px solid #e2e8f0', textAlign: 'left' }}
    >
      <h3 style={{ fontSize: 18, marginBottom: 8, color: '#0f172a' }}>Pre-Onboarding Documents</h3>
      <p style={{ color: '#64748b', marginBottom: 16, fontSize: 14 }}>
        Please upload the required documents to complete your onboarding process.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {requiredDocuments.map((reqDoc) => {
          const isUploaded = hasUploaded(reqDoc.name);
          const isUploading = uploadingName === reqDoc.name;

          return (
            <div
              key={reqDoc.name}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                border: '1px solid #e2e8f0',
                borderRadius: 6,
                backgroundColor: '#f8fafc',
              }}
            >
              <div>
                <div style={{ fontWeight: 500, color: '#1e293b' }}>
                  {reqDoc.name} {reqDoc.is_required && <span style={{ color: '#ef4444' }}>*</span>}
                </div>
                {reqDoc.description && (
                  <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                    {reqDoc.description}
                  </div>
                )}
              </div>

              <div>
                {isUploaded ? (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      color: '#16a34a',
                      fontWeight: 500,
                      fontSize: 14,
                    }}
                  >
                    <CheckCircle size={18} /> Uploaded
                  </div>
                ) : (
                  <label
                    className={`${styles.btn} ${styles.btnPrimary}`}
                    style={{
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      opacity: isUploading ? 0.7 : 1,
                    }}
                  >
                    {isUploading ? (
                      <Loader2 size={16} className={styles.spinner} />
                    ) : (
                      <UploadCloud size={16} />
                    )}
                    {isUploading ? 'Uploading...' : 'Choose File'}
                    <input
                      type="file"
                      style={{ display: 'none' }}
                      disabled={isUploading}
                      onChange={(e) => {
                        if (e.target.files?.[0]) handleUpload(reqDoc.name, e.target.files[0]);
                      }}
                    />
                  </label>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {requiredDocuments.length === 0 && (
        <div style={{ color: '#64748b', fontStyle: 'italic', fontSize: 14 }}>
          No specific documents requested.
        </div>
      )}
    </div>
  );
};
