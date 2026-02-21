import { createFileRoute } from '@tanstack/react-router';
import { Download, MessageCircle, Minus, Plus } from 'lucide-react';
import { useState } from 'react';
import tw from 'tailwind-styled-components';

export const Route = createFileRoute('/promo')({
  component: PromoPage,
});

const NAV_ITEMS = [
  { label: '레퍼런스', targetId: 'portfolio' },
  { label: '서비스 안내', targetId: 'features' },
  { label: '인플루언서', targetId: 'muses' },
] as const;

const PARTNER_LOGO_ROW1 = '/assets/promo/partner-row1.jpg';
const PARTNER_LOGO_ROW2 = '/assets/promo/partner-row2.jpg';

interface PortfolioCard {
  label: string;
  title: string;
}

const INFO_FEED_CARDS: PortfolioCard[] = [
  { label: '공구진행', title: '숙박 업체명' },
  { label: '공구진행', title: '숙박 업체명' },
  { label: '공구진행', title: '숙박 업체명' },
  { label: '공구진행', title: '숙박 업체명' },
];

const VISIT_FEED_CARDS: PortfolioCard[] = [
  { label: '공구진행', title: '숙박 업체명' },
  { label: '공구진행', title: '숙박 업체명' },
  { label: '공구진행', title: '숙박 업체명' },
  { label: '공구진행', title: '숙박 업체명' },
];

interface FeatureItem {
  subtitle: string;
  title: string;
  description: string;
}

