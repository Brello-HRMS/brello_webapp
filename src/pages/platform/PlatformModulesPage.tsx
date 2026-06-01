import React, { useCallback, useMemo, useState } from 'react';
import { ChevronDown, ChevronRight, GitBranch, Plus } from 'lucide-react';

import {
  Button,
  NoDataFound,
  PageHeader,
  TableActions,
  WarningModal,
} from '../../components/common';
import { useAppsList } from '../../features/platform/apps/hooks';
import { useModulesByApp, useDeleteModule } from '../../features/platform/appModules/hooks';
import { ModuleFormModal } from '../../features/platform/appModules/ModuleFormModal';
import { ModuleType } from '../../features/platform/appModules/types';

import styles from './PlatformModulesPage.module.scss';

import type { AppModule, ModuleTreeNode } from '../../features/platform/appModules/types';

const buildTree = (modules: AppModule[]): ModuleTreeNode[] =>
  modules
    .filter((m) => !m.parent_id)
    .map((root) => ({
      ...root,
      children: modules
        .filter((m) => m.parent_id === root.id)
        .sort(
          (a, b) =>
            (parseInt(a.wbs_code.split('.').at(-1) ?? '0') || 0) -
            (parseInt(b.wbs_code.split('.').at(-1) ?? '0') || 0),
        ),
    }))
    .sort((a, b) => (parseInt(a.wbs_code) || 0) - (parseInt(b.wbs_code) || 0));

