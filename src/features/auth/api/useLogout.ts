import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import { showToast } from '../../ToastFeature/ShowToast';
import { removeCookie } from '../../../utils/cookieUtils';

import { logout } from './auth';

import type { ApiError } from '../../../types/common';

export const useLogout = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Clears all cached queries (permissions, profile, employee data, etc.) so
  // a second user logging in on the same browser/device can never be served
  // the previous user's cached data.
  const cleanupAndRedirect = () => {
    removeCookie('auth_response');
    queryClient.clear();
    navigate('/auth/login');
  };

  return useMutation({
    mutationFn: logout,
    onSuccess: cleanupAndRedirect,
    onError: (error: ApiError) => {
      showToast(error?.data?.message || 'Failed to logout. Please try again.', 'error');
      cleanupAndRedirect();
    },
  });
};
