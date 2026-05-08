import React, { useMemo, useState } from 'react';
import { Save, X, Users, Building2, Info } from 'lucide-react';

import { MultiSelect, Select, Button } from '../../../../components/common';
import { StatusBadge } from '../../../../components/common/StatusBadge/StatusBadge';
import { useRules } from '../hooks/useRules';
import { useAssignments } from '../hooks/useAssignments';
import { useDepartments } from '../../../department/hooks/useDepartments';
import { useEmployeesDropdown } from '../../../../hooks/useEmployees';

import styles from './AssignTab.module.scss';

const getInitials = (name: string) =>
  name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

const AssignTab: React.FC<{ setHeaderActions: (actions: React.ReactNode) => void }> = ({
  setHeaderActions,
}) => {
  const [selectedRuleId, setSelectedRuleId] = useState('');
  const [selectedDeptIds, setSelectedDeptIds] = useState<(string | number)[]>([]);
  const [selectedEmpIds, setSelectedEmpIds] = useState<(string | number)[]>([]);

  const { rules, isLoading: rulesLoading } = useRules();
  const {
    assignedDeptIds,
    assignedEmpIds,
    isLoadingAssignments,
    assignDepartments,
    assignEmployees,
    isAssigning,
  } = useAssignments(selectedRuleId);
  const { data: deptResponse, isLoading: isDepartmentsLoading } = useDepartments({ limit: 200 });
  const { data: empResponse, isLoading: isEmployeesLoading } = useEmployeesDropdown();

  const departments = useMemo(() => deptResponse?.data?.data ?? [], [deptResponse?.data?.data]);
  const employees = useMemo(() => empResponse?.data ?? [], [empResponse?.data]);

  const ruleOptions = useMemo(() => rules.map((r) => ({ label: r.name, value: r.id })), [rules]);

  // Exclude already-assigned from the selectable options
  const deptOptions = useMemo(
    () =>
      departments
        .filter((d) => !assignedDeptIds.includes(d.id))
        .map((d) => ({ label: d.name, value: d.id })),
    [departments, assignedDeptIds],
  );
  const empOptions = useMemo(
    () =>
      employees
        .filter((e) => !assignedEmpIds.includes(e.id))
        .map((e) => ({ label: e.name, value: e.id })),
    [employees, assignedEmpIds],
  );

  // Resolve names for assigned (existing) items
  const assignedDeptItems = departments.filter((d) => assignedDeptIds.includes(d.id));
  const assignedEmpItems = employees.filter((e) => assignedEmpIds.includes(e.id));

  // Resolve names for newly selected items
  const newDeptItems = departments.filter((d) => selectedDeptIds.includes(d.id));
  const newEmpItems = employees.filter((e) => selectedEmpIds.includes(e.id));

  const hasNewSelection = selectedDeptIds.length > 0 || selectedEmpIds.length > 0;

  const handleRuleChange = (ruleId: string) => {
    setSelectedRuleId(ruleId);
    setSelectedDeptIds([]);
    setSelectedEmpIds([]);
  };

  const handleSave = React.useCallback(async () => {
    if (!selectedRuleId || !hasNewSelection) return;
    try {
      if (selectedDeptIds.length > 0) {
        await assignDepartments(selectedDeptIds as string[]);
      }
      if (selectedEmpIds.length > 0) {
        await assignEmployees(selectedEmpIds as string[]);
      }
      setSelectedDeptIds([]);
      setSelectedEmpIds([]);
    } catch {
      // error handled in hook
    }
  }, [
    selectedRuleId,
    hasNewSelection,
    selectedDeptIds,
    selectedEmpIds,
    assignDepartments,
    assignEmployees,
  ]);

  React.useEffect(() => {
    setHeaderActions(
      <Button
        variant="primary"
        onClick={handleSave}
        disabled={!selectedRuleId || !hasNewSelection || isAssigning}
      >
        <Save size={16} style={{ marginRight: '8px' }} />
        {isAssigning ? 'Saving...' : 'Save'}
      </Button>,
    );
  }, [handleSave, selectedRuleId, hasNewSelection, isAssigning, setHeaderActions]);

  const renderDeptPanel = () => (
    <div className={styles.previewPanel}>
      <div className={styles.panelHead}>
        <Building2 size={14} />
        <span>Departments</span>
        {assignedDeptItems.length + newDeptItems.length > 0 && (
          <span className={styles.badge}>{assignedDeptItems.length + newDeptItems.length}</span>
        )}
        {newDeptItems.length > 0 && (
          <button type="button" className={styles.clearAll} onClick={() => setSelectedDeptIds([])}>
            Clear new
          </button>
        )}
      </div>

      <div className={styles.listBody}>
        {assignedDeptItems.length === 0 && newDeptItems.length === 0 ? (
          <div className={styles.panelEmpty}>
            <Building2 size={20} />
            <span>
              {isLoadingAssignments && selectedRuleId ? 'Loading…' : 'No departments assigned'}
            </span>
          </div>
        ) : (
          <>
            {assignedDeptItems.length > 0 && (
              <>
                <div className={styles.panelDivider}>Already assigned</div>
                {assignedDeptItems.map((dept) => (
                  <div key={dept.id} className={styles.listRow}>
                    <div className={styles.deptIconSm}>
                      <Users size={13} />
                    </div>
                    <div className={styles.rowMeta}>
                      <span className={styles.rowName}>{dept.name}</span>
                      <span className={styles.rowSub}>{dept.code}</span>
                    </div>
                    <StatusBadge status={dept.status} className={styles.rowBadge} />
                    <span className={styles.assignedTag}>Assigned</span>
                  </div>
                ))}
              </>
            )}
            {newDeptItems.length > 0 && (
              <>
                <div className={styles.panelDivider}>To be assigned</div>
                {newDeptItems.map((dept) => (
                  <div key={dept.id} className={styles.listRow}>
                    <div className={styles.deptIconSm}>
                      <Users size={13} />
                    </div>
                    <div className={styles.rowMeta}>
                      <span className={styles.rowName}>{dept.name}</span>
                      <span className={styles.rowSub}>{dept.code}</span>
                    </div>
                    <StatusBadge status={dept.status} className={styles.rowBadge} />
                    <button
                      type="button"
                      className={styles.rowRemove}
                      onClick={() =>
                        setSelectedDeptIds((prev) => prev.filter((id) => id !== dept.id))
                      }
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );

  const renderEmpPanel = () => (
    <div className={styles.previewPanel}>
      <div className={styles.panelHead}>
        <Users size={14} />
        <span>Employees</span>
        {assignedEmpItems.length + newEmpItems.length > 0 && (
          <span className={styles.badge}>{assignedEmpItems.length + newEmpItems.length}</span>
        )}
        {newEmpItems.length > 0 && (
          <button type="button" className={styles.clearAll} onClick={() => setSelectedEmpIds([])}>
            Clear new
          </button>
        )}
      </div>

      <div className={styles.listBody}>
        {assignedEmpItems.length === 0 && newEmpItems.length === 0 ? (
          <div className={styles.panelEmpty}>
            <Users size={20} />
            <span>
              {isLoadingAssignments && selectedRuleId ? 'Loading…' : 'No employees assigned'}
            </span>
          </div>
        ) : (
          <>
            {assignedEmpItems.length > 0 && (
              <>
                <div className={styles.panelDivider}>Already assigned</div>
                {assignedEmpItems.map((emp) => (
                  <div key={emp.id} className={styles.listRow}>
                    <div className={styles.empAvatar}>
                      {emp.profile ? (
                        <img src={emp.profile} alt={emp.name} className={styles.avatarImg} />
                      ) : (
                        <span>{getInitials(emp.name)}</span>
                      )}
                    </div>
                    <div className={styles.rowMeta}>
                      <span className={styles.rowName}>{emp.name}</span>
                    </div>
                    <span className={styles.assignedTag}>Assigned</span>
                  </div>
                ))}
              </>
            )}
            {newEmpItems.length > 0 && (
              <>
                <div className={styles.panelDivider}>To be assigned</div>
                {newEmpItems.map((emp) => (
                  <div key={emp.id} className={styles.listRow}>
                    <div className={styles.empAvatar}>
                      {emp.profile ? (
                        <img src={emp.profile} alt={emp.name} className={styles.avatarImg} />
                      ) : (
                        <span>{getInitials(emp.name)}</span>
                      )}
                    </div>
                    <div className={styles.rowMeta}>
                      <span className={styles.rowName}>{emp.name}</span>
                    </div>
                    <button
                      type="button"
                      className={styles.rowRemove}
                      onClick={() =>
                        setSelectedEmpIds((prev) => prev.filter((id) => id !== emp.id))
                      }
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );

  return (
    <div className={styles.container}>
      <div className={styles.formCard}>
        <div className={styles.formGrid}>
          <Select
            label="Attendance Rule"
            options={ruleOptions}
            value={selectedRuleId}
            onChange={(v) => handleRuleChange(v as string)}
            placeholder="Select a rule to assign"
            required
            disabled={rulesLoading}
          />
          <MultiSelect
            label="Departments"
            options={deptOptions}
            value={selectedDeptIds}
            onChange={setSelectedDeptIds}
            placeholder={isDepartmentsLoading ? 'Loading...' : 'Add departments...'}
            disabled={isDepartmentsLoading || !selectedRuleId}
          />
          <MultiSelect
            label="Employees"
            options={empOptions}
            value={selectedEmpIds}
            onChange={setSelectedEmpIds}
            placeholder={isEmployeesLoading ? 'Loading...' : 'Add employees...'}
            disabled={isEmployeesLoading || !selectedRuleId}
          />
        </div>
        <div className={styles.selectionNote}>
          <Info size={13} className={styles.noteIcon} />
          {selectedRuleId
            ? 'Select departments or employees to assign to this rule.'
            : 'Select a rule first to view and manage its assignments.'}
        </div>
      </div>

      <div className={styles.previewRow}>
        {renderDeptPanel()}
        {renderEmpPanel()}
      </div>
    </div>
  );
};

export default AssignTab;
