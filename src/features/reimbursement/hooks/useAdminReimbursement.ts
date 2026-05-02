import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';

import * as api from '../api/reimbursementApi';

import type {
  AdminReimbursementQuery,
  AdminUpdateStatusPayload,
} from '../types/reimbursementTypes';

export const useAllReimbursements = (params: AdminReimbursementQuery) => {
  const query = useQuery({
    queryKey: ['reimbursements', 'admin', params],
    queryFn: () => api.getAllReimbursements(params),
  });

  return {
    items: query.data?.items ?? [],
    pagination: query.data?.pagination,
    isLoading: query.isLoading,
    error: query.error,
  };
};

export const useUpdateReimbursementStatus = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: AdminUpdateStatusPayload }) =>
      api.updateReimbursementStatus(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reimbursements', 'admin'] });
      toast.success('Status updated successfully');
    },
    onError: () => {
      toast.error('Failed to update status');
    },
  });

  return {
    updateStatus: mutation.mutateAsync,
    isUpdating: mutation.isPending,
  };
};

export const useMarkReimbursementPaid = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (id: string) => api.markReimbursementPaid(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reimbursements', 'admin'] });
      toast.success('Marked as paid');
    },
    onError: () => {
      toast.error('Failed to mark as paid');
    },
  });

  return {
    markPaid: mutation.mutateAsync,
    isMarking: mutation.isPending,
  };
};
