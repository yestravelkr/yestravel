---
name: Shop Promo Landing
description: Shop 프로모션 랜딩 페이지 - 인플루언서 마케팅 서비스 소개 및 제휴 문의 전환 페이지
keywords: [프로모션, 랜딩페이지, 인플루언서, 마케팅, 제휴문의, promo, landing]
---

# Shop Promo Landing

인플루언서 마케팅 서비스를 소개하고 제휴 문의를 유도하는 프로모션 랜딩 페이지. TanStack Router 기반 단일 라우트로 구성되며, 모바일 퍼스트 반응형 디자인을 적용한다.

## 파일 구조

| 파일 | 역할 | 핵심 함수/클래스 |
|------|------|-----------------|
| apps/shop/src/routes/promo.tsx | 라우트 진입점, 전체 섹션 조합 및 상태 관리 | Route, PromoPage() |
| apps/shop/src/routes/promo/constants.ts | 정적 데이터 및 타입 정의 | NAV_ITEMS, PARTNER_LOGO_ROW1/2, INFO_FEED_CARDS, VISIT_FEED_CARDS, FEATURES, INFLUENCERS, FAQ_ITEMS |
| apps/shop/src/routes/promo/icons.tsx | 소셜 플랫폼 SVG 아이콘 | InstagramIcon(), TiktokIcon(), YoutubeIcon() |
| apps/shop/src/routes/promo/components/HeaderSection.tsx | 상단 네비게이션 (로고, 앵커 nav, 제안서 CTA) | HeaderSection() |
| apps/shop/src/routes/promo/components/HeroSection.tsx | 히어로 배너 (헤드카피, CTA 버튼) | HeroSection() |
| apps/shop/src/routes/promo/components/PartnersSection.tsx | 파트너 로고 마퀴 애니메이션 | PartnersSection() |
| apps/shop/src/routes/promo/components/PortfolioSection.tsx | 포트폴리오 카드 그리드 (재사용 2회) | PortfolioSection() |
| apps/shop/src/routes/promo/components/FeaturesSection.tsx | 서비스 특장점 3종 카드 | FeaturesSection() |
| apps/shop/src/routes/promo/components/MusesSection.tsx | 인플루언서 15인 소개 그리드 | MusesSection() |
| apps/shop/src/routes/promo/components/FaqSection.tsx | 아코디언 FAQ | FaqSection() |
| apps/shop/src/routes/promo/components/FooterSection.tsx | 회사 법인 정보 푸터 | FooterSection() |
| apps/shop/src/routes/promo/components/ContactBar.tsx | 하단 고정 제휴 문의 바 (모바일: 바텀시트, 데스크톱: 인라인 폼) | ContactBar() |

## 핵심 흐름

1. TanStack Router `/promo` 라우트 → `PromoPage` 렌더링
2. `PromoPage`에서 `openFaqIndex`, `selectedInfluencer` 상태를 관리하고 자식 컴포넌트에 prop 전달
3. `constants.ts`의 정적 데이터가 각 섹션 컴포넌트에 주입됨

## 컴포넌트 계층

```
PromoPage (promo.tsx)
├── HeaderSection (앵커 nav)
├── HeroSection (히어로 배너)
├── PartnersSection (로고 마퀴)
├── PortfolioSection x2 (정보형/방문형 피드)
├── FeaturesSection (특장점 카드)
├── MusesSection (인플루언서 프로필)
├── FaqSection (아코디언 FAQ)
├── FooterSection (법인 정보)
└── ContactBar (고정 CTA)
```

## 주요 패턴

| 패턴 | 적용 |
|------|------|
| 스타일링 | tailwind-styled-components (`tw.div`, `tw.section`) |
| 반응형 breakpoint | 모바일 360px+(기본), `tablet:`, `lg:`(1024px+) |
| 조건부 스타일 | `tw.div<{ $selected: boolean }>` transient prop |
| 상태 끌어올리기 | `openFaqIndex`, `selectedInfluencer`를 PromoPage에서 관리 |
| 스크롤 앵커 | `scrollIntoView({ behavior: 'smooth' })` |
| 마퀴 애니메이션 | `animate-marquee-left/right` Tailwind 커스텀 애니메이션 |
| 모바일/데스크톱 분기 | `lg:hidden` / `hidden lg:flex` 쌍 |

## 관련 Business Context

- [프로모션 랜딩](../business/promotion-landing.md)
