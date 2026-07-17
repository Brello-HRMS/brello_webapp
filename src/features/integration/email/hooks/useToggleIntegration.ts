import { useMutation, useQueryClient } from '@tanstack/react-query';

import { activateIntegration, deactivateIntegration } from '../api/emailIntegration';
import { showToast } from '../../../ToastFeature/ShowToast';

import { EMAIL_INTEGRATIONS_QUERY_KEY } from './useEmailIntegrations';

import type { ApiError } from '../../../../types/common';

/**
 * Activates or deactivates an integration. Activating one automatically makes it
 * the organization's single active sender (the backend deactivates the others),
 * so we always refetch the list.
 */
export const useToggleIntegration = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, activate }: { id: string; activate: boolean }) =>
      activate ? activateIntegration(id) : deactivateIntegration(id),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: EMAIL_INTEGRATIONS_QUERY_KEY });
      showToast(
        variables.activate
          ? 'Email account activated — outgoing mail will now use it'
          : 'Email account deactivated',
        'success',
      );
    },
    onError: (error: ApiError) => {
      const message = error?.data?.message || 'Failed to update the email account';
      showToast(message, 'error');
    },
  });
};
