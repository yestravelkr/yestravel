---
name: Coding
description: 모든 코드 작성 시 참조. SRP/결합도/응집도 판단 기준, 폴더 구조 설계 원칙, 삼항연산자/try-catch 가독성 규칙, Plan 필수 항목(DB/FE Flow/API + 의사결정 근거) 제공.
keywords: [SRP, 단일책임, 결합도, 응집도, 설계원칙, 폴더구조, 아키텍처, 가독성, 삼항연산자, try-catch, Plan, DB설계, FE Flow, API구성, 의사결정]
user-invocable: false
---

# 공통 코딩 원칙

<rules>

## 단일 책임 원칙 (SRP)

> **하나의 모듈/컴포넌트는 하나의 책임만 가진다.**

### 백엔드 레이어별 책임

| 레이어 | 책임 | 전담 영역 |
|--------|------|----------|
| **Entity** | 데이터 구조 정의 | 구조 정의에 집중 |
| **Repository** | 데이터 접근 | 데이터 접근에 집중 |
| **Service** | 비즈니스 로직 | 비즈니스 로직에 집중 |
| **Controller** | 요청 라우팅 | 요청/응답 처리에 집중 |
| **DTO/Schema** | 데이터 전송 구조 | 데이터 전송에 집중 |

### 프론트엔드 컴포넌트별 책임

| 유형 | 책임 | 전담 영역 |
|------|------|----------|
| **Page** | 레이아웃, 데이터 fetch | 레이아웃과 fetch에 집중 |
| **Container** | 상태 관리, API 호출 | 상태/API에 집중 |
| **Presentational** | UI 렌더링 | UI 렌더링에 집중 (props로 데이터 수신) |
| **Hook** | 특정 로직 캡슐화 | 단일 로직에 집중 |
| **Store** | 전역 상태 | 상태 관리에 집중 |

---

## 결합도 낮추기

> **모듈 간 의존성을 최소화한다.**

### 공통 규칙

| 규칙 | 설명 |
|------|------|
| **단방향 의존 유지** | A → B 단방향으로 유지 (순환 구조 대신) |
| **상위 모듈은 독립적으로 유지** | shared는 도메인 모듈과 독립 유지 |
| **인터페이스에 의존** | 구체 클래스 대신 추상화에 의존 |
| **공개 API 통해 접근** | index.ts를 통한 export만 사용 |

### 백엔드

<examples>
<example type="good">
```typescript
// 토큰 기반 주입 / 인터페이스 의존
@Inject(PRODUCT_REPOSITORY)
private readonly repository: IProductRepository
```
</example>
<example type="bad">
```typescript
// ❌ 구체 클래스 직접 의존
private readonly repository: ProductRepository
```
</example>
</examples>

### 프론트엔드

<examples>
<example type="good">
```typescript
// props로 의존성 전달
function ProductCard({ product, onAction }: Props) { ... }
```
</example>
<example type="bad">
```typescript
// ❌ Presentational에서 전역 상태 직접 접근
const action = useStore(s => s.action);
```
</example>
</examples>

---

## 응집도 높이기

> **관련 있는 코드는 가까이 둔다.**

### 폴더 구조 원칙

```
높은 응집도:
- 같은 도메인 파일은 같은 폴더에
- 컴포넌트와 관련 스타일은 같은 파일에
- 기능별 hook 분리

낮은 응집도 (피해야 함):
- 관련 없는 기능을 한 파일에
- 모든 컴포넌트를 최상위에
- 여러 도메인을 한 모듈에서 처리
```

### 폴더 구조 예시

```
src/
├── module/
│   ├── domain/          # Entity (공유)
│   ├── product/         # 기능별 폴더
│   │   ├── product.controller.ts
│   │   ├── product.service.ts
│   │   ├── product.dto.ts
│   │   └── product.module.ts
│   └── order/
└── shared/              # 공통 (도메인 모듈과 독립 유지)
```

```
src/
├── components/
│   ├── product/         # 도메인별 폴더
│   │   ├── ProductCard.tsx
│   │   ├── ProductList.tsx
│   │   └── index.ts
│   └── common/          # 공통 (도메인과 독립 유지)
├── hooks/               # 도메인별 hook
├── store/               # 전역 상태
└── shared/              # 유틸리티
```

</rules>

---

<rules>

## 가독성 규칙

### try-catch vs then-catch

> **Promise 처리 시 `then-catch` 패턴을 사용한다.**

