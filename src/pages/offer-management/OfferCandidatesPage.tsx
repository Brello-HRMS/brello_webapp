import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, UserPlus, FileText } from 'lucide-react';

import {
  Button,
  DataTable,
  ListControls,
  NoDataFound,
  PageHeader,
  PermissionGate,
} from '../../components/common';
import { useOfferCandidates } from '../../features/offer-management/hooks/useOfferCandidates';
import { useOffers } from '../../features/offer-management/hooks/useOffers';
import { OfferStatusBadge } from '../../features/offer-management/components/OfferStatusBadge/OfferStatusBadge';
import { AddCandidateModal } from '../../features/offer-management/components/AddCandidateModal/AddCandidateModal';
import { CandidateCard } from '../../features/offer-management/components/CandidateCard/CandidateCard';
import { ModuleCode, ActionCode } from '../../enum/modules';
import { useDebounce } from '../../hooks/useDebounce';

import styles from './OfferCandidatesPage.module.scss';

import type { ColumnDef } from '@tanstack/react-table';
import type {
  OfferCandidate,
  Offer,
  OfferStatus,
} from '../../features/offer-management/types/offerTypes';

interface CandidateRow {
  id: string;
  candidate: OfferCandidate;
  offer: Offer | null;
}

const buildColumns = (
  onCreateOffer: (candidate: OfferCandidate) => void,
  onViewOffer: (offer: Offer) => void,
): ColumnDef<CandidateRow>[] => [
  {
    id: 'name',
    header: 'Candidate',
    cell: ({ row }) => (
      <div className={styles.nameCell}>
        <span className={styles.name}>
          {row.original.candidate.first_name} {row.original.candidate.last_name}
        </span>
        <span className={styles.email}>{row.original.candidate.email}</span>
      </div>
    ),
  },
  {
    id: 'position',
    header: 'Applied For',
    cell: ({ row }) => row.original.candidate.applied_for ?? '—',
  },
  {
    id: 'experience',
    header: 'Experience',
    cell: ({ row }) =>
      row.original.candidate.experience_years != null
        ? `${row.original.candidate.experience_years} yrs`
        : '—',
  },
  {
    id: 'offer_status',
    header: 'Offer Status',
    cell: ({ row }) =>
      row.original.offer ? (
        <OfferStatusBadge status={row.original.offer.offer_status as OfferStatus} />
      ) : (
        <span className={styles.noOffer}>No Offer</span>
      ),
  },
  {
    id: 'offer_number',
    header: 'Offer No.',
    cell: ({ row }) => row.original.offer?.offer_number ?? '—',
  },
  {
    id: 'actions',
    header: 'Action',
    cell: ({ row }) => {
      const { candidate, offer } = row.original;
      return (
        <div>
          {offer ? (
            <Button variant="ghost" size="sm" onClick={() => onViewOffer(offer)}>
              View Offer
            </Button>
          ) : (
            <PermissionGate module={ModuleCode.OFFER_CANDIDATES} action={ActionCode.CREATE}>
              <Button variant="outline" size="sm" onClick={() => onCreateOffer(candidate)}>
                <Plus size={14} /> Create Offer
              </Button>
            </PermissionGate>
          )}
        </div>
      );
    },
  },
];

const OfferCandidatesPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [viewType, setViewType] = useState<'grid' | 'table'>('grid');
  const [isAddCandidateOpen, setIsAddCandidateOpen] = useState(false);
  const debouncedSearch = useDebounce(searchQuery, 300);

  const { data: candidatesResponse, isLoading } = useOfferCandidates({
    search: debouncedSearch || undefined,
  });
  // This page builds a candidate→offer lookup map, not a paginated table, so
  // request the max page size rather than the default.
  const { data: offersResponse } = useOffers({ limit: 200 });

  const candidates = useMemo(() => candidatesResponse?.data ?? [], [candidatesResponse]);
  const offers = useMemo(() => offersResponse?.data.data ?? [], [offersResponse]);

  const offerByCandidateId = useMemo(() => {
    const map = new Map<string, Offer>();
    offers.forEach((o) => map.set(o.candidate_id, o));
    return map;
  }, [offers]);

  const rows = useMemo<CandidateRow[]>(
    () =>
      candidates.map((candidate) => ({
        id: candidate.id,
        candidate,
        offer: offerByCandidateId.get(candidate.id) ?? null,
      })),
    [candidates, offerByCandidateId],
  );

  const handleCreateOffer = useCallback(
    (candidate: OfferCandidate) => {
      navigate(`/offer-management/create?candidate_id=${candidate.id}`);
    },
    [navigate],
  );

  const handleViewOffer = useCallback(
    (offer: Offer) => {
      navigate(`/offer-management/offers/${offer.id}`);
    },
    [navigate],
  );

  const columns = useMemo(
    () => buildColumns(handleCreateOffer, handleViewOffer),
    [handleCreateOffer, handleViewOffer],
  );

  if (!isLoading && candidates.length === 0 && !debouncedSearch) {
    return (
      <>
        <NoDataFound
          title="No Candidates Yet"
          description="Add candidates to start creating offers."
          buttonText="Add First Candidate"
          onButtonClick={() => setIsAddCandidateOpen(true)}
          showButtonIcon
        />
        <AddCandidateModal
          isOpen={isAddCandidateOpen}
          onClose={() => setIsAddCandidateOpen(false)}
        />
      </>
    );
  }

  return (
    <div className={`${isLoading ? styles.loading : ''}`}>
      <PageHeader
        title="Offer Management"
        titleExtra={
          <span className={styles.pageIcon}>
            <FileText size={20} />
          </span>
        }
        subtitle="Manage candidates, create offers, and track the hiring lifecycle."
        actions={
          <PermissionGate module={ModuleCode.OFFER_CANDIDATES} action={ActionCode.CREATE}>
            <Button variant="outline" onClick={() => setIsAddCandidateOpen(true)}>
              <UserPlus size={16} /> Add Candidate
            </Button>
          </PermissionGate>
        }
      />

      <ListControls
        showSearch
        showFilters={false}
        showSort={false}
        showViewSwitcher={true}
        viewType={viewType}
        onViewTypeChange={setViewType}
        showMultiSelect={false}
        searchPlaceholder="Search candidates by name or email..."
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {rows.length === 0 ? (
        <NoDataFound title="No Candidates Found" description="No candidates match your search." />
      ) : viewType === 'grid' ? (
        <div className={styles.candidateGrid}>
          {rows.map((row) => (
            <CandidateCard
              key={row.id}
              candidate={row.candidate}
              offer={row.offer}
              onCreateOffer={handleCreateOffer}
              onViewOffer={handleViewOffer}
            />
          ))}
        </div>
      ) : (
        <DataTable columns={columns} data={rows} rowIdField="id" />
      )}

      <AddCandidateModal isOpen={isAddCandidateOpen} onClose={() => setIsAddCandidateOpen(false)} />
    </div>
  );
};

export default OfferCandidatesPage;
