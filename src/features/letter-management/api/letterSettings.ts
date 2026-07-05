import { apiClient } from '../../../lib/axios';
import { envVars } from '../../../utils/envVars';

import type { ApiResponse } from '../../../types/common';
import type { LetterSettings, UpdateLetterSettingsParams } from '../types/letterTypes';

const BASE = `${envVars.BRELLO_BASE_API}/letter-management/settings`;

export const getLetterSettings = async (): Promise<ApiResponse<LetterSettings>> => {
  return apiClient.get(BASE);
};

export const updateLetterSettings = async (
  params: UpdateLetterSettingsParams,
): Promise<ApiResponse<LetterSettings>> => {
  return apiClient.patch(BASE, params);
};
