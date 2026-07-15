import {
  Briefcase,
  Clock,
  Building,
  Banknote,
  Calendar,
  Plus,
  ChevronRight,
  FileText,
} from 'lucide-react';

import { Button, PermissionGate } from '../../../../components/common';
import { OfferStatusBadge } from '../OfferStatusBadge/OfferStatusBadge';
import { ModuleCode, ActionCode } from '../../../../enum/modules';

import styles from './CandidateCard.module.scss';

import type { OfferCandidate, Offer, OfferStatus } from '../../types/offerTypes';

interface CandidateCardProps {
  candidate: OfferCandidate;
  offer: Offer | null;
  onCreateOffer: (candidate: OfferCandidate) => void;
  onViewOffer: (offer: Offer) => void;
}

export const CandidateCard = ({
  candidate,
  offer,
  onCreateOffer,
  onViewOffer,
}: CandidateCardProps) => {
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  const formatCurrency = (amount: number | null | undefined) => {
    if (amount == null) return '—';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.profileSection}>
          <div className={styles.avatar}>
            {getInitials(candidate.first_name, candidate.last_name)}
          </div>
          <div className={styles.nameInfo}>
            <h3 className={styles.name}>
              {candidate.first_name} {candidate.last_name}
            </h3>
            <div className={styles.statusWrapper}>
              {offer ? (
                <OfferStatusBadge status={offer.offer_status as OfferStatus} />
              ) : (
                <span className={styles.noOfferBadge}>No Offer</span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className={styles.body}>
        <div className={styles.detailGrid}>
          <div className={styles.detailItem}>
            <Briefcase size={14} className={styles.icon} />
            <span className={styles.value}>{candidate.applied_for || 'No position specified'}</span>
          </div>
          <div className={styles.detailItem}>
            <Clock size={14} className={styles.icon} />
            <span className={styles.value}>
              {candidate.experience_years != null
                ? `${candidate.experience_years} years exp.`
                : 'Exp. not specified'}
            </span>
          </div>
          {candidate.current_company && (
            <div className={styles.detailItem}>
              <Building size={14} className={styles.icon} />
              <span className={styles.value}>{candidate.current_company}</span>
            </div>
          )}
        </div>

        {offer && (
          <>
            <div className={styles.divider} />
            <div className={styles.offerDetails}>
              <div className={styles.offerMetric}>
                <span className={styles.metricLabel}>Offer No.</span>
                <span className={styles.metricValue}>
                  <FileText size={12} className={styles.metricIcon} />
                  {offer.offer_number || 'Pending'}
                </span>
              </div>
              <div className={styles.offerMetric}>
                <span className={styles.metricLabel}>Proposed CTC</span>
                <span className={styles.metricValue}>
                  <Banknote size={12} className={styles.metricIcon} />
                  {formatCurrency(offer.ctc_annual)}
                </span>
              </div>
              <div className={styles.offerMetric}>
                <span className={styles.metricLabel}>Joining Date</span>
                <span className={styles.metricValue}>
                  <Calendar size={12} className={styles.metricIcon} />
                  {formatDate(offer.joining_date)}
                </span>
              </div>
            </div>
          </>
        )}
      </div>

      <div className={styles.footer}>
        {offer ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onViewOffer(offer)}
            className={styles.actionBtn}
          >
            View Details <ChevronRight size={16} />
          </Button>
        ) : (
          <PermissionGate module={ModuleCode.OFFER_CANDIDATES} action={ActionCode.CREATE}>
            <Button
              variant="primary"
              size="sm"
              onClick={() => onCreateOffer(candidate)}
              className={styles.actionBtn}
            >
              <Plus size={16} /> Create Offer
            </Button>
          </PermissionGate>
        )}
      </div>
    </div>
  );
};