const FEATURES: FeatureItem[] = [
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

interface Influencer {
  name: string;
  description: string;
  platforms: string[];
}

const INFLUENCERS: Influencer[] = [
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

interface FaqItem {
  question: string;
  answer: string;
}

const FAQ_ITEMS: FaqItem[] = [
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

/**
 * PromoPage - 예스트래블 마케팅 솔루션 프로모션 랜딩 페이지
 *
 * 반응형 breakpoints:
 * - 모바일: 360px~ (기본 스타일)
 * - 태블릿: 600px~ (tablet:)
 * - 데스크톱: 1024px+ (lg:)
 */
function PromoPage() {
  const [openFaqIndex, setOpenFaqIndex] = useState<number>(0);
  const [selectedInfluencer, setSelectedInfluencer] = useState<number>(0);

  return (
    <PageWrapper>
      <HeaderSection />
      <HeroSection />
      <PartnersSection />
      <PortfolioSection
        id="portfolio"
        title="정보형 피드와 릴스"
        description="매출 전환과 클릭률(CTR)에 최적화된 소구점 중심 콘텐츠"
        cards={INFO_FEED_CARDS}
      />
      <PortfolioSection
        title="방문형 피드와 릴스"
        description="매출 전환과 클릭률(CTR)에 최적화된 소구점 중심 콘텐츠"
        cards={VISIT_FEED_CARDS}
      />
      <FeaturesSection />
      <MusesSection
        selectedIndex={selectedInfluencer}
        onSelect={setSelectedInfluencer}
      />
      <FaqSection openIndex={openFaqIndex} onToggle={setOpenFaqIndex} />
      <FooterSection />
      <ContactBar />
    </PageWrapper>
  );
}

function HeaderSection() {
  return (
    <HeaderWrapper>
      <HeaderInner>
        <LogoText>YESTRAVEL</LogoText>
        <NavGroup>
          {NAV_ITEMS.map(item => (
            <NavButton
              key={item.label}
              onClick={() =>
                document
                  .getElementById(item.targetId)
                  ?.scrollIntoView({ behavior: 'smooth' })
              }
            >
              <NavButtonLabel>{item.label}</NavButtonLabel>
            </NavButton>
          ))}
          <DownloadButton>
            <Download className="size-[18px]" color="white" />
            <DownloadButtonLabel>
              <span className="lg:hidden">제안서</span>
              <span className="hidden lg:inline">제안서 다운로드</span>
            </DownloadButtonLabel>
          </DownloadButton>
        </NavGroup>
      </HeaderInner>
    </HeaderWrapper>
  );
}

function HeroSection() {
  return (
    <HeroWrapper>
      <HeroImagePlaceholder />
      <HeroContent>
        <HeroTextGroup>
          <HeroTitle>
            YESTRAVEL
            <br />
            Marketing Solution
          </HeroTitle>
          <HeroDescription>
            여행부터 라이프스타일 제품까지.
            <br />
            브랜드의 매출과 브랜딩을 동시에 해결하는
            <br />
            인플루언서 커머스 &amp; 마케팅 플랫폼
          </HeroDescription>
        </HeroTextGroup>
        <HeroButtonGroup>
          <HeroPrimaryButton>
            <Download className="size-[18px]" color="white" />
            <HeroButtonLabel>제안서 다운로드</HeroButtonLabel>
          </HeroPrimaryButton>
          <HeroSecondaryButton
            onClick={() =>
              document
                .getElementById('portfolio')
                ?.scrollIntoView({ behavior: 'smooth' })
            }
          >
            <HeroButtonLabel>레퍼런스 보기</HeroButtonLabel>
          </HeroSecondaryButton>
        </HeroButtonGroup>
      </HeroContent>
    </HeroWrapper>
  );
}

function PartnersSection() {
  return (
    <PartnersWrapper>
      <PartnersTitleGroup>
        <PartnersTitle>YESTRAVEL과 함께하는 주요 고객사</PartnersTitle>
        <PartnersSubtitle>
          600여 브랜드와 함께 2,500회 이상의 캠페인을 성공으로 이끌었습니다.
        </PartnersSubtitle>
      </PartnersTitleGroup>
      <MarqueeContainer>
        <MarqueeTrack $direction="left">
          <MarqueeImage src={PARTNER_LOGO_ROW1} alt="" />
          <MarqueeImage src={PARTNER_LOGO_ROW1} alt="" />
        </MarqueeTrack>
      </MarqueeContainer>
      <MarqueeContainer>
        <MarqueeTrack $direction="right">
          <MarqueeImage src={PARTNER_LOGO_ROW2} alt="" />
          <MarqueeImage src={PARTNER_LOGO_ROW2} alt="" />
        </MarqueeTrack>
      </MarqueeContainer>
    </PartnersWrapper>
  );
}

interface PortfolioSectionProps {
  id?: string;
  title: string;
  description: string;
  cards: PortfolioCard[];
}

function PortfolioSection({
  id,
  title,
  description,
  cards,
}: PortfolioSectionProps) {
  return (
    <PortfolioWrapper id={id}>
      <PortfolioInner>
        <SectionTitleGroup>
          <SectionTitle>{title}</SectionTitle>
          <SectionDescription>{description}</SectionDescription>
        </SectionTitleGroup>
        <CardGrid>
          {cards.map((card, i) => (
            <PortfolioCardItem key={i}>
              <CardImagePlaceholder />
              <CardOverlay>
                <CardBadge>{card.label}</CardBadge>
                <CardTitle>{card.title}</CardTitle>
              </CardOverlay>
            </PortfolioCardItem>
          ))}
        </CardGrid>
      </PortfolioInner>
    </PortfolioWrapper>
  );
}

function FeaturesSection() {
  return (
    <FeaturesWrapper id="features">
      <FeaturesInner>
        <FeatureCardGrid>
          {FEATURES.map((feature, i) => (
            <FeatureCard key={i}>
              <FeatureSubtitle>{feature.subtitle}</FeatureSubtitle>
              <FeatureTitle>{feature.title}</FeatureTitle>
              <FeatureMutedText>{feature.description}</FeatureMutedText>
            </FeatureCard>
          ))}
        </FeatureCardGrid>
      </FeaturesInner>
    </FeaturesWrapper>
  );
}

interface MusesSectionProps {
  selectedIndex: number;
  onSelect: (index: number) => void;
}

function MusesSection({ selectedIndex, onSelect }: MusesSectionProps) {
  const selected = INFLUENCERS[selectedIndex];

  return (
    <MusesWrapper id="muses">
      <MusesInner>
        <SectionTitleGroup>
          <SectionTitle>OUR MUSES</SectionTitle>
          <SectionDescription>
            예스트래블이 보증하는 추천 인플루언서
          </SectionDescription>
        </SectionTitleGroup>
        <MusesContentRow>
          <InfluencerDetailCard>
            <InfluencerImagePlaceholder />
            <InfluencerInfo>
              <InfluencerTextGroup>
                <InfluencerName>{selected?.name}</InfluencerName>
                <InfluencerDescription>
                  {selected?.description}
                </InfluencerDescription>
              </InfluencerTextGroup>
              <PlatformChipGroup>
                {selected?.platforms.map(platform => (
                  <PlatformChip key={platform}>
                    {platform === '인스타그램' && <InstagramIcon />}
                    {platform === '틱톡' && <TiktokIcon />}
                    {platform === '유튜브' && <YoutubeIcon />}
                    <PlatformChipLabel>{platform}</PlatformChipLabel>
                  </PlatformChip>
                ))}
              </PlatformChipGroup>
            </InfluencerInfo>
          </InfluencerDetailCard>

          {/* Mobile/Tablet: horizontal scroll */}
          <InfluencerScrollSection>
            <InfluencerScrollFadeLeft />
            <InfluencerScrollTrack>
              {INFLUENCERS.map((inf, i) => (
                <InfluencerScrollItem
                  key={inf.name}
                  onClick={() => onSelect(i)}
                >
                  <InfluencerScrollAvatar $selected={i === selectedIndex}>
                    <AvatarPlaceholder />
                  </InfluencerScrollAvatar>
                  <InfluencerScrollName>{inf.name}</InfluencerScrollName>
                </InfluencerScrollItem>
              ))}
            </InfluencerScrollTrack>
            <InfluencerScrollFadeRight />
          </InfluencerScrollSection>

          {/* Desktop: 3x5 grid */}
          <InfluencerGridSection>
            {[
              INFLUENCERS.slice(0, 5),
              INFLUENCERS.slice(5, 10),
              INFLUENCERS.slice(10, 15),
            ].map((row, rowIndex) => (
              <InfluencerAvatarRow key={rowIndex}>
                {row.map((inf, i) => {
                  const globalIndex = rowIndex * 5 + i;
                  return (
                    <InfluencerAvatarItem
                      key={inf.name}
                      onClick={() => onSelect(globalIndex)}
                    >
                      <InfluencerAvatar
                        $selected={globalIndex === selectedIndex}
                      >
                        <AvatarPlaceholder />
                      </InfluencerAvatar>
                      <InfluencerAvatarName>{inf.name}</InfluencerAvatarName>
                    </InfluencerAvatarItem>
                  );
                })}
              </InfluencerAvatarRow>
            ))}
          </InfluencerGridSection>
        </MusesContentRow>
      </MusesInner>
    </MusesWrapper>
  );
}

interface FaqSectionProps {
  openIndex: number;
  onToggle: (index: number) => void;
}

function FaqSection({ openIndex, onToggle }: FaqSectionProps) {
  return (
    <FaqWrapper>
      <FaqTitle>자주 묻는 질문</FaqTitle>
      <FaqList>
        {FAQ_ITEMS.map((item, i) => (
          <FaqItemWrapper key={i}>
            <FaqDivider />
            <FaqQuestionRow onClick={() => onToggle(openIndex === i ? -1 : i)}>
              <FaqQuestion>{item.question}</FaqQuestion>
              {openIndex === i ? (
                <Minus className="size-6 shrink-0" />
              ) : (
                <Plus className="size-6 shrink-0" />
              )}
            </FaqQuestionRow>
            {openIndex === i && <FaqAnswer>{item.answer}</FaqAnswer>}
          </FaqItemWrapper>
        ))}
        <FaqDivider />
      </FaqList>
    </FaqWrapper>
  );
}

function ContactBar() {
  const [brandName, setBrandName] = useState('');
  const [contact, setContact] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <ContactBarWrapper>
        {/* Mobile/Tablet: 문의 버튼 */}
        <ContactBarMobile>
          <ContactBarMobileButton onClick={() => setIsModalOpen(true)}>
            <MessageCircle className="size-5 shrink-0" />
            <span>제휴 문의하기</span>
          </ContactBarMobileButton>
          <ContactBarMobileDesc>
            문의 남겨주시면 인플루언서 리스트를 보내드립니다.
          </ContactBarMobileDesc>
        </ContactBarMobile>

        {/* Desktop: 인라인 폼 */}
        <ContactBarDesktop>
          <ContactBarInfo>
            <MessageCircle className="size-6 shrink-0" />
            <div className="flex flex-col">
              <ContactBarTitle>제휴 문의</ContactBarTitle>
              <ContactBarDesc>
                문의 남겨주시면 인플루언서 리스트를 보내드립니다.
              </ContactBarDesc>
            </div>
          </ContactBarInfo>
          <ContactBarForm>
            <ContactInput
              type="text"
              placeholder="브랜드/업체명"
              value={brandName}
              onChange={e => setBrandName(e.target.value)}
            />
            <ContactInput
              type="text"
              placeholder="연락처"
              value={contact}
              onChange={e => setContact(e.target.value)}
            />
            <ContactSubmitButton>무료 상담 신청</ContactSubmitButton>
          </ContactBarForm>
        </ContactBarDesktop>
      </ContactBarWrapper>

      {/* Mobile Modal */}
      <ContactModal
        $isOpen={isModalOpen}
        brandName={brandName}
        contact={contact}
        onBrandNameChange={setBrandName}
        onContactChange={setContact}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}

interface ContactModalProps {
  $isOpen: boolean;
  brandName: string;
  contact: string;
  onBrandNameChange: (value: string) => void;
  onContactChange: (value: string) => void;
  onClose: () => void;
}

/**
 * ContactModal - 모바일 전용 바텀 시트 문의 모달
 */
function ContactModal({
  $isOpen,
  brandName,
  contact,
  onBrandNameChange,
  onContactChange,
  onClose,
}: ContactModalProps) {
  if (!$isOpen) return null;

  return (
    <ModalOverlay onClick={onClose}>
      <ModalCard onClick={e => e.stopPropagation()}>
        <ModalTitle>제휴 문의</ModalTitle>
        <ModalDesc>문의 남겨주시면 인플루언서 리스트를 보내드립니다.</ModalDesc>
        <ModalFormGroup>
          <ModalInput
            type="text"
            placeholder="브랜드/업체명"
            value={brandName}
            onChange={e => onBrandNameChange(e.target.value)}
          />
          <ModalInput
            type="text"
            placeholder="연락처"
            value={contact}
            onChange={e => onContactChange(e.target.value)}
          />
          <ModalSubmitButton>무료 상담 신청</ModalSubmitButton>
        </ModalFormGroup>
      </ModalCard>
    </ModalOverlay>
  );
}

function FooterSection() {
  return (
    <FooterWrapper>
      <FooterText>
        회사명 : (주)코이스토리 | 대표이사: 김두민
        <br />
        사업자번호 : 315-87-02973
        <br />
        주소 : 서울특별시 강남구 강남대로364, 1603호
        <br />
        고객센터 : 070-4858-1401 | e-mail :{' '}
        <FooterLink href="mailto:info@yestravel.co.kr">
          info@yestravel.co.kr
        </FooterLink>
      </FooterText>
    </FooterWrapper>
  );
}

// --- Icons ---

function InstagramIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
    >
      <path
        d="M10.0001 5.71755C12.3612 5.71755 14.3056 7.63885 14.3056 9.99996C14.3056 12.3611 12.3612 14.3055 10.0001 14.3055C7.63897 14.3055 5.71767 12.3611 5.71767 9.99996C5.71767 7.63885 7.63897 5.71755 10.0001 5.71755ZM10.0001 12.7777C11.5279 12.7777 12.7779 11.5277 12.7779 9.99996C12.7779 8.47218 11.5279 7.22218 10.0001 7.22218C8.4723 7.22218 7.2223 8.47218 7.2223 9.99996C7.2223 11.5277 8.4723 12.7777 10.0001 12.7777ZM14.4445 6.55089C13.9121 6.55089 13.4723 6.08792 13.4723 5.55552C13.4723 4.99996 13.9121 4.56015 14.4445 4.56015C15.0001 4.56015 15.463 4.99996 15.463 5.55552C15.463 6.08792 15.0001 6.55089 14.4445 6.55089ZM10.0001 1.66663C12.2686 1.66663 12.5464 1.68978 13.4492 1.71292C14.3288 1.75922 14.9538 1.89811 15.4862 2.10644C16.0186 2.31477 16.4816 2.6157 16.9445 3.05551C17.4075 3.54163 17.6853 3.98144 17.8936 4.537C18.1019 5.0694 18.264 5.6944 18.2871 6.57403C18.3103 7.45366 18.3334 7.73144 18.3334 9.99996C18.3334 12.2685 18.3103 12.5463 18.2871 13.449C18.264 14.3055 18.1019 14.9537 17.8936 15.4629C17.6853 16.0185 17.3843 16.4814 16.9445 16.9444C16.4816 17.3842 16.0186 17.6851 15.463 17.8935C14.9538 18.1018 14.3056 18.2638 13.4492 18.287C12.5464 18.3101 12.2686 18.3333 10.0001 18.3333C7.73156 18.3333 7.45379 18.3101 6.57416 18.287C5.69453 18.2638 5.06953 18.1018 4.53712 17.8935C3.98156 17.6851 3.54175 17.3842 3.05564 16.9444C2.61582 16.4814 2.3149 16.0185 2.10656 15.4629C1.89823 14.9537 1.73619 14.3055 1.71304 13.449C1.6899 12.5463 1.66675 12.2685 1.66675 9.99996C1.66675 7.73144 1.6899 7.45366 1.71304 6.55089C1.73619 5.6944 1.89823 5.0694 2.10656 4.537C2.3149 3.98144 2.61582 3.54163 3.05564 3.05551C3.54175 2.6157 3.98156 2.31477 4.53712 2.10644C5.06953 1.89811 5.69453 1.73607 6.57416 1.71292C7.45379 1.68978 7.73156 1.66663 10.0001 1.66663ZM10.0001 3.17126L6.62045 3.1944C5.83342 3.26385 5.3936 3.37959 5.09267 3.49533C4.69916 3.65737 4.42138 3.84255 4.12045 4.12033C3.84267 4.39811 3.65749 4.67589 3.49545 5.0694C3.37971 5.37033 3.26397 5.81014 3.21767 6.62033L3.19453 9.99996L3.21767 13.3796C3.26397 14.1666 3.37971 14.6064 3.49545 14.9074C3.65749 15.3009 3.84267 15.5787 4.12045 15.8796C4.42138 16.1574 4.69916 16.3426 5.09267 16.4814C5.3936 16.5972 5.83342 16.7361 6.62045 16.7824L10.0001 16.8055L13.3797 16.7824C14.1899 16.7361 14.6297 16.5972 14.9306 16.4814C15.3242 16.3426 15.6019 16.1574 15.8797 15.8796C16.1575 15.5787 16.3427 15.3009 16.5047 14.9074C16.6205 14.6064 16.7593 14.1666 16.8056 13.3796L16.8288 9.99996L16.8056 6.62033C16.7593 5.83329 16.6205 5.37033 16.5047 5.0694C16.3427 4.67589 16.1575 4.39811 15.8797 4.12033C15.6019 3.84255 15.3242 3.65737 14.9306 3.49533C14.6297 3.37959 14.1899 3.26385 13.3797 3.1944L10.0001 3.17126Z"
        fill="#18181B"
      />
    </svg>
  );
}

function TiktokIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
    >
      <path
        d="M13.3542 1.66663C13.3542 3.79163 15 5.54163 17.125 5.60413V8.45829C15.75 8.43746 14.4583 7.95829 13.3958 7.20829V13.0416C13.3958 15.9375 11.0417 18.3333 8.14583 18.3333C5.22917 18.3333 2.875 15.9583 2.875 13.0416C2.875 10.1041 5.1875 7.74996 8.04167 7.70829V10.5416C6.75 10.6041 5.6875 11.7083 5.6875 13.0416C5.6875 14.375 6.77083 15.4791 8.125 15.4791C9.45833 15.4791 10.5417 14.375 10.5417 13.0416V1.66663H13.3542Z"
        fill="#18181B"
      />
    </svg>
  );
}

function YoutubeIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
    >
      <path
        d="M17.7 5.9C17.5 5.2 16.9 4.6 16.2 4.5C14.8 4.2 10 4.2 10 4.2C10 4.2 5.2 4.2 3.8 4.5C3.1 4.7 2.5 5.2 2.3 5.9C2 7.3 2 10 2 10C2 10 2 12.7 2.3 14.1C2.5 14.8 3.1 15.4 3.8 15.5C5.2 15.8 10 15.8 10 15.8C10 15.8 14.8 15.8 16.2 15.5C16.9 15.3 17.5 14.8 17.7 14.1C18 12.7 18 10 18 10C18 10 18 7.3 17.7 5.9ZM8.3 12.5V7.5L12.7 10L8.3 12.5Z"
        fill="#18181B"
      />
    </svg>
  );
}

// --- Styled Components ---

const PageWrapper = tw.div`
  w-full min-h-screen bg-white
  flex flex-col items-start
  overflow-clip rounded-[32px]
`;

// Header
const HeaderWrapper = tw.div`
  w-full
  px-4 tablet:px-5 lg:px-[110px]
`;

const HeaderInner = tw.header`
  w-full
  h-[56px] tablet:h-[68px] lg:h-[76px]
  flex items-center gap-3
  bg-white overflow-clip
  py-2
`;

