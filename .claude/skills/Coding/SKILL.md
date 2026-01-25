---
name: Coding
description: 공통 코딩 원칙. SRP, 결합도, 응집도, 폴더 구조 설계. Backend/Frontend 공통 참조.
keywords: [SRP, 단일책임, 결합도, 응집도, 설계원칙, 폴더구조, 아키텍처]
estimated_tokens: ~400
---

# 공통 코딩 원칙

## 단일 책임 원칙 (SRP)

> **하나의 모듈/컴포넌트는 하나의 책임만 가진다.**

### 백엔드 레이어별 책임

| 레이어 | 책임 | 금지 |
|--------|------|------|
| **Entity** | 데이터 구조 정의 | 비즈니스 로직 |
| **Repository** | 데이터 접근 | 비즈니스 로직 |
| **Service** | 비즈니스 로직 | HTTP/tRPC 의존 |
| **Controller** | 메시지 라우팅 | 비즈니스 로직 |
| **Router** | tRPC 엔드포인트 | 비즈니스 로직 |
| **DTO/Schema** | 데이터 전송 구조 | 로직 |

### 프론트엔드 컴포넌트별 책임

| 유형 | 책임 | 금지 |
|------|------|------|
| **Page** | 레이아웃, 데이터 fetch | 복잡한 로직 |
| **Container** | 상태 관리, API 호출 | 과도한 UI |
| **Presentational** | UI 렌더링 | API 호출, 전역 상태 |
| **Hook** | 특정 로직 캡슐화 | 여러 책임 혼합 |
| **Store** | 전역 상태 | UI 로직 |

---

## 결합도 낮추기

> **모듈 간 의존성을 최소화한다.**

### 공통 규칙

| 규칙 | 설명 |
|------|------|
| **순환 의존 금지** | A → B → A 형태 금지 |
| **상위 모듈 의존 금지** | shared는 도메인 모듈 의존 금지 |
| **인터페이스로 의존** | 구체 클래스 대신 추상화에 의존 |
| **공개 API 통해 접근** | index.ts를 통한 export만 사용 |

### 백엔드

```typescript
// ✅ 토큰 기반 주입
@Inject(getProductRepository)
private readonly repository: Repository<Product>

// ❌ 구체 클래스 직접 의존
private readonly repository: ProductRepository
```

### 프론트엔드

```typescript
// ✅ props로 의존성 전달
function ProductCard({ product, onAction }: Props) { ... }

// ❌ 전역 상태 직접 접근 (Presentational에서)
const action = useStore(s => s.action);
```

---

## 응집도 높이기

> **관련 있는 코드는 가까이 둔다.**

### 폴더 구조 원칙

```
✅ 높은 응집도:
- 같은 도메인 파일은 같은 폴더에
- 컴포넌트와 관련 스타일은 같은 파일에
- 기능별 hook 분리

❌ 낮은 응집도:
- 관련 없는 기능을 한 파일에
- 모든 컴포넌트를 최상위에
- 여러 도메인을 한 모듈에서 처리
```

### 백엔드 폴더 구조

```
apps/api/src/module/
├── backoffice/
│   ├── domain/          # Entity (공유)
│   ├── product/         # 기능별 폴더
│   │   ├── product.controller.ts
│   │   ├── product.service.ts
│   │   ├── product.dto.ts
│   │   └── product.module.ts
│   └── order/
├── shop/
└── shared/              # 공통 (상위 의존 금지)
```

### 프론트엔드 폴더 구조

```
apps/shop/src/
├── components/
│   ├── product/         # 도메인별 폴더
│   │   ├── ProductCard.tsx
│   │   ├── ProductList.tsx
│   │   └── index.ts
│   └── common/          # 공통 (도메인 의존 금지)
├── hooks/               # 도메인별 hook
├── store/               # 전역 상태
└── shared/              # 유틸리티
```

---

## 코드 작성 시 체크리스트

- [ ] 이 파일의 책임은 하나인가?
- [ ] 다른 모듈에 불필요하게 의존하고 있지 않은가?
- [ ] 관련 파일들이 같은 폴더에 있는가?
- [ ] 순환 의존이 발생하지 않는가?
- [ ] 공개 API(index.ts)를 통해 접근하는가?
