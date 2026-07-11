import { useMutation, useQueryClient } from '@tanstack/react-query';

import { disconnectIntegration } from '../api/emailIntegration';
import { showToast } from '../../../ToastFeature/ShowToast';

import { EMAIL_INTEGRATIONS_QUERY_KEY } from './useEmailIntegrations';

import type { ApiError } from '../../../../types/common';

export const useDisconnectIntegration = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => disconnectIntegration(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EMAIL_INTEGRATIONS_QUERY_KEY });
      showToast('Email account disconnected', 'success');
    },
    onError: (error: ApiError) => {
      const message = error?.data?.message || 'Failed to disconnect the email account';
      showToast(message, 'error');
    },
  });
};
