import React, { useCallback } from 'react';

import {
  KanbanBoard as GenericKanbanBoard,
  type KanbanColumnDef,
} from '../../../../components/common/Kanban/KanbanBoard';

import { KanbanCard } from './KanbanCard';

import type { OfferCandidate, Offer } from '../../types/offerTypes';

interface CandidateRow {
  id: string;
  candidate: OfferCandidate;
  offer: Offer | null;
}

interface KanbanBoardProps {
  rows: CandidateRow[];
  onCreateOffer: (candidate: OfferCandidate) => void;
  onViewOffer: (offer: Offer) => void;
}

const COLUMNS: KanbanColumnDef[] = [
  { id: 'no_offer', title: 'Pending Generation', color: '#94a3b8' },
  { id: 'drafting', title: 'Drafting', color: '#38bdf8' },
  { id: 'sent', title: 'Sent / Viewed', color: '#818cf8' },
  { id: 'negotiating', title: 'Negotiating', color: '#fbbf24' },
  { id: 'accepted', title: 'Accepted / Synced', color: '#4ade80' },
  { id: 'closed', title: 'Declined / Expired', color: '#f87171' },
];

export const KanbanBoard: React.FC<KanbanBoardProps> = ({ rows, onCreateOffer, onViewOffer }) => {
  const getColumnId = useCallback((row: CandidateRow): string => {
    const o = row.offer;
    if (!o) return 'no_offer';
    if (['DRAFT', 'PENDING_APPROVAL', 'APPROVED'].includes(o.offer_status)) return 'drafting';
    if (['SENT', 'VIEWED'].includes(o.offer_status)) return 'sent';
    if (o.offer_status === 'NEGOTIATING') return 'negotiating';
    if (['ACCEPTED', 'SYNCED'].includes(o.offer_status)) return 'accepted';
    if (['REJECTED', 'EXPIRED', 'WITHDRAWN'].includes(o.offer_status)) return 'closed';
    return 'no_offer';
  }, []);

  return (
    <GenericKanbanBoard<CandidateRow>
      columns={COLUMNS}
      items={rows}
      getItemId={(row) => row.candidate.id}
      getColumnId={getColumnId}
      renderCard={(row) => (
        <KanbanCard
          candidate={row.candidate}
          offer={row.offer}
          onClick={() => {
            if (row.offer) {
              onViewOffer(row.offer);
            } else {
              onCreateOffer(row.candidate);
            }
          }}
        />
      )}
      emptyStateText="No candidates in this stage"
    />
  );
};