const LogoText = tw.p`
  flex-1 font-bold
  text-[18px] tablet:text-[21px] lg:text-[27px]
  leading-[36px] text-[#18181b]
`;

const NavGroup = tw.nav`
  flex items-center gap-0
`;

const NavButton = tw.button`
  hidden lg:flex
  h-[44px] min-w-[44px]
  items-center justify-center
  px-3 rounded-[22px]
  bg-transparent
`;

const NavButtonLabel = tw.span`
  font-medium text-[16.5px] leading-[22px]
  text-[#18181b] px-1
`;

const DownloadButton = tw.button`
  h-[32px] tablet:h-[36px] lg:h-[44px]
  min-w-[44px]
  flex items-center justify-center gap-1
  px-3 rounded-[22px]
  bg-[#18181b]
`;

const DownloadButtonLabel = tw.span`
  font-medium text-[16.5px] leading-[22px]
  text-white px-1
`;

// Hero
const HeroWrapper = tw.section`
  w-full
  px-4 tablet:px-5 lg:px-[110px]
  flex flex-col items-center
  gap-6 tablet:gap-8 lg:gap-8
  bg-white overflow-clip
  pb-12 tablet:pb-16 lg:pb-[96px]
`;

const HeroImagePlaceholder = tw.div`
  w-full
  h-[200px] tablet:h-[240px] lg:h-[400px]
  bg-gray-200 rounded-[20px]
`;

