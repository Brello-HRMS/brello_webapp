import React from 'react';
import { Briefcase } from 'lucide-react';

import { OfferStatusBadge } from '../OfferStatusBadge/OfferStatusBadge';

import styles from './KanbanCard.module.scss';

import type { OfferCandidate, Offer, OfferStatus } from '../../types/offerTypes';

interface KanbanCardProps {
  candidate: OfferCandidate;
  offer: Offer | null;
  onClick: () => void;
}

export const KanbanCard: React.FC<KanbanCardProps> = ({ candidate, offer, onClick }) => {
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  const title = offer?.position || candidate.applied_for || 'No position specified';

  return (
    <div
      className={styles.card}
      onClick={onClick}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
    >
      <div className={styles.header}>
        <div className={styles.avatar}>
          {getInitials(candidate.first_name, candidate.last_name)}
        </div>
        <div className={styles.name}>
          {candidate.first_name} {candidate.last_name}
        </div>
      </div>

      <div className={styles.body}>
        <Briefcase size={12} className={styles.icon} />
        <span className={styles.titleText}>{title}</span>
      </div>

      <div className={styles.footer}>
        {offer ? (
          <OfferStatusBadge status={offer.offer_status as OfferStatus} />
        ) : (
          <span className={styles.noOfferBadge}>No Offer</span>
        )}
        {offer?.offer_number && <span className={styles.offerNumber}>{offer.offer_number}</span>}
      </div>
    </div>
  );
};
