import React, { useCallback, useMemo, useState } from 'react';
import { ChevronDown, ChevronRight, GitBranch, GripVertical, Plus } from 'lucide-react';

import {
  Button,
  NoDataFound,
  PageHeader,
  TableActions,
  WarningModal,
} from '../../components/common';
import { showToast } from '../../features/ToastFeature/ShowToast';
import { useAppsList } from '../../features/platform/apps/hooks';
import {
  useModulesByApp,
  useDeleteModule,
  useReorderModules,
} from '../../features/platform/appModules/hooks';
import { ModuleFormModal } from '../../features/platform/appModules/ModuleFormModal';
import { ModuleType } from '../../features/platform/appModules/types';

import styles from './PlatformModulesPage.module.scss';

import type {
  AppModule,
  ModuleTreeNode,
  ReorderModuleItem,
} from '../../features/platform/appModules/types';

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

type DropMode = 'before' | 'after' | 'into';

interface DropIndicator {
  targetId: string;
  mode: DropMode;
}

const wbsSuffix = (wbs: string): number => parseInt(wbs.split('.').at(-1) ?? '0', 10) || 0;

/**
 * Computes the full batch of {id, parent_id, wbs_code, type} updates needed to
 * apply a single drag-and-drop move: reordering siblings, promoting a
 * sub-module to a top-level module (drop target is a root row), or demoting a
 * module into a sub-module (dropped "into" another module's middle band).
 * Renumbers every sibling list touched by the move so wbs_code stays gap-free.
 */
const computeReorderBatch = (
  allModules: AppModule[],
  draggedId: string,
  targetId: string,
  mode: DropMode,
): { updates: ReorderModuleItem[] } | { error: string } => {
  const dragged = allModules.find((m) => m.id === draggedId);
  const target = allModules.find((m) => m.id === targetId);
  if (!dragged || !target || dragged.id === target.id) return { updates: [] };

  const oldParentId = dragged.parent_id;
  const newParentId =
    mode === 'into' ? target.id : target.type === ModuleType.MOD ? null : target.parent_id;

  if (mode === 'into' && target.type !== ModuleType.MOD) return { updates: [] };

  const newType = newParentId ? ModuleType.SUBMOD : ModuleType.MOD;

  // Demoting a module (MOD → SUBMOD) is only allowed once it has no children left.
  if (dragged.type === ModuleType.MOD && newType === ModuleType.SUBMOD) {
    const children = allModules.filter((m) => m.parent_id === dragged.id);
    if (children.length > 0) {
      return { error: `Move "${dragged.name}"'s sub-modules out first before nesting it.` };
    }
  }

  const siblingsOf = (parentId: string | null) =>
    allModules
      .filter((m) => m.parent_id === parentId && m.id !== dragged.id)
      .sort((a, b) => wbsSuffix(a.wbs_code) - wbsSuffix(b.wbs_code));

  let newSiblings = siblingsOf(newParentId);
  if (mode === 'into') {
    newSiblings = [...newSiblings, dragged];
  } else {
    const targetIndex = newSiblings.findIndex((m) => m.id === target.id);
    const insertAt = mode === 'before' ? targetIndex : targetIndex + 1;
    newSiblings = [...newSiblings.slice(0, insertAt), dragged, ...newSiblings.slice(insertAt)];
  }

  const newParentWbs = newParentId ? allModules.find((p) => p.id === newParentId)?.wbs_code : null;
  const updates: ReorderModuleItem[] = newSiblings.map((m, idx) => ({
    id: m.id,
    parent_id: newParentId,
    wbs_code: newParentId ? `${newParentWbs}.${idx + 1}` : String(idx + 1),
    type: newType,
  }));

  // Close the gap in the old parent's children if the item left it for a different parent.
  if (oldParentId && oldParentId !== newParentId) {
    const oldParent = allModules.find((p) => p.id === oldParentId);
    if (oldParent) {
      updates.push(
        ...siblingsOf(oldParentId).map((m, idx) => ({
          id: m.id,
          parent_id: oldParentId,
          wbs_code: `${oldParent.wbs_code}.${idx + 1}`,
          type: ModuleType.SUBMOD,
        })),
      );
    }
  }

  // Close the gap in the root list if the item left it to become nested.
  if (!oldParentId && newParentId) {
    updates.push(
      ...siblingsOf(null).map((m, idx) => ({
        id: m.id,
        parent_id: null,
        wbs_code: String(idx + 1),
        type: ModuleType.MOD,
      })),
    );
  }

  // Cascade: any root module whose own wbs_code just changed must have its
  // children's wbs_code recomputed too, since a child's wbs encodes its
  // parent's wbs as a prefix (e.g. "9.1" under root "9"). Without this, a
  // root reorder leaves every other root's children stamped with a stale
  // prefix pointing at the parent's old position.
  for (const rootUpdate of updates.filter((u) => u.type === ModuleType.MOD)) {
    const before = allModules.find((m) => m.id === rootUpdate.id);
    if (!before || before.wbs_code === rootUpdate.wbs_code) continue;

    const children = allModules
      .filter((m) => m.parent_id === rootUpdate.id && m.id !== dragged.id)
      .sort((a, b) => wbsSuffix(a.wbs_code) - wbsSuffix(b.wbs_code));

    children.forEach((c, idx) => {
      updates.push({
        id: c.id,
        parent_id: rootUpdate.id,
        wbs_code: `${rootUpdate.wbs_code}.${idx + 1}`,
        type: ModuleType.SUBMOD,
      });
    });
  }

  return { updates };
};