const HeroContent = tw.div`
  w-full flex flex-col items-center justify-center
  gap-8
`;

const HeroTextGroup = tw.div`
  w-full flex flex-col items-start
  gap-3 text-center text-[#18181b]
`;

const HeroTitle = tw.h1`
  w-full font-bold
  text-[24px] leading-[32px]
  tablet:text-[27px] tablet:leading-[36px]
  lg:text-[36px] lg:leading-[48px]
`;

const HeroDescription = tw.p`
  w-full font-normal text-[16.5px] leading-[22px]
`;

const HeroButtonGroup = tw.div`
  w-full lg:w-auto
  flex flex-col lg:flex-row
  items-start gap-2
`;

const HeroPrimaryButton = tw.button`
  w-full lg:w-[200px]
  h-[52px]
  flex items-center justify-center gap-1
  px-4 rounded-[27px]
  bg-[#18181b]
`;

const HeroSecondaryButton = tw.button`
  w-full lg:w-[200px]
  h-[52px]
  flex items-center justify-center
  px-4 rounded-[27px]
  bg-[#449afc]
`;

const HeroButtonLabel = tw.span`
  font-medium text-[16.5px] leading-[22px]
  text-white px-1
`;

// Partners
const PartnersWrapper = tw.section`
  w-full
  flex flex-col items-center justify-center gap-8
  bg-[#18181b]
  py-12 tablet:py-16 lg:py-16
`;

