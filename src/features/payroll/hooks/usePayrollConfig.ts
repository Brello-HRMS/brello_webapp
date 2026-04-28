import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import * as payrollApi from '../api/payrollApi';

import type {
  PayrollCycleConfig,
  StatutoryPFConfig,
  SalaryComponent,
  SalaryTemplate,
} from '../types/payrollConfigTypes';

export const usePayrollSettings = () => {
  const queryClient = useQueryClient();

  const settingsQuery = useQuery({
    queryKey: ['payroll', 'settings'],
    queryFn: payrollApi.getPayrollSettings,
  });

  const updateSettingsMutation = useMutation({
    mutationFn: (data: PayrollCycleConfig) => payrollApi.updatePayrollSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payroll', 'settings'] });
    },
  });

  return {
    settings: settingsQuery.data,
    isLoading: settingsQuery.isLoading,
    error: settingsQuery.error,
    updateSettings: updateSettingsMutation.mutateAsync,
    isUpdating: updateSettingsMutation.isPending,
  };
};

export const usePfConfig = () => {
  const queryClient = useQueryClient();

  const pfQuery = useQuery({
    queryKey: ['payroll', 'pf-config'],
    queryFn: payrollApi.getPfConfig,
  });

  const updatePfMutation = useMutation({
    mutationFn: (data: StatutoryPFConfig) => payrollApi.updatePfConfig(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payroll', 'pf-config'] });
    },
  });

  return {
    pfConfig: pfQuery.data,
    isLoading: pfQuery.isLoading,
    error: pfQuery.error,
    updatePfConfig: updatePfMutation.mutateAsync,
    isUpdating: updatePfMutation.isPending,
  };
};

export const useSalaryComponents = () => {
  const queryClient = useQueryClient();

  const componentsQuery = useQuery({
    queryKey: ['payroll', 'components'],
    queryFn: payrollApi.getSalaryComponents,
  });

  const createComponentMutation = useMutation({
    mutationFn: (data: Partial<SalaryComponent>) => payrollApi.createSalaryComponent(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payroll', 'components'] });
    },
  });

  const updateComponentMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<SalaryComponent> }) =>
      payrollApi.updateSalaryComponent(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payroll', 'components'] });
    },
  });

  const deleteComponentMutation = useMutation({
    mutationFn: (id: string) => payrollApi.deleteSalaryComponent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payroll', 'components'] });
    },
  });

  return {
    components: componentsQuery.data || [],
    isLoading: componentsQuery.isLoading,
    error: componentsQuery.error,
    createComponent: createComponentMutation.mutateAsync,
    updateComponent: updateComponentMutation.mutateAsync,
    deleteComponent: deleteComponentMutation.mutateAsync,
    isCreating: createComponentMutation.isPending,
    isUpdating: updateComponentMutation.isPending,
    isDeleting: deleteComponentMutation.isPending,
  };
};

export const useSalaryTemplates = () => {
  const queryClient = useQueryClient();

  const templatesQuery = useQuery({
    queryKey: ['payroll', 'templates'],
    queryFn: payrollApi.getSalaryTemplates,
  });

  const createTemplateMutation = useMutation({
    mutationFn: (data: Partial<SalaryTemplate>) => payrollApi.createSalaryTemplate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payroll', 'templates'] });
    },
  });

  const updateTemplateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<SalaryTemplate> }) =>
      payrollApi.updateSalaryTemplate(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payroll', 'templates'] });
    },
  });

  const deleteTemplateMutation = useMutation({
    mutationFn: (id: string) => payrollApi.deleteSalaryTemplate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payroll', 'templates'] });
    },
  });

  return {
    templates: templatesQuery.data || [],
    isLoading: templatesQuery.isLoading,
    error: templatesQuery.error,
    createTemplate: createTemplateMutation.mutateAsync,
    isCreating: createTemplateMutation.isPending,
    updateTemplate: updateTemplateMutation.mutateAsync,
    isUpdating: updateTemplateMutation.isPending,
    deleteTemplate: deleteTemplateMutation.mutateAsync,
    isDeleting: deleteTemplateMutation.isPending,
  };
};
