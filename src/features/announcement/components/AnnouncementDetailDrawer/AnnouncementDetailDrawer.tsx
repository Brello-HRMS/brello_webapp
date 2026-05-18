import React from 'react';
import { FileText, Download } from 'lucide-react';

import { Dialog } from '../../../../components/common/Dialog/Dialog';
import { MarkdownEditor } from '../../../../components/common/MarkdownEditor/MarkdownEditor';
import { AnnouncementPriority } from '../../types/announcementTypes';
import { useMarkAnnouncementRead } from '../../hooks/useAnnouncement';

import styles from './AnnouncementDetailDrawer.module.scss';

import type { EmployeeAnnouncement } from '../../types/announcementTypes';

interface AnnouncementDetailDrawerProps {
  announcement: EmployeeAnnouncement | null;
  onClose: () => void;
}

const PRIORITY_LABEL: Record<AnnouncementPriority, string> = {
  [AnnouncementPriority.NORMAL]: 'Normal',
  [AnnouncementPriority.IMPORTANT]: 'Important',
  [AnnouncementPriority.URGENT]: 'Urgent',
};

const PRIORITY_CLASS: Record<AnnouncementPriority, string> = {
  [AnnouncementPriority.NORMAL]: styles.priorityNormal,
  [AnnouncementPriority.IMPORTANT]: styles.priorityImportant,
  [AnnouncementPriority.URGENT]: styles.priorityUrgent,
};

const formatDate = (dateStr: string | null | undefined) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
};

export const AnnouncementDetailDrawer: React.FC<AnnouncementDetailDrawerProps> = ({
  announcement,
  onClose,
}) => {
  const { markRead } = useMarkAnnouncementRead();

  React.useEffect(() => {
    if (announcement && !announcement.is_read) {
      markRead(announcement.id);
    }
  }, [announcement, markRead]);

  return (
    <Dialog
      title={announcement?.title ?? 'Announcement'}
      open={!!announcement}
      onClose={onClose}
      maxWidth="560px"
      position="right"
    >
      {announcement && (
        <div className={styles.body}>
          <div className={styles.metaRow}>
            <span className={`${styles.priorityBadge} ${PRIORITY_CLASS[announcement.priority]}`}>
              {PRIORITY_LABEL[announcement.priority]}
            </span>
            <span className={styles.date}>{formatDate(announcement.published_at)}</span>
          </div>

          <div className={styles.section}>
            <span className={styles.sectionLabel}>Content</span>
            <div className={styles.descriptionWrapper}>
              <MarkdownEditor value={announcement.description_html} previewOnly height="auto" />
            </div>
          </div>

          {announcement.attachments?.length > 0 && (
            <div className={styles.section}>
              <span className={styles.sectionLabel}>Attachments</span>
              <div className={styles.attachmentList}>
                {announcement.attachments.map((att, idx) => (
                  <div key={att.id ?? idx} className={styles.attachmentItem}>
                    <FileText
                      size={14}
                      style={{ color: 'var(--color-primary-border)', flexShrink: 0 }}
                    />
                    <span className={styles.attachmentName}>{att.file_name}</span>
                    {att.file_url && (
                      <a
                        href={att.file_url}
                        target="_blank"
                        rel="noreferrer"
                        className={styles.attachmentLink}
                        title="Download"
                      >
                        <Download size={14} />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </Dialog>
  );
};
