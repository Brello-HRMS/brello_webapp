import React, { useState, useMemo, useCallback } from 'react';
import { Loader2 } from 'lucide-react';

import { PageHeader } from '../../components/common/PageHeader/PageHeader';
import { DataTable } from '../../components/common/DataTable';
import { Select, type SelectOption } from '../../components/common/Select/Select';
import { Input } from '../../components/ui/Input/Input';
import { DatePicker } from '../../components/ui/DatePicker/DatePicker';
import { usePlatformAuditLogs } from '../../features/audit/hooks/useAuditLogs';
import {
  usePlatformAuditLogStats,
  usePlatformAuditFilterOptions,
} from '../../features/audit/hooks/useAuditLogStats';
import { auditColumns } from '../../features/audit/columns/auditColumns';
import { AuditDetailDrawer } from '../../features/audit/components/AuditDetailDrawer';
import { useOrganizationsList } from '../../features/platform/organizations/hooks';

import styles from './PlatformAuditPage.module.css';

import type { AuditLog } from '../../features/audit/types/audit.types';

const PlatformAuditPage: React.FC = () => {
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 20 });
  const [moduleFilter, setModuleFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [orgFilter, setOrgFilter] = useState('');
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const { data: orgsData } = useOrganizationsList();
  const { data: filterOptions } = usePlatformAuditFilterOptions(orgFilter || undefined);

  const orgOptions: SelectOption[] = useMemo(
    () => [
      { value: '', label: 'All Organisations' },
      ...(orgsData?.data ?? []).map((o) => ({ value: o.id, label: o.name })),
    ],
    [orgsData],
  );

  const moduleOptions: SelectOption[] = useMemo(
    () => [
      { value: '', label: 'All Modules' },
      ...(filterOptions?.modules ?? []).map((m) => ({ value: m, label: m.replace(/_/g, ' ') })),
    ],
    [filterOptions],
  );

  const actionOptions: SelectOption[] = useMemo(
    () => [
      { value: '', label: 'All Actions' },
      ...(filterOptions?.actions ?? []).map((a) => ({ value: a, label: a.replace(/_/g, ' ') })),
    ],
    [filterOptions],
  );

  const resetPage = useCallback(() => setPagination((p) => ({ ...p, pageIndex: 0 })), []);

  const queryParams = useMemo(
    () => ({
      page: pagination.pageIndex + 1,
      limit: pagination.pageSize,
      ...(moduleFilter ? { module: moduleFilter } : {}),
      ...(actionFilter ? { action: actionFilter } : {}),
      ...(search ? { search } : {}),
      ...(dateFrom ? { date_from: dateFrom } : {}),
      ...(dateTo ? { date_to: dateTo } : {}),
      ...(orgFilter ? { organization_id: orgFilter } : {}),
    }),
    [pagination, moduleFilter, actionFilter, search, dateFrom, dateTo, orgFilter],
  );

  const { items, isLoading, pagination: meta } = usePlatformAuditLogs(queryParams);
  const { data: stats } = usePlatformAuditLogStats(orgFilter || undefined, dateFrom, dateTo);

  const handleView = useCallback((log: AuditLog) => setSelectedLog(log), []);
  const columns = useMemo(() => auditColumns({ onView: handleView }), [handleView]);
  const pageCount = meta ? Math.ceil(meta.total / meta.limit) : 0;

  const handleFilter = useCallback(
    (setter: (v: string) => void) => (v: string | number) => {
      setter(String(v));
      resetPage();
    },
    [resetPage],
  );

  return (
    <div className={styles.page}>
      <PageHeader
        title="Audit Logs"
        subtitle="Platform-wide audit trail across all organisations and events."
      />

      {stats && (
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>Total Events</span>
            <span className={styles.statValue}>{(stats.total ?? 0).toLocaleString()}</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>Top Module</span>
            <span className={styles.statValue}>
              {Object.entries(stats.by_module)
                .sort((a, b) => b[1] - a[1])[0]?.[0]
                ?.replace(/_/g, ' ') ?? '—'}
            </span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>Logins</span>
            <span className={styles.statValue}>
              {(stats.by_action['LOGIN'] ?? 0).toLocaleString()}
            </span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>Failed Logins</span>
            <span className={styles.statValue}>
              {(stats.by_action['LOGIN_FAILED'] ?? 0).toLocaleString()}
            </span>
          </div>
        </div>
      )}

      <div className={styles.filtersRow}>
        <div className={styles.filterSearch}>
          <Input
            placeholder="Search actor, entity…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              resetPage();
            }}
          />
        </div>
        <div className={styles.filterOrg}>
          <Select
            options={orgOptions}
            value={orgFilter}
            onChange={handleFilter(setOrgFilter)}
            placeholder="All Organisations"
          />
        </div>
        <div className={styles.filterSelect}>
          <Select
            options={moduleOptions}
            value={moduleFilter}
            onChange={handleFilter(setModuleFilter)}
            placeholder="All Modules"
          />
        </div>
        <div className={styles.filterSelect}>
          <Select
            options={actionOptions}
            value={actionFilter}
            onChange={handleFilter(setActionFilter)}
            placeholder="All Actions"
          />
        </div>
        <div className={styles.filterDate}>
          <DatePicker
            placeholder="From date"
            value={dateFrom}
            onChange={(v) => {
              setDateFrom(v);
              resetPage();
            }}
          />
        </div>
        <div className={styles.filterDate}>
          <DatePicker
            placeholder="To date"
            value={dateTo}
            onChange={(v) => {
              setDateTo(v);
              resetPage();
            }}
          />
        </div>
      </div>

      {isLoading ? (
        <div className={styles.loader}>
          <Loader2 size={28} style={{ animation: 'spin 1s linear infinite' }} />
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={items}
          rowIdField="id"
          pagination={pagination}
          onPaginationChange={setPagination}
          pageCount={pageCount}
          manualPagination
        />
      )}

      <AuditDetailDrawer log={selectedLog} onClose={() => setSelectedLog(null)} />
    </div>
  );
};

export default PlatformAuditPage;
