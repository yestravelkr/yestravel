# CLAUDE.md

이 파일은 이 저장소에서 코드 작업 시 Claude Code에게 가이드를 제공합니다.

## 프로젝트 개요

**YesTravel**: 여행 예약 플랫폼 (Hybrid tRPC + NestJS 마이크로서비스)

```
클라이언트 → tRPC Router → MicroserviceClient → EventBus → NestJS Controller → Service
```

## 빠른 시작

```bash
# 1. Docker 서비스 시작
cd docker && ./startDocker.sh

# 2. API 환경 설정 및 마이그레이션
cd ../apps/api && yarn generateEnv && yarn migration:run

# 3. 개발 서버 시작 (3000 포트)
yarn dev
```

## 문서 참조

### Context (사실/배경) - "우리 프로젝트는 이렇다"

| 주제 | 위치 |
|-----|------|
| 시스템 아키텍처 | `.claude/context/architecture/INDEX.md` |
| 데이터베이스 구조 | `.claude/context/architecture/database.md` |
| 프론트엔드 기술 스택 | `.claude/context/frontend/INDEX.md` |
| 백엔드 기술 스택 | `.claude/context/backend/INDEX.md` |
| 네이밍 규칙 | `.claude/context/conventions/naming.md` |

### Skills (방법/절차) - "이렇게 해라"

| 작업 | 위치 |
|-----|------|
| 프론트엔드 개발 | `.claude/skills/fe-development/SKILL.md` |
| 백엔드 개발 | `.claude/skills/be-development/SKILL.md` |
| PR 리뷰 | `.claude/skills/pr-review.md` |

## 즉시 알아야 할 규칙

### 프론트엔드 (⚠️ 필수)

| 규칙 | 설명 |
|-----|------|
| **className 금지** | `tailwind-styled-components` 필수 사용 |
| **$prefix 패턴** | 조건부 props는 `$primary`, `$active` 형식 |
| **stroke-* 색상** | `var()` 함수로 사용 (예: `border-[var(--stroke-neutral)]`) |
| **아이콘** | `lucide-react`만 사용, 폰트 이모지 금지 |
| **알림** | `alert()` 금지, `toast` from `sonner` 사용 |

### 백엔드 (⚠️ 필수)

| 규칙 | 설명 |
|-----|------|
| **for 루프 await 금지** | `Promise.all()` + `map()` 패턴 사용 |
| **DTO 분리** | Service 내 interface 금지, `*.dto.ts` 분리 |
| **Repository** | `TypeOrmModule.forFeature()` 금지, `RepositoryProvider` 사용 |
| **트랜잭션** | mutation에 `@Transactional`, Controller에 `TransactionService` 주입 |
| **Entity 위치** | `apps/api/src/module/backoffice/domain/` |

## 주요 디렉토리

```
apps/
├── api/                    # NestJS + tRPC 서버
│   └── src/module/backoffice/domain/  # 모든 Entity 위치
├── backoffice/             # 백오피스 프론트엔드
└── shop/                   # 샵 프론트엔드
packages/
├── api-types/              # tRPC 타입 공유
└── min-design-system/      # 디자인 시스템
```

## 신규 컴포넌트 작성 규칙

모든 컴포넌트에 **JSDoc 주석**과 **Usage 예시** 포함:

```typescript
/**
 * ComponentName - 컴포넌트 설명
 */
export interface ComponentProps {
  /** prop 설명 */
  value: string;
}

/**
 * Usage:
 * <ComponentName value="test" />
 */
```

## 작업 완료 후 체크리스트

- [ ] `cd apps/api && yarn lint` 실행
- [ ] 빌드 확인: `yarn build`
