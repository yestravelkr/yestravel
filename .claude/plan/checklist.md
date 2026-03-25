---
name: additional-payment-checklist
description: 주문 추가결제 기능 실행 체크리스트
created: 2026-03-25
---

# 추가결제 Checklist

## Phase 1: 계획
- [x] 목적 확인
- [x] GitHub Issue 생성 (#347, #348)
- [x] 브랜치 생성 (feat/additional-payment)
- [x] 1차 Plan 문서 작성 (기능/기획 중심)
- [x] 비즈니스 규칙 확정 (횟수, 유효기간, 발급조건, 취소정책 등)
- [x] Context 수집 (기존 결제/주문 코드 분석)
- [x] 2차 Plan 보강 (DB/API/FE 상세 설계)
- [ ] 사용자 Confirm

## Phase 2: 검증
- [x] Code Flow 분석: OrderEntity 1:N PaymentEntity 이미 존재 확인, PortOne 결제 패턴 확인
- [x] UserFlow 분석: 관리자 발급 → 고객 결제 → 다건 내역 확인 시나리오 설계
- [x] Breaking Change 확인: PaymentEntity 미수정, 기존 결제 플로우 영향 없음
- [x] 추가 검증: ShopClaimService에 취소 가드 추가 영향 분석

## Phase 3: 구현

### T1: DB - AdditionalPaymentEntity + 마이그레이션
- [ ] AdditionalPaymentEntity 작성 (token, title, amount, reason, expiresAt, paymentId, deletedAt)
- [ ] 상태 판단 로직 구현 (computed: deleted_at → payment 존재 → expiresAt → PENDING)
- [ ] PaymentEntity에 `@OneToOne(() => AdditionalPaymentEntity)` 역방향 관계 추가
- [ ] order-history-action에 3개 action 추가
- [ ] RepositoryProvider에 AdditionalPaymentRepository 추가
- [ ] 마이그레이션 작성 (테이블 + 인덱스 + FK)
- [ ] additionalPaymentNumberParser 작성 (ADDPAY prefix + Sqids)
- [ ] 유효기간 상수 정의 (ADDITIONAL_PAYMENT_EXPIRY_HOURS = 24)
- [ ] 커밋

### T2: Backoffice API - create, findByOrderId, cancel
- [ ] additional-payment.module.ts
- [ ] additional-payment.router.ts (backofficeAdditionalPayment alias)
- [ ] additional-payment.controller.ts (MessagePattern)
- [ ] additional-payment.service.ts (create: 정산전 검증 + 토큰생성 + title/reason, cancel: PENDING만 → deleted_at 기록)
- [ ] additional-payment.schema.ts (Zod - title 필드 포함)
- [ ] additional-payment.dto.ts
- [ ] App 모듈에 import 추가
- [ ] 커밋

### T3: Shop API - getByToken, complete
- [ ] shop.additional-payment.module.ts
- [ ] shop.additional-payment.router.ts (인증 미적용)
- [ ] shop.additional-payment.controller.ts
- [ ] shop.additional-payment.service.ts (getByToken: 만료 실시간 검증, complete: PortOne 승인 + Payment 생성 + totalAmount 갱신)
- [ ] shop.additional-payment.schema.ts
- [ ] shop.additional-payment.dto.ts
- [ ] App 모듈에 import 추가
- [ ] 커밋

### T4: 취소 차단 가드
- [ ] ShopClaimService에 추가결제(PENDING/PAID) 존재 여부 검증 추가
- [ ] 에러 메시지: "추가결제가 진행 중이므로 취소할 수 없습니다. 고객센터로 문의해주세요."
- [ ] 커밋

### T5: Shop Order API 수정
- [ ] shop.order.service.ts getOrderDetail에 hasActiveAdditionalPayment 필드 추가
- [ ] shop.order.service.ts getOrderDetail에 추가결제 목록(결제완료분) 포함
- [ ] shop.order.schema.ts 응답 스키마 확장
- [ ] 커밋

### T6: Backoffice FE - AdditionalPaymentCard
- [ ] packages/admin-shared/src/components/AdditionalPaymentCard.tsx 생성
- [ ] 추가결제 발급 모달 (금액, 사유 입력)
- [ ] 추가결제 목록 (상태 뱃지, 링크 복사, 무효화 버튼)
- [ ] hotel.$orderId.tsx에 AdditionalPaymentCard 통합
- [ ] 커밋

### T7: Shop FE - 추가결제 결제 페이지
- [ ] apps/shop/src/routes/additional-payment.$token.tsx 생성 (_auth 바깥)
- [ ] 추가결제 정보 표시 (상품명, 금액, 사유)
- [ ] 상태별 분기 (PENDING: 결제버튼, PAID/CANCELLED/EXPIRED: 안내)
- [ ] PortOne.requestPayment() 연동
- [ ] 결제 완료 후 shopAdditionalPayment.complete 호출
- [ ] 커밋

### T8: Shop FE - 주문 상세 수정
- [ ] PaymentSummarySection.tsx: 다건 결제 표시 (1차 + 추가결제)
- [ ] order.$orderNumber.tsx: hasActiveAdditionalPayment시 취소 비활성화 + CS 안내
- [ ] 커밋

## Phase 4: 리뷰
- [ ] 전체 요구사항 충족 확인
- [ ] 엣지케이스 점검 (만료/취소/중복발급/정산후발급시도)
- [ ] `cd apps/api && yarn lint` 실행
- [ ] 빌드 확인
