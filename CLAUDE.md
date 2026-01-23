# CLAUDE.md

이 파일은 이 저장소에서 코드 작업 시 Claude Code에게 가이드를 제공합니다.

## 프로젝트 개요

**YesTravel**: 여행 예약 플랫폼 (Hybrid tRPC + NestJS 마이크로서비스)

```
클라이언트 → tRPC Router → MicroserviceClient → EventBus → NestJS Controller → Service
```

## 작업 워크플로우 (필수)

모든 코드 작업은 아래 순서를 따릅니다:

### Phase 1: 계획 (Planning)

```
1. Context 수집
   - EnterPlanMode 진입
   - 관련 Context 문서 확인 (.claude/context/)
   - 필요한 Skill 활성화 (.claude/skills/)
   - 기존 코드 탐색 (Explore Agent)

2. TaskList 생성
   - 작업을 작은 단위로 분해
   - 각 Task에 명확한 완료 조건 정의
   - Task 간 의존성 설정

3. 코드 수정 계획 작성
   - 수정할 파일 목록
   - 각 파일의 변경 내용 요약
   - 예상되는 영향 범위
```

### Phase 2: 검증 (Validation)

```
4. 사이드이펙트 검증
   - 코드 Flow 분석: 변경이 다른 모듈에 미치는 영향
   - UI/UX UserFlow 분석: 사용자 경험에 미치는 영향
   - Breaking Change 여부 확인
```

### Phase 3: 구현 (Implementation)

```
5. 작은 단위로 코드 수정
   - 독립적으로 빌드 가능한 단위로 작업
   - 한 번에 하나의 기능/수정만 진행
   - 빌드 에러가 발생하지 않는 상태 유지

6. 단위별 커밋
   - 수정한 파일만 git add (git add -A 금지)
   - 명확한 커밋 메시지 작성
   - 커밋 단위: 하나의 논리적 변경
```

### Phase 4: 리뷰 (Review)

```
7. Self Code Review
   - 작성한 코드가 프로젝트 규칙을 준수하는지 확인
   - Frontend/checklist.md / Backend/checklist.md 기준 검토
   - yarn lint 실행

8. Task 완료 검증
   - 원래 요청사항이 모두 충족되었는지 확인
   - 예상한 동작이 구현되었는지 확인
   - 누락된 엣지케이스 없는지 점검
```

### 워크플로우 요약

```
┌─────────────────────────────────────────────────────────────┐
│  1. Context 수집 → 2. TaskList → 3. 수정 계획              │
│                        ↓                                    │
│  4. 사이드이펙트 검증 (Code Flow, UserFlow)                 │
│                        ↓                                    │
│  5. 코드 수정 (작은 단위) → 6. git add & commit (단위별)    │
│                        ↓                                    │
│  7. Self Code Review → 8. Task 완료 검증                    │
└─────────────────────────────────────────────────────────────┘
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
| 프론트엔드 개발 | `.claude/skills/Frontend/SKILL.md` |
| 백엔드 개발 | `.claude/skills/Backend/SKILL.md` |
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

---

## .claude 문서 작성 가이드

### 디렉토리 구조

```
.claude/
├── context/       # 사실/배경 정보 (읽기 전용)
├── skills/        # 방법/절차 가이드 (액션 지침)
├── agents/        # Agent 정의 (역할, 프로세스)
└── hooks/         # 자동 실행 스크립트
```

### 파일 길이 제한

| 상태 | 줄 수 | 조치 |
|------|-------|------|
| 권장 | ~500줄 | 이상적인 길이 |
| 허용 | ~1000줄 | 최대 한계 |
| 초과 | 1000줄+ | 반드시 파일 분리 |

> **원칙**: Context 압축에 중점. 길어지면 Sub-Skill/Sub-Context로 분리.

### Frontmatter 패턴

모든 `.md` 파일은 YAML frontmatter로 시작:

```yaml
---
name: file-name              # 파일 식별자 (kebab-case)
description: 한 줄 설명       # 파일 목적
keywords: [키워드1, 키워드2]  # 검색/매칭용 키워드
estimated_tokens: ~500       # 예상 토큰 수 (선택)
---
```

**Agent 전용 필드:**
```yaml
model: opus                  # 사용 모델
color: blue                  # UI 색상
```

**Skill 전용 필드:**
```yaml
user-invocable: true         # 사용자 직접 호출 가능 여부
```

### 파일 유형별 구조

#### Context (사실/배경)

```markdown
---
name: context-name
description: 설명
keywords: [...]
---

# 제목

## 핵심 정보
(테이블, 다이어그램으로 요약)

## 상세 구조
(필요시 코드 블록)

## 관련 파일
(참조 경로 목록)
```

#### Skill (방법/절차)

```markdown
---
name: skill-name
description: 설명
keywords: [...]
---

# 스킬 제목

## 핵심 역할
(불릿 포인트로 요약)

## 이 스킬이 필요할 때
(사용 시점 목록)

## 관련 문서
(Sub-Skill 테이블)

## 필수 준수 사항
(테이블로 규칙 요약)

## 체크리스트
(확인 항목)
```

#### Agent (역할/프로세스)

```markdown
---
name: agent-name
description: 설명
keywords: [...]
model: opus
color: blue
---

# Agent 이름

## 역할
(번호 목록으로 역할 정의)

## 프로세스
(Step별 작업 흐름)

## 출력 형식
(결과물 템플릿)
```

### 파일 분리 기준

| 상황 | 분리 방법 |
|------|----------|
| Skill이 길어짐 | `SKILL.md` + `sub-skill.md` |
| Context가 길어짐 | `INDEX.md` + `detail.md` |
| 도메인별 분리 | `Backend/`, `Frontend/`, `Git/` |

### 작성 원칙

1. **압축 우선**: 중복 제거, 테이블/불릿 활용
2. **검색 가능**: keywords에 다양한 변형 포함
3. **독립적**: 각 파일이 단독으로 이해 가능
4. **참조 명시**: 관련 문서 경로 항상 포함
