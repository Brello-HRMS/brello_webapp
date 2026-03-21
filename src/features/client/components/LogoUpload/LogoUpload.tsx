import React, { useState } from 'react';
import { Upload, X } from 'lucide-react';

import styles from './LogoUpload.module.scss';

interface LogoUploadProps {
  onLogoChange?: (file: File | null) => void;
  initialLogoUrl?: string;
}

export const LogoUpload: React.FC<LogoUploadProps> = ({ onLogoChange, initialLogoUrl }) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialLogoUrl || null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      onLogoChange?.(file);
    }
  };

  const handleRemove = () => {
    setPreviewUrl(null);
    onLogoChange?.(null);
  };

  return (
    <div className={styles.container}>
      <label className={styles.label}>Client Logo</label>
      <div className={styles.uploadArea}>
        {previewUrl ? (
          <div className={previewUrl ? styles.previewWrapper : ''}>
            <img src={previewUrl} alt="Logo preview" className={styles.preview} />
            <button type="button" className={styles.removeButton} onClick={handleRemove}>
              <X size={14} />
            </button>
          </div>
        ) : (
          <label className={styles.uploadPlaceholder}>
            <input
              type="file"
              accept="image/*"
              className={styles.fileInput}
              onChange={handleFileChange}
            />
            <div className={styles.iconWrapper}>
              <Upload size={20} />
            </div>
            <span className={styles.uploadText}>Upload Logo</span>
          </label>
        )}
      </div>
    </div>
  );
};
