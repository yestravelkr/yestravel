export interface PortfolioCard {
  label: string;
  title: string;
}

export interface FeatureItem {
  subtitle: string;
  title: string;
  description: string;
}

export interface Influencer {
  name: string;
  description: string;
  platforms: string[];
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface PortfolioSectionProps {
  id?: string;
  title: string;
  description: string;
  cards: PortfolioCard[];
}

export interface MusesSectionProps {
  selectedIndex: number;
  onSelect: (index: number) => void;
}

export interface FaqSectionProps {
  openIndex: number;
  onToggle: (index: number) => void;
}

export interface ContactModalProps {
  $isOpen: boolean;
  brandName: string;
  contact: string;
  onBrandNameChange: (value: string) => void;
  onContactChange: (value: string) => void;
  onClose: () => void;
}

export const NAV_ITEMS = [
  { label: '레퍼런스', targetId: 'portfolio' },
  { label: '서비스 안내', targetId: 'features' },
  { label: '인플루언서', targetId: 'muses' },
] as const;

export const PARTNER_LOGO_ROW1 = '/assets/promo/partner-row1.jpg';
export const PARTNER_LOGO_ROW2 = '/assets/promo/partner-row2.jpg';

export const INFO_FEED_CARDS: PortfolioCard[] = [
  { label: '공구진행', title: '숙박 업체명' },
  { label: '공구진행', title: '숙박 업체명' },
  { label: '공구진행', title: '숙박 업체명' },
  { label: '공구진행', title: '숙박 업체명' },
];

export const VISIT_FEED_CARDS: PortfolioCard[] = [
  { label: '공구진행', title: '숙박 업체명' },
  { label: '공구진행', title: '숙박 업체명' },
  { label: '공구진행', title: '숙박 업체명' },
  { label: '공구진행', title: '숙박 업체명' },
];

export const FEATURES: FeatureItem[] = [
  {
    subtitle: '거품 뺀 실속형 단가',
    title: '원고료 50만원~',
    description: '서비스 이용료 5만원 별도',
  },
  {
    subtitle: '현장 맞춤형 브랜딩',
    title: '방문촬영 가능',
    description: '업종별 생생한 비주얼 소스 확보',
  },
  {
    subtitle: '마케팅 효율 극대화',
    title: '2차 활용 가능',
    description: '광고 및 상세페이지 활용',
  },
];

export const INFLUENCERS: Influencer[] = [
  {
    name: '다온맘',
    description: '아이와 함께하는 따뜻한 여행 기록',
    platforms: ['인스타그램', '틱톡'],
  },
  {
    name: '여행하는J',
    description: '감성 가득한 호캉스 전문가',
    platforms: ['인스타그램'],
  },
  {
    name: '트래블러K',
    description: '가성비 끝판왕 여행 크리에이터',
    platforms: ['인스타그램', '유튜브'],
  },
  {
    name: '럭셔리맘',
    description: '프리미엄 호텔 리뷰 전문',
    platforms: ['인스타그램'],
  },
  {
    name: '소소한여행',
    description: '일상 속 특별한 여행 이야기',
    platforms: ['인스타그램', '틱톡'],
  },
  {
    name: '하늘이맘',
    description: '하늘 아래 모든 여행을 기록하는 맘',
    platforms: ['인스타그램'],
  },
  {
    name: '제주살이',
    description: '제주 로컬 감성 여행 전문',
    platforms: ['인스타그램', '유튜브'],
  },
  {
    name: '호텔마니아',
    description: '국내외 호텔 리뷰 전문가',
    platforms: ['인스타그램'],
  },
  {
    name: '감성트립',
    description: '감성 넘치는 여행 브이로그',
    platforms: ['인스타그램', '틱톡'],
  },
  {
    name: '빈티지걸',
    description: '빈티지 감성 여행 크리에이터',
    platforms: ['인스타그램'],
  },
  {
    name: '여행에미치다',
    description: '여행 중독자의 솔직한 후기',
    platforms: ['인스타그램', '유튜브'],
  },
  {
    name: '맛있는여행',
    description: '맛집 탐방 여행 전문가',
    platforms: ['인스타그램'],
  },
  {
    name: '풍경사냥꾼',
    description: '아름다운 풍경을 담는 포토그래퍼',
    platforms: ['인스타그램'],
  },
  {
    name: '힐링타임',
    description: '힐링 여행 콘텐츠 크리에이터',
    platforms: ['인스타그램', '틱톡'],
  },
  {
    name: '바다사랑',
    description: '바다와 해변 여행 전문',
    platforms: ['인스타그램'],
  },
];

export const FAQ_ITEMS: FaqItem[] = [
  {
    question: '여행 상품만 진행하나요?',
    answer:
      '아니요, 예스트래블은 여행뿐만 아니라 뷰티, 식품, 생활용품 등 다양한 카테고리의 제품 광고 및 공동구매를 진행하는 하이브리드 에이전시입니다.',
  },
  {
    question: '인플루언서 섭외 비용은 별도인가요?',
    answer:
      '인플루언서 섭외 비용은 캠페인 패키지에 포함되어 있습니다. 별도의 섭외 비용이 발생하지 않으며, 브랜드에 적합한 인플루언서를 매칭해드립니다.',
  },
  {
    question: '공동구매 진행 절차가 궁금합니다.',
    answer:
      '상담 접수 후, 브랜드 분석 - 인플루언서 매칭 - 콘텐츠 기획 - 촬영/제작 - 공동구매 진행 순으로 약 2~3주 내 캠페인이 시작됩니다.',
  },
  {
    question: '광고 소재로만 활용 가능한가요?',
    answer:
      '네, 광고 소재뿐만 아니라 상세페이지, SNS 콘텐츠, 블로그 등 다양한 채널에서 2차 활용이 가능합니다.',
  },
];
