import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';

import * as api from '../api/reimbursementApi';

import type {
  CreateReimbursementPayload,
  UpdateReimbursementPayload,
  EmployeeReimbursementQuery,
} from '../types/reimbursementTypes';

export const useMyReimbursements = (params: EmployeeReimbursementQuery) => {
  const query = useQuery({
    queryKey: ['reimbursements', 'me', params],
    queryFn: () => api.getMyReimbursements(params),
  });

  return {
    items: query.data?.items ?? [],
    pagination: query.data?.pagination,
    isLoading: query.isLoading,
    error: query.error,
  };
};

export const useCreateReimbursement = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: CreateReimbursementPayload) => api.createReimbursement(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reimbursements', 'me'] });
      toast.success('Reimbursement submitted successfully');
    },
    onError: () => {
      toast.error('Failed to submit reimbursement');
    },
  });

  return {
    createReimbursement: mutation.mutateAsync,
    isCreating: mutation.isPending,
  };
};

export const useUpdateReimbursement = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateReimbursementPayload }) =>
      api.updateReimbursement(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reimbursements', 'me'] });
      toast.success('Reimbursement updated successfully');
    },
    onError: () => {
      toast.error('Failed to update reimbursement');
    },
  });

  return {
    updateReimbursement: mutation.mutateAsync,
    isUpdating: mutation.isPending,
  };
};

export const useDeleteReimbursement = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (id: string) => api.deleteReimbursement(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reimbursements', 'me'] });
      toast.success('Reimbursement deleted');
    },
    onError: () => {
      toast.error('Failed to delete reimbursement');
    },
  });

  return {
    deleteReimbursement: mutation.mutateAsync,
    isDeleting: mutation.isPending,
  };
};
