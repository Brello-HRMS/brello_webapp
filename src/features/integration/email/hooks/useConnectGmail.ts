import { useMutation } from '@tanstack/react-query';

import { getGoogleAuthUrl } from '../api/emailIntegration';
import { showToast } from '../../../ToastFeature/ShowToast';

import type { ApiError } from '../../../../types/common';

/**
 * Starts the Gmail connect flow: fetches the Google consent URL, then sends the
 * browser to it. Google redirects back to /integration/email?connected=... where
 * the page shows a success/error toast.
 */
export const useConnectGmail = () => {
  return useMutation({
    mutationFn: getGoogleAuthUrl,
    onSuccess: (response) => {
      const url = response?.data?.url;
      if (url) {
        window.location.href = url;
      } else {
        showToast('Could not start Google sign-in. Please try again.', 'error');
      }
    },
    onError: (error: ApiError) => {
      const message = error?.data?.message || 'Failed to start Google sign-in';
      showToast(message, 'error');
    },
  });
};
