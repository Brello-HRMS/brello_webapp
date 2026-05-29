export type LeadStatus =
  | 'NEW'
  | 'CONTACTED'
  | 'DEMO_SCHEDULED'
  | 'DEMO_COMPLETED'
  | 'PROPOSAL_SENT'
  | 'NEGOTIATION'
  | 'CONTRACT_SENT'
  | 'WON'
  | 'LOST'
  | 'ON_HOLD';

export type LeadSource = 'website' | 'adminPanel';

export type Lead = {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  location: string | null;
  device: string | null;
  source: LeadSource;
  lead_status: LeadStatus;
  is_verified: boolean;
  plan_id: string | null;
  created_at: string;
  updated_at: string;
};

export type LeadsResponse = { success: boolean; data: Lead[] };
export type LeadResponse = { success: boolean; data: Lead };
export type UpdateLeadStatusRequest = { status: LeadStatus };
