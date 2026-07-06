import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  getLetterTemplates,
  getLetterTemplate,
  createLetterTemplate,
  updateLetterTemplate,
  publishLetterTemplate,
  duplicateLetterTemplate,
  previewLetterTemplate,
  archiveLetterTemplate,
  unarchiveLetterTemplate,
  getVariableRegistry,
} from '../api/letterTemplate';
import { showToast } from '../../ToastFeature/ShowToast';

import type { ApiError } from '../../../types/common';
import type { LetterTemplateFilters } from '../api/letterTemplate';
import type { CreateLetterTemplateParams, UpdateLetterTemplateParams } from '../types/letterTypes';

export const useLetterTemplates = (filters?: LetterTemplateFilters) => {
  return useQuery({
    queryKey: ['letter-templates', filters],
    queryFn: async () => {
      try {
        const data = await getLetterTemplates(filters);
        return data;
      } catch (error) {
        const message = (error as ApiError)?.data?.message || 'Failed to fetch letter templates';
        showToast(message, 'error');
        throw error;
      }
    },
    placeholderData: (previousData) => previousData,
  });
};

export const useLetterTemplate = (id: string) => {
  return useQuery({
    queryKey: ['letter-templates', id],
    queryFn: async () => {
      try {
        const data = await getLetterTemplate(id);
        return data;
      } catch (error) {
        const message = (error as ApiError)?.data?.message || 'Failed to fetch letter template';
        showToast(message, 'error');
        throw error;
      }
    },
    enabled: !!id,
  });
};

export const useCreateLetterTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: CreateLetterTemplateParams) => createLetterTemplate(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['letter-templates'] });
      showToast('Template created successfully', 'success');
    },
    onError: (error: ApiError) => {
      const message = error?.data?.message || 'Failed to create template';
      showToast(message, 'error');
    },
  });
};

export const useUpdateLetterTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, params }: { id: string; params: UpdateLetterTemplateParams }) =>
      updateLetterTemplate(id, params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['letter-templates'] });
      showToast('Template updated successfully', 'success');
    },
    onError: (error: ApiError) => {
      const message = error?.data?.message || 'Failed to update template';
      showToast(message, 'error');
    },
  });
};

export const usePublishLetterTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => publishLetterTemplate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['letter-templates'] });
      showToast('Template published successfully', 'success');
    },
    onError: (error: ApiError) => {
      const message = error?.data?.message || 'Failed to publish template';
      showToast(message, 'error');
    },
  });
};

export const useDuplicateLetterTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => duplicateLetterTemplate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['letter-templates'] });
      showToast('Template duplicated successfully', 'success');
    },
    onError: (error: ApiError) => {
      const message = error?.data?.message || 'Failed to duplicate template';
      showToast(message, 'error');
    },
  });
};

export const useArchiveLetterTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => archiveLetterTemplate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['letter-templates'] });
      showToast('Template archived successfully', 'success');
    },
    onError: (error: ApiError) => {
      const message = error?.data?.message || 'Failed to archive template';
      showToast(message, 'error');
    },
  });
};

export const useTemplatePreview = (id: string) => {
  return useMutation({
    mutationFn: () => previewLetterTemplate(id),
    onError: (error: ApiError) => {
      const message = error?.data?.message || 'Failed to generate preview';
      showToast(message, 'error');
    },
  });
};

export const useUnarchiveLetterTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => unarchiveLetterTemplate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['letter-templates'] });
      showToast('Template restored successfully', 'success');
    },
    onError: (error: ApiError) => {
      const message = error?.data?.message || 'Failed to restore template';
      showToast(message, 'error');
    },
  });
};

export const useVariableRegistry = () => {
  return useQuery({
    queryKey: ['letter-variables'],
    queryFn: async () => {
      try {
        const data = await getVariableRegistry();
        return data;
      } catch (error) {
        const message = (error as ApiError)?.data?.message || 'Failed to fetch variables';
        showToast(message, 'error');
        throw error;
      }
    },
    staleTime: Infinity,
  });
};
