import { useCallback, useMemo, useState } from 'react';
import { Plus } from 'lucide-react';

import {
  Button,
  DataTable,
  ListControls,
  NoDataFound,
  PageHeader,
  StatusBadge,
  TableActions,
  WarningModal,
} from '../../components/common';
import { useDebounce } from '../../hooks/useDebounce';
import { EnterpriseFormModal } from '../../features/platform/enterprises/EnterpriseFormModal';
import { useEnterprisesList, useDeleteEnterprise } from '../../features/platform/enterprises/hooks';
import { Status } from '../../types/common';

import styles from './PlatformEnterprisesPage.module.scss';

import type { Enterprise, EnterpriseApp } from '../../features/platform/enterprises/types';
import type { ColumnDef } from '@tanstack/react-table';

const MAX_VISIBLE_APPS = 3;

const AppChips = ({ apps }: { apps: EnterpriseApp[] }) => {
  const visible = apps.slice(0, MAX_VISIBLE_APPS);
  const overflow = apps.length - MAX_VISIBLE_APPS;
  return (
    <div className={styles.appsCell}>
      {visible.map((app) => (
        <span key={app.id} className={styles.appChip}>
          {app.name}
        </span>
      ))}
      {overflow > 0 && <span className={styles.moreApps}>+{overflow} more</span>}
      {apps.length === 0 && <span className={styles.muted}>—</span>}
    </div>
  );
};

const OrgAvatar = ({ name, logo }: { name: string; logo: string | null }) => {
  if (logo) {
    return <img src={logo} alt={name} className={styles.orgLogo} />;
  }
  return (
    <div className={styles.orgInitials}>
      {name
        .split(' ')
        .slice(0, 2)
        .map((w) => w[0])
        .join('')
        .toUpperCase()}
    </div>
  );
};

const PlatformEnterprisesPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Enterprise | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Enterprise | null>(null);

  const debouncedSearch = useDebounce(searchQuery, 300);
  const { data: response, isLoading } = useEnterprisesList();
  const { mutate: remove } = useDeleteEnterprise();

  const allItems = useMemo(() => response?.data ?? [], [response]);

  const stats = useMemo(
    () => ({
      total: allItems.length,
      active: allItems.filter((e) => e.status === Status.ACTIVE).length,
      totalApps: allItems.reduce((sum, e) => sum + e.apps.length, 0),
    }),
    [allItems],
  );

  const filtered = useMemo(() => {
    const q = debouncedSearch.toLowerCase();
    if (!q) return allItems;
    return allItems.filter(
      (e) => e.name.toLowerCase().includes(q) || e.domain.toLowerCase().includes(q),
    );
  }, [allItems, debouncedSearch]);

  const handleAdd = useCallback(() => {
    setEditingItem(null);
    setFormOpen(true);
  }, []);

  const handleEdit = useCallback((item: Enterprise) => {
    setEditingItem(item);
    setFormOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setFormOpen(false);
    setEditingItem(null);
  }, []);

  const handleDeleteConfirm = useCallback(() => {
    if (!deleteTarget) return;
    remove(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) });
  }, [deleteTarget, remove]);

  const columns: ColumnDef<Enterprise>[] = useMemo(
    () => [
      {
        id: 'organisation',
        header: 'Organisation',
        cell: ({ row }) => {
          const { name, domain, logo } = row.original;
          return (
            <div className={styles.orgCell}>
              <OrgAvatar name={name} logo={logo} />
              <div>
                <div className={styles.orgName}>{name}</div>
                <div className={styles.orgDomain}>{domain}</div>
              </div>
            </div>
          );
        },
      },
      {
        id: 'apps',
        header: 'Apps',
        cell: ({ row }) => <AppChips apps={row.original.apps} />,
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
      {
        id: 'actions',
        header: 'Actions',
        size: 100,
        cell: ({ row }) => (
          <TableActions
            onEdit={() => handleEdit(row.original)}
            onDelete={() => setDeleteTarget(row.original)}
          />
        ),
      },
    ],
    [handleEdit],
  );

  const showEmptyState = !isLoading && allItems.length === 0 && !debouncedSearch;

  return (
    <div className={`${styles.container} ${isLoading ? styles.loading : ''}`}>
      {showEmptyState ? (
        <NoDataFound
          title="No Enterprises Yet"
          description="Add customer organizations to the platform. Each enterprise gets access to all apps automatically."
          noDataImage={undefined}
          noDataImageAlt="No Enterprises"
          buttonText="Add Enterprise"
          onButtonClick={handleAdd}
          showButtonIcon
        />
      ) : (
        <>
          <PageHeader
            title="Enterprises"
            subtitle="Manage customer organisations on the platform."
            actions={
              <Button variant="primary" onClick={handleAdd}>
                <Plus size={16} />
                Add enterprise
              </Button>
            }
          />

          <div className={styles.statsRow}>
            <div className={styles.statCard}>
              <div className={styles.statValue}>{stats.total}</div>
              <div className={styles.statLabel}>Total</div>
            </div>
            <div className={styles.statCard}>
              <div className={`${styles.statValue} ${styles.green}`}>{stats.active}</div>
              <div className={styles.statLabel}>Active</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statValue}>{stats.totalApps}</div>
              <div className={styles.statLabel}>App Assignments</div>
            </div>
          </div>

          <ListControls
            searchPlaceholder="Search by name or domain…"
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            showFilters={false}
            showSort={false}
            showViewSwitcher={false}
            showMultiSelect={false}
          />

          {filtered.length === 0 ? (
            <NoDataFound
              title="No Enterprises Found"
              description="Try adjusting your search criteria."
              noDataImage={undefined}
              noDataImageAlt="No Enterprises"
            />
          ) : (
            <DataTable columns={columns} data={filtered} />
          )}
        </>
      )}

      <EnterpriseFormModal open={formOpen} onClose={handleClose} enterprise={editingItem} />

      <WarningModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title={`Delete "${deleteTarget?.name}"?`}
        description="This enterprise and all its app assignments will be permanently removed."
        actionLabel="Delete"
        onAction={handleDeleteConfirm}
      />
    </div>
  );
};

export default PlatformEnterprisesPage;
