import React, { useState } from 'react';
import { Settings2, Shield, LayoutList, FileText, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';

import { PageHeader } from '../../components/common/PageHeader/PageHeader';
import { Button } from '../../components/common/Button/Button';
import { Accordion } from '../../components/common/Accordion/Accordion';
import { WarningModal } from '../../components/common/WarningModal/WarningModal';
import { AlertModal } from '../../components/common/AlertModal/AlertModal';
import { PayrollCycleSetup } from '../../features/payroll/components/PayrollCycleSetup/PayrollCycleSetup';
import { StatutorySetupPF } from '../../features/payroll/components/StatutorySetupPF/StatutorySetupPF';
import { SalaryComponents } from '../../features/payroll/components/SalaryComponents/SalaryComponents';
import { SalaryTemplates } from '../../features/payroll/components/SalaryTemplates/SalaryTemplates';
import { AddComponentModal } from '../../features/payroll/components/AddComponentModal/AddComponentModal';
import { CreateSalaryTemplateModal } from '../../features/payroll/components/CreateSalaryTemplateModal/CreateSalaryTemplateModal';
import {
  usePayrollSettings,
  usePfConfig,
  useSalaryComponents,
  useSalaryTemplates,
} from '../../features/payroll/hooks/usePayrollConfig';

import type {
  PayrollCycleConfig,
  StatutoryPFConfig,
  AddComponentFormData,
  CreateTemplateFormData,
  SalaryComponent,
  SalaryTemplate,
} from '../../features/payroll/types/payrollConfigTypes';

const PayrollConfigPage: React.FC = () => {
  const {
    settings,
    isLoading: isSettingsLoading,
    updateSettings,
    isUpdating: isSettingsUpdating,
  } = usePayrollSettings();

  const {
    pfConfig,
    isLoading: isPfLoading,
    updatePfConfig,
    isUpdating: isPfUpdating,
  } = usePfConfig();

  const { components, isLoading: isComponentsLoading, createComponent } = useSalaryComponents();

  const {
    templates,
    isLoading: isTemplatesLoading,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    isDeleting: isDeletingTemplate,
  } = useSalaryTemplates();

  const [localCycleConfig, setLocalCycleConfig] = useState<PayrollCycleConfig | null>(null);
  const [localPfConfig, setLocalPfConfig] = useState<StatutoryPFConfig | null>(null);

  const [isAddComponentOpen, setIsAddComponentOpen] = useState(false);
  const [editingComponent, setEditingComponent] = useState<SalaryComponent | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [componentToDelete, setComponentToDelete] = useState<SalaryComponent | null>(null);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [dependentNames, setDependentNames] = useState<string[]>([]);
  const [isCreateTemplateOpen, setIsCreateTemplateOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<SalaryTemplate | null>(null);
  const [isDeleteTemplateModalOpen, setIsDeleteTemplateModalOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<SalaryTemplate | null>(null);

  const [prevSettings, setPrevSettings] = useState<PayrollCycleConfig | null>(null);
  const [prevPfConfig, setPrevPfConfig] = useState<StatutoryPFConfig | null>(null);

  if (settings && settings !== prevSettings) {
    setLocalCycleConfig(settings);
    setPrevSettings(settings);
  }

  if (pfConfig && pfConfig !== prevPfConfig) {
    setLocalPfConfig(pfConfig);
    setPrevPfConfig(pfConfig);
  }

  const handleSaveAll = async () => {
    if (localCycleConfig) {
      const settingsPayload: PayrollCycleConfig = {
        financial_start_month: localCycleConfig.financial_start_month,
        payout_type: localCycleConfig.payout_type,
        payout_date: localCycleConfig.payout_date,
        payout_day_shift: localCycleConfig.payout_day_shift,
        consider_holidays: localCycleConfig.consider_holidays,
        attendance_cutoff_type: localCycleConfig.attendance_cutoff_type,
        attendance_cutoff_value: localCycleConfig.attendance_cutoff_value,
      };
      await updateSettings(settingsPayload);
    }
    if (localPfConfig) {
      const pfPayload: StatutoryPFConfig = {
        employee_contribution: localPfConfig.employee_contribution,
        employer_contribution: localPfConfig.employer_contribution,
        minimum_salary_threshold: localPfConfig.minimum_salary_threshold,
        is_enabled: localPfConfig.is_enabled,
        effective_from: localPfConfig.effective_from,
      };
      await updatePfConfig(pfPayload);
    }
  };

  const {
    updateComponent,
    deleteComponent,
    isDeleting: isDeletingComponent,
  } = useSalaryComponents();

  const handleDeleteComponent = (component: SalaryComponent) => {
    // UUID-based dependency check
    const dependents = components.filter((c) => c.calculate_from === component.id);

    if (dependents.length > 0) {
      setDependentNames(dependents.map((d) => d.name));
      setIsAlertModalOpen(true);
    } else {
      setComponentToDelete(component);
      setIsDeleteModalOpen(true);
    }
  };

  const confirmDeleteComponent = async () => {
    if (componentToDelete) {
      try {
        await deleteComponent(componentToDelete.id);
        setIsDeleteModalOpen(false);
        setComponentToDelete(null);
      } catch {
        toast.error('Failed to delete component');
      }
    }
  };

  const handleAddComponent = async (data: AddComponentFormData) => {
    if (editingComponent) {
      // UpdatePayrollComponentDto only allows: value, calculation_priority, is_active, is_taxable
      await updateComponent({
        id: editingComponent.id,
        data: {
          value: Number(data.value),
          is_taxable: data.taxable,
          is_active: data.status,
        },
      });
      setEditingComponent(null);
    } else {
      await createComponent({
        name: data.name,
        component_type: data.componentType,
        category: data.category,
        calculation_type: data.calculationType,
        calculate_from: data.calculateFrom || undefined,
        value: Number(data.value),
        is_taxable: data.taxable,
      });
    }
  };

  const handleEditComponent = (component: SalaryComponent) => {
    setEditingComponent(component);
    setIsAddComponentOpen(true);
  };

  const handleCreateTemplate = async (data: CreateTemplateFormData) => {
    const payload = {
      name: data.name,
      description: data.description,
      is_active: data.status,
      components: data.componentIds.map((id, index) => ({
        component_id: id,
        sort_order: index + 1,
      })),
    };

    if (editingTemplate) {
      await updateTemplate({ id: editingTemplate.id, data: payload });
      setEditingTemplate(null);
    } else {
      await createTemplate(payload);
    }
  };

  const handleEditTemplate = (template: SalaryTemplate) => {
    setEditingTemplate(template);
    setIsCreateTemplateOpen(true);
  };

  const handleDeleteTemplate = (template: SalaryTemplate) => {
    setTemplateToDelete(template);
    setIsDeleteTemplateModalOpen(true);
  };

  const confirmDeleteTemplate = async () => {
    if (templateToDelete) {
      try {
        await deleteTemplate(templateToDelete.id);
        setIsDeleteTemplateModalOpen(false);
        setTemplateToDelete(null);
      } catch {
        toast.error('Failed to delete template');
      }
    }
  };

  const isLoading = isSettingsLoading || isPfLoading || isComponentsLoading || isTemplatesLoading;

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title="Payroll Configuration"
        subtitle="Set payroll rules and salary components at company level."
        actions={
          <Button
            variant="primary"
            onClick={handleSaveAll}
            disabled={isSettingsUpdating || isPfUpdating}
          >
            {isSettingsUpdating || isPfUpdating ? 'Saving...' : 'Save Changes'}
          </Button>
        }
      />

      <Accordion
        title="Payroll Cycle Setup"
        icon={<Settings2 size={18} />}
        iconWrapperStyle={{ backgroundColor: '#eefcf5', color: '#16b364' }}
        defaultExpanded
      >
        <PayrollCycleSetup config={localCycleConfig} onChange={setLocalCycleConfig} />
      </Accordion>

      <Accordion
        title="Statutory Setup - Provident Fund"
        icon={<Shield size={18} />}
        iconWrapperStyle={{ backgroundColor: '#f4f3ff', color: '#7a5af8' }}
        defaultExpanded
      >
        <StatutorySetupPF config={localPfConfig} onChange={setLocalPfConfig} />
      </Accordion>

      <Accordion
        title="Salary Components"
        icon={<LayoutList size={18} />}
        iconWrapperStyle={{ backgroundColor: '#eff8ff', color: '#1d4ed8' }}
        badge={`${components.length} components`}
        defaultExpanded
      >
        <SalaryComponents
          components={components}
          onAddComponent={() => {
            setEditingComponent(null);
            setIsAddComponentOpen(true);
          }}
          onEditComponent={handleEditComponent}
          onDeleteComponent={handleDeleteComponent}
        />
      </Accordion>

      <Accordion
        title="Salary Templates"
        icon={<FileText size={18} />}
        iconWrapperStyle={{ backgroundColor: '#fdf4ec', color: '#e58728' }}
        badge={`${templates.length} templates`}
        defaultExpanded
      >
        <SalaryTemplates
          templates={templates}
          onCreateTemplate={() => {
            setEditingTemplate(null);
            setIsCreateTemplateOpen(true);
          }}
          onEditTemplate={handleEditTemplate}
          onDeleteTemplate={handleDeleteTemplate}
        />
      </Accordion>

      <AddComponentModal
        key={`component-${editingComponent?.id || 'new'}-${isAddComponentOpen}`}
        isOpen={isAddComponentOpen}
        onClose={() => {
          setIsAddComponentOpen(false);
          setEditingComponent(null);
        }}
        onSave={handleAddComponent}
        initialData={editingComponent}
        availableComponents={components}
      />

      <CreateSalaryTemplateModal
        key={`template-${editingTemplate?.id || 'new'}-${isCreateTemplateOpen}`}
        isOpen={isCreateTemplateOpen}
        onClose={() => {
          setIsCreateTemplateOpen(false);
          setEditingTemplate(null);
        }}
        onSave={handleCreateTemplate}
        availableComponents={components}
        initialData={editingTemplate}
      />

      <WarningModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setComponentToDelete(null);
        }}
        title="Delete Salary Component"
        description={
          <>
            Are you sure you want to delete <strong>{componentToDelete?.name}</strong>? This action
            cannot be undone.
          </>
        }
        actionLabel="Delete"
        onAction={confirmDeleteComponent}
        isActionLoading={isDeletingComponent}
      />

      <AlertModal
        isOpen={isAlertModalOpen}
        onClose={() => {
          setIsAlertModalOpen(false);
          setDependentNames([]);
        }}
        title="Deletion Blocked"
        alertMessage="This component cannot be deleted because other components are dependent on it."
        description={
          <>
            The following components are currently calculated as a percentage of this component:
            <ul style={{ marginTop: '12px', paddingLeft: '20px', listStyleType: 'disc' }}>
              {dependentNames.map((name) => (
                <li key={name}>{name}</li>
              ))}
            </ul>
            Please update or remove these dependent components first.
          </>
        }
        actionLabel="Close"
        onAction={() => {
          setIsAlertModalOpen(false);
          setDependentNames([]);
        }}
      />

      <WarningModal
        isOpen={isDeleteTemplateModalOpen}
        onClose={() => {
          setIsDeleteTemplateModalOpen(false);
          setTemplateToDelete(null);
        }}
        title="Delete Salary Template"
        description={
          <>
            Are you sure you want to delete <strong>{templateToDelete?.name}</strong>? This action
            cannot be undone.
          </>
        }
        actionLabel="Delete"
        onAction={confirmDeleteTemplate}
        isActionLoading={isDeletingTemplate}
      />
    </>
  );
};

export default PayrollConfigPage;