const PartnersTitleGroup = tw.div`
  w-full flex flex-col items-start gap-2
  text-white text-center
`;

const PartnersTitle = tw.h2`
  w-full font-bold
  text-[21px] tablet:text-[27px] lg:text-[27px]
  leading-[36px]
`;

const PartnersSubtitle = tw.p`
  w-full font-normal text-[16.5px] leading-[22px]
`;

const MarqueeContainer = tw.div`
  w-full overflow-hidden
`;

const MarqueeTrack = tw.div<{ $direction: 'left' | 'right' }>`
  flex items-center w-max
  ${({ $direction }) =>
    $direction === 'left' ? 'animate-marquee-left' : 'animate-marquee-right'}
`;

const MarqueeImage = tw.img`
  h-[50px] w-auto shrink-0 object-contain
  mr-8
`;

// Portfolio (Feed sections)
const PortfolioWrapper = tw.section`
  w-full
  px-4 tablet:px-5 lg:px-[110px]
  flex flex-col items-center justify-center
  gap-16
  py-12 tablet:py-16 lg:py-16
  bg-white overflow-clip
`;

const PortfolioInner = tw.div`
  w-full max-w-[1220px]
  flex flex-col items-start gap-8
`;

const SectionTitleGroup = tw.div`
  w-full flex flex-col items-start gap-2
  text-[#18181b] text-center
`;

const SectionTitle = tw.h2`
  w-full font-bold text-[27px] leading-[36px]
`;

const SectionDescription = tw.p`
  w-full font-normal text-[16.5px] leading-[22px]
`;

const CardGrid = tw.div`
  w-full
  grid grid-cols-2 gap-2
  lg:grid-cols-4 lg:gap-5
`;

const PortfolioCardItem = tw.div`
  min-w-0 min-h-0
  aspect-[280/420]
  flex flex-col items-start justify-end
  overflow-clip rounded-xl
  relative
`;

const CardImagePlaceholder = tw.div`
  absolute inset-0
  bg-gray-300 rounded-xl
`;

const CardOverlay = tw.div`
  relative w-full
  flex flex-col items-start justify-center gap-2
  px-5 pb-5 pt-12
  bg-gradient-to-t from-black/50 to-transparent
`;

const CardBadge = tw.span`
  flex items-center justify-center
  h-5 min-w-[20px] px-1
  bg-[#18181b] rounded-lg
  font-medium text-xs leading-4 text-white
`;

const CardTitle = tw.p`
  w-full font-bold text-lg leading-6 text-white
`;

// Features
const FeaturesWrapper = tw.section`
  w-full
  px-4 tablet:px-5 lg:px-[110px]
  py-16
  bg-white overflow-clip
  flex flex-col items-center justify-center
`;

const FeaturesInner = tw.div`
  w-full
  bg-[#f4f4f5] rounded-[32px]
  flex flex-col items-center justify-center
  px-5 py-16
`;

const FeatureCardGrid = tw.div`
  w-full
  flex flex-col lg:flex-row
  items-center justify-center
  gap-12 tablet:gap-16 lg:gap-5
  text-center overflow-clip
`;