const PlatformModulesPage = () => {
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [formOpen, setFormOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<AppModule | null>(null);
  const [defaultParentId, setDefaultParentId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AppModule | null>(null);

  const { data: appsResponse, isLoading: isAppsLoading } = useAppsList();
  const apps = useMemo(() => appsResponse?.data ?? [], [appsResponse]);

  const activeAppId = selectedAppId ?? apps[0]?.id ?? null;

  const { data: modulesResponse, isLoading: isModulesLoading } = useModulesByApp(activeAppId);
  const allModules = useMemo(() => modulesResponse?.data ?? [], [modulesResponse]);

  const { mutate: remove } = useDeleteModule(activeAppId ?? '');

  const tree = useMemo(() => buildTree(allModules), [allModules]);
  const rootModules = useMemo(
    () => allModules.filter((m) => m.type === ModuleType.MOD),
    [allModules],
  );

  const toggleRow = useCallback((id: string) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const handleAddModule = useCallback(() => {
    setEditingModule(null);
    setDefaultParentId(null);
    setFormOpen(true);
  }, []);

  const handleAddSubModule = useCallback((parentId: string) => {
    setEditingModule(null);
    setDefaultParentId(parentId);
    setExpandedRows((prev) => new Set([...prev, parentId]));
    setFormOpen(true);
  }, []);

  const handleEdit = useCallback((mod: AppModule) => {
    setEditingModule(mod);
    setDefaultParentId(null);
    setFormOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setFormOpen(false);
    setEditingModule(null);
    setDefaultParentId(null);
  }, []);

  const handleDelete = useCallback(() => {
    if (!deleteTarget) return;
    remove(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) });
  }, [deleteTarget, remove]);

  if (isAppsLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading apps…</div>
      </div>
    );
  }

  if (apps.length === 0) {
    return (
      <div className={styles.container}>
        <NoDataFound title="No Apps Yet" description="Create apps first before adding modules." />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <PageHeader
        title="Modules & Sub-Modules"
        subtitle="Define the module tree for each app. Modules map to sidebar nav and RBAC permissions."
        actions={
          activeAppId && (
            <Button variant="primary" onClick={handleAddModule}>
              <Plus size={16} />
              Add module
            </Button>
          )
        }
      />

      {/* App pill tabs */}
      <div className={styles.appTabs}>
        {apps.map((app) => (
          <button
            key={app.id}
            className={`${styles.appTab} ${activeAppId === app.id ? styles.appTabActive : ''}`}
            onClick={() => setSelectedAppId(app.id)}
          >
            {app.name}
          </button>
        ))}
      </div>

      {isModulesLoading ? (
        <div className={styles.loadingModules}>Loading modules…</div>
      ) : tree.length === 0 ? (
        <NoDataFound
          title="No Modules Yet"
          description="Add modules for this app to define its navigation and permission structure."
          buttonText="Add Module"
          onButtonClick={handleAddModule}
          showButtonIcon
        />
      ) : (
        <div className={styles.tableCard}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th style={{ width: 120 }}>WBS</th>
                <th>Module</th>
                <th style={{ width: 160 }}>Code</th>
                <th style={{ width: 100 }}>Type</th>
                <th style={{ width: 80 }}>Icon</th>
                <th>Path</th>
                <th style={{ width: 130 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tree.map((node) => {
                const isExpanded = expandedRows.has(node.id);
                const hasChildren = node.children.length > 0;

                return (
                  <React.Fragment key={node.id}>
                    {/* MOD row */}
                    <tr className={`${styles.row} ${styles.modRow}`}>
                      <td>
                        <div className={styles.wbsCell}>
                          <button
                            className={styles.chevronBtn}
                            onClick={() => hasChildren && toggleRow(node.id)}
                            style={{ visibility: hasChildren ? 'visible' : 'hidden' }}
                            aria-label={isExpanded ? 'Collapse' : 'Expand'}
                          >
                            {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                          </button>
                          <span className={styles.wbsBadge}>{node.wbs_code}</span>
                        </div>
                      </td>
                      <td>
                        <div className={styles.modNameCell}>
                          <span className={styles.modName}>{node.name}</span>
                          {hasChildren && (
                            <span className={styles.childCount}>{node.children.length}</span>
                          )}
                        </div>
                      </td>
                      <td>
                        <code className={styles.codeChip}>{node.code}</code>
                      </td>
                      <td>
                        <span className={styles.typeBadge}>MOD</span>
                      </td>
                      <td className={styles.dimCell}>{node.icon ?? '—'}</td>
                      <td className={styles.pathCell}>{node.path ?? '—'}</td>
                      <td>
                        <div className={styles.rowActions}>
                          <button
                            className={styles.addSubBtn}
                            onClick={() => handleAddSubModule(node.id)}
                            title="Add sub-module"
                          >
                            <GitBranch size={13} />
                          </button>
                          <TableActions
                            onEdit={() => handleEdit(node)}
                            onDelete={() => setDeleteTarget(node)}
                          />
                        </div>
                      </td>
                    </tr>

                    {/* SUBMOD rows */}
                    {isExpanded &&
                      node.children.map((child, idx, arr) => {
                        const isLast = idx === arr.length - 1;
                        return (
                          <tr key={child.id} className={`${styles.row} ${styles.submodRow}`}>
                            <td>
                              <div className={styles.wbsCell} style={{ paddingLeft: '2.25rem' }}>
                                <span className={`${styles.wbsBadge} ${styles.wbsBadgeSub}`}>
                                  {child.wbs_code}
                                </span>
                              </div>
                            </td>
                            <td className={styles.nameTd}>
                              <div className={styles.submodNameCell}>
                                <div
                                  className={`${styles.connector} ${isLast ? styles.connectorLast : ''}`}
                                />
                                <span className={styles.submodName}>{child.name}</span>
                              </div>
                            </td>
                            <td>
                              <code className={styles.codeChip}>{child.code}</code>
                            </td>
                            <td>
                              <span className={`${styles.typeBadge} ${styles.typeBadgeSub}`}>
                                SUBMOD
                              </span>
                            </td>
                            <td className={styles.dimCell}>{child.icon ?? '—'}</td>
                            <td className={styles.pathCell}>{child.path ?? '—'}</td>
                            <td>
                              <TableActions
                                onEdit={() => handleEdit(child)}
                                onDelete={() => setDeleteTarget(child)}
                              />
                            </td>
                          </tr>
                        );
                      })}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <ModuleFormModal
        open={formOpen}
        onClose={handleClose}
        appId={activeAppId ?? ''}
        allModules={allModules}
        rootModules={rootModules}
        defaultParentId={defaultParentId}
        module={editingModule}
      />

      <WarningModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title={`Delete "${deleteTarget?.name}"?`}
        description={
          deleteTarget?.type === ModuleType.MOD
            ? 'This module and all its sub-modules will be removed. Roles using this module will lose access.'
            : 'This sub-module will be removed. Roles using this sub-module will lose access.'
        }
        actionLabel="Delete"
        onAction={handleDelete}
      />
    </div>
  );
};

export default PlatformModulesPage;