const PlatformModulesPage = () => {
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [formOpen, setFormOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<AppModule | null>(null);
  const [defaultParentId, setDefaultParentId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AppModule | null>(null);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dropIndicator, setDropIndicator] = useState<DropIndicator | null>(null);

  const { data: appsResponse, isLoading: isAppsLoading } = useAppsList();
  const apps = useMemo(() => appsResponse?.data ?? [], [appsResponse]);

  const activeAppId = selectedAppId ?? apps[0]?.id ?? null;

  const { data: modulesResponse, isLoading: isModulesLoading } = useModulesByApp(activeAppId);
  const allModules = useMemo(() => modulesResponse?.data ?? [], [modulesResponse]);

  const { mutate: remove } = useDeleteModule(activeAppId ?? '');
  const { mutate: reorder } = useReorderModules(activeAppId ?? '');

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

  const handleDragStart = useCallback((e: React.DragEvent, mod: AppModule) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', mod.id);
    setDraggedId(mod.id);
  }, []);

  const handleDragEnd = useCallback(() => {
    setDraggedId(null);
    setDropIndicator(null);
  }, []);

  const handleDragOver = useCallback(
    (e: React.DragEvent, target: AppModule) => {
      e.preventDefault();
      if (!draggedId || draggedId === target.id) return;

      const rect = e.currentTarget.getBoundingClientRect();
      const ratio = (e.clientY - rect.top) / rect.height;

      let mode: DropMode;
      if (target.type === ModuleType.MOD) {
        mode = ratio < 0.25 ? 'before' : ratio > 0.75 ? 'after' : 'into';
      } else {
        mode = ratio < 0.5 ? 'before' : 'after';
      }
      setDropIndicator({ targetId: target.id, mode });
    },
    [draggedId],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent, target: AppModule) => {
      e.preventDefault();
      const indicator = dropIndicator;
      setDraggedId(null);
      setDropIndicator(null);

      if (!draggedId || !indicator || indicator.targetId !== target.id || draggedId === target.id) {
        return;
      }

      const result = computeReorderBatch(allModules, draggedId, target.id, indicator.mode);
      if ('error' in result) {
        showToast(result.error, 'error');
        return;
      }
      if (result.updates.length === 0) return;

      if (indicator.mode === 'into') {
        setExpandedRows((prev) => new Set([...prev, target.id]));
      }
      reorder({ updates: result.updates });
    },
    [draggedId, dropIndicator, allModules, reorder],
  );

  const rowDropClass = (mod: AppModule) => {
    if (dropIndicator?.targetId !== mod.id) return '';
    return dropIndicator.mode === 'into'
      ? styles.dropInto
      : dropIndicator.mode === 'before'
        ? styles.dropBefore
        : styles.dropAfter;
  };

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
        subtitle="Define the module tree for each app. Drag rows to reorder, nest, or promote them. Modules map to sidebar nav and RBAC permissions."
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
                    <tr
                      className={`${styles.row} ${styles.modRow} ${draggedId === node.id ? styles.dragging : ''} ${rowDropClass(node)}`}
                      draggable
                      onDragStart={(e) => handleDragStart(e, node)}
                      onDragEnd={handleDragEnd}
                      onDragOver={(e) => handleDragOver(e, node)}
                      onDrop={(e) => handleDrop(e, node)}
                    >
                      <td>
                        <div className={styles.wbsCell}>
                          <span className={styles.dragHandle} title="Drag to reorder or nest">
                            <GripVertical size={14} />
                          </span>
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
                          <tr
                            key={child.id}
                            className={`${styles.row} ${styles.submodRow} ${draggedId === child.id ? styles.dragging : ''} ${rowDropClass(child)}`}
                            draggable
                            onDragStart={(e) => handleDragStart(e, child)}
                            onDragEnd={handleDragEnd}
                            onDragOver={(e) => handleDragOver(e, child)}
                            onDrop={(e) => handleDrop(e, child)}
                          >
                            <td>
                              <div className={styles.wbsCell} style={{ paddingLeft: '2.25rem' }}>
                                <span
                                  className={styles.dragHandle}
                                  title="Drag to reorder or promote"
                                >
                                  <GripVertical size={13} />
                                </span>
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