const FeatureCard = tw.div`
  flex-1 min-w-0 min-h-0
  flex flex-col items-center gap-1
  overflow-clip
`;

const FeatureSubtitle = tw.p`
  w-full font-bold text-lg leading-6
  text-[#18181b]
`;

const FeatureTitle = tw.p`
  w-full font-bold text-[36px] leading-[48px]
  text-[#18181b]
`;

const FeatureMutedText = tw.p`
  w-full font-normal text-[16.5px] leading-[22px]
  text-[#71717a]
`;

// Muses / Influencers
const MusesWrapper = tw.section`
  w-full
  px-4 tablet:px-5 lg:px-[110px]
  py-12 tablet:py-16 lg:py-16
  bg-white overflow-clip
  flex flex-col items-center justify-center
`;

const MusesInner = tw.div`
  w-full
  flex flex-col items-start gap-8
`;

const MusesContentRow = tw.div`
  w-full
  flex flex-col lg:flex-row
  items-center gap-8 lg:gap-12
`;

const InfluencerDetailCard = tw.div`
  w-full tablet:max-w-[360px] tablet:mx-auto lg:max-w-none lg:mx-0
  lg:w-[400px] shrink-0
  flex flex-col items-start
  bg-[#f4f4f5] rounded-[20px]
  overflow-clip
`;

const InfluencerImagePlaceholder = tw.div`
  w-full aspect-square
  bg-gray-300
`;

const InfluencerInfo = tw.div`
  w-full flex flex-col gap-5
  items-start justify-center
  p-5 lg:px-8 lg:py-8
  lg:h-[208px]
`;

const InfluencerTextGroup = tw.div`
  w-full flex flex-col items-start gap-2
  text-[#18181b]
`;

const InfluencerName = tw.p`
  w-full font-bold
  text-[21px] lg:text-[27px]
  leading-[36px]
`;

const InfluencerDescription = tw.p`
  w-full font-normal text-[16.5px] leading-[22px]
`;

const PlatformChipGroup = tw.div`
  flex items-start gap-2
`;

const PlatformChip = tw.div`
  h-9 flex items-center justify-center
  px-2 rounded-xl
  bg-white
  border border-solid border-[var(--stroke-neutral,#e4e4e7)]
`;

const PlatformChipLabel = tw.span`
  font-normal text-[15px] leading-5
  text-[#18181b] px-1
`;

// Mobile/Tablet: horizontal scroll avatars
const InfluencerScrollSection = tw.div`
  w-full relative
  lg:hidden
`;

const InfluencerScrollFadeLeft = tw.div`
  absolute left-0 top-0 bottom-0 w-6 z-10
  bg-gradient-to-r from-white to-transparent
  pointer-events-none
`;

const InfluencerScrollFadeRight = tw.div`
  absolute right-0 top-0 bottom-0 w-6 z-10
  bg-gradient-to-l from-white to-transparent
  pointer-events-none
`;

const InfluencerScrollTrack = tw.div`
  w-full flex items-start gap-3
  overflow-x-auto
  scrollbar-hide
`;

const InfluencerScrollItem = tw.button`
  flex-shrink-0
  w-[60px]
  flex flex-col items-center gap-1
`;

const InfluencerScrollAvatar = tw.div<{ $selected: boolean }>`
  w-[60px] h-[60px]
  flex flex-col items-start
  overflow-clip rounded-full
  ${({ $selected }) =>
    $selected ? 'border-[3px] border-solid border-[#18181b]' : 'border-0'}
`;

const InfluencerScrollName = tw.p`
  w-full text-center
  font-normal text-xs leading-4
  text-[#18181b] truncate
`;

// Desktop: 3x5 grid avatars
const InfluencerGridSection = tw.div`
  hidden lg:flex
  flex-1 min-w-0
  flex-col items-center gap-8
`;

const InfluencerAvatarRow = tw.div`
  w-full flex gap-5 items-start
  overflow-clip
`;

const InfluencerAvatarItem = tw.button`
  flex-1 min-w-0 min-h-0
  flex flex-col items-start gap-3
`;

const InfluencerAvatar = tw.div<{ $selected: boolean }>`
  w-full aspect-square
  flex flex-col items-start
  overflow-clip rounded-full
  ${({ $selected }) =>
    $selected ? 'border-[6px] border-solid border-[#18181b]' : 'border-0'}
`;

const AvatarPlaceholder = tw.div`
  w-full aspect-square
  bg-gray-300 rounded-full
`;

const InfluencerAvatarName = tw.p`
  w-full text-center
  font-normal text-[16.5px] leading-[22px]
  text-[#18181b]
`;

