import { useCallback, useMemo, useState } from 'react';
import { LayoutGrid, Pencil, Plus, Trash2 } from 'lucide-react';

import { Button, NoDataFound, PageHeader, WarningModal } from '../../components/common';
import { useDebounce } from '../../hooks/useDebounce';
import { useAppsList, useDeleteApp } from '../../features/platform/apps/hooks';
import { AppFormModal } from '../../features/platform/apps/AppFormModal';
import { StatusBadge } from '../../components/common';

import styles from './PlatformAppsPage.module.scss';

import type { PlatformApp } from '../../features/platform/apps/types';

const PlatformAppsPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editingApp, setEditingApp] = useState<PlatformApp | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PlatformApp | null>(null);

  const debouncedSearch = useDebounce(searchQuery, 300);
  const { data: response, isLoading } = useAppsList();
  const { mutate: remove } = useDeleteApp();

  const allApps = useMemo(() => response?.data ?? [], [response]);

  const filtered = useMemo(() => {
    const q = debouncedSearch.toLowerCase();
    if (!q) return allApps;
    return allApps.filter(
      (app) => app.name.toLowerCase().includes(q) || app.description?.toLowerCase().includes(q),
    );
  }, [allApps, debouncedSearch]);

  const handleAdd = useCallback(() => {
    setEditingApp(null);
    setFormOpen(true);
  }, []);

  const handleEdit = useCallback((app: PlatformApp) => {
    setEditingApp(app);
    setFormOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setFormOpen(false);
    setEditingApp(null);
  }, []);

  const handleDelete = useCallback(() => {
    if (!deleteTarget) return;
    remove(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) });
  }, [deleteTarget, remove]);

  const showEmptyState = !isLoading && allApps.length === 0 && !debouncedSearch;

  return (
    <div className={`${styles.container} ${isLoading ? styles.loading : ''}`}>
      {showEmptyState ? (
        <NoDataFound
          title="No Apps Yet"
          description="Create apps (e.g. HRMS, CRM) that organizations can subscribe to. Each app contains modules and actions."
          noDataImage={undefined}
          noDataImageAlt="No Apps"
          buttonText="Create App"
          onButtonClick={handleAdd}
          showButtonIcon
        />
      ) : (
        <>
          <PageHeader
            title="Apps"
            subtitle="Manage platform applications. Apps contain modules and are assigned to organizations."
            actions={
              <Button variant="primary" onClick={handleAdd}>
                <Plus size={16} />
                Add app
              </Button>
            }
          />

          <div className={styles.searchBar}>
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search apps..."
              className={styles.searchInput}
            />
          </div>

          {filtered.length === 0 ? (
            <NoDataFound
              title="No Apps Found"
              description="Try adjusting your search."
              noDataImage={undefined}
              noDataImageAlt="No Apps"
            />
          ) : (
            <div className={styles.grid}>
              {filtered.map((app) => (
                <AppCard key={app.id} app={app} onEdit={handleEdit} onDelete={setDeleteTarget} />
              ))}
            </div>
          )}
        </>
      )}

      <AppFormModal open={formOpen} onClose={handleClose} app={editingApp} />

      <WarningModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title={`Delete "${deleteTarget?.name}"?`}
        description="This app and all its modules will be removed. Organizations using this app may lose access."
        actionLabel="Delete"
        onAction={handleDelete}
      />
    </div>
  );
};

interface AppCardProps {
  app: PlatformApp;
  onEdit: (app: PlatformApp) => void;
  onDelete: (app: PlatformApp) => void;
}

const AppCard = ({ app, onEdit, onDelete }: AppCardProps) => (
  <div className={styles.card}>
    <div className={styles.cardHeader}>
      <div className={styles.appIcon}>
        <LayoutGrid size={20} />
      </div>
      <div className={styles.cardActions}>
        <button
          className={styles.iconBtn}
          onClick={() => onEdit(app)}
          aria-label="Edit app"
          title="Edit"
        >
          <Pencil size={15} />
        </button>
        <button
          className={`${styles.iconBtn} ${styles.iconBtnDanger}`}
          onClick={() => onDelete(app)}
          aria-label="Delete app"
          title="Delete"
        >
          <Trash2 size={15} />
        </button>
      </div>
    </div>

    <div className={styles.cardBody}>
      <div className={styles.appName}>{app.name}</div>
      {app.description && <p className={styles.appDesc}>{app.description}</p>}
    </div>

    <div className={styles.cardFooter}>
      <StatusBadge status={app.status} />
      <span className={styles.priority}>Priority {app.priority}</span>
    </div>
  </div>
);

export default PlatformAppsPage;
