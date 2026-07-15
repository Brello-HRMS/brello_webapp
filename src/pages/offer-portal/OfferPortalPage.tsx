import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { CheckCircle, XCircle, MessageSquare, Briefcase, User, Calendar } from 'lucide-react';

import {
  getPortalOffer,
  acceptOffer,
  rejectOffer,
  requestOfferChanges,
} from '../../features/offer-management/api/offerPortal.api';

import styles from './OfferPortalPage.module.scss';

import type { OfferPortalData } from '../../features/offer-management/types/offerTypes';

type PortalView = 'offer' | 'accept_confirm' | 'reject_form' | 'negotiate_form' | 'done';

const OfferPortalPage = () => {
  const { token } = useParams<{ token: string }>();
  const [view, setView] = useState<PortalView>('offer');
  const [rejectReason, setRejectReason] = useState('');
  const [negotiateComment, setNegotiateComment] = useState('');
  const [expectedSalary, setExpectedSalary] = useState('');
  const [doneMessage, setDoneMessage] = useState('');

  const {
    data: response,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['portal-offer', token],
    queryFn: () => getPortalOffer(token!),
    enabled: !!token,
    retry: false,
  });

  const { mutate: doAccept, isPending: isAccepting } = useMutation({
    mutationFn: () => acceptOffer(token!),
    onSuccess: () => {
      setDoneMessage('🎉 You have accepted the offer! We will be in touch with the next steps.');
      setView('done');
    },
  });

  const { mutate: doReject, isPending: isRejecting } = useMutation({
    mutationFn: () => rejectOffer(token!, rejectReason),
    onSuccess: () => {
      setDoneMessage(
        'Thank you for letting us know. We wish you all the best in your future endeavours.',
      );
      setView('done');
    },
  });

  const { mutate: doNegotiate, isPending: isNegotiating } = useMutation({
    mutationFn: () =>
      requestOfferChanges(token!, {
        expected_salary: expectedSalary ? parseFloat(expectedSalary) : undefined,
        comments: negotiateComment,
      }),
    onSuccess: () => {
      setDoneMessage(
        'Your request has been sent to the HR team. They will review and respond shortly.',
      );
      setView('done');
    },
  });

  if (isLoading) {
    return (
      <div className={styles.shell}>
        <div className={styles.loading}>Loading your offer...</div>
      </div>
    );
  }

  if (error || !response?.data) {
    return (
      <div className={styles.shell}>
        <div className={styles.errorCard}>
          <XCircle size={40} className={styles.errorIcon} />
          <h2>Offer Not Found</h2>
          <p>
            This offer link is invalid or has expired. Please contact HR if you think this is a
            mistake.
          </p>
        </div>
      </div>
    );
  }

  const { offer, candidate } = response.data as OfferPortalData;
  const candidateName = `${candidate.first_name} ${candidate.last_name}`;

  const isClosed = ['ACCEPTED', 'REJECTED', 'WITHDRAWN', 'EXPIRED', 'SYNCED'].includes(
    offer.offer_status,
  );

  return (
    <div className={styles.shell}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.brand}>Brello · Offer Management</div>
      </header>

      <main className={styles.main}>
        {view === 'done' ? (
          <div className={styles.doneCard}>
            <CheckCircle size={52} className={styles.doneIcon} />
            <p className={styles.doneMessage}>{doneMessage}</p>
          </div>
        ) : (
          <>
            {/* Offer card */}
            <div className={styles.offerCard}>
              <div className={styles.greeting}>
                <span className={styles.wave}>👋</span>
                <span>
                  Dear <strong>{candidateName}</strong>,
                </span>
              </div>
              <p className={styles.intro}>
                We are pleased to extend you an offer for the position of{' '}
                <strong>{offer.position ?? 'the role'}</strong>. Please review the details below.
              </p>

              <div className={styles.detailsGrid}>
                <DetailChip
                  icon={<Briefcase size={15} />}
                  label="Position"
                  value={offer.position}
                />
                <DetailChip
                  icon={<User size={15} />}
                  label="Employment Type"
                  value={offer.employment_type?.replace('_', ' ')}
                />
                <DetailChip
                  icon={<Calendar size={15} />}
                  label="Joining Date"
                  value={
                    offer.joining_date
                      ? new Date(offer.joining_date).toLocaleDateString()
                      : undefined
                  }
                />
                <DetailChip
                  icon={<Briefcase size={15} />}
                  label="Work Mode"
                  value={offer.work_mode}
                />
              </div>

              {offer.ctc_annual && (
                <div className={styles.ctcBanner}>
                  <span className={styles.ctcLabel}>Annual CTC</span>
                  <span className={styles.ctcValue}>
                    ₹{Number(offer.ctc_annual).toLocaleString('en-IN')}
                  </span>
                  {offer.monthly_take_home && (
                    <span className={styles.ctcSub}>
                      ≈ ₹{Number(offer.monthly_take_home).toLocaleString('en-IN')} / month take-home
                    </span>
                  )}
                </div>
              )}

              {offer.salary_components.length > 0 && (
                <div className={styles.salarySection}>
                  <h4 className={styles.salaryTitle}>Salary Breakdown</h4>
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
                </div>
              )}

              {offer.expires_at && (
                <div className={styles.expiry}>
                  ⏰ This offer expires on{' '}
                  <strong>{new Date(offer.expires_at).toLocaleDateString()}</strong>
                </div>
              )}
            </div>

            {/* Action row */}
            {!isClosed && view === 'offer' && (
              <div className={styles.actionRow}>
                <button
                  className={`${styles.actionBtn} ${styles.accept}`}
                  onClick={() => setView('accept_confirm')}
                >
                  <CheckCircle size={18} /> Accept Offer
                </button>
                <button
                  className={`${styles.actionBtn} ${styles.negotiate}`}
                  onClick={() => setView('negotiate_form')}
                >
                  <MessageSquare size={18} /> Request Changes
                </button>
                <button
                  className={`${styles.actionBtn} ${styles.reject}`}
                  onClick={() => setView('reject_form')}
                >
                  <XCircle size={18} /> Decline
                </button>
              </div>
            )}

            {isClosed && (
              <div className={styles.closedBanner}>
                This offer is <strong>{offer.offer_status.toLowerCase()}</strong> and no further
                action is needed.
              </div>
            )}

            {/* Accept confirmation */}
            {view === 'accept_confirm' && (
              <div className={styles.responseCard}>
                <h3>Confirm Acceptance</h3>
                <p>
                  By confirming, you agree to accept the offer for <strong>{offer.position}</strong>
                  . The HR team will be notified immediately.
                </p>
                <div className={styles.responseActions}>
                  <button className={styles.ghostBtn} onClick={() => setView('offer')}>
                    ← Back
                  </button>
                  <button
                    className={`${styles.actionBtn} ${styles.accept}`}
                    onClick={() => doAccept()}
                    disabled={isAccepting}
                  >
                    {isAccepting ? 'Submitting...' : '✓ Confirm Acceptance'}
                  </button>
                </div>
              </div>
            )}

            {/* Reject form */}
            {view === 'reject_form' && (
              <div className={styles.responseCard}>
                <h3>Decline Offer</h3>
                <p>We're sorry to hear this. Please share your reason so we can improve.</p>
                <textarea
                  className={styles.textarea}
                  placeholder="e.g. Accepted another offer, compensation mismatch..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                />
                <div className={styles.responseActions}>
                  <button className={styles.ghostBtn} onClick={() => setView('offer')}>
                    ← Back
                  </button>
                  <button
                    className={`${styles.actionBtn} ${styles.reject}`}
                    onClick={() => doReject()}
                    disabled={!rejectReason.trim() || isRejecting}
                  >
                    {isRejecting ? 'Submitting...' : 'Confirm Decline'}
                  </button>
                </div>
              </div>
            )}

            {/* Negotiate form */}
            {view === 'negotiate_form' && (
              <div className={styles.responseCard}>
                <h3>Request Changes</h3>
                <p>Share your expectations and we'll review your request.</p>
                <label className={styles.fieldLabel}>Expected Salary (Annual ₹)</label>
                <input
                  className={styles.textInput}
                  type="number"
                  placeholder="e.g. 900000"
                  value={expectedSalary}
                  onChange={(e) => setExpectedSalary(e.target.value)}
                />
                <label className={styles.fieldLabel}>Comments *</label>
                <textarea
                  className={styles.textarea}
                  placeholder="Please describe your expectations or concerns..."
                  value={negotiateComment}
                  onChange={(e) => setNegotiateComment(e.target.value)}
                />
                <div className={styles.responseActions}>
                  <button className={styles.ghostBtn} onClick={() => setView('offer')}>
                    ← Back
                  </button>
                  <button
                    className={`${styles.actionBtn} ${styles.negotiate}`}
                    onClick={() => doNegotiate()}
                    disabled={!negotiateComment.trim() || isNegotiating}
                  >
                    {isNegotiating ? 'Submitting...' : 'Send Request'}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      <footer className={styles.footer}>
        Powered by <strong>Brello HRMS</strong> · Secure Offer Portal
      </footer>
    </div>
  );
};

const DetailChip = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string | null;
}) =>
  value ? (
    <div className={styles.chip}>
      <span className={styles.chipIcon}>{icon}</span>
      <div>
        <span className={styles.chipLabel}>{label}</span>
        <span className={styles.chipValue}>{value}</span>
      </div>
    </div>
  ) : null;

export default OfferPortalPage;
