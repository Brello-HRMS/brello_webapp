import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import { showToast } from '../../ToastFeature/ShowToast';

import { logout } from './auth';

import type { ApiError } from '../../../types/common';

export const useLogout = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      sessionStorage.removeItem('auth_response');
      sessionStorage.removeItem('access_token');
      localStorage.clear();
      navigate('/auth/login');
    },
    onError: (error: ApiError) => {
      showToast(error?.data?.message || 'Failed to logout. Please try again.', 'error');
      sessionStorage.removeItem('auth_response');
      sessionStorage.removeItem('access_token');
      localStorage.clear();
      navigate('/auth/login');
    },
  });
};
