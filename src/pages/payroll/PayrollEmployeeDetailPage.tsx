import React, { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { TrendingUp, TrendingDown, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';

import {
  useEmployeeSalaryStructure,
  useAssignSalary,
  useDryRun,
} from '../../features/payroll/hooks/useEmployeePayroll';
import { useSalaryTemplates } from '../../features/payroll/hooks/usePayrollConfig';
import { getInitials } from '../../utils/stringUtils';
import { formatINR } from '../../utils/numberUtils';

import { ComponentGrid } from './components/ComponentGrid';
import { EmployeeProfileCard } from './components/EmployeeProfileCard';
import { SalaryEditPanel } from './components/SalaryEditPanel';
import { SalaryEmptyState } from './components/SalaryEmptyState';
import styles from './PayrollEmployeeDetailPage.module.scss';

import type { MultiSelectOption } from '../../components/common/MultiSelect/MultiSelect';
import type { SelectOption } from '../../components/common/Select/Select';
import type { EmployeeSalaryComponent } from '../../features/payroll/types/payrollConfigTypes';

const PayrollEmployeeDetailPage: React.FC = () => {
  const { employeeId } = useParams<{ employeeId: string }>();

  // Queries & Mutations
  const { salaryStructure, isLoading, refetch } = useEmployeeSalaryStructure(employeeId ?? null);
  const { templates, isLoading: isTemplatesLoading } = useSalaryTemplates();
  const { assignSalary, isAssigning } = useAssignSalary();
  const { runDryRun } = useDryRun();

  // Local UI State
  const [isEditing, setIsEditing] = useState(false);
  const [ctc, setCtc] = useState('');
  const [templateId, setTemplateId] = useState('');
  const [effectiveFrom, setEffectiveFrom] = useState(new Date().toISOString().split('T')[0]);
  const [previewComponents, setPreviewComponents] = useState<EmployeeSalaryComponent[] | null>(
    null,
  );
  const [selectedComponentIds, setSelectedComponentIds] = useState<string[]>([]);
  const [overrides, setOverrides] = useState<Record<string, number>>({});

  // Handlers
  const handleStartEdit = () => {
    if (salaryStructure) {
      setCtc(salaryStructure.ctc > 0 ? String(salaryStructure.ctc) : '');
    }
    setIsEditing(true);
  };

  const handleCalculate = async () => {
    if (!ctc || !templateId) {
      toast.error('Select a template and enter CTC first.');
      return;
    }

    const result = await runDryRun({
      template_id: templateId,
      ctc: Number(ctc),
      component_ids: selectedComponentIds,
      overrides: Object.keys(overrides).length > 0 ? overrides : undefined,
    });

    const currentTemplate = templates.find((t) => t.id === templateId);

    if (result) {
      const mappedEarnings = result.earnings.map((e, i) => {
        const tc = currentTemplate?.components.find((c) => c.component?.name === e.name);
        return {
          component_name: e.name,
          component_type: 'earning' as const,
          value: e.calculated_value,
          calculation_type: tc?.component?.calculation_type ?? 'fixed',
          is_residual: tc?.component?.is_residual ?? false,
          calculation_priority: i,
        };
      });

      const mappedDeductions = result.deductions.map((d, i) => {
        const tc = currentTemplate?.components.find((c) => c.component?.name === d.name);
        return {
          component_name: d.name,
          component_type: 'deduction' as const,
          value: d.calculated_value,
          calculation_type: tc?.component?.calculation_type ?? 'fixed',
          is_residual: tc?.component?.is_residual ?? false,
          calculation_priority: i,
        };
      });

      setPreviewComponents([...mappedEarnings, ...mappedDeductions]);
    }
  };

  const handleSave = async () => {
    if (!employeeId || !templateId || !ctc || !effectiveFrom) {
      toast.error('Fill in all required fields.');
      return;
    }

    await assignSalary({
      user_id: employeeId,
      template_id: templateId,
      ctc: Number(ctc),
      effective_from: effectiveFrom,
      component_ids: selectedComponentIds.length > 0 ? selectedComponentIds : undefined,
      overrides: Object.keys(overrides).length > 0 ? overrides : undefined,
    });

    setIsEditing(false);
    setPreviewComponents(null);
    setOverrides({});
    refetch();
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setPreviewComponents(null);
    setCtc('');
    setTemplateId('');
    setSelectedComponentIds([]);
    setOverrides({});
  };

  // Memoized Data
  const displayComponents = previewComponents ?? salaryStructure?.components ?? [];
  const earnings = displayComponents.filter((c) => c.component_type === 'earning');
  const deductions = displayComponents.filter((c) => c.component_type === 'deduction');
  const hasSalary = (salaryStructure?.ctc ?? 0) > 0;

  const { displayEarnings, totalEarnings, isExceedingCtc, hasAutoAdjustedResidual } =
    useMemo(() => {
      const ctcNum = Number(isEditing ? ctc : salaryStructure?.ctc || 0);
      let nonResidualSum = 0;

      // First pass: Sum non-residual components
      earnings.forEach((c) => {
        if (!c.is_residual) {
          nonResidualSum += overrides[c.component_name] ?? Number(c.value || 0);
        }
      });

      const mappedEarnings = earnings.map((c) => {
        if (c.is_residual) {
          const autoValue = Math.max(0, ctcNum - nonResidualSum);
          return { ...c, displayValue: autoValue };
        }
        return { ...c, displayValue: overrides[c.component_name] ?? Number(c.value || 0) };
      });

      const autoAdjusted =
        isEditing &&
        Object.keys(overrides).length > 0 &&
        mappedEarnings.some((c) => c.is_residual && c.displayValue !== Number(c.value));

      const residualComp = mappedEarnings.find((c) => c.is_residual);
      const calculatedTotal = nonResidualSum + (residualComp?.displayValue || 0);

      return {
        displayEarnings: mappedEarnings,
        totalEarnings: calculatedTotal,
        isExceedingCtc: nonResidualSum > ctcNum + 0.1,
        hasAutoAdjustedResidual: autoAdjusted,
      };
    }, [earnings, overrides, ctc, isEditing, salaryStructure?.ctc]);

  const templateOptions: SelectOption[] = templates.map((t) => ({
    value: t.id,
    label: t.name,
  }));

  const selectedTemplate = templates.find((t) => t.id === templateId);
  const componentOptions: MultiSelectOption[] =
    selectedTemplate?.components.map((tc) => ({
      value: tc.component?.id || '',
      label: tc.component?.name || '',
    })) || [];

  if (isLoading || isTemplatesLoading) {
    return (
      <div className={styles.loader}>
        <Loader2 className={styles.spin} size={32} />
      </div>
    );
  }

  const emp = salaryStructure?.employee;

  return (
    <div className={styles.page}>
      <EmployeeProfileCard
        emp={emp}
        hasSalary={hasSalary}
        salaryStructure={salaryStructure}
        isEditing={isEditing}
        onStartEdit={handleStartEdit}
        onCancelEdit={handleCancelEdit}
        formatINR={formatINR}
        getInitials={getInitials}
      />

      {isEditing && (
        <SalaryEditPanel
          hasSalary={hasSalary}
          templateOptions={templateOptions}
          templateId={templateId}
          onTemplateChange={(v) => {
            setTemplateId(v);
            setPreviewComponents(null);
            setSelectedComponentIds([]);
            setOverrides({});
          }}
          componentOptions={componentOptions}
          selectedComponentIds={selectedComponentIds}
          onComponentIdsChange={(v) => {
            setSelectedComponentIds(v);
            setPreviewComponents(null);
          }}
          ctc={ctc}
          onCtcChange={(v) => {
            setCtc(v);
            setPreviewComponents(null);
          }}
          onCalculate={handleCalculate}
          effectiveFrom={effectiveFrom}
          onEffectiveFromChange={setEffectiveFrom}
          onSave={handleSave}
          onCancel={handleCancelEdit}
          isAssigning={isAssigning}
          previewComponents={previewComponents}
          isExceedingCtc={isExceedingCtc}
          hasAutoAdjustedResidual={hasAutoAdjustedResidual}
          totalEarnings={totalEarnings}
          formatCurrency={formatINR}
        />
      )}

      {!hasSalary && !isEditing && <SalaryEmptyState onAssign={handleStartEdit} />}

      {(hasSalary || previewComponents) && earnings.length > 0 && (
        <div className={styles.sectionCard}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionIconEarnings}>
              <TrendingUp size={16} />
            </div>
            <h3 className={styles.sectionTitle}>Earnings</h3>
          </div>
          <ComponentGrid
            components={displayEarnings}
            isEditing={isEditing}
            overrides={overrides}
            onOverrideChange={(name, val) => setOverrides((prev) => ({ ...prev, [name]: val }))}
            formatCurrency={formatINR}
          />
        </div>
      )}

      {(hasSalary || previewComponents) && deductions.length > 0 && (
        <div className={styles.sectionCard}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionIconDeductions}>
              <TrendingDown size={16} />
            </div>
            <h3 className={styles.sectionTitle}>Deduction</h3>
          </div>
          <ComponentGrid
            components={deductions}
            isEditing={isEditing}
            overrides={overrides}
            onOverrideChange={(name, val) => setOverrides((prev) => ({ ...prev, [name]: val }))}
            formatCurrency={formatINR}
          />
        </div>
      )}
    </div>
  );
};

export default PayrollEmployeeDetailPage;
