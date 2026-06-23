import React, { useState, useMemo, useCallback } from 'react';
import { Plus, Loader2 } from 'lucide-react';

import { PageHeader } from '../../components/common/PageHeader/PageHeader';
import { DataTable } from '../../components/common/DataTable';
import { Button } from '../../components/common/Button/Button';
import { Select, type SelectOption } from '../../components/common/Select/Select';
import { useMyTickets } from '../../features/feedback/hooks/useFeedback';
import { feedbackColumns } from '../../features/feedback/columns/feedbackColumns';
import { SubmitFeedbackModal } from '../../features/feedback/components/SubmitFeedbackModal/SubmitFeedbackModal';
import { FeedbackDetailDrawer } from '../../features/feedback/components/FeedbackDetailDrawer/FeedbackDetailDrawer';
import { FeedbackType, FeedbackStatus } from '../../features/feedback/types/feedbackTypes';

import styles from './FeedbackPage.module.scss';

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

const PAGE_CONFIG: Record<FeedbackType, { title: string; subtitle: string; btnLabel: string }> = {
  [FeedbackType.FEEDBACK]: {
    title: 'Feedback',
    subtitle: 'Share feature requests, suggestions, or praise about the Brello product.',
    btnLabel: 'Submit Feedback',
  },
  [FeedbackType.ISSUE_REPORT]: {
    title: 'Report an Issue',
    subtitle:
      'Report bugs, UI problems, performance issues, or data inaccuracies you have encountered.',
    btnLabel: 'Report Issue',
  },
};

interface FeedbackPageProps {
  defaultType: FeedbackType;
}

const FeedbackPage: React.FC<FeedbackPageProps> = ({ defaultType }) => {
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 20 });
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [submitOpen, setSubmitOpen] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);

  const statusOptions =
    defaultType === FeedbackType.FEEDBACK ? FEEDBACK_STATUS_OPTIONS : ISSUE_STATUS_OPTIONS;

  const queryParams = useMemo(
    () => ({
      page: pagination.pageIndex + 1,
      limit: pagination.pageSize,
      type: defaultType,
      ...(statusFilter ? { status: statusFilter as FeedbackStatus } : {}),
    }),
    [pagination, defaultType, statusFilter],
  );

  const { items, isLoading, pagination: meta } = useMyTickets(queryParams);

  const handleView = useCallback((ticket: FeedbackTicket) => {
    setSelectedTicketId(ticket.id);
  }, []);

  const columns = useMemo(() => feedbackColumns({ onView: handleView }), [handleView]);

  const pageCount = meta ? Math.ceil(meta.total / meta.limit) : 0;

  const config = PAGE_CONFIG[defaultType];

  return (
    <div className={styles.page}>
      <PageHeader
        title={config.title}
        subtitle={config.subtitle}
        actions={
          <Button variant="primary" onClick={() => setSubmitOpen(true)}>
            <Plus size={16} />
            {config.btnLabel}
          </Button>
        }
      />

      <div className={styles.filterRow}>
        <div className={styles.filterSelect}>
          <Select
            options={statusOptions}
            value={statusFilter}
            onChange={(v) => {
              setStatusFilter(String(v));
              setPagination((p) => ({ ...p, pageIndex: 0 }));
            }}
            placeholder="All Statuses"
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

      <SubmitFeedbackModal
        isOpen={submitOpen}
        onClose={() => setSubmitOpen(false)}
        defaultType={defaultType}
      />
      <FeedbackDetailDrawer ticketId={selectedTicketId} onClose={() => setSelectedTicketId(null)} />
    </div>
  );
};

export default FeedbackPage;
