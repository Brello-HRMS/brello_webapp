export interface OrgIndustryType {
  id: string;
  name: string;
  code: string | null;
}

export interface OrgDocument {
  id: string;
  file_name: string;
  original_name: string;
  mime_type: string;
}

export interface OrgIdentity {
  id: string;
  name: string;
  subdomain: string | null;
  enterprise_id: string;
  created_at: string;
}

export interface OrganizationProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  gst_no: string | null;
  domain: string | null;
  registration_no: string;
  address: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  country: string | null;
  logo_id: string | null;
  industry_type_id: string | null;
  organization_id: string;
  enterprise_id: string;
  logo: OrgDocument | null;
  industry_type: OrgIndustryType | null;
  organization: OrgIdentity;
  created_at: string;
  updated_at: string;
}

export interface OrgStats {
  employee_count: number;
}

export interface UpdateOrgProfilePayload {
  name?: string;
  email?: string;
  phone?: string;
  gst_no?: string;
  domain?: string;
  registration_no?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  country?: string;
  logo_id?: string | null;
  industry_type_id?: string | null;
}

export interface OrgProfileResponse {
  success: boolean;
  data: OrganizationProfile;
  timestamp: string;
}

export interface OrgStatsResponse {
  success: boolean;
  data: OrgStats;
  timestamp: string;
}
