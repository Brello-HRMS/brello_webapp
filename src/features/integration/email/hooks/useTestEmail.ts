import { useMutation } from '@tanstack/react-query';

import { sendTestEmail } from '../api/emailIntegration';
import { showToast } from '../../../ToastFeature/ShowToast';

import type { ApiError } from '../../../../types/common';

export const useTestEmail = () => {
  return useMutation({
    mutationFn: ({ id, to }: { id: string; to?: string }) => sendTestEmail(id, to),
    onSuccess: (response) => {
      const to = response?.data?.to;
      showToast(to ? `Test email sent to ${to}` : 'Test email sent', 'success');
    },
    onError: (error: ApiError) => {
      const message = error?.data?.message || 'Failed to send test email';
      showToast(message, 'error');
    },
  });
};
