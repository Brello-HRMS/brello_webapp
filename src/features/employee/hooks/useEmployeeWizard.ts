/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation, useQueryClient } from '@tanstack/react-query';

import {
  createEmployee,
  updateEmploymentDetails,
  updatePayrollDetails,
  updateSystemAccess,
  addEducation,
  addExperience,
  finalizeOnboarding,
  linkDocuments,
} from '../api/employee';
import { showToast } from '../../ToastFeature/ShowToast';

export const useEmployeeWizard = () => {
  const queryClient = useQueryClient();

  const createDraftMutation = useMutation({
    mutationFn: createEmployee,
    onSuccess: () => {
      showToast('Draft created successfully', 'success');
    },
    onError: (error: any) => {
      showToast(error?.response?.data?.message || 'Failed to create draft', 'error');
    },
  });

  const employmentMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateEmploymentDetails(id, data),
    onSuccess: () => {
      showToast('Employment details updated', 'success');
    },
    onError: (error: any) => {
      showToast(error?.response?.data?.message || 'Failed to update employment details', 'error');
    },
  });

  const payrollMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updatePayrollDetails(id, data),
    onSuccess: () => {
      showToast('Payroll details updated', 'success');
    },
    onError: (error: any) => {
      showToast(error?.response?.data?.message || 'Failed to update payroll details', 'error');
    },
  });

  const systemAccessMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateSystemAccess(id, data),
    onSuccess: () => {
      showToast('System access updated', 'success');
    },
    onError: (error: any) => {
      showToast(error?.response?.data?.message || 'Failed to update system access', 'error');
    },
  });

  const educationMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => addEducation(id, data),
    onSuccess: () => {
      showToast('Education added', 'success');
    },
    onError: (error: any) => {
      showToast(error?.response?.data?.message || 'Failed to add education', 'error');
    },
  });

  const experienceMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => addExperience(id, data),
    onSuccess: () => {
      showToast('Experience added', 'success');
    },
    onError: (error: any) => {
      showToast(error?.response?.data?.message || 'Failed to add experience', 'error');
    },
  });

  const finalizeMutation = useMutation({
    mutationFn: (id: string) => finalizeOnboarding(id),
    onSuccess: () => {
      showToast('Employee onboarded successfully', 'success');
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
    onError: (error: any) => {
      showToast(error?.response?.data?.message || 'Failed to finalize onboarding', 'error');
    },
  });

  const linkDocumentsMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => linkDocuments(id, data),
    onSuccess: () => {
      showToast('Documents linked successfully', 'success');
    },
    onError: (error: any) => {
      showToast(error?.response?.data?.message || 'Failed to link documents', 'error');
    },
  });

  return {
    createDraftMutation,
    employmentMutation,
    payrollMutation,
    systemAccessMutation,
    educationMutation,
    experienceMutation,
    finalizeMutation,
    linkDocumentsMutation,
  };
};
