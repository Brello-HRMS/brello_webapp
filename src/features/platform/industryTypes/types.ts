export type IndustryType = {
  id: string;
  name: string;
  status: string;
  created_at: string;
  updated_at: string;
};

export type IndustryTypesResponse = {
  success: boolean;
  data: IndustryType[];
  timestamp: string;
};

export type IndustryTypeResponse = {
  success: boolean;
  data: IndustryType;
  timestamp: string;
};

export type CreateIndustryTypeRequest = {
  name: string;
};

export type UpdateIndustryTypeRequest = {
  name: string;
};
