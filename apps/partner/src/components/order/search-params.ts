/**
 * Hotel order search params - 숙박 주문 검색 파라미터 타입 및 검증 함수
 *
 * OrderListContent에서 분리하여 react-refresh/only-export-components warning을 해소합니다.
 */

/** 검색 파라미터 타입 */
export interface HotelOrderSearchParams {
  page: number;
  limit: number;
  periodType: string;
  periodPreset: string;
  startDate: string;
  endDate: string;
  orderStatus: string;
  campaignId: string;
  influencerIds: string;
  productId: string;
  optionId: string;
  searchQuery: string;
}

/** 검색 파라미터 검증 함수 */
export function validateHotelOrderSearch(
  search: Record<string, unknown>,
): HotelOrderSearchParams {
  return {
    page: Number(search.page) || 1,
    limit: Number(search.limit) || 50,
    periodType: (search.periodType as string) || '',
    periodPreset: (search.periodPreset as string) || '',
    startDate: (search.startDate as string) || '',
    endDate: (search.endDate as string) || '',
    orderStatus: (search.orderStatus as string) || '',
    campaignId: (search.campaignId as string) || '',
    influencerIds: (search.influencerIds as string) || '',
    productId: (search.productId as string) || '',
    optionId: (search.optionId as string) || '',
    searchQuery: (search.searchQuery as string) || '',
  };
}
