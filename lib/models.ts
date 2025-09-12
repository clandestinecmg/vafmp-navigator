export type BillingType = 'direct' | 'reimbursement';

export interface Provider {
  id: string;
  name: string;
  country: 'TH' | 'PH' | 'VN' | 'KH' | 'MY' | 'ID' | 'SG';
  city?: string;
  regionTag?: string; // e.g., 'Bangkok', 'Chiang Mai', 'HCMC'
  billingType: BillingType; // 'direct' or 'reimbursement'
  lat?: number;
  lng?: number;
  phone?: string;
  website?: string;
  address?: string;
  googlePlaceId?: string;
  googleMapsUrl?: string;
}
