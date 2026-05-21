export interface AuthUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  enterprise_id: string;
  organization_id: string;
}

export const getAuthResponse = () => {
  try {
    // Support both localStorage and sessionStorage depending on how auth is persisted
    const authStr =
      localStorage.getItem('auth_response') || sessionStorage.getItem('auth_response');
    if (authStr) {
      return JSON.parse(authStr);
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to parse auth response:', error);
  }
  return null;
};

export const getAuthUser = (): AuthUser | null => {
  const response = getAuthResponse();
  return response?.data?.user || null;
};

export const getEnterpriseId = (): string | undefined => {
  return getAuthUser()?.enterprise_id;
};

export const getOrganizationId = (): string | undefined => {
  return getAuthUser()?.organization_id;
};

export const getAvailableApps = (): { id: string; name: string; priority: number }[] => {
  const response = getAuthResponse();
  return response?.data?.availableApps || [];
};

export const getCurrentAppId = (): string | undefined => {
  const response = getAuthResponse();
  return response?.data?.defaultAppId;
};
