interface BankInfo {
  bankName: string; // 은행명
  accountNumber: string; // 계좌번호
  accountHolder: string; // 예금주명
}

type BusinessType = 'CORPORATION' | 'SOLE_PROPRIETOR' | 'INDIVIDUAL'; // 법인 사업자 / 간이 사업자 / 개인 사업자

type BusinessInfo = {
  businessType?: BusinessType; // 사업종류
  businessRegistrationNumber?: string; // 사업자 등록번호
  representativeName?: string; // 대표자명
  email?: string; // 이메일 주소
};

type SocialMedia = {
  platform: 'INSTAGRAM' | 'TIKTOK' | 'YOUTUBE' | string;
  url: string;
};

interface Influencer {
  name: string; // 인플루언서명
  socialMedia: SocialMedia;
  businessInfo?: BusinessInfo; // 사업자 정보
  bankInfo?: BankInfo; // 은행정보
}

// 사업자 등록번호, 대표자명, 메일주소, 은행, 계좌번호, 예금주명
interface Brand {
  name: string; // 브랜드명

  businessInfo?: BusinessInfo; // 사업자 정보
  bankInfo?: BankInfo; // 은행 정보
}