// FAQ
const FaqWrapper = tw.section`
  w-full
  px-4 tablet:px-5 lg:px-[120px]
  py-12 tablet:py-16 lg:py-16
  bg-white overflow-clip
  flex flex-col items-center justify-center gap-8
`;

const FaqTitle = tw.h2`
  w-full text-center
  font-bold text-[27px] leading-[36px]
  text-[#18181b]
`;

const FaqList = tw.div`
  w-full lg:w-[820px]
  flex flex-col items-start gap-8
`;

const FaqDivider = tw.div`
  w-full h-[2px] bg-[#18181b]
`;

const FaqItemWrapper = tw.div`
  w-full flex flex-col items-start gap-5
`;

const FaqQuestionRow = tw.button`
  w-full flex items-start gap-2
  cursor-pointer
`;

const FaqQuestion = tw.p`
  flex-1 min-w-0 text-left
  font-bold text-[21px] leading-7
  text-[#18181b]
`;

const FaqAnswer = tw.p`
  w-full font-normal text-[16.5px] leading-[22px]
  text-[#18181b]
`;

// Contact Bar (Fixed Bottom)
const ContactBarWrapper = tw.div`
  fixed bottom-0 left-0 right-0 z-50
  bg-white border-t border-[#e4e4e7]
  px-4 tablet:px-5 lg:px-[120px]
  py-3 lg:py-4
`;

// Mobile/Tablet: 문의 버튼 + 안내 텍스트
const ContactBarMobile = tw.div`
  flex flex-col items-center gap-2
  lg:hidden
`;

const ContactBarMobileButton = tw.button`
  w-full h-[48px]
  flex items-center justify-center gap-2
  rounded-xl
  bg-[#18181b] text-white
  font-semibold text-[15px]
  cursor-pointer
`;

const ContactBarMobileDesc = tw.p`
  font-normal text-[13px] leading-4
  text-[#71717a]
`;

// Desktop: 인라인 폼
const ContactBarDesktop = tw.div`
  hidden lg:flex
  w-full max-w-[1200px] mx-auto
  items-center justify-between
  gap-4
`;

const ContactBarInfo = tw.div`
  flex items-center gap-3
`;

const ContactBarTitle = tw.p`
  font-bold text-[16px] leading-5
  text-[#18181b]
`;

const ContactBarDesc = tw.p`
  font-normal text-[13px] leading-4
  text-[#71717a]
`;

const ContactBarForm = tw.div`
  flex items-center gap-2
`;

const ContactInput = tw.input`
  h-[44px] w-[160px]
  px-3 rounded-xl
  border border-[#e4e4e7]
  bg-white
  text-sm text-[#18181b]
  placeholder:text-[#a1a1aa]
  outline-none
  focus:border-[#18181b]
`;

const ContactSubmitButton = tw.button`
  h-[44px] px-6
  rounded-xl
  bg-[#18181b] text-white
  font-semibold text-sm
  whitespace-nowrap
  cursor-pointer
  hover:bg-[#27272a]
  transition-colors
`;

// Modal (Mobile bottom sheet)
const ModalOverlay = tw.div`
  fixed inset-0 z-[60]
  bg-black/50
  flex items-end justify-center
  lg:hidden
`;

const ModalCard = tw.div`
  w-full
  bg-white
  rounded-t-2xl
  px-5 pt-8 pb-8
  flex flex-col gap-4
`;

const ModalTitle = tw.p`
  font-bold text-[18px] leading-6
  text-[#18181b]
`;

const ModalDesc = tw.p`
  font-normal text-[14px] leading-5
  text-[#71717a]
`;

const ModalFormGroup = tw.div`
  flex flex-col gap-3
  mt-2
`;

const ModalInput = tw.input`
  h-[48px] w-full
  px-4 rounded-xl
  border border-[#e4e4e7]
  bg-white
  text-sm text-[#18181b]
  placeholder:text-[#a1a1aa]
  outline-none
  focus:border-[#18181b]
`;

const ModalSubmitButton = tw.button`
  h-[48px] w-full
  rounded-xl
  bg-[#18181b] text-white
  font-semibold text-[15px]
  cursor-pointer
  hover:bg-[#27272a]
  transition-colors
  mt-1
`;

// Footer
const FooterWrapper = tw.footer`
  w-full
  px-4 tablet:px-5 lg:px-[120px]
  py-12 tablet:py-16 lg:py-16
  pb-24 tablet:pb-28 lg:pb-28
  bg-[#18181b]
  flex flex-col items-center justify-center
  overflow-clip
`;

const FooterText = tw.p`
  w-full text-center
  font-normal text-xs leading-4
  text-white/60
`;

const FooterLink = tw.a`
  underline text-white/60
`;
