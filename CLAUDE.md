# CLAUDE.md

이 파일은 이 저장소에서 코드 작업 시 Claude Code (claude.ai/code)에게 가이드를 제공합니다.

## 작업별 필수 문서 참조

**⚠️ 아래 작업 시작 전 반드시 해당 문서를 먼저 읽을 것:**

| 작업 유형 | 참조 문서 | 주요 내용 |
|----------|----------|----------|
| 프론트엔드 개발 | `docs/frontend.md` | 스타일링, Modal 패턴, 색상 시스템, 컴포넌트 구조 |
| DB 마이그레이션/INHERITS | `docs/database.md` | PostgreSQL INHERITS, 마이그레이션, Repository 패턴 |
| 새 기능/모듈 추가 | `docs/adding-features.md` | 단계별 구현 가이드, 스키마/타입 패턴 |
| 아키텍처 이해 | `docs/architecture.md` | tRPC + NestJS 구조, 통신 흐름 |
| Git 커밋/PR 작성 | `docs/git-workflow.md` | 커밋 규칙, PR 작성 가이드라인 |

## 빠른 시작

```bash
# 1. Docker 서비스 시작
cd docker && ./startDocker.sh

# 2. API 환경 설정 및 마이그레이션
cd ../apps/api && yarn generateEnv && yarn migration:run

# 3. 개발 서버 시작
yarn dev  # 3000 포트
```

## 핵심 아키텍처

**Hybrid tRPC + NestJS 마이크로서비스:**
```
클라이언트 → tRPC Router → MicroserviceClient → EventBus → NestJS Controller → Service
```

**모듈 구조:**
```
module/
├── module.router.ts      # tRPC 엔드포인트 (@Router)
├── module.controller.ts  # 메시지 핸들러 (@MessagePattern)
├── module.service.ts     # 비즈니스 로직
├── module.module.ts      # NestJS 모듈
├── module.schema.ts      # Zod 스키마
└── module.dto.ts         # DTO 타입 정의
```

## 핵심 규칙 요약

### 코딩 스타일

| 규칙 | 설명 |
|-----|------|
| **for 루프 내 await 금지** | `Promise.all()` + `map()` 패턴 사용 |
| **한 글자 변수명 금지** | `i`, `p`, `x` 대신 `item`, `product` 등 사용 |
| **함수형 메서드 사용** | `for` 대신 `map`, `filter`, `reduce` 사용 |

### 백엔드 패턴

| 패턴 | 규칙 |
|-----|------|
| **DTO 파일 분리** | Service 내 interface 직접 정의 금지, `*.dto.ts`에 정의 |
| **nullish() 통일** | `optional().nullable()` 대신 `nullish()` 사용 |
| **Update 스키마** | `createSchema.extend({ id: z.number() })` 패턴 |
| **Entity 조회** | `findOneOrFail` + `.catch()` 패턴 사용 |
| **Repository 접근** | `TypeOrmModule.forFeature()` 금지, `RepositoryProvider`만 사용 |
| **Router 등록** | Module의 providers에 Router 넣지 않음 (자동 발견) |
| **트랜잭션** | mutation 메서드에 `@Transactional`, Controller에 `TransactionService` 주입 필수 |
| **Entity 위치** | 모든 Entity는 `apps/api/src/module/backoffice/domain/`에 생성 |
| **tRPC 데코레이터** | 반드시 `'nestjs-trpc'` 패키지에서 import |

### 프론트엔드 패턴

| 패턴 | 규칙 |
|-----|------|
| **스타일링** | `className` 금지, `tailwind-styled-components` 필수 |
| **스타일 컴포넌트 위치** | 파일 최하단에 작성 |
| **아이콘** | `lucide-react` 사용, 폰트 이모지 금지 |
| **알림** | `alert()` 금지, `sonner`의 `toast` 사용 |
| **Modal** | `react-snappy-modal` + `useCurrentModal().resolveModal()` 패턴 |
| **색상 변수** | `stroke-*` 변수는 `var()` 함수로 사용 |
| **폰트** | `font-['Min_Sans_VF']` 클래스 사용 금지 (전역 설정됨) |

## Enum 네이밍 규칙

```typescript
// 값 배열: {NAME}_ENUM_VALUE
export const ROLE_ENUM_VALUE = ['ADMIN_SUPER', 'ADMIN_STAFF'] as const;

// 타입: {Name}EnumType
export type RoleEnumType = typeof ROLE_ENUM_VALUE[number];

// 객체: {Name}Enum
export const RoleEnum = { ADMIN_SUPER: 'ADMIN_SUPER', ADMIN_STAFF: 'ADMIN_STAFF' };

// 스키마: {name}EnumSchema
export const roleEnumSchema = z.enum(ROLE_ENUM_VALUE);
```

## 공통 유틸리티

**시간 관련 (`@src/utils/time.util.ts`):**
```typescript
import { normalizeTime, TIME_FORMAT_REGEX, TIME_FORMAT_ERROR_MESSAGE_KO } from '@src/utils/time.util';
```

**Nullish 타입 (`@src/types/utility.type`):**
```typescript
import { Nullish } from '@src/types/utility.type';

@Column({ type: 'varchar', nullable: true })
email: Nullish<string>;
```

## PostgreSQL INHERITS 핵심 규칙

**⚠️ 상세 내용은 `docs/database.md` 참조**

| 규칙 | 설명 |
|-----|------|
| TypeORM 상속 데코레이터 금지 | `@TableInheritance`, `@ChildEntity` 사용 금지 |
| 부모 테이블 조회 | Raw Query 사용 필수 (QueryBuilder 금지) |
| 컬럼 추가/삭제 | 부모 테이블에만 수행 (자식에 자동 상속) |
| FK 제약 | INHERITS 부모 테이블 참조 FK 금지 |

## api-types 패키지 규칙

**⚠️ 상세 내용은 `docs/adding-features.md` 참조**

- `server.ts`의 `appRouter` 내부는 수정 금지 (자동 생성)
- import 문, 변수 선언은 수정 가능
- 빌드 에러 시: `apps/api`에서 변수 정의 찾아 `types/*.ts`에 추가

## 중요 환경 설정

| 항목 | 값 |
|-----|-----|
| API 포트 | 3000 |
| 환경 생성 | `yarn generateEnv` (API 시작 전 필수) |
| 마이그레이션 | `yarn migration:run` |
| Soft Delete | 자동 적용 (`deletedAt: null` 조건 불필요) |

## 신규 컴포넌트 작성 규칙

모든 신규 컴포넌트는 **설명 주석**과 **Usage 예시**를 포함해야 함:

```typescript
/**
 * FileUpload - 파일 업로드 컴포넌트
 * 이미지 파일을 업로드하고 미리보기를 제공합니다.
 */
export interface FileUploadProps {
  /** 업로드된 파일의 URL */
  value?: string | null;
  /** 파일 업로드 완료 시 호출되는 콜백 */
  onChange: (url: string | null) => void;
}

/**
 * Usage:
 * <FileUpload value={imageUrl} onChange={setImageUrl} />
 */
```

## 문서 업데이트 규칙

**⚠️ 새로운 기능 구현, 컴포넌트 추가, 아키텍처 변경 시 해당 docs 문서도 함께 업데이트**

| 변경 유형 | 업데이트 대상 |
|----------|-------------|
| 새 모듈/페이지 | `docs/adding-features.md`, `docs/frontend.md` |
| 컴포넌트 패턴 | `docs/frontend.md` |
| API 엔드포인트 | `docs/architecture.md` |
| DB 스키마 변경 | `docs/database.md` |