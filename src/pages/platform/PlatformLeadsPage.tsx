import { useMemo, useState } from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';

import { DataTable, ListControls, NoDataFound, PageHeader } from '../../components/common';
import { useDebounce } from '../../hooks/useDebounce';
import { usePlansList } from '../../features/platform/plans/hooks';
import { useLeadsList, useUpdateLeadStatus } from '../../features/platform/leads/hooks';

import styles from './PlatformLeadsPage.module.scss';

import type { Lead, LeadStatus } from '../../features/platform/leads/types';
import type { ColumnDef } from '@tanstack/react-table';

const STATUS_LABELS: Record<LeadStatus, string> = {
  NEW: 'New',
  CONTACTED: 'Contacted',
  DEMO_SCHEDULED: 'Demo Scheduled',
  DEMO_COMPLETED: 'Demo Completed',
  PROPOSAL_SENT: 'Proposal Sent',
  NEGOTIATION: 'Negotiation',
  CONTRACT_SENT: 'Contract Sent',
  WON: 'Won',
  LOST: 'Lost',
  ON_HOLD: 'On Hold',
};

const STATUS_COLORS: Record<LeadStatus, { bg: string; color: string }> = {
  NEW: { bg: '#eff6ff', color: '#2563eb' },
  CONTACTED: { bg: '#f5f3ff', color: '#7c3aed' },
  DEMO_SCHEDULED: { bg: '#eef2ff', color: '#4338ca' },
  DEMO_COMPLETED: { bg: '#ecfeff', color: '#0891b2' },
  PROPOSAL_SENT: { bg: '#fff7ed', color: '#ea580c' },
  NEGOTIATION: { bg: '#fffbeb', color: '#d97706' },
  CONTRACT_SENT: { bg: '#fefce8', color: '#ca8a04' },
  WON: { bg: '#f0fdf4', color: '#16a34a' },
  LOST: { bg: '#fef2f2', color: '#dc2626' },
  ON_HOLD: { bg: '#f9fafb', color: '#6b7280' },
};

const ALL_STATUSES = Object.keys(STATUS_LABELS) as LeadStatus[];

const PlatformLeadsPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeStatus, setActiveStatus] = useState<LeadStatus | 'ALL'>('ALL');

  const debouncedSearch = useDebounce(searchQuery, 300);
  const { data: response, isLoading } = useLeadsList();
  const { data: plansResp } = usePlansList();
  const { mutate: updateStatus, isPending: isUpdating } = useUpdateLeadStatus();

  const allLeads = useMemo(() => response?.data ?? [], [response]);

  const plansMap = useMemo(() => {
    const map: Record<string, string> = {};
    for (const p of plansResp?.data ?? []) map[p.id] = p.name;
    return map;
  }, [plansResp]);

  const stats = useMemo(
    () => ({
      total: allLeads.length,
      newLeads: allLeads.filter((l) => l.lead_status === 'NEW').length,
      won: allLeads.filter((l) => l.lead_status === 'WON').length,
      lost: allLeads.filter((l) => l.lead_status === 'LOST').length,
    }),
    [allLeads],
  );

  const filtered = useMemo(() => {
    let list =
      activeStatus === 'ALL' ? allLeads : allLeads.filter((l) => l.lead_status === activeStatus);
    const q = debouncedSearch.toLowerCase();
    if (q)
      list = list.filter(
        (l) =>
          l.first_name.toLowerCase().includes(q) ||
          l.last_name.toLowerCase().includes(q) ||
          l.email.toLowerCase().includes(q) ||
          l.phone.includes(q),
      );
    return list;
  }, [allLeads, activeStatus, debouncedSearch]);

  const columns: ColumnDef<Lead>[] = useMemo(
    () => [
      {
        id: 'lead',
        header: 'Lead',
        cell: ({ row }) => {
          const { first_name, last_name, email } = row.original;
          return (
            <div className={styles.leadCell}>
              <div className={styles.avatar}>{first_name[0]?.toUpperCase()}</div>
              <div>
                <div className={styles.leadName}>
                  {first_name} {last_name}
                </div>
                <div className={styles.leadEmail}>{email}</div>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: 'phone',
        header: 'Phone',
        cell: ({ row }) => <span className={styles.mono}>{row.original.phone}</span>,
      },
      {
        accessorKey: 'source',
        header: 'Source',
        size: 100,
        cell: ({ row }) => (
          <span
            className={`${styles.badge} ${row.original.source === 'website' ? styles.badgeWebsite : styles.badgeAdmin}`}
          >
            {row.original.source === 'website' ? 'Website' : 'Admin'}
          </span>
        ),
      },
      {
        accessorKey: 'plan_id',
        header: 'Plan',
        cell: ({ row }) => {
          const name = row.original.plan_id ? plansMap[row.original.plan_id] : null;
          return name ? <span>{name}</span> : <span className={styles.muted}>—</span>;
        },
      },
      {
        accessorKey: 'lead_status',
        header: 'Status',
        size: 180,
        cell: ({ row }) => {
          const status = row.original.lead_status;
          const colors = STATUS_COLORS[status];
          return (
            <select
              className={styles.statusSelect}
              style={{
                background: colors.bg,
                color: colors.color,
                borderColor: `${colors.color}55`,
              }}
              value={status}
              disabled={isUpdating}
              onChange={(e) =>
                updateStatus({ id: row.original.id, status: e.target.value as LeadStatus })
              }
            >
              {ALL_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABELS[s]}
                </option>
              ))}
            </select>
          );
        },
      },
      {
        accessorKey: 'is_verified',
        header: 'Verified',
        size: 90,
        cell: ({ row }) =>
          row.original.is_verified ? (
            <CheckCircle2 size={16} color="#16a34a" />
          ) : (
            <XCircle size={16} color="#dc2626" />
          ),
      },
      {
        accessorKey: 'created_at',
        header: 'Registered',
        cell: ({ row }) =>
          new Date(row.original.created_at).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          }),
      },
    ],
    [updateStatus, isUpdating, plansMap],
  );

  if (!isLoading && allLeads.length === 0) {
    return (
      <NoDataFound
        title="No Leads Yet"
        description="Leads will appear here once customers sign up through your pricing plans."
        noDataImage={undefined}
        noDataImageAlt="No Leads"
      />
    );
  }

  return (
    <div className={`${styles.container} ${isLoading ? styles.loading : ''}`}>
      <PageHeader
        title="Leads"
        subtitle="Track and manage customer leads through the sales pipeline."
      />

      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{stats.total}</div>
          <div className={styles.statLabel}>Total Leads</div>
        </div>
        <div className={styles.statCard}>
          <div className={`${styles.statValue} ${styles.blue}`}>{stats.newLeads}</div>
          <div className={styles.statLabel}>New</div>
        </div>
        <div className={styles.statCard}>
          <div className={`${styles.statValue} ${styles.green}`}>{stats.won}</div>
          <div className={styles.statLabel}>Won</div>
        </div>
        <div className={styles.statCard}>
          <div className={`${styles.statValue} ${styles.red}`}>{stats.lost}</div>
          <div className={styles.statLabel}>Lost</div>
        </div>
      </div>

      <div className={styles.filterTabs}>
        <button
          className={`${styles.filterTab} ${activeStatus === 'ALL' ? styles.active : ''}`}
          onClick={() => setActiveStatus('ALL')}
        >
          All
          <span className={styles.tabCount}>{allLeads.length}</span>
        </button>
        {ALL_STATUSES.map((s) => {
          const count = allLeads.filter((l) => l.lead_status === s).length;
          if (count === 0) return null;
          return (
            <button
              key={s}
              className={`${styles.filterTab} ${activeStatus === s ? styles.active : ''}`}
              onClick={() => setActiveStatus(s)}
            >
              {STATUS_LABELS[s]}
              <span className={styles.tabCount}>{count}</span>
            </button>
          );
        })}
      </div>

      <ListControls
        searchPlaceholder="Search by name, email or phone…"
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        showFilters={false}
        showSort={false}
        showViewSwitcher={false}
        showMultiSelect={false}
      />

      {filtered.length === 0 ? (
        <NoDataFound
          title="No Leads Found"
          description="Try adjusting your search or filter."
          noDataImage={undefined}
          noDataImageAlt="No Leads"
        />
      ) : (
        <DataTable columns={columns} data={filtered} />
      )}
    </div>
  );
};

export default PlatformLeadsPage;
