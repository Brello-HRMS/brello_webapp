import { useCallback, useMemo, useState } from 'react';
import { Pencil, Plus, Shield, Trash2 } from 'lucide-react';

import { Button, NoDataFound, PageHeader, WarningModal } from '../../components/common';
import { StatusBadge } from '../../components/common';
import { useAppsList } from '../../features/platform/apps/hooks';
import { usePlatformRoles, useDeletePlatformRole } from '../../features/platform/roles/hooks';
import { RoleFormModal } from '../../features/platform/roles/RoleFormModal';

import styles from './PlatformRolesPage.module.scss';

import type { PlatformRole } from '../../features/platform/roles/types';

const PlatformRolesPage = () => {
  const [formOpen, setFormOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<PlatformRole | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PlatformRole | null>(null);
  const [appFilter, setAppFilter] = useState('');

  const { data: rolesResp, isLoading } = usePlatformRoles();
  const roles = useMemo(() => rolesResp?.data ?? [], [rolesResp]);
  const { data: appsResp } = useAppsList();
  const { mutate: remove } = useDeletePlatformRole();

  const apps = useMemo(() => appsResp?.data ?? [], [appsResp]);

  const appMap = useMemo(() => new Map(apps.map((a) => [a.id, a.name])), [apps]);

  const filtered = useMemo(() => {
    if (!appFilter) return roles;
    return roles.filter((r) => r.app_id === appFilter);
  }, [roles, appFilter]);

  const grouped = useMemo(() => {
    const map = new Map<string, PlatformRole[]>();
    for (const role of filtered) {
      const appName = appMap.get(role.app_id) ?? role.app?.name ?? role.app_id;
      const existing = map.get(appName) ?? [];
      existing.push(role);
      map.set(appName, existing);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [filtered, appMap]);

  const handleAdd = useCallback(() => {
    setEditingRole(null);
    setFormOpen(true);
  }, []);

  const handleEdit = useCallback((role: PlatformRole) => {
    setEditingRole(role);
    setFormOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setFormOpen(false);
    setEditingRole(null);
  }, []);

  const handleDelete = useCallback(() => {
    if (!deleteTarget) return;
    remove(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) });
  }, [deleteTarget, remove]);

  const showEmpty = !isLoading && roles.length === 0;

  return (
    <div className={`${styles.container} ${isLoading ? styles.loading : ''}`}>
      {showEmpty ? (
        <NoDataFound
          title="No Platform Roles"
          description="Create system-defined roles that are automatically cloned to every new organisation on creation."
          noDataImage={undefined}
          noDataImageAlt="No Roles"
          buttonText="Create Role"
          onButtonClick={handleAdd}
          showButtonIcon
        />
      ) : (
        <>
          <PageHeader
            title="Platform Roles"
            subtitle="System-defined roles automatically cloned to each new organisation."
            actions={
              <Button variant="primary" onClick={handleAdd}>
                <Plus size={16} />
                Add role
              </Button>
            }
          />

          <div className={styles.banner}>
            <Shield size={14} />
            These roles are template roles. When a new organisation is created, all
            <strong> auto-assign </strong> roles are cloned for each app that org's plan includes.
          </div>

          {apps.length > 0 && (
            <div className={styles.filterRow}>
              {[{ id: '', name: 'All Apps' }, ...apps].map((app) => (
                <button
                  key={app.id}
                  className={`${styles.filterChip} ${appFilter === app.id ? styles.filterChipActive : ''}`}
                  onClick={() => setAppFilter(app.id)}
                >
                  {app.name}
                </button>
              ))}
            </div>
          )}

          {filtered.length === 0 ? (
            <NoDataFound
              title="No Roles Found"
              description="No roles match the selected filter."
              noDataImage={undefined}
              noDataImageAlt="No Roles"
            />
          ) : (
            <div className={styles.groups}>
              {grouped.map(([appName, appRoles]) => (
                <div key={appName} className={styles.group}>
                  <div className={styles.groupHeader}>{appName}</div>
                  <div className={styles.table}>
                    <div className={styles.tableHead}>
                      <span>Role Name</span>
                      <span>Code</span>
                      <span>Description</span>
                      <span>Auto-assign</span>
                      <span>Status</span>
                      <span />
                    </div>
                    {appRoles.map((role) => (
                      <div key={role.id} className={styles.tableRow}>
                        <span className={styles.roleName}>{role.name}</span>
                        <span className={styles.code}>
                          {role.code ? (
                            <code className={styles.codeTag}>{role.code}</code>
                          ) : (
                            <span className={styles.empty}>—</span>
                          )}
                        </span>
                        <span className={styles.desc}>
                          {role.description || <span className={styles.empty}>—</span>}
                        </span>
                        <span>
                          {role.is_default ? (
                            <span className={styles.defaultBadge}>Yes</span>
                          ) : (
                            <span className={styles.empty}>No</span>
                          )}
                        </span>
                        <span>
                          <StatusBadge status={role.status} />
                        </span>
                        <span className={styles.actions}>
                          <button
                            className={styles.iconBtn}
                            onClick={() => handleEdit(role)}
                            title="Edit"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            className={`${styles.iconBtn} ${styles.iconBtnDanger}`}
                            onClick={() => setDeleteTarget(role)}
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      <RoleFormModal open={formOpen} onClose={handleClose} role={editingRole} />

      <WarningModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title={`Delete "${deleteTarget?.name}"?`}
        description="This role will be permanently removed and will no longer be cloned to new organisations."
        actionLabel="Delete"
        onAction={handleDelete}
      />
    </div>
  );
};

export default PlatformRolesPage;
