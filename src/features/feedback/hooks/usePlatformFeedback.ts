import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';

import * as api from '../api/feedbackApi';

import type {
  UpdateTicketPayload,
  PlatformAddCommentPayload,
  PlatformFeedbackQuery,
} from '../types/feedbackTypes';

export const usePlatformTickets = (params: PlatformFeedbackQuery) => {
  const query = useQuery({
    queryKey: ['feedback', 'platform', params],
    queryFn: () => api.getPlatformTickets(params),
  });

  return {
    items: query.data?.items ?? [],
    pagination: query.data?.pagination,
    isLoading: query.isLoading,
    error: query.error,
  };
};

export const usePlatformTicketDetail = (id: string | null) => {
  return useQuery({
    queryKey: ['feedback', 'platform', 'detail', id],
    queryFn: () => api.getPlatformTicketDetail(id!),
    enabled: !!id,
  });
};

export const usePlatformStats = () => {
  return useQuery({
    queryKey: ['feedback', 'platform', 'stats'],
    queryFn: () => api.getPlatformStats(),
  });
};

export const useUpdatePlatformTicket = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTicketPayload }) =>
      api.updatePlatformTicket(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['feedback', 'platform'] });
      queryClient.invalidateQueries({ queryKey: ['feedback', 'platform', 'detail', id] });
      toast.success('Ticket updated');
    },
    onError: () => {
      toast.error('Failed to update ticket');
    },
  });

  return {
    updateTicket: mutation.mutateAsync,
    isUpdating: mutation.isPending,
  };
};

export const useAddPlatformComment = (ticketId: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: PlatformAddCommentPayload) => api.addPlatformComment(ticketId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedback', 'platform', 'detail', ticketId] });
      toast.success('Reply sent');
    },
    onError: () => {
      toast.error('Failed to send reply');
    },
  });

  return {
    addComment: mutation.mutateAsync,
    isAdding: mutation.isPending,
  };
};
