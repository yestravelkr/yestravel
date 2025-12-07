/**
 * Campaign form types
 */

// HookForm에 저장되는 간소화된 데이터
export type CampaignProductFormData = {
  id: number;
  status: 'ACTIVE' | 'INACTIVE';
};

export type CampaignInfluencerProductFormData = {
  productId: number;
  useCustomCommission: boolean;
  hotelOptions: {
    hotelOptionId: number;
    commissionByDate: Record<string, number>;
  }[];
};

export type CampaignInfluencerFormData = {
  influencerId: number;
  periodType: 'DEFAULT' | 'CUSTOM';
  startAt: string | null; // ISO date string
  endAt: string | null; // ISO date string
  feeType: 'NONE' | 'CUSTOM';
  fee: number | null;
  status: 'VISIBLE' | 'HIDDEN' | 'SOLD_OUT';
  products: CampaignInfluencerProductFormData[];
};

// 화면에 표시되는 전체 데이터
export type CampaignProductDisplay = {
  id: number;
  name: string;
  brand: string;
  category: string;
  status: 'ACTIVE' | 'INACTIVE';
};

export type CampaignInfluencerProductDisplay = {
  productId: number;
  productName: string;
  brandName: string;
  useCustomCommission: boolean;
  hotelOptions: {
    hotelOptionId: number;
    optionName: string;
    startDate: string;
    endDate: string;
    commissionByDate: Record<string, number>;
  }[];
};

export type CampaignInfluencerDisplay = {
  influencerId: number;
  name: string;
  email: string | null;
  phoneNumber: string | null;
  periodType: 'DEFAULT' | 'CUSTOM';
  startAt: string | null;
  endAt: string | null;
  feeType: 'NONE' | 'CUSTOM';
  fee: number | null;
  status: 'VISIBLE' | 'HIDDEN' | 'SOLD_OUT';
  products: CampaignInfluencerProductDisplay[];
};

export type CampaignFormData = {
  title: string;
  dateRange: {
    startDate: string;
    endDate: string;
  };
  products: CampaignProductFormData[];
  influencers: CampaignInfluencerFormData[];
};
