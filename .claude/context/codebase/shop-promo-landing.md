---
name: Shop Promo Landing
description: Shop 프로모션 랜딩 페이지 - 인플루언서 마케팅 제휴 문의 페이지 컴포넌트 구조
keywords: [promo, 프로모션, 랜딩, 인플루언서, 제휴문의, ContactBar, 공동구매]
---

# Shop Promo Landing

프로모션 랜딩 페이지로, 인플루언서 마케팅 서비스를 홍보하고 제휴 문의를 받는 단일 페이지이다. tailwind-styled-components 기반 스타일링을 사용하며, 반응형(모바일/데스크톱) 레이아웃을 지원한다.

## 파일 구조

| 파일 | 역할 | 핵심 함수/클래스 |
|------|------|-----------------|
| apps/shop/src/routes/promo.tsx | 프로모션 페이지 라우트 진입점 | - |
| apps/shop/src/routes/promo/constants.ts | 타입 정의 및 상수 데이터 | PortfolioCard, FeatureItem, Influencer, FaqItem, ContactModalProps, NAV_ITEMS, FEATURES, INFLUENCERS, FAQ_ITEMS |
| apps/shop/src/routes/promo/icons.tsx | 커스텀 아이콘 컴포넌트 | - |
| apps/shop/src/routes/promo/components/HeroSection.tsx | 히어로 섹션 | - |
| apps/shop/src/routes/promo/components/HeaderSection.tsx | 헤더/네비게이션 섹션 | - |
| apps/shop/src/routes/promo/components/PortfolioSection.tsx | 포트폴리오/레퍼런스 섹션 | - |
| apps/shop/src/routes/promo/components/FeaturesSection.tsx | 서비스 특징 소개 섹션 | - |
| apps/shop/src/routes/promo/components/MusesSection.tsx | 인플루언서 소개 섹션 | - |
| apps/shop/src/routes/promo/components/PartnersSection.tsx | 파트너사 로고 섹션 | - |
| apps/shop/src/routes/promo/components/FaqSection.tsx | FAQ 아코디언 섹션 | - |
| apps/shop/src/routes/promo/components/FooterSection.tsx | 푸터 섹션 | - |
| apps/shop/src/routes/promo/components/ContactBar.tsx | 하단 고정 제휴 문의 바 + 모바일 모달 | ContactBar(), ContactModal() |

## 핵심 흐름

1. 사용자가 `/promo` 경로 접근 → `promo.tsx` 라우트 렌더링
2. 페이지 스크롤: Hero → Header(네비게이션) → Portfolio → Features → Muses → Partners → FAQ → Footer
3. 하단 고정 ContactBar: 데스크톱에서는 인라인 폼, 모바일에서는 버튼 클릭 시 바텀시트 모달 노출
4. 제휴 문의 폼 입력(브랜드명, 연락처) → 상담 신청

## 관련 Business Context

- [프로모션 랜딩](../business/promotion-landing.md)
