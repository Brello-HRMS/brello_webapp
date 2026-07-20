import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, FileText } from 'lucide-react';

import {
  Button,
  ListControls,
  NoDataFound,
  PageHeader,
  PermissionGate,
} from '../../components/common';
import { useOfferCandidates } from '../../features/offer-management/hooks/useOfferCandidates';
import { useOffers } from '../../features/offer-management/hooks/useOffers';
import { AddCandidateModal } from '../../features/offer-management/components/AddCandidateModal/AddCandidateModal';
import { KanbanBoard } from '../../features/offer-management/components/KanbanBoard/KanbanBoard';
import { ModuleCode, ActionCode } from '../../enum/modules';
import { useDebounce } from '../../hooks/useDebounce';

import styles from './OfferCandidatesPage.module.scss';

import type { OfferCandidate, Offer } from '../../features/offer-management/types/offerTypes';

interface CandidateRow {
  id: string;
  candidate: OfferCandidate;
  offer: Offer | null;
}

const OfferCandidatesPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
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
        showViewSwitcher={false}
        showMultiSelect={false}
        searchPlaceholder="Search candidates by name or email..."
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {rows.length === 0 ? (
        <NoDataFound title="No Candidates Found" description="No candidates match your search." />
      ) : (
        <KanbanBoard rows={rows} onCreateOffer={handleCreateOffer} onViewOffer={handleViewOffer} />
      )}

      <AddCandidateModal isOpen={isAddCandidateOpen} onClose={() => setIsAddCandidateOpen(false)} />
    </div>
  );
};

export default OfferCandidatesPage;
