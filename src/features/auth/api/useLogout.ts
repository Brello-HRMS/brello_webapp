import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import { showToast } from '../../ToastFeature/ShowToast';
import { removeCookie } from '../../../utils/cookieUtils';

import { logout } from './auth';

import type { ApiError } from '../../../types/common';

export const useLogout = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      removeCookie('auth_response');
      navigate('/auth/login');
    },
    onError: (error: ApiError) => {
      showToast(error?.data?.message || 'Failed to logout. Please try again.', 'error');
      removeCookie('auth_response');
      navigate('/auth/login');
    },
  });
};
