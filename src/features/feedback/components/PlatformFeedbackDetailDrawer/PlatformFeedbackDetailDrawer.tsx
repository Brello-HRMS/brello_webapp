import React, { useEffect, useState } from 'react';
import { Loader2, ArrowRight } from 'lucide-react';

import { Dialog } from '../../../../components/common/Dialog/Dialog';
import { DocumentRender } from '../../../../components/common/DocumentRender/DocumentRender';
import { TextArea } from '../../../../components/ui/TextArea/TextArea';
import { Button } from '../../../../components/common/Button/Button';
import { Select, type SelectOption } from '../../../../components/common/Select/Select';
import {
  usePlatformTicketDetail,
  useUpdatePlatformTicket,
  useAddPlatformComment,
} from '../../hooks/usePlatformFeedback';
import { TicketStatusBadge } from '../TicketStatusBadge/TicketStatusBadge';
import {
  FeedbackStatus,
  FeedbackPriority,
  FeedbackCategory,
  FeedbackType,
} from '../../enums/feedback.enum';
import { getDocumentSignedUrl } from '../../../../api/documents';
import { resolveAssetUrl } from '../../../../utils/assetUrl';
import { formatDateTime } from '../../../../utils/timeUtils';

import styles from './PlatformFeedbackDetailDrawer.module.scss';

const CATEGORY_LABEL: Record<FeedbackCategory, string> = {
  [FeedbackCategory.FEATURE_REQUEST]: 'Feature Request',
  [FeedbackCategory.SUGGESTION]: 'Suggestion',
  [FeedbackCategory.PRAISE]: 'Praise',
  [FeedbackCategory.BUG]: 'Bug',
  [FeedbackCategory.UI_UX]: 'UI / UX Issue',
  [FeedbackCategory.PERFORMANCE]: 'Performance',
  [FeedbackCategory.DATA_ISSUE]: 'Data Issue',
};

const FEEDBACK_STATUS_OPTIONS: SelectOption[] = [
  { value: FeedbackStatus.SUBMITTED, label: 'Submitted' },
  { value: FeedbackStatus.UNDER_REVIEW, label: 'Under Review' },
  { value: FeedbackStatus.PLANNED, label: 'Planned' },
  { value: FeedbackStatus.DECLINED, label: 'Declined' },
  { value: FeedbackStatus.RELEASED, label: 'Released' },
];

const ISSUE_STATUS_OPTIONS: SelectOption[] = [
  { value: FeedbackStatus.SUBMITTED, label: 'Submitted' },
  { value: FeedbackStatus.ACKNOWLEDGED, label: 'Acknowledged' },
  { value: FeedbackStatus.IN_PROGRESS, label: 'In Progress' },
  { value: FeedbackStatus.RESOLVED, label: 'Resolved' },
  { value: FeedbackStatus.CLOSED, label: 'Closed' },
];

const PRIORITY_OPTIONS: SelectOption[] = [
  { value: FeedbackPriority.LOW, label: 'Low' },
  { value: FeedbackPriority.MEDIUM, label: 'Medium' },
  { value: FeedbackPriority.HIGH, label: 'High' },
  { value: FeedbackPriority.CRITICAL, label: 'Critical' },
];

interface PlatformFeedbackDetailDrawerProps {
  ticketId: string | null;
  onClose: () => void;
}

