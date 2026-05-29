import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  DataTable,
  ListControls,
  NoDataFound,
  PageHeader,
  StatusBadge,
} from '../../components/common';
import { useDebounce } from '../../hooks/useDebounce';
import { useOrganizationsList } from '../../features/platform/organizations/hooks';
import { useEnterprisesList } from '../../features/platform/enterprises/hooks';

import styles from './PlatformOrganizationsPage.module.scss';

import type { Organization } from '../../features/platform/organizations/types';
import type { ColumnDef } from '@tanstack/react-table';

const OrgInitials = ({ name, subdomain }: { name: string; subdomain: string }) => (
  <div className={styles.orgCell}>
    <div className={styles.avatar}>
      {name
        .split(' ')
        .slice(0, 2)
        .map((w) => w[0])
        .join('')
        .toUpperCase()}
    </div>
    <div>
      <div className={styles.orgName}>{name}</div>
      <div className={styles.orgSub}>{subdomain}</div>
    </div>
  </div>
);

const PlatformOrganizationsPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [enterpriseFilter, setEnterpriseFilter] = useState('');

  const debouncedSearch = useDebounce(searchQuery, 300);
  const { data: orgsResponse, isLoading } = useOrganizationsList();
  const { data: entResponse } = useEnterprisesList();

  const allOrgs = useMemo(() => orgsResponse?.data ?? [], [orgsResponse]);
  const enterprises = useMemo(() => entResponse?.data ?? [], [entResponse]);

  const stats = useMemo(
    () => ({
      total: allOrgs.length,
      byEnterprise: enterprises.length,
    }),
    [allOrgs, enterprises],
  );

  const filtered = useMemo(() => {
    const q = debouncedSearch.toLowerCase();
    return allOrgs.filter((o) => {
      const matchSearch =
        !q || o.name.toLowerCase().includes(q) || o.subdomain?.toLowerCase().includes(q);
      const matchEnt = !enterpriseFilter || o.enterprise_id === enterpriseFilter;
      return matchSearch && matchEnt;
    });
  }, [allOrgs, debouncedSearch, enterpriseFilter]);

  const columns: ColumnDef<Organization>[] = useMemo(
    () => [
      {
        id: 'organisation',
        header: 'Organisation',
        cell: ({ row }) => (
          <OrgInitials name={row.original.name} subdomain={row.original.subdomain} />
        ),
      },
      {
        id: 'enterprise',
        header: 'Enterprise',
        cell: ({ row }) => (
          <span className={styles.enterprise}>{row.original.enterprise?.name ?? '—'}</span>
        ),
      },
      {
        id: 'contact',
        header: 'Contact',
        cell: ({ row }) => {
          const profile = row.original.profile;
          return (
            <div className={styles.contactCell}>
              <div>{profile?.email ?? '—'}</div>
              {profile?.phone && <div className={styles.muted}>{profile.phone}</div>}
            </div>
          );
        },
      },
      {
        id: 'location',
        header: 'Location',
        cell: ({ row }) => {
          const p = row.original.profile;
          const parts = [p?.city, p?.state, p?.country].filter(Boolean);
          return <span className={styles.muted}>{parts.length ? parts.join(', ') : '—'}</span>;
        },
      },
      {
        accessorKey: 'status',
        header: 'Status',
        size: 110,
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        accessorKey: 'created_at',
        header: 'Created',
        size: 130,
        cell: ({ row }) =>
          new Date(row.original.created_at).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          }),
      },
    ],
    [],
  );

  const showEmptyState = !isLoading && allOrgs.length === 0;

  return (
    <div className={`${styles.container} ${isLoading ? styles.loading : ''}`}>
      {showEmptyState ? (
        <NoDataFound
          title="No Organisations Yet"
          description="Organisations are created when users complete account setup."
          noDataImage={undefined}
          noDataImageAlt="No Organisations"
        />
      ) : (
        <>
          <PageHeader
            title="Organisations"
            subtitle="All customer organisations on the platform."
          />

          <div className={styles.statsRow}>
            <div className={styles.statCard}>
              <div className={styles.statValue}>{stats.total}</div>
              <div className={styles.statLabel}>Total Orgs</div>
            </div>
            <div className={styles.statCard}>
              <div className={`${styles.statValue} ${styles.blue}`}>{stats.byEnterprise}</div>
              <div className={styles.statLabel}>Enterprises</div>
            </div>
          </div>

          <ListControls
            searchPlaceholder="Search by name or subdomain…"
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            showFilters={true}
            filterTitle="Enterprise"
            filterOptions={[
              { label: 'All Enterprises', value: '' },
              ...enterprises.map((e) => ({ label: e.name, value: e.id })),
            ]}
            selectedFilter={enterpriseFilter}
            onFilterChange={setEnterpriseFilter}
            showSort={false}
            showViewSwitcher={false}
            showMultiSelect={false}
          />

          {filtered.length === 0 ? (
            <NoDataFound
              title="No Organisations Found"
              description="Try adjusting your search or filters."
              noDataImage={undefined}
              noDataImageAlt="No Organisations"
            />
          ) : (
            <DataTable
              columns={columns}
              data={filtered}
              onRowClick={(row) => navigate(`/platform/organizations/${row.id}`)}
            />
          )}
        </>
      )}
    </div>
  );
};

export default PlatformOrganizationsPage;
