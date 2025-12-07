/**
 * Campaign form types
 */

export type CampaignProduct = {
  id: number;
  name: string;
  brandName: string;
  category: string;
  status: 'ACTIVE' | 'INACTIVE';
};

export type CampaignInfluencer = {
  id: number;
  name: string;
  email: string | null;
  phoneNumber: string | null;
  status: 'ACTIVE' | 'INACTIVE';
};

export type CampaignFormData = {
  title: string;
  dateRange: {
    startDate: string;
    endDate: string;
  };
  products: CampaignProduct[];
  influencers: CampaignInfluencer[];
};