<examples>
<example type="bad">
```typescript
// ❌ try-catch (가독성 저하)
async function fetchUser(id: string) {
  try {
    const user = await userService.findById(id);
    return user;
  } catch (error) {
    throw new NotFoundException('User not found');
  }
}
```
</example>
<example type="good">
```typescript
// ✅ then-catch (가독성 향상)
function fetchUser(id: string) {
  return userService.findById(id)
    .then(user => user)
    .catch(() => {
      throw new NotFoundException('User not found');
    });
}
```
</example>
</examples>

### 삼항연산자 규칙

> **삼항연산자에서 인자가 2개 이상인 함수 호출은 변수로 분리한다.**

<examples>
<example type="bad">
```typescript
// ❌ 삼항연산자 내 복잡한 함수 호출
const result = isAdmin
  ? processAdminData(data, options, config)
  : processUserData(data, options);
```
</example>
<example type="good">
```typescript
// ✅ 변수로 분리 후 사용
const processor = isAdmin ? processAdminData : processUserData;
const result = processor(data, options, config);

// ✅ 또는 if문 사용
let result;
if (isAdmin) {
  result = processAdminData(data, options, config);
} else {
  result = processUserData(data, options);
}
```
</example>
</examples>

**삼항연산자 허용 케이스:**
- 단순 값 선택: `const name = isKorean ? '홍길동' : 'John';`
- 인자 없는/1개 함수: `const value = isValid ? getValue() : getDefault();`

</rules>

---

<rules>

## Plan 작성 필수 항목

> **코드 수정 계획(Plan)에는 아래 3가지 설계와 의사결정 근거를 포함한다.**

### 필수 설계 항목

| 항목 | 포함 내용 | 예시 |
|------|----------|------|
| **DB 수정 계획** | Entity 변경, 컬럼 추가/삭제, 마이그레이션, 인덱스 | 새 Entity 생성, 기존 테이블 컬럼 추가, FK 관계 설정 |
| **FE 페이지 Flow** | 화면 흐름, 사용자 동선, 상태 전이, 라우트 구조 | 리스트 → 상세 → 수정 페이지 흐름, 모달/토스트 트리거 |
| **API 구성** | 엔드포인트 목록, 요청/응답 구조, tRPC 프로시저 | `product.findAll`, `product.create` 등 프로시저 정의 |

### 의사결정 근거

각 설계 항목에 아래를 명시한다:

| 항목 | 설명 |
|------|------|
| **선택한 이유** | 왜 이 방식을 선택했는가 (성능, 확장성, 기존 패턴 일관성 등) |
| **차선책** | 검토했으나 채택하지 않은 대안과 그 이유 |

<examples>
<example type="good">
```markdown
## DB 수정 계획
- ProductOption Entity 신규 생성 (Product와 1:N 관계)
- 이유: 옵션 개수가 가변적이므로 별도 테이블 분리
- 차선책: Product에 JSON 컬럼으로 저장 → 쿼리/필터링 어려워 기각

## FE 페이지 Flow
- 상품 목록 → 상품 상세 → 옵션 선택 → 장바구니
- 이유: 기존 호텔 예약 Flow와 동일한 패턴 유지
- 차선책: 목록에서 바로 옵션 선택 → UX 복잡도 증가로 기각

## API 구성
- product.findAll: 목록 조회 (pagination)
- product.findOne: 상세 + 옵션 포함
- 이유: findOne에서 옵션을 join으로 한 번에 조회 (N+1 방지)
- 차선책: 옵션을 별도 API로 분리 → 프론트 호출 2번 필요해 기각
```
</example>
</examples>

</rules>

---

<checklist>

## 코드 작성 시 체크리스트

- [ ] 이 파일의 책임은 하나인가?
- [ ] 다른 모듈에 불필요한 의존이 있는가? (있다면 제거)
- [ ] 관련 파일들이 같은 폴더에 있는가?
- [ ] 단방향 의존이 유지되는가?
- [ ] 공개 API(index.ts)를 통해 접근하는가?
- [ ] Promise 처리에 then-catch 패턴을 사용했는가?
- [ ] 삼항연산자에서 복잡한 함수 호출을 변수로 분리했는가?
- [ ] Plan에 DB 수정 계획 / FE 페이지 Flow / API 구성이 포함되었는가?
- [ ] 각 설계 항목에 선택 이유와 차선책이 명시되었는가?

</checklist>
