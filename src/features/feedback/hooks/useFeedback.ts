import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';

import * as api from '../api/feedbackApi';

import type {
  CreateFeedbackTicketPayload,
  AddCommentPayload,
  OrgFeedbackQuery,
} from '../types/feedbackTypes';

export const useMyTickets = (params: OrgFeedbackQuery) => {
  const query = useQuery({
    queryKey: ['feedback', 'org', params],
    queryFn: () => api.getMyTickets(params),
  });

  return {
    items: query.data?.items ?? [],
    pagination: query.data?.pagination,
    isLoading: query.isLoading,
    error: query.error,
  };
};

export const useTicketDetail = (id: string | null) => {
  return useQuery({
    queryKey: ['feedback', 'org', 'detail', id],
    queryFn: () => api.getTicketDetail(id!),
    enabled: !!id,
  });
};

export const useCreateFeedbackTicket = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: CreateFeedbackTicketPayload) => api.createFeedbackTicket(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedback', 'org'] });
      toast.success('Ticket submitted successfully');
    },
    onError: () => {
      toast.error('Failed to submit ticket');
    },
  });

  return {
    createTicket: mutation.mutateAsync,
    isCreating: mutation.isPending,
  };
};

export const useAddOrgComment = (ticketId: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: AddCommentPayload) => api.addOrgComment(ticketId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedback', 'org', 'detail', ticketId] });
      toast.success('Comment added');
    },
    onError: () => {
      toast.error('Failed to add comment');
    },
  });

  return {
    addComment: mutation.mutateAsync,
    isAdding: mutation.isPending,
  };
};
