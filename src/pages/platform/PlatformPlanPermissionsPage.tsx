import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ChevronDown, Save } from 'lucide-react';

import { Button, PageHeader } from '../../components/common';
import { showToast } from '../../features/ToastFeature/ShowToast';
import { useAppsList } from '../../features/platform/apps/hooks';
import { useActionsList } from '../../features/platform/actions/hooks';
import {
  usePlanModules,
  usePlanModuleActions,
  useAllModules,
} from '../../features/platform/planPermissions/hooks';
import {
  createPlanModule,
  updatePlanModule,
  createPlanModuleAction,
  updatePlanModuleAction,
} from '../../features/platform/planPermissions/api';
import { usePlansList } from '../../features/platform/plans/hooks';

import styles from './PlatformPlanPermissionsPage.module.scss';

import type { AppModule } from '../../features/platform/appModules/types';
import type { Action } from '../../features/platform/actions/types';

const SelectAllCheckbox = ({
  checked,
  indeterminate,
  onChange,
  className,
}: {
  checked: boolean;
  indeterminate: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
}) => {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.indeterminate = indeterminate;
  }, [indeterminate]);
  return (
    <input
      ref={ref}
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      className={className}
    />
  );
};

type ActionState = { enabled: boolean; id?: string };
type ModuleRow = {
  included: boolean;
  planModuleId?: string;
  actions: Record<string, ActionState>;
};
type PermState = Record<string, ModuleRow>;

const sortByWbs = (a: AppModule, b: AppModule) => {
  const parts = (wbs: string) => wbs.split('.').map(Number);
  const pa = parts(a.wbs_code);
  const pb = parts(b.wbs_code);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const diff = (pa[i] ?? 0) - (pb[i] ?? 0);
    if (diff !== 0) return diff;
  }
  return 0;
};

const buildInitialState = (
  allModules: AppModule[],
  allActions: Action[],
  planModules: { id: string; module_id: string; enabled: boolean }[],
  planModuleActions: { id: string; module_id: string; action_id: string; enabled: boolean }[],
): PermState => {
  const state: PermState = {};
  for (const mod of allModules) {
    const pm = planModules.find((p) => p.module_id === mod.id);
    const actionMap: Record<string, ActionState> = {};
    for (const action of allActions) {
      const pma = planModuleActions.find(
        (a) => a.module_id === mod.id && a.action_id === action.id,
      );
      actionMap[action.id] = { enabled: pma?.enabled ?? false, id: pma?.id };
    }
    state[mod.id] = {
      included: pm?.enabled ?? false,
      planModuleId: pm?.id,
      actions: actionMap,
    };
  }
  return state;
};

