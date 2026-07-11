import { useState } from 'react';
import { Eye } from 'lucide-react';

import { Popover } from '../../../../components/common';
import { useAnnouncementReaders } from '../../hooks/useAnnouncement';

import styles from './ReadersCell.module.scss';

interface Props {
  announcementId: string;
  readCount: number;
}

const formatViewedAt = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });

export const ReadersCell = ({ announcementId, readCount }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const { readers, isLoading } = useAnnouncementReaders(announcementId, isOpen);

  if (readCount <= 0) {
    return <span className={styles.readCount}>0</span>;
  }

  const trigger = (
    <button type="button" className={styles.trigger}>
      <Eye size={13} />
      <span>{readCount}</span>
    </button>
  );

  return (
    <Popover
      trigger={trigger}
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      dropdownClassName={styles.dropdown}
    >
      <div className={styles.header}>Read by</div>
      {isLoading ? (
        <div className={styles.state}>Loading…</div>
      ) : readers.length === 0 ? (
        <div className={styles.state}>No one has read this yet.</div>
      ) : (
        <ul className={styles.list}>
          {readers.map((r) => (
            <li key={r.employee_id} className={styles.item}>
              <span className={styles.name}>{r.name}</span>
              <span className={styles.time}>{formatViewedAt(r.viewed_at)}</span>
            </li>
          ))}
        </ul>
      )}
    </Popover>
  );
};
