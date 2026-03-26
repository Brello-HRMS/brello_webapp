export interface ApiMenuItem {
  label: string;
  icon: string | null;
  path: string | null;
  actions: string[];
  children?: ApiMenuItem[];
}

export interface MenuApiResponse {
  success: boolean;
  data: ApiMenuItem[];
  timestamp: string;
}
