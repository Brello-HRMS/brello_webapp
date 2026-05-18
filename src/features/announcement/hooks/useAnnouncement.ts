import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';

import * as api from '../api/announcementApi';

import type { ApiError } from '../../../types/common';
import type {
  AdminAnnouncementQuery,
  CreateAnnouncementPayload,
  EmployeeAnnouncementQuery,
  UpdateAnnouncementPayload,
} from '../types/announcementTypes';

// --- Admin hooks ---

export const useAnnouncements = (params: AdminAnnouncementQuery) => {
  const query = useQuery({
    queryKey: ['announcements', 'admin', params],
    queryFn: () => api.getAnnouncements(params),
  });

  return {
    items: query.data?.items ?? [],
    pagination: query.data?.pagination,
    isLoading: query.isLoading,
    error: query.error,
  };
};

export const useCreateAnnouncement = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: CreateAnnouncementPayload) => api.createAnnouncement(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements', 'admin'] });
      toast.success('Announcement created successfully');
    },
    onError: (error: ApiError) => {
      toast.error(error?.data?.message || 'Failed to create announcement');
    },
  });

  return { createAnnouncement: mutation.mutateAsync, isCreating: mutation.isPending };
};

export const useUpdateAnnouncement = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAnnouncementPayload }) =>
      api.updateAnnouncement(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements', 'admin'] });
      toast.success('Announcement updated successfully');
    },
    onError: (error: ApiError) => {
      toast.error(error?.data?.message || 'Failed to update announcement');
    },
  });

  return { updateAnnouncement: mutation.mutateAsync, isUpdating: mutation.isPending };
};

export const useDeleteAnnouncement = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (id: string) => api.deleteAnnouncement(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements', 'admin'] });
      toast.success('Announcement deleted');
    },
    onError: (error: ApiError) => {
      toast.error(error?.data?.message || 'Failed to delete announcement');
    },
  });

  return { deleteAnnouncement: mutation.mutateAsync, isDeleting: mutation.isPending };
};

export const usePublishAnnouncement = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (id: string) => api.publishAnnouncement(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements', 'admin'] });
      toast.success('Announcement published');
    },
    onError: (error: ApiError) => {
      toast.error(error?.data?.message || 'Failed to publish announcement');
    },
  });

  return { publishAnnouncement: mutation.mutateAsync, isPublishing: mutation.isPending };
};

export const useArchiveAnnouncement = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (id: string) => api.archiveAnnouncement(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements', 'admin'] });
      toast.success('Announcement archived');
    },
    onError: (error: ApiError) => {
      toast.error(error?.data?.message || 'Failed to archive announcement');
    },
  });

  return { archiveAnnouncement: mutation.mutateAsync, isArchiving: mutation.isPending };
};

// --- Employee hooks ---

export const useEmployeeAnnouncements = (params: EmployeeAnnouncementQuery) => {
  const query = useQuery({
    queryKey: ['announcements', 'employee', params],
    queryFn: () => api.getEmployeeAnnouncements(params),
  });

  return {
    items: query.data?.items ?? [],
    pagination: query.data?.pagination,
    isLoading: query.isLoading,
    error: query.error,
  };
};

export const useMarkAnnouncementRead = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (id: string) => api.markAnnouncementRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements', 'employee'] });
    },
  });

  return { markRead: mutation.mutate };
};
