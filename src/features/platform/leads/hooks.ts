import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { showToast } from '../../ToastFeature/ShowToast';

import { getLeads, updateLeadStatus } from './api';

import type { ApiError } from '../../../types/common';
import type { LeadStatus } from './types';

export const LEADS_QUERY_KEY = ['platform', 'leads'];

export const useLeadsList = () =>
  useQuery({
    queryKey: LEADS_QUERY_KEY,
    queryFn: () => getLeads(),
  });

export const useUpdateLeadStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: LeadStatus }) =>
      updateLeadStatus(id, { status }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: LEADS_QUERY_KEY });
      showToast('Lead status updated', 'success');
    },
    onError: (error: ApiError) => {
      showToast(error?.data?.message || 'Failed to update status', 'error');
    },
  });
};