export const PlatformFeedbackDetailDrawer: React.FC<PlatformFeedbackDetailDrawerProps> = ({
  ticketId,
  onClose,
}) => {
  const [replyBody, setReplyBody] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [attachmentUrls, setAttachmentUrls] = useState<Record<string, string>>({});

  const { data: ticket, isLoading } = usePlatformTicketDetail(ticketId);
  const { updateTicket, isUpdating } = useUpdatePlatformTicket();
  const { addComment, isAdding } = useAddPlatformComment(ticketId ?? '');

  useEffect(() => {
    if (!ticket?.attachments?.length) return;
    let cancelled = false;
    Promise.all(
      ticket.attachments.map((a) =>
        getDocumentSignedUrl(a.document_id)
          .then((res) => [a.document_id, resolveAssetUrl(res.url) ?? ''] as const)
          .catch(() => [a.document_id, ''] as const),
      ),
    ).then((entries) => {
      if (!cancelled) setAttachmentUrls(Object.fromEntries(entries));
    });
    return () => {
      cancelled = true;
    };
  }, [ticket?.id, ticket?.attachments]);

  const handleStatusChange = (newStatus: string | number) => {
    if (!ticketId) return;
    updateTicket({ id: ticketId, data: { status: newStatus as FeedbackStatus } });
  };

  const handlePriorityChange = (newPriority: string | number) => {
    if (!ticketId) return;
    updateTicket({ id: ticketId, data: { priority: newPriority as FeedbackPriority } });
  };

  const handleSendReply = async () => {
    if (!replyBody.trim()) return;
    await addComment({ body: replyBody.trim(), is_internal: isInternal });
    setReplyBody('');
    setIsInternal(false);
  };

  const statusOptions =
    ticket?.type === FeedbackType.FEEDBACK ? FEEDBACK_STATUS_OPTIONS : ISSUE_STATUS_OPTIONS;

  return (
    <Dialog
      title={ticket?.title ?? 'Ticket Detail'}
      open={!!ticketId}
      onClose={onClose}
      maxWidth="560px"
      position="right"
      showCloseButton
    >
      {isLoading || !ticket ? (
        <div className={styles.loader}>
          <Loader2 size={24} style={{ animation: 'spin 1s linear infinite' }} />
        </div>
      ) : (
        <div className={styles.content}>
          {/* Meta row */}
          <div className={styles.meta}>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Status</span>
              <TicketStatusBadge status={ticket.ticket_status} />
            </div>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Type</span>
              <span className={styles.metaValue}>
                {ticket.type === FeedbackType.FEEDBACK ? 'Feedback' : 'Issue Report'}
              </span>
            </div>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Category</span>
              <span className={styles.metaValue}>{CATEGORY_LABEL[ticket.category]}</span>
            </div>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Priority</span>
              <span className={`${styles.priorityBadge} ${styles[ticket.priority.toLowerCase()]}`}>
                {ticket.priority}
              </span>
            </div>
            {ticket.affected_module && (
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Module</span>
                <span className={styles.metaValue}>{ticket.affected_module}</span>
              </div>
            )}
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Submitted</span>
              <span className={styles.metaValue}>{formatDateTime(ticket.created_at)}</span>
            </div>
          </div>

          {/* Controls */}
          <div className={styles.controlsPanel}>
            <p className={styles.sectionTitle}>Update Ticket</p>
            <div className={styles.controlsRow}>
              <Select
                label="Status"
                options={statusOptions}
                value={ticket.ticket_status}
                onChange={handleStatusChange}
                disabled={isUpdating}
              />
              <Select
                label="Priority"
                options={PRIORITY_OPTIONS}
                value={ticket.priority}
                onChange={handlePriorityChange}
                disabled={isUpdating}
              />
            </div>
          </div>

          <div className={styles.divider} />

          {/* Description */}
          <div>
            <p className={styles.sectionTitle}>Description</p>
            <p className={styles.description}>{ticket.ticket_description}</p>
          </div>

          {/* Attachments */}
          {ticket.attachments && ticket.attachments.length > 0 && (
            <>
              <div className={styles.divider} />
              <div>
                <p className={styles.sectionTitle}>Attachments</p>
                <div className={styles.attachmentList}>
                  {ticket.attachments.map((a) => (
                    <DocumentRender
                      key={a.document_id}
                      url={attachmentUrls[a.document_id] || undefined}
                      mimeType={a.mime_type}
                      name={a.name}
                      variant="thumbnail"
                    />
                  ))}
                </div>
              </div>
            </>
          )}

          <div className={styles.divider} />

          {/* Status history */}
          {ticket.status_history && ticket.status_history.length > 0 && (
            <>
              <div>
                <p className={styles.sectionTitle}>Status History</p>
                <div className={styles.historyList}>
                  {ticket.status_history.map((log) => (
                    <div key={log.id} className={styles.historyItem}>
                      <div className={styles.historyTransition}>
                        <TicketStatusBadge status={log.old_status} />
                        <ArrowRight size={13} className={styles.historyArrow} />
                        <TicketStatusBadge status={log.new_status} />
                      </div>
                      <div className={styles.historyMeta}>
                        <span className={styles.historyTime}>{formatDateTime(log.created_at)}</span>
                        {log.note && <span className={styles.historyNote}>{log.note}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className={styles.divider} />
            </>
          )}

          {/* Comment thread */}
          <div>
            <p className={styles.sectionTitle}>Comments</p>
            {!ticket.comments || ticket.comments.length === 0 ? (
              <p className={styles.emptyComments}>No comments yet.</p>
            ) : (
              <div className={styles.commentList}>
                {ticket.comments.map((c) => (
                  <div
                    key={c.id}
                    className={`${styles.comment} ${c.is_internal ? styles.commentInternal : styles.commentPublic}`}
                  >
                    <div className={styles.commentMeta}>
                      <span className={styles.commentAuthor}>
                        {c.author_id === ticket.submitted_by ? 'Org User' : 'Brello Team'}
                      </span>
                      {c.is_internal && <span className={styles.internalTag}>Internal Note</span>}
                      {c.author_id === ticket.submitted_by && (
                        <span className={styles.orgTag}>Org</span>
                      )}
                      <span className={styles.commentTime}>{formatDateTime(c.created_at)}</span>
                    </div>
                    <p className={styles.commentBody}>{c.body}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className={styles.divider} />

          {/* Reply box */}
          <div className={styles.replyBox}>
            <TextArea
              placeholder="Write a reply or internal note..."
              rows={3}
              value={replyBody}
              onChange={(e) => setReplyBody(e.target.value)}
            />
            <label className={styles.internalToggle}>
              <input
                type="checkbox"
                checked={isInternal}
                onChange={(e) => setIsInternal(e.target.checked)}
              />
              Mark as internal note (not visible to org user)
            </label>
            <div className={styles.replyFooter}>
              <Button
                variant={isInternal ? 'secondary' : 'primary'}
                size="sm"
                onClick={handleSendReply}
                isLoading={isAdding}
                disabled={!replyBody.trim()}
              >
                {isInternal ? 'Save Internal Note' : 'Send Reply'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </Dialog>
  );
};
