import React, { useState, useMemo, useCallback } from 'react';
import { Loader2 } from 'lucide-react';

import { PageHeader } from '../../components/common/PageHeader/PageHeader';
import { DataTable } from '../../components/common/DataTable';
import { Select, type SelectOption } from '../../components/common/Select/Select';
import {
  usePlatformTickets,
  usePlatformStats,
} from '../../features/feedback/hooks/usePlatformFeedback';
import { platformFeedbackColumns } from '../../features/feedback/columns/platformFeedbackColumns';
import { PlatformFeedbackDetailDrawer } from '../../features/feedback/components/PlatformFeedbackDetailDrawer/PlatformFeedbackDetailDrawer';
import {
  FeedbackType,
  FeedbackStatus,
  FeedbackPriority,
} from '../../features/feedback/types/feedbackTypes';

import styles from './PlatformFeedbackPage.module.scss';

import type { FeedbackTicket } from '../../features/feedback/types/feedbackTypes';

const FEEDBACK_STATUS_OPTIONS: SelectOption[] = [
  { value: '', label: 'All Statuses' },
  { value: FeedbackStatus.SUBMITTED, label: 'Submitted' },
  { value: FeedbackStatus.UNDER_REVIEW, label: 'Under Review' },
  { value: FeedbackStatus.PLANNED, label: 'Planned' },
  { value: FeedbackStatus.DECLINED, label: 'Declined' },
  { value: FeedbackStatus.RELEASED, label: 'Released' },
];

const ISSUE_STATUS_OPTIONS: SelectOption[] = [
  { value: '', label: 'All Statuses' },
  { value: FeedbackStatus.SUBMITTED, label: 'Submitted' },
  { value: FeedbackStatus.ACKNOWLEDGED, label: 'Acknowledged' },
  { value: FeedbackStatus.IN_PROGRESS, label: 'In Progress' },
  { value: FeedbackStatus.RESOLVED, label: 'Resolved' },
  { value: FeedbackStatus.CLOSED, label: 'Closed' },
];

const PRIORITY_OPTIONS: SelectOption[] = [
  { value: '', label: 'All Priorities' },
  { value: FeedbackPriority.LOW, label: 'Low' },
  { value: FeedbackPriority.MEDIUM, label: 'Medium' },
  { value: FeedbackPriority.HIGH, label: 'High' },
  { value: FeedbackPriority.CRITICAL, label: 'Critical' },
];

const PAGE_CONFIG: Record<FeedbackType, { title: string; subtitle: string }> = {
  [FeedbackType.FEEDBACK]: {
    title: 'Feedback',
    subtitle: 'Feature requests, suggestions, and praise submitted by organisations.',
  },
  [FeedbackType.ISSUE_REPORT]: {
    title: 'Issue Reports',
    subtitle: 'Bugs, UI problems, performance and data issues reported by organisations.',
  },
};

interface PlatformFeedbackPageProps {
  defaultType: FeedbackType;
}

const PlatformFeedbackPage: React.FC<PlatformFeedbackPageProps> = ({ defaultType }) => {
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 20 });
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);

  const { data: stats } = usePlatformStats();

  const queryParams = useMemo(
    () => ({
      page: pagination.pageIndex + 1,
      limit: pagination.pageSize,
      type: defaultType,
      ...(statusFilter ? { status: statusFilter as FeedbackStatus } : {}),
      ...(priorityFilter ? { priority: priorityFilter as FeedbackPriority } : {}),
    }),
    [pagination, defaultType, statusFilter, priorityFilter],
  );

  const { items, isLoading, pagination: meta } = usePlatformTickets(queryParams);

  const handleView = useCallback((ticket: FeedbackTicket) => {
    setSelectedTicketId(ticket.id);
  }, []);

  const columns = useMemo(() => platformFeedbackColumns({ onView: handleView }), [handleView]);

  const pageCount = meta ? Math.ceil(meta.total / meta.limit) : 0;

  const resetPagination = (setter: (v: string) => void) => (v: string | number) => {
    setter(String(v));
    setPagination((p) => ({ ...p, pageIndex: 0 }));
  };

  const statusOptions =
    defaultType === FeedbackType.FEEDBACK ? FEEDBACK_STATUS_OPTIONS : ISSUE_STATUS_OPTIONS;

  const config = PAGE_CONFIG[defaultType];

  // Stats scoped to the current type
  const typeKey = defaultType === FeedbackType.FEEDBACK ? 'FEEDBACK' : 'ISSUE_REPORT';
  const openStatuses =
    defaultType === FeedbackType.FEEDBACK
      ? ['SUBMITTED', 'UNDER_REVIEW']
      : ['SUBMITTED', 'ACKNOWLEDGED', 'IN_PROGRESS'];

  return (
    <div className={styles.page}>
      <PageHeader title={config.title} subtitle={config.subtitle} />

      {stats && (
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>Total</span>
            <span className={styles.statValue}>{stats.by_type[typeKey] ?? 0}</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>Open</span>
            <span className={styles.statValue}>
              {openStatuses.reduce((sum, s) => sum + (stats.by_status[s] ?? 0), 0)}
            </span>
            <span className={styles.statSub}>{openStatuses.join(' + ')}</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>Critical</span>
            <span className={styles.statValue}>{stats.by_priority['CRITICAL'] ?? 0}</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>High Priority</span>
            <span className={styles.statValue}>{stats.by_priority['HIGH'] ?? 0}</span>
          </div>
        </div>
      )}

      <div className={styles.filtersRow}>
        <div className={styles.filterItem}>
          <Select
            options={statusOptions}
            value={statusFilter}
            onChange={resetPagination(setStatusFilter)}
            placeholder="All Statuses"
          />
        </div>
        <div className={styles.filterItem}>
          <Select
            options={PRIORITY_OPTIONS}
            value={priorityFilter}
            onChange={resetPagination(setPriorityFilter)}
            placeholder="All Priorities"
          />
        </div>
      </div>

      {isLoading ? (
        <div className={styles.loader}>
          <Loader2 size={28} style={{ animation: 'spin 1s linear infinite' }} />
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={items}
          rowIdField="id"
          pagination={pagination}
          onPaginationChange={setPagination}
          pageCount={pageCount}
          manualPagination
        />
      )}

      <PlatformFeedbackDetailDrawer
        ticketId={selectedTicketId}
        onClose={() => setSelectedTicketId(null)}
      />
    </div>
  );
};

export default PlatformFeedbackPage;
