import React, { useMemo, useState } from 'react';
import { Calendar, Users, Lock, Anchor } from 'lucide-react';

import {
  PageHeader,
  Accordion,
  Button,
  ListControls,
  NoDataFound,
  AlertModal,
} from '../../components/common';
import { Select } from '../../components/common/Select/Select';
import { useGroupedPolicies } from '../../features/policies/hooks/useGroupedPolicies';
import { useDeletePolicy } from '../../features/policies/hooks/useDeletePolicy';
import { useCreatePolicy } from '../../features/policies/hooks/useCreatePolicy';
import { PolicyAccordionItem } from '../../features/policies/components/PolicyAccordionItem/PolicyAccordionItem';
import { CreatePolicyDialog } from '../../features/policies/components/CreatePolicyDialog/CreatePolicyDialog';
import { PolicyCreatedModal } from '../../features/policies/components/PolicyCreatedModal/PolicyCreatedModal';
import { PolicyViewDialog } from '../../features/policies/components/PolicyViewDialog/PolicyViewDialog';
import no_department from '../../assets/svg/department/no_department_found.svg';

import styles from './PoliciesPage.module.scss';

import type { Policy, PolicyFormData } from '../../features/policies/types/policyType';

// Map API icon names → lucide icons + style
const ICON_MAP: Record<string, React.ReactElement> = {
  calendar: <Calendar size={20} />,
  users: <Users size={20} />,
  lock: <Lock size={20} />,
  people: <Users size={20} />,
  description: <Lock size={20} />,
};

const ICON_STYLE_MAP: Record<string, { backgroundColor: string; color: string }> = {
  calendar: { backgroundColor: '#eefcf5', color: '#16b364' },
  users: { backgroundColor: '#fdf4ec', color: '#e58728' },
  people: { backgroundColor: '#fdf4ec', color: '#e58728' },
  lock: { backgroundColor: '#f4f3ff', color: '#7a5af8' },
  description: { backgroundColor: '#f4f3ff', color: '#7a5af8' },
};

const DEFAULT_ICON = <Anchor size={20} />;
const DEFAULT_STYLE = { backgroundColor: '#f4f3ff', color: '#7a5af8' };

const SORT_OPTIONS = [
  { label: 'Newest first', value: 'newest' },
  { label: 'Alphabetical A–Z', value: 'asc' },
  { label: 'Alphabetical Z–A', value: 'desc' },
];

