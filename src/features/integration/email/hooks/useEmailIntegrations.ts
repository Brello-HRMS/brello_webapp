import { useQuery } from '@tanstack/react-query';

import { getEmailIntegrations } from '../api/emailIntegration';
import { showToast } from '../../../ToastFeature/ShowToast';

import type { ApiError } from '../../../../types/common';
import type { GetEmailIntegrationsResponse } from '../types/emailIntegrationType';

export const EMAIL_INTEGRATIONS_QUERY_KEY = ['email-integrations'] as const;

export const useEmailIntegrations = () => {
  return useQuery<GetEmailIntegrationsResponse, Error>({
    queryKey: EMAIL_INTEGRATIONS_QUERY_KEY,
    queryFn: async () => {
      try {
        return await getEmailIntegrations();
      } catch (error) {
        const message = (error as ApiError)?.data?.message || 'Failed to load email integrations';
        showToast(message, 'error');
        throw error;
      }
    },
    placeholderData: (previousData) => previousData,
  });
};
