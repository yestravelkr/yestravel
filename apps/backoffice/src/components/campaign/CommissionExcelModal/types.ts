/**
 * CommissionExcelModal - 공유 TypeScript 인터페이스
 */

export interface HotelOption {
  id: number;
  name: string;
  priceByDate: Record<string, number>;
  anotherPriceByDate: Record<
    string,
    {
      supplyPrice: number;
      commission: number;
    }
  >;
}

export interface Product {
  id: number;
  name: string;
  hotelOptions: HotelOption[];
}

export interface CommissionData {
  hotelOptionId: number;
  commissionByDate: Record<string, number>;
}

export interface CommissionExcelModalProps {
  product: Product;
  campaignStartDate: string;
  campaignEndDate: string;
  currentCommissionData: CommissionData[];
  onApply: (commissionData: CommissionData[]) => void;
}

export interface ExcelRow {
  상품명: string;
  옵션명: string;
  날짜: string;
  수수료: number;
}

export interface PreviewRow {
  hotelOptionId: number;
  optionName: string;
  date: string;
  commission: number;
  isValid: boolean;
  errorMessage: string | null;
}

export interface PreviewData {
  validRows: PreviewRow[];
  invalidRows: PreviewRow[];
  totalCount: number;
  validCount: number;
  invalidCount: number;
}
