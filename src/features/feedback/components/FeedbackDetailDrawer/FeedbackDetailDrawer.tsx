import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

import { Dialog } from '../../../../components/common/Dialog/Dialog';
import { DocumentRender } from '../../../../components/common/DocumentRender/DocumentRender';
import { TextArea } from '../../../../components/ui/TextArea/TextArea';
import { Button } from '../../../../components/common/Button/Button';
import { useTicketDetail, useAddOrgComment } from '../../hooks/useFeedback';
import { TicketStatusBadge } from '../TicketStatusBadge/TicketStatusBadge';
import { FeedbackType, FeedbackCategory } from '../../enums/feedback.enum';
import { getDocumentSignedUrl } from '../../../../api/documents';
import { resolveAssetUrl } from '../../../../utils/assetUrl';
import { formatDateTime } from '../../../../utils/timeUtils';

import styles from './FeedbackDetailDrawer.module.scss';

const CATEGORY_LABEL: Record<FeedbackCategory, string> = {
  [FeedbackCategory.FEATURE_REQUEST]: 'Feature Request',
  [FeedbackCategory.SUGGESTION]: 'Suggestion',
  [FeedbackCategory.PRAISE]: 'Praise',
  [FeedbackCategory.BUG]: 'Bug',
  [FeedbackCategory.UI_UX]: 'UI / UX Issue',
  [FeedbackCategory.PERFORMANCE]: 'Performance',
  [FeedbackCategory.DATA_ISSUE]: 'Data Issue',
};

interface FeedbackDetailDrawerProps {
  ticketId: string | null;
  onClose: () => void;
}

export const FeedbackDetailDrawer: React.FC<FeedbackDetailDrawerProps> = ({
  ticketId,
  onClose,
}) => {
  const [replyBody, setReplyBody] = useState('');
  const [attachmentUrls, setAttachmentUrls] = useState<Record<string, string>>({});

  const { data: ticket, isLoading } = useTicketDetail(ticketId);
  const { addComment, isAdding } = useAddOrgComment(ticketId ?? '');

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

  const handleSendReply = async () => {
    if (!replyBody.trim()) return;
    await addComment({ body: replyBody.trim() });
    setReplyBody('');
  };

  return (
    <Dialog
      title={ticket?.title ?? 'Ticket Detail'}
      open={!!ticketId}
      onClose={onClose}
      maxWidth="520px"
      position="right"
      showCloseButton
    >
      {isLoading || !ticket ? (
        <div className={styles.loader}>
          <Loader2 size={24} style={{ animation: 'spin 1s linear infinite' }} />
        </div>
      ) : (
        <div className={styles.content}>
          {/* Meta */}
          <div className={styles.meta}>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Status</span>
              <TicketStatusBadge status={ticket.ticket_status} />
            </div>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Priority</span>
              <span className={`${styles.priorityBadge} ${styles[ticket.priority.toLowerCase()]}`}>
                {ticket.priority.charAt(0) + ticket.priority.slice(1).toLowerCase()}
              </span>
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
              <span className={styles.metaLabel}>Submitted</span>
              <span className={styles.metaValue}>{formatDateTime(ticket.created_at)}</span>
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

          {/* Comment thread */}
          <div>
            <p className={styles.sectionTitle}>Comments</p>
            {ticket.comments.length === 0 ? (
              <p className={styles.emptyComments}>No replies yet.</p>
            ) : (
              <div className={styles.commentList}>
                {ticket.comments.map((c) => (
                  <div key={c.id} className={styles.comment}>
                    <div className={styles.commentMeta}>
                      <span className={styles.commentAuthor}>
                        {c.author_id === ticket.submitted_by ? 'You' : 'Brello Team'}
                      </span>
                      {c.author_id !== ticket.submitted_by && (
                        <span className={styles.platformTag}>Brello</span>
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
              placeholder="Add a follow-up comment..."
              rows={3}
              value={replyBody}
              onChange={(e) => setReplyBody(e.target.value)}
            />
            <div className={styles.footer}>
              <Button
                variant="primary"
                size="sm"
                onClick={handleSendReply}
                isLoading={isAdding}
                disabled={!replyBody.trim()}
              >
                Send
              </Button>
            </div>
          </div>
        </div>
      )}
    </Dialog>
  );
};