const PoliciesPage = () => {
  const { data: groups = [], isLoading } = useGroupedPolicies();
  const { mutate: deletePolicyMutation, isPending: isDeleting } = useDeletePolicy();
  const { mutate: createPolicyMutation } = useCreatePolicy();

  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<string>('newest');

  const [createOpen, setCreateOpen] = useState(false);
  const [createdPolicy, setCreatedPolicy] = useState<PolicyFormData | null>(null);
  const [viewPolicy, setViewPolicy] = useState<Policy | null>(null);
  const [deletePolicy, setDeletePolicy] = useState<Policy | null>(null);

  const filteredGroups = useMemo(() => {
    const lowerQuery = searchQuery.toLowerCase();

    const result = groups
      .map((group) => {
        const matchGroupName = group.name.toLowerCase().includes(lowerQuery);
        const filteredPolicies = searchQuery
          ? group.policies.filter(
              (p) =>
                p.title.toLowerCase().includes(lowerQuery) ||
                p.description.toLowerCase().includes(lowerQuery),
            )
          : group.policies;

        const policies = [...(matchGroupName || !searchQuery ? group.policies : filteredPolicies)];
        if (sortBy === 'asc') policies.sort((a, b) => a.title.localeCompare(b.title));
        if (sortBy === 'desc') policies.sort((a, b) => b.title.localeCompare(a.title));

        return { ...group, policies };
      })
      .filter((g) => g.policies.length > 0);

    if (sortBy === 'asc') result.sort((a, b) => a.name.localeCompare(b.name));
    if (sortBy === 'desc') result.sort((a, b) => b.name.localeCompare(a.name));

    return result;
  }, [groups, searchQuery, sortBy]);

  const handleCreateSuccess = (data: PolicyFormData) => {
    // Map form data → API payload
    createPolicyMutation(
      {
        title: data.title,
        description: data.description,
        type_id: data.policyType,
        content: data.content,
        status: 'ACTIVE',
      },
      {
        onSuccess: () => {
          setCreateOpen(false);
          setCreatedPolicy(data);
        },
      },
    );
  };

  const handleViewFromModal = () => {
    if (!createdPolicy) return;
    const syntheticPolicy: Policy = {
      id: 'new',
      title: createdPolicy.title,
      description: createdPolicy.description,
      type_id: createdPolicy.policyType,
      content: createdPolicy.content,
      status: 'ACTIVE',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setCreatedPolicy(null);
    setViewPolicy(syntheticPolicy);
  };

  const handleDeleteConfirm = () => {
    if (!deletePolicy) return;
    deletePolicyMutation(deletePolicy.id, {
      onSuccess: () => setDeletePolicy(null),
    });
  };

  if (!isLoading && groups.length === 0) {
    return (
      <>
        <NoDataFound
          title="No Policies Added Yet"
          description="Set up your first policy to ensure your team is aligned with the company's guidelines."
          noDataImage={no_department}
          noDataImageAlt="No Policies Found"
          buttonText="Add New Policy"
          onButtonClick={() => setCreateOpen(true)}
          showButtonIcon
        />
        <CreatePolicyDialog
          open={createOpen}
          onClose={() => setCreateOpen(false)}
          onSuccess={handleCreateSuccess}
        />
        {createdPolicy && (
          <PolicyCreatedModal
            isOpen={!!createdPolicy}
            policyTitle={createdPolicy.title}
            onClose={() => setCreatedPolicy(null)}
            onViewPolicy={handleViewFromModal}
            onCreateAnother={() => {
              setCreatedPolicy(null);
              setCreateOpen(true);
            }}
          />
        )}
      </>
    );
  }

  return (
    <div className={`${styles.container} ${isLoading ? styles.loading : ''}`}>
      <PageHeader
        title="Policies"
        subtitle="Manage and view company policies."
        actions={
          <Button variant="primary" onClick={() => setCreateOpen(true)}>
            Add policy
          </Button>
        }
      />

      <div className={styles.controls}>
        <div className={styles.controlsRow}>
          <ListControls
            searchPlaceholder="Search policies..."
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            viewType="grid"
            onViewTypeChange={() => {}}
            showViewSwitcher={false}
          />
          <Select
            options={SORT_OPTIONS}
            value={sortBy}
            onChange={(val) => setSortBy(String(val))}
            labelPrefix="Sort by: "
            className={styles.sortSelect}
          />
        </div>
      </div>

      <div className={styles.content}>
        {filteredGroups.map((group) => (
          <Accordion
            key={group.id}
            title={group.name}
            icon={ICON_MAP[group.icon] || DEFAULT_ICON}
            iconWrapperStyle={ICON_STYLE_MAP[group.icon] || DEFAULT_STYLE}
            badge={`${group.policies.length} ${group.policies.length === 1 ? 'policy' : 'policies'}`}
            defaultExpanded={true}
          >
            <div className={styles.accordionContent}>
              {group.policies.map((policy) => (
                <PolicyAccordionItem
                  key={policy.id}
                  policy={policy}
                  onEdit={(p) => setViewPolicy(p)}
                  onDelete={(p) => setDeletePolicy(p)}
                />
              ))}
              {group.policies.length === 0 && (
                <div className={styles.emptyCategory}>
                  No policies found matching your search in this category.
                </div>
              )}
            </div>
          </Accordion>
        ))}

        {filteredGroups.length === 0 && searchQuery && (
          <NoDataFound
            title="No Policies Found"
            description="We couldn't find any policy matching your search. Try adjusting your query."
            noDataImage={no_department}
            noDataImageAlt="No Policies Found"
          />
        )}
      </div>

      {/* Create Policy Dialog */}
      <CreatePolicyDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSuccess={handleCreateSuccess}
      />

      {/* Policy Created Success Modal */}
      {createdPolicy && (
        <PolicyCreatedModal
          isOpen={!!createdPolicy}
          policyTitle={createdPolicy.title}
          onClose={() => setCreatedPolicy(null)}
          onViewPolicy={handleViewFromModal}
          onCreateAnother={() => {
            setCreatedPolicy(null);
            setCreateOpen(true);
          }}
        />
      )}

      {/* Policy View Dialog */}
      <PolicyViewDialog
        open={!!viewPolicy}
        policy={viewPolicy}
        onClose={() => setViewPolicy(null)}
        onEdit={() => {
          setViewPolicy(null);
          setCreateOpen(true);
        }}
      />

      {/* Delete Confirmation */}
      <AlertModal
        isOpen={!!deletePolicy}
        onClose={() => setDeletePolicy(null)}
        title="Delete Policy"
        alertMessage={`You are about to delete "${deletePolicy?.title}"`}
        description="This action cannot be undone. The policy will be permanently removed."
        actionLabel="Delete Policy"
        actionVariant="danger"
        onAction={handleDeleteConfirm}
        onCancel={() => setDeletePolicy(null)}
        cancelLabel="Cancel"
        isActionLoading={isDeleting}
      />
    </div>
  );
};

export default PoliciesPage;
