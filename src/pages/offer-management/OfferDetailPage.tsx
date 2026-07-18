import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Send,
  Ban,
  Calendar,
  User,
  Clock,
  FileText,
  MessageSquare,
  MessageSquareWarning,
  Activity,
  Pencil,
} from 'lucide-react';

import { Button, PermissionGate } from '../../components/common';
import { OfferStatusBadge } from '../../features/offer-management/components/OfferStatusBadge/OfferStatusBadge';
import { OfferVersions } from '../../features/offer-management/components/OfferVersions/OfferVersions';
import { OfferEmployeeSyncWizard } from '../../features/offer-management/components/OfferEmployeeSyncWizard/OfferEmployeeSyncWizard';
import {
  useOffer,
  useWithdrawOffer,
  useSendOffer,
  useOfferTimeline,
  useOfferVersions,
  useExtendOfferExpiry,
} from '../../features/offer-management/hooks/useOffers';
import { useOfferCandidate } from '../../features/offer-management/hooks/useOfferCandidates';
import { ModuleCode, ActionCode } from '../../enum/modules';

import styles from './OfferDetailPage.module.scss';

import type {
  OfferStatus,
  OfferTimeline as TimelineItem,
} from '../../features/offer-management/types/offerTypes';

// Mirrors the backend's assertOpenForResponse() (offer-portal.service.ts) — once an offer
// reaches one of these statuses the expiry date no longer applies, even if `expires_at`
// is still set on old records.
const CLOSED_STATUSES: OfferStatus[] = ['ACCEPTED', 'REJECTED', 'WITHDRAWN', 'EXPIRED', 'SYNCED'];

const OfferDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: offerResponse, isLoading } = useOffer(id!);
  const offer = offerResponse?.data;

  const { data: candidateResponse } = useOfferCandidate(offer?.candidate_id ?? '');
  const candidate = candidateResponse?.data;

  const { data: timelineResponse } = useOfferTimeline(id!);
  const timeline = timelineResponse?.data ?? [];

  const { data: versionsResponse } = useOfferVersions(id!);
  const versions = versionsResponse?.data ?? [];
  const negotiatingVersion = versions.find(
    (v) => v.candidate_response === 'changes_requested' && v.negotiation_request,
  );

  const { mutate: sendOffer, isPending: isSending } = useSendOffer();
  const { mutate: withdrawOffer, isPending: isWithdrawing } = useWithdrawOffer();
  const { mutate: extendExpiry } = useExtendOfferExpiry();
  const [withdrawReason, setWithdrawReason] = useState('');
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showSyncWizard, setShowSyncWizard] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'versions'>('overview');

  if (isLoading) return <div className={styles.loading}>Loading offer...</div>;
  if (!offer) return <div className={styles.loading}>Offer not found.</div>;

  // Mirrors the backend's assertSendable() (offer-lifecycle.service.ts) — anything not
  // ACCEPTED/SYNCED/WITHDRAWN/REJECTED/EXPIRED/PENDING_APPROVAL can be (re)sent, which is
  // how a negotiated offer gets revised and resent as a new version.
  const canSend = ['DRAFT', 'APPROVED', 'SENT', 'VIEWED', 'NEGOTIATING'].includes(
    offer.offer_status,
  );
  const canEdit = canSend;
  const canWithdraw = !['ACCEPTED', 'SYNCED', 'WITHDRAWN'].includes(offer.offer_status);
  const canExtend = ['SENT', 'VIEWED', 'NEGOTIATING', 'EXPIRED'].includes(offer.offer_status);

  const candidateName = candidate ? `${candidate.first_name} ${candidate.last_name}` : '—';

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <button className={styles.back} onClick={() => navigate('/offer-management')}>
          <ArrowLeft size={16} /> Back to Candidates
        </button>
      </div>

      <div className={styles.header}>
        <div>
          <div className={styles.offerNumber}>{offer.offer_number ?? 'Draft (not yet sent)'}</div>
          <h1 className={styles.title}>{offer.position ?? 'Untitled Offer'}</h1>
          <div className={styles.meta}>
            <OfferStatusBadge status={offer.offer_status} />
            {offer.expires_at && !CLOSED_STATUSES.includes(offer.offer_status) && (
              <span className={styles.expiry}>
                <Clock size={13} />
                Expires {new Date(offer.expires_at).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
        <div className={styles.headerActions}>
          {canEdit && (
            <PermissionGate module={ModuleCode.OFFER_CANDIDATES} action={ActionCode.EDIT}>
              <Button
                variant="outline"
                onClick={() => navigate(`/offer-management/offers/${offer.id}/edit`)}
              >
                <Pencil size={15} /> Edit Offer
              </Button>
            </PermissionGate>
          )}
          {canSend && (
            <PermissionGate module={ModuleCode.OFFER_CANDIDATES} action={ActionCode.CREATE}>
              <Button
                variant="primary"
                onClick={() => sendOffer({ id: offer.id })}
                disabled={isSending}
              >
                <Send size={15} />
                {isSending ? 'Sending...' : offer.offer_number ? 'Resend Offer' : 'Send Offer'}
              </Button>
            </PermissionGate>
          )}
          {canExtend && (
            <Button
              variant="outline"
              onClick={() => extendExpiry({ id: offer.id, params: { extra_days: 7 } })}
            >
              <Calendar size={15} /> Extend +7 days
            </Button>
          )}
          {canWithdraw && (
            <PermissionGate module={ModuleCode.OFFER_CANDIDATES} action={ActionCode.EDIT}>
              <Button
                variant="danger"
                onClick={() => setShowWithdrawModal(true)}
                disabled={isWithdrawing}
              >
                <Ban size={15} /> Withdraw
              </Button>
            </PermissionGate>
          )}
          {offer.offer_status === 'ACCEPTED' && (
            <PermissionGate module={ModuleCode.OFFER_CANDIDATES} action={ActionCode.EDIT}>
              <Button variant="primary" onClick={() => setShowSyncWizard(true)}>
                <User size={15} /> Sync to Employee
              </Button>
            </PermissionGate>
          )}
        </div>
      </div>

      <div className={styles.tabsContainer}>
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'versions', label: 'Version History' },
        ].map((tab) => (
          <button
            key={tab.id}
            className={`${styles.tabButton} ${activeTab === tab.id ? styles.active : ''}`}
            onClick={() => setActiveTab(tab.id as 'overview' | 'versions')}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className={styles.body}>
          {/* Left column */}
          <div className={styles.mainCol}>
            <InfoCard title="Candidate" icon={<User size={16} />}>
              <div className={styles.candidateInfo}>
                <div className={styles.avatar}>
                  {candidate?.first_name?.[0]}
                  {candidate?.last_name?.[0]}
                </div>
                <div>
                  <div className={styles.candidateName}>{candidateName}</div>
                  {candidate?.email && (
                    <div className={styles.candidateEmail}>{candidate.email}</div>
                  )}
                </div>
              </div>
            </InfoCard>

            <InfoCard title="Offer Details" icon={<FileText size={16} />}>
              <dl className={styles.dl}>
                <DetailRow label="Position" value={offer.position} />
                <DetailRow
                  label="Employment Type"
                  value={offer.employment_type?.replace('_', ' ')}
                />
                <DetailRow label="Work Mode" value={offer.work_mode} />
                <DetailRow label="Location" value={offer.work_location} />
                <DetailRow
                  label="Joining Date"
                  value={
                    offer.joining_date ? new Date(offer.joining_date).toLocaleDateString() : null
                  }
                />
                <DetailRow
                  label="Probation"
                  value={offer.probation_days ? `${offer.probation_days} days` : null}
                />
                <DetailRow
                  label="Notice Period"
                  value={offer.notice_period_days ? `${offer.notice_period_days} days` : null}
                />
              </dl>
            </InfoCard>

            <InfoCard title="Compensation" icon={<Activity size={16} />}>
              <dl className={styles.dl}>
                <DetailRow
                  label="Annual CTC"
                  value={
                    offer.ctc_annual ? `₹${Number(offer.ctc_annual).toLocaleString('en-IN')}` : null
                  }
                />
                <DetailRow
                  label="Monthly Take-Home"
                  value={
                    offer.monthly_take_home
                      ? `₹${Number(offer.monthly_take_home).toLocaleString('en-IN')}`
                      : null
                  }
                />
              </dl>
              {offer.salary_components.length > 0 && (
                <table className={styles.salaryTable}>
                  <thead>
                    <tr>
                      <th>Component</th>
                      <th>Type</th>
                      <th className={styles.right}>Monthly</th>
                      <th className={styles.right}>Annual</th>
                    </tr>
                  </thead>
                  <tbody>
                    {offer.salary_components.map((c, i) => (
                      <tr key={i}>
                        <td>{c.name}</td>
                        <td className={styles.dim}>{c.type}</td>
                        <td className={styles.right}>
                          ₹{Math.round(c.amount / 12).toLocaleString('en-IN')}
                        </td>
                        <td className={styles.right}>₹{c.amount.toLocaleString('en-IN')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </InfoCard>

            {negotiatingVersion?.negotiation_request && (
              <InfoCard
                title="Candidate Requested Changes"
                icon={<MessageSquareWarning size={16} />}
              >
                <dl className={styles.dl}>
                  {negotiatingVersion.negotiation_request.expected_salary != null && (
                    <DetailRow
                      label="Expected Salary (Annual)"
                      value={`₹${Number(
                        negotiatingVersion.negotiation_request.expected_salary,
                      ).toLocaleString('en-IN')}`}
                    />
                  )}
                  {negotiatingVersion.negotiation_request.preferred_joining_date && (
                    <DetailRow
                      label="Preferred Joining Date"
                      value={new Date(
                        negotiatingVersion.negotiation_request.preferred_joining_date,
                      ).toLocaleDateString()}
                    />
                  )}
                </dl>
                {negotiatingVersion.negotiation_request.comments && (
                  <p className={styles.feedback}>
                    {negotiatingVersion.negotiation_request.comments}
                  </p>
                )}
                <p className={styles.feedback} style={{ fontSize: '12px', color: '#94a3b8' }}>
                  Requested on {new Date(negotiatingVersion.responded_at!).toLocaleString()} for
                  Version {negotiatingVersion.version_number}. Use "Edit Offer" to revise and resend
                  a new version, or check the Version History tab for the full history.
                </p>
              </InfoCard>
            )}

            {offer.rejection_reason && (
              <InfoCard title="Candidate Feedback" icon={<MessageSquare size={16} />}>
                <p className={styles.feedback}>
                  <strong>Rejection Reason:</strong> {offer.rejection_reason}
                </p>
                {offer.candidate_comment && (
                  <p className={styles.feedback}>{offer.candidate_comment}</p>
                )}
              </InfoCard>
            )}
          </div>

          {/* Timeline column */}
          <div className={styles.timelineCol}>
            <div className={styles.timelineHeader}>
              <Clock size={16} /> Activity Timeline
            </div>
            <div className={styles.timeline}>
              {timeline.length === 0 ? (
                <p className={styles.emptyTimeline}>No activity yet.</p>
              ) : (
                timeline.map((entry) => <TimelineCard key={entry.id} entry={entry} />)
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'versions' && (
        <div className={styles.body}>
          <div className={styles.mainCol}>
            <OfferVersions offerId={offer.id} />
          </div>
        </div>
      )}

      {/* Withdraw modal */}
      {showWithdrawModal && (
        <div className={styles.overlay}>
          <div className={styles.modal}>
            <h3>Withdraw Offer</h3>
            <p>Please provide a reason for withdrawing this offer:</p>
            <textarea
              className={styles.textarea}
              placeholder="e.g. Role no longer available..."
              value={withdrawReason}
              onChange={(e) => setWithdrawReason(e.target.value)}
            />
            <div className={styles.modalActions}>
              <Button variant="ghost" onClick={() => setShowWithdrawModal(false)}>
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={() => {
                  withdrawOffer(
                    { id: offer.id, params: { reason: withdrawReason } },
                    { onSuccess: () => setShowWithdrawModal(false) },
                  );
                }}
                disabled={!withdrawReason.trim() || isWithdrawing}
              >
                {isWithdrawing ? 'Withdrawing...' : 'Confirm Withdraw'}
              </Button>
            </div>
          </div>
        </div>
      )}
      {showSyncWizard && candidate && (
        <OfferEmployeeSyncWizard
          open
          offer={offer}
          candidate={candidate}
          onClose={() => setShowSyncWizard(false)}
        />
      )}
    </div>
  );
};

// ── Sub-components ─────────────────────────────────────────────────────────────

const InfoCard = ({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) => (
  <div className={styles.card}>
    <div className={styles.cardTitle}>
      {icon}
      {title}
    </div>
    {children}
  </div>
);

const DetailRow = ({ label, value }: { label: string; value?: string | null }) => (
  <div className={styles.detailRow}>
    <dt>{label}</dt>
    <dd>{value ?? <span className={styles.dim}>—</span>}</dd>
  </div>
);

const TimelineCard = ({ entry }: { entry: TimelineItem }) => (
  <div className={styles.timelineEntry}>
    <div className={styles.timelineDot} />
    <div className={styles.timelineContent}>
      <p className={styles.timelineLabel}>{entry.label}</p>
      <p className={styles.timelineTime}>
        {new Date(entry.created_at).toLocaleString()}
        {entry.actor_name && ` · ${entry.actor_name}`}
      </p>
    </div>
  </div>
);

export default OfferDetailPage;
