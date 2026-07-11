import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  searchEmployees,
  resolveIssuedLetter,
  getIssuedLetters,
  generateIssuedLetter,
  getIssuedLetterDownloadUrl,
  getMyLetters,
  getMyLetterDownloadUrl,
  acknowledgeMyLetter,
} from '../api/issuedLetter';
import { showToast } from '../../ToastFeature/ShowToast';
import { resolveAssetUrl } from '../../../utils/assetUrl';

import type { ApiError } from '../../../types/common';
import type { GenerateLetterParams, IssuedLetterFilters } from '../types/letterTypes';

export const useEmployeeSearch = () => {
  return useQuery({
    queryKey: ['letter-employees'],
    queryFn: async () => {
      try {
        const data = await searchEmployees();
        return data;
      } catch (error) {
        const message = (error as ApiError)?.data?.message || 'Failed to fetch employees';
        showToast(message, 'error');
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useResolveIssuedLetter = () => {
  return useMutation({
    mutationFn: (params: { employee_id: string; template_id: string }) =>
      resolveIssuedLetter(params),
    onError: (error: ApiError) => {
      const message = error?.data?.message || 'Failed to resolve letter preview';
      showToast(message, 'error');
    },
  });
};

export const useIssuedLetters = (filters?: IssuedLetterFilters) => {
  return useQuery({
    queryKey: ['issued-letters', filters],
    queryFn: async () => {
      try {
        const data = await getIssuedLetters(filters);
        return data;
      } catch (error) {
        const message = (error as ApiError)?.data?.message || 'Failed to fetch issued letters';
        showToast(message, 'error');
        throw error;
      }
    },
    placeholderData: (previousData) => previousData,
  });
};

export const useGenerateIssuedLetter = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      params,
      idempotencyKey,
    }: {
      params: GenerateLetterParams;
      idempotencyKey: string;
    }) => generateIssuedLetter(params, idempotencyKey),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['issued-letters'] });
      showToast(`Letter ${response.data.letterNumber} generated successfully`, 'success');
    },
    onError: (error: ApiError) => {
      const message = error?.data?.message || 'Failed to generate letter';
      showToast(message, 'error');
    },
  });
};

export const useIssuedLetterDownload = () => {
  return useMutation({
    mutationFn: (id: string) => getIssuedLetterDownloadUrl(id),
    onSuccess: (response) => {
      const url = resolveAssetUrl(response.data.url);
      if (url) window.open(url, '_blank');
    },
    onError: (error: ApiError) => {
      const message = error?.data?.message || 'Failed to download letter';
      showToast(message, 'error');
    },
  });
};

export const useMyLetters = () => {
  return useQuery({
    queryKey: ['my-letters'],
    queryFn: async () => {
      try {
        const data = await getMyLetters();
        return data;
      } catch (error) {
        const message = (error as ApiError)?.data?.message || 'Failed to fetch your letters';
        showToast(message, 'error');
        throw error;
      }
    },
    placeholderData: (previousData) => previousData,
  });
};

export const useMyLetterDownload = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => getMyLetterDownloadUrl(id),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['my-letters'] });
      const url = resolveAssetUrl(response.data.url);
      if (url) window.open(url, '_blank');
    },
    onError: (error: ApiError) => {
      const message = error?.data?.message || 'Failed to download letter';
      showToast(message, 'error');
    },
  });
};

export const useAcknowledgeLetter = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => acknowledgeMyLetter(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-letters'] });
      showToast('Letter acknowledged', 'success');
    },
    onError: (error: ApiError) => {
      const message = error?.data?.message || 'Failed to acknowledge letter';
      showToast(message, 'error');
    },
  });
};
