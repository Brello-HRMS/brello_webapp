import React, { useState } from 'react';
import {
  FileImage,
  FileVideo,
  FileText,
  FileSpreadsheet,
  FileCode2,
  FileArchive,
  File,
  Download,
  Loader2,
  AlertCircle,
} from 'lucide-react';

import styles from './DocumentRender.module.scss';

// ── Public API ───────────────────────────────────────────────────────────────

export type DocumentVariant = 'thumbnail' | 'preview' | 'full';

export interface DocumentRenderProps {
  /** Resolved signed/public URL. Pass `undefined` while the URL is still loading. */
  url: string | undefined;
  /** MIME type — drives which renderer is used. */
  mimeType: string;
  /** Original file name, shown on download cards. */
  name?: string;
  /**
   * `thumbnail` — fixed 80×80, inline previews (image grids, attachment lists).
   * `preview`   — full-width, height-capped, suitable for modals.
   * `full`      — fills 100% of the parent container.
   */
  variant?: DocumentVariant;
  className?: string;
}

// ── Internal helpers ─────────────────────────────────────────────────────────

type DocCategory =
  | 'image'
  | 'video'
  | 'pdf'
  | 'spreadsheet'
  | 'csv'
  | 'document'
  | 'presentation'
  | 'archive'
  | 'other';

function getCategory(mime: string): DocCategory {
  if (!mime) return 'other';
  if (mime.startsWith('image/')) return 'image';
  if (mime.startsWith('video/')) return 'video';
  if (mime === 'application/pdf') return 'pdf';
  if (mime === 'text/csv' || mime === 'application/csv') return 'csv';
  if (
    mime === 'application/vnd.ms-excel' ||
    mime === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
    mime === 'application/vnd.oasis.opendocument.spreadsheet'
  )
    return 'spreadsheet';
  if (
    mime === 'application/msword' ||
    mime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    mime === 'application/vnd.oasis.opendocument.text'
  )
    return 'document';
  if (
    mime === 'application/vnd.ms-powerpoint' ||
    mime === 'application/vnd.openxmlformats-officedocument.presentationml.presentation' ||
    mime === 'application/vnd.oasis.opendocument.presentation'
  )
    return 'presentation';
  if (
    mime === 'application/zip' ||
    mime === 'application/x-zip-compressed' ||
    mime === 'application/x-rar-compressed' ||
    mime === 'application/x-7z-compressed' ||
    mime === 'application/gzip'
  )
    return 'archive';
  return 'other';
}

type CategoryMeta = {
  Icon: React.FC<{ size?: number; className?: string }>;
  label: string;
  colorClass: string;
};

const CATEGORY_META: Record<DocCategory, CategoryMeta> = {
  image:        { Icon: FileImage,       label: 'Image',        colorClass: styles.colorImage },
  video:        { Icon: FileVideo,       label: 'Video',        colorClass: styles.colorVideo },
  pdf:          { Icon: FileText,        label: 'PDF',          colorClass: styles.colorPdf },
  csv:          { Icon: FileCode2,       label: 'CSV',          colorClass: styles.colorCsv },
  spreadsheet:  { Icon: FileSpreadsheet, label: 'Spreadsheet',  colorClass: styles.colorSpreadsheet },
  document:     { Icon: FileText,        label: 'Document',     colorClass: styles.colorDocument },
  presentation: { Icon: FileText,        label: 'Presentation', colorClass: styles.colorPresentation },
  archive:      { Icon: FileArchive,     label: 'Archive',      colorClass: styles.colorArchive },
  other:        { Icon: File,            label: 'File',         colorClass: styles.colorOther },
};

// ── Sub-renderers ────────────────────────────────────────────────────────────

interface DownloadCardProps {
  url: string;
  name: string;
  meta: CategoryMeta;
  variant: DocumentVariant;
}

const DownloadCard: React.FC<DownloadCardProps> = ({ url, name, meta, variant }) => {
  const { Icon, label, colorClass } = meta;
  const iconSize = variant === 'thumbnail' ? 24 : 40;

  return (
    <div className={`${styles.card} ${styles[variant]}`}>
      <div className={`${styles.cardIcon} ${colorClass}`}>
        <Icon size={iconSize} />
      </div>
      {variant !== 'thumbnail' && (
        <span className={styles.cardLabel}>{label}</span>
      )}
      <span className={styles.cardName} title={name}>
        {name}
      </span>
      <a
        href={url}
        download={name}
        target="_blank"
        rel="noopener noreferrer"
        className={`${styles.downloadBtn} ${variant === 'thumbnail' ? styles.downloadBtnSm : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        <Download size={variant === 'thumbnail' ? 11 : 14} />
        {variant !== 'thumbnail' && <span>Download</span>}
      </a>
    </div>
  );
};

// ── Main component ───────────────────────────────────────────────────────────

export const DocumentRender: React.FC<DocumentRenderProps> = ({
  url,
  mimeType = '',
  name = 'document',
  variant = 'preview',
  className,
}) => {
  const [imgError, setImgError] = useState(false);
  const [videoError, setVideoError] = useState(false);

  const category = getCategory(mimeType);
  const meta = CATEGORY_META[category];
  const rootClass = [styles.root, styles[variant], className].filter(Boolean).join(' ');

  // ── Loading ──
  if (!url) {
    return (
      <div className={`${rootClass} ${styles.skeleton}`}>
        <Loader2 size={18} className={styles.skeletonSpinner} />
      </div>
    );
  }

  // ── Image ──
  if (category === 'image') {
    if (imgError) {
      return (
        <div className={`${rootClass} ${styles.errorBox}`}>
          <AlertCircle size={18} className={styles.errorIcon} />
          {variant !== 'thumbnail' && <span className={styles.errorText}>Failed to load image</span>}
        </div>
      );
    }
    return (
      <div className={rootClass}>
        <img
          src={url}
          alt={name}
          className={`${styles.img} ${styles[variant]}`}
          onError={() => setImgError(true)}
        />
      </div>
    );
  }

  // ── Video ──
  if (category === 'video') {
    if (videoError) {
      return <DownloadCard url={url} name={name} meta={meta} variant={variant} />;
    }
    return (
      <div className={rootClass}>
        <video
          src={url}
          controls={variant !== 'thumbnail'}
          muted={variant === 'thumbnail'}
          preload="metadata"
          className={`${styles.video} ${styles[variant]}`}
          onError={() => setVideoError(true)}
        />
      </div>
    );
  }

  // ── PDF — iframe in preview/full, download card in thumbnail ──
  if (category === 'pdf') {
    if (variant === 'thumbnail') {
      return <DownloadCard url={url} name={name} meta={meta} variant={variant} />;
    }
    return (
      <div className={rootClass}>
        <iframe
          src={url}
          title={name}
          className={`${styles.pdfFrame} ${styles[variant]}`}
        />
      </div>
    );
  }

  // ── All other types — download card ──
  return <DownloadCard url={url} name={name} meta={meta} variant={variant} />;
};
