import { useMutation } from '@tanstack/react-query';

import { apiClient } from '../../../lib/axios';

interface CheckAvailabilityParams {
  email?: string;
  phone?: string;
}

interface CheckAvailabilityResponse {
  emailAvailable: boolean;
  phoneAvailable: boolean;
}

export const checkAvailability = async (
  params: CheckAvailabilityParams,
): Promise<CheckAvailabilityResponse> => {
  const query = new URLSearchParams();
  if (params.email) query.append('email', params.email);
  if (params.phone) query.append('phone', params.phone);

  const response = await apiClient.get(`/leads/check-availability?${query.toString()}`);
  return response.data;
};

export const useCheckAvailability = () => {
  return useMutation({
    mutationFn: checkAvailability,
  });
};
