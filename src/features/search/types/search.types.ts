export interface SearchResultItem {
  id: string;
  entity_id: string;
  entity_type: string;
  module_key: string;
  title: string;
  subtitle: string;
  route: string;
  permissions: string[];
  metadata: Record<string, unknown>;
}

export interface SearchModuleInfo {
  label: string;
  route: string;
}

export interface SearchResponse {
  success: boolean;
  data: {
    modules: SearchModuleInfo[];
    results: SearchResultItem[];
  };
}

export interface RecentSearchItem {
  id: string;
  query: string | null;
  entity_id: string | null;
  entity_type: string | null;
  title: string | null;
  route: string | null;
  created_at: string;
}

export interface RecentSearchItems {
  data: RecentSearchItem[];
  success: boolean;
}

export interface SaveRecentSearchPayload {
  query?: string;
  entity_id?: string;
  entity_type?: string;
  title?: string;
  route?: string;
}