const PlatformPlanPermissionsPage = () => {
  const { planId } = useParams<{ planId: string }>();
  const navigate = useNavigate();

  const { data: plansResp } = usePlansList();
  const { data: appsResp } = useAppsList();
  const { data: modulesResp } = useAllModules();
  const { data: actionsResp } = useActionsList();
  const { data: planModulesResp, isLoading: pmLoading } = usePlanModules(planId!);
  const { data: planModuleActionsResp, isLoading: pmaLoading } = usePlanModuleActions(planId!);

  const plan = useMemo(
    () => plansResp?.data?.find((p) => p.id === planId) ?? null,
    [plansResp, planId],
  );
  const apps = useMemo(() => appsResp?.data ?? [], [appsResp]);
  const allModules = useMemo(() => modulesResp?.data ?? [], [modulesResp]);
  const allActions = useMemo(() => actionsResp?.data ?? [], [actionsResp]);
  const planModules = useMemo(() => planModulesResp?.data ?? [], [planModulesResp]);
  const planModuleActions = useMemo(
    () => planModuleActionsResp?.data ?? [],
    [planModuleActionsResp],
  );

  const [permState, setPermState] = useState<PermState>({});
  const [originalState, setOriginalState] = useState<PermState>({});
  const [isSaving, setIsSaving] = useState(false);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());

  const toggleExpanded = useCallback((moduleId: string) => {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      if (next.has(moduleId)) next.delete(moduleId);
      else next.add(moduleId);
      return next;
    });
  }, []);

  const isLoading = pmLoading || pmaLoading;

  useEffect(() => {
    if (!allModules.length || !allActions.length || isLoading) return;
    const initial = buildInitialState(allModules, allActions, planModules, planModuleActions);
    setPermState(initial);
    setOriginalState(initial);
  }, [allModules, allActions, planModules, planModuleActions, isLoading]);

  const childMap = useMemo(() => {
    const map = new Map<string, string[]>();
    for (const mod of allModules) {
      if (mod.parent_id) {
        const existing = map.get(mod.parent_id) ?? [];
        existing.push(mod.id);
        map.set(mod.parent_id, existing);
      }
    }
    return map;
  }, [allModules]);

  const setIncluded = useCallback(
    (moduleId: string, included: boolean) => {
      setPermState((prev) => {
        const next = { ...prev, [moduleId]: { ...prev[moduleId], included } };
        if (!included) {
          for (const childId of childMap.get(moduleId) ?? []) {
            if (next[childId]) next[childId] = { ...next[childId], included: false };
          }
        }
        return next;
      });
    },
    [childMap],
  );

  const setActionEnabled = useCallback((moduleId: string, actionId: string, enabled: boolean) => {
    setPermState((prev) => ({
      ...prev,
      [moduleId]: {
        ...prev[moduleId],
        actions: {
          ...prev[moduleId].actions,
          [actionId]: { ...prev[moduleId].actions[actionId], enabled },
        },
      },
    }));
  }, []);

  const handleSave = async () => {
    if (!planId) return;
    setIsSaving(true);
    try {
      const calls: Promise<{ success: boolean; data: { id: string } }>[] = [];
      const stateUpdates: Array<() => void> = [];

      for (const [moduleId, current] of Object.entries(permState)) {
        const original = originalState[moduleId];

        // Plan module
        if (!current.planModuleId) {
          if (current.included) {
            calls.push(
              createPlanModule({ plan_id: planId, module_id: moduleId, enabled: true }).then(
                (res) => {
                  stateUpdates.push(() =>
                    setPermState((prev) => ({
                      ...prev,
                      [moduleId]: { ...prev[moduleId], planModuleId: res.data.id },
                    })),
                  );
                  return res;
                },
              ),
            );
          }
        } else if (current.included !== original?.included) {
          calls.push(updatePlanModule(current.planModuleId, { enabled: current.included }));
        }

        // Plan module actions
        for (const [actionId, actionState] of Object.entries(current.actions)) {
          const origAction = original?.actions[actionId];
          if (!actionState.id) {
            if (actionState.enabled) {
              calls.push(
                createPlanModuleAction({
                  plan_id: planId,
                  module_id: moduleId,
                  action_id: actionId,
                  enabled: true,
                }).then((res) => {
                  stateUpdates.push(() =>
                    setPermState((prev) => ({
                      ...prev,
                      [moduleId]: {
                        ...prev[moduleId],
                        actions: {
                          ...prev[moduleId].actions,
                          [actionId]: { enabled: true, id: res.data.id },
                        },
                      },
                    })),
                  );
                  return res;
                }),
              );
            }
          } else if (actionState.enabled !== origAction?.enabled) {
            calls.push(updatePlanModuleAction(actionState.id, { enabled: actionState.enabled }));
          }
        }
      }

      await Promise.all(calls);
      stateUpdates.forEach((fn) => fn());
      setOriginalState(permState);
      showToast('Permissions saved', 'success');
    } catch {
      showToast('Failed to save permissions', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const setAllIncluded = useCallback((included: boolean) => {
    setPermState((prev) => {
      const next = { ...prev };
      for (const moduleId of Object.keys(next)) {
        next[moduleId] = { ...next[moduleId], included };
      }
      return next;
    });
  }, []);

  const setAllActionEnabled = useCallback((actionId: string, enabled: boolean) => {
    setPermState((prev) => {
      const next = { ...prev };
      for (const moduleId of Object.keys(next)) {
        next[moduleId] = {
          ...next[moduleId],
          actions: {
            ...next[moduleId].actions,
            [actionId]: { ...next[moduleId].actions[actionId], enabled },
          },
        };
      }
      return next;
    });
  }, []);

  const moduleIds = useMemo(() => Object.keys(permState), [permState]);

  const includeStats = useMemo(() => {
    const total = moduleIds.length;
    if (total === 0) return { checked: false, indeterminate: false };
    const count = moduleIds.filter((id) => permState[id]?.included).length;
    return { checked: count === total, indeterminate: count > 0 && count < total };
  }, [permState, moduleIds]);

  const actionStats = useMemo(() => {
    const stats: Record<string, { checked: boolean; indeterminate: boolean }> = {};
    for (const action of allActions) {
      const total = moduleIds.length;
      if (total === 0) {
        stats[action.id] = { checked: false, indeterminate: false };
        continue;
      }
      const count = moduleIds.filter((id) => permState[id]?.actions[action.id]?.enabled).length;
      stats[action.id] = { checked: count === total, indeterminate: count > 0 && count < total };
    }
    return stats;
  }, [permState, moduleIds, allActions]);

  // Group modules by app with parent/child structure, sorted by WBS
  const appGroups = useMemo(() => {
    const sorted = [...allModules].sort(sortByWbs);
    return apps
      .map((app) => {
        const appMods = sorted.filter((m) => m.app_id === app.id);
        const appModIds = new Set(appMods.map((m) => m.id));
        const topLevel = appMods.filter((m) => !m.parent_id || !appModIds.has(m.parent_id));
        return {
          app,
          modules: topLevel.map((mod) => ({
            mod,
            children: appMods.filter((m) => m.parent_id === mod.id),
          })),
        };
      })
      .filter((g) => g.modules.length > 0);
  }, [apps, allModules]);

  const hasChanges = useMemo(() => {
    for (const [moduleId, current] of Object.entries(permState)) {
      const original = originalState[moduleId];
      if (!original) return true;
      if (current.included !== original.included) return true;
      for (const [actionId, { enabled }] of Object.entries(current.actions)) {
        if (enabled !== original.actions[actionId]?.enabled) return true;
      }
    }
    return false;
  }, [permState, originalState]);

  return (
    <div className={styles.container}>
      <button className={styles.backLink} onClick={() => navigate('/platform/plans')}>
        <ArrowLeft size={14} />
        Back to Plans
      </button>

      <PageHeader
        title={plan ? `${plan.name} — Permissions` : 'Plan Permissions'}
        subtitle="Configure which modules and actions are available in this plan."
      />

      {isLoading || !allActions.length ? (
        <div className={styles.loading}>
          {!allActions.length && !isLoading
            ? 'No actions found. Add actions under Setup → Actions first.'
            : 'Loading…'}
        </div>
      ) : appGroups.length === 0 ? (
        <div className={styles.loading}>
          No modules found. Add modules under App & Modules → Modules first.
        </div>
      ) : (
        <div className={styles.tableCard}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th style={{ minWidth: 260 }}>Module</th>
                <th className={styles.includeCell}>
                  <div className={styles.thCell}>
                    <SelectAllCheckbox
                      checked={includeStats.checked}
                      indeterminate={includeStats.indeterminate}
                      onChange={setAllIncluded}
                      className={styles.checkbox}
                    />
                    Include
                  </div>
                </th>
                {allActions.map((action) => (
                  <th key={action.id} className={styles.checkCell}>
                    <div className={styles.thCell}>
                      <SelectAllCheckbox
                        checked={actionStats[action.id]?.checked ?? false}
                        indeterminate={actionStats[action.id]?.indeterminate ?? false}
                        onChange={(checked) => setAllActionEnabled(action.id, checked)}
                        className={styles.checkbox}
                      />
                      {action.name}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {appGroups.map(({ app, modules }) => (
                <React.Fragment key={app.id}>
                  <tr className={styles.appGroupRow}>
                    <td colSpan={2 + allActions.length}>{app.name}</td>
                  </tr>
                  {modules.map(({ mod: parent, children }) => {
                    const parentRow = permState[parent.id];
                    if (!parentRow) return null;
                    const hasChildren = children.length > 0;
                    const isExpanded = expandedModules.has(parent.id);
                    return (
                      <React.Fragment key={parent.id}>
                        {/* Parent row */}
                        <tr
                          className={`${styles.moduleRow} ${!parentRow.included ? styles.disabled : ''}`}
                        >
                          <td>
                            <div className={styles.moduleName}>
                              {hasChildren ? (
                                <button
                                  className={styles.chevronBtn}
                                  onClick={() => toggleExpanded(parent.id)}
                                  aria-label={isExpanded ? 'Collapse' : 'Expand'}
                                >
                                  <ChevronDown
                                    size={12}
                                    className={`${styles.chevronIcon} ${isExpanded ? styles.chevronIconOpen : ''}`}
                                  />
                                </button>
                              ) : (
                                <span className={styles.chevronPlaceholder} />
                              )}
                              <span className={styles.wbsBadge}>{parent.wbs_code}</span>
                              {parent.name}
                              {hasChildren && (
                                <span className={styles.childCount}>{children.length}</span>
                              )}
                            </div>
                          </td>
                          <td className={styles.includeCell}>
                            <input
                              type="checkbox"
                              className={styles.includeCheckbox}
                              checked={parentRow.included}
                              onChange={(e) => setIncluded(parent.id, e.target.checked)}
                            />
                          </td>
                          {allActions.map((action) => (
                            <td key={action.id} className={styles.checkCell}>
                              <input
                                type="checkbox"
                                className={styles.checkbox}
                                checked={parentRow.actions[action.id]?.enabled ?? false}
                                disabled={!parentRow.included}
                                onChange={(e) =>
                                  setActionEnabled(parent.id, action.id, e.target.checked)
                                }
                              />
                            </td>
                          ))}
                        </tr>

                        {/* Child rows — visible only when parent is expanded */}
                        {isExpanded &&
                          children.map((child) => {
                            const childRow = permState[child.id];
                            if (!childRow) return null;
                            const effectivelyDisabled = !childRow.included || !parentRow.included;
                            return (
                              <tr
                                key={child.id}
                                className={`${styles.moduleRow} ${styles.childModuleRow} ${effectivelyDisabled ? styles.disabled : ''}`}
                              >
                                <td>
                                  <div className={`${styles.moduleName} ${styles.moduleNameChild}`}>
                                    <span className={styles.childIndent} />
                                    <span className={styles.wbsBadge}>{child.wbs_code}</span>
                                    {child.name}
                                  </div>
                                </td>
                                <td className={styles.includeCell}>
                                  <input
                                    type="checkbox"
                                    className={styles.includeCheckbox}
                                    checked={childRow.included}
                                    disabled={!parentRow.included}
                                    onChange={(e) => setIncluded(child.id, e.target.checked)}
                                  />
                                </td>
                                {allActions.map((action) => (
                                  <td key={action.id} className={styles.checkCell}>
                                    <input
                                      type="checkbox"
                                      className={styles.checkbox}
                                      checked={childRow.actions[action.id]?.enabled ?? false}
                                      disabled={effectivelyDisabled}
                                      onChange={(e) =>
                                        setActionEnabled(child.id, action.id, e.target.checked)
                                      }
                                    />
                                  </td>
                                ))}
                              </tr>
                            );
                          })}
                      </React.Fragment>
                    );
                  })}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className={styles.saveRow}>
        <Button
          variant="secondary"
          onClick={() => setPermState(originalState)}
          disabled={!hasChanges || isSaving}
        >
          Discard
        </Button>
        <Button
          variant="primary"
          onClick={handleSave}
          isLoading={isSaving}
          disabled={!hasChanges || isSaving}
        >
          <Save size={15} />
          Save changes
        </Button>
      </div>

      <p className={styles.hint}>
        Include = module is available in this plan · Checkboxes = allowed actions per module
      </p>
    </div>
  );
};

export default PlatformPlanPermissionsPage;
