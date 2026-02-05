#!/bin/bash

# .claude/hooks/skill-forced.sh
# Skill/Agent 평가 프로토콜 - UserPromptSubmit hook

echo "✅ [Hook] Skill/Agent 평가 프로토콜 실행됨"

cat << 'EOF'
MANDATORY SKILL & AGENT EVALUATION PROTOCOL

작업을 시작하기 전에 반드시 아래 단계를 순서대로 완료하세요:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️ CONTEXT 절약 원칙 (최우선 - 반드시 준수) ⚠️
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Main Agent의 Context Window는 제한적입니다.
**Subagent가 할 수 있는 작업은 반드시 Subagent에 위임하세요!**

### 🚨 필수 위임 작업 (Main Agent 직접 수행 금지)

| 작업 유형 | 사용할 Agent | 이유 |
|----------|-------------|------|
| 코드베이스 탐색/검색 | explore | 파일 내용이 Main Context에 쌓이지 않음 |
| 여러 파일 읽기 | explore / context-collector | 탐색 결과만 요약해서 받음 |
| 패턴/구조 파악 | context-collector | 분석 결과만 받음 |
| 복잡한 계획 수립 | task-planner | 계획 결과만 받음 |
| 영향 분석 | impact-analyzer | 분석 결과만 받음 |
| 코드 리뷰 | code-reviewer | 리뷰 결과만 받음 |
| 테스트/빌드 검증 | qa-tester | 검증 결과만 받음 |
| 여러 파일 코드 작성 | code-writer / designer | 구현 결과만 받음 |
| Git 작업 | git-manager | 커밋/PR 결과만 받음 |

### ❌ 절대 금지 (Main Agent에서 직접 수행 금지)

- Main Agent에서 직접 Glob/Grep으로 여러 파일 탐색
- Main Agent에서 직접 여러 파일 Read (2개 이상)
- Main Agent에서 복잡한 분석/계획 수행
- Main Agent에서 3개 이상 파일 수정

### ✅ Main Agent 허용 작업 (이것만 직접 수행)

- 단일~소수(1-2개) 파일 수정 (Edit)
- 단일~소수(1-2개) 파일 생성 (Write)
- 단순 명령 실행 (Bash)
- 사용자와 대화/질문 응답

### 💡 왜 Subagent를 사용해야 하는가?

1. **Context 절약**: Subagent의 탐색/분석 결과는 요약되어 Main에 전달
2. **대화 지속성**: Main Context가 절약되어 더 긴 대화 가능
3. **전문성**: 각 Agent는 특정 작업에 최적화됨
4. **병렬 처리**: 여러 Agent를 동시에 실행 가능

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 1: SKILL 평가
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Step 1 - Skill 평가: 각 Skill에 대해 다음을 명시하세요:
  - Skill 이름
  - YES 또는 NO (이 요청에 해당 Skill이 필요한가?)
  - 한 줄 이유

Step 2 - Skill 활성화: YES로 표시된 모든 Skill에 대해 Skill(skill-name) 도구를 사용하세요.

---

### 메인 Skill

| Skill | 키워드 | 설명 |
|-------|--------|------|
| Coding | SRP, 단일책임, 결합도, 응집도, 설계원칙, 폴더구조 | 공통 코딩 원칙 (Backend/Frontend 공통 참조) |
| Backend | 백엔드, API, Router, Controller, Service, Repository, Migration, Entity, tRPC, NestJS | 백엔드 개발 전체 |
| Frontend | 프론트엔드, 컴포넌트, 스타일링, 폼, React, tailwind-styled-components, Modal, Toast | 프론트엔드 개발 전체 |

### Git Skill

| Skill | 키워드 | 설명 |
|-------|--------|------|
| Git | 커밋, PR생성, 브랜치, push, merge, FEAT, FIX, PR리뷰, 코드리뷰, 피드백 | Commit/PR 생성, PR 리뷰, 피드백 적용 |

### Sub-Skills (자동 로드됨 - 참조용)

**Backend Sub-Skills:**
- checklist: 백엔드 코드 품질 체크리스트
- migration: TypeORM 마이그레이션 작성
- repository: Repository 패턴 구현
- trpc-nestjs: tRPC-NestJS 통합 가이드
- schema-dto: DTO/Schema 정의 규칙
- entity-inheritance: Entity 상속 (STI 패턴)
- module-creation: 새 모듈 생성 가이드
- database: 로컬 PostgreSQL 접근 및 디버깅

**Frontend Sub-Skills:**
- checklist: 프론트엔드 코드 품질 체크리스트
- components: 컴포넌트 작성 패턴
- styling: tailwind-styled-components 스타일링
- form-patterns: React Hook Form 폼 패턴
- backoffice-patterns: 백오피스 페이지 패턴 (리스트/상세 레이아웃, 필터, 테이블)

**Git Sub-Skills:**
- git: Commit 메시지 작성, PR 생성 규칙
- pr-review: PR 코드 리뷰 체크리스트
- pr-apply: PR 리뷰 피드백 반영

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 1.5: CONTEXT 확인 (Subagent로 위임 권장)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**권장:** Context 확인은 `context-collector` Agent에 위임하세요.
직접 여러 파일을 읽으면 Main Context가 낭비됩니다.

```
Task(subagent_type="context-collector", prompt="[작업 설명]에 필요한 Context를 수집하고 요약해줘")
```

### Context 문서 목록 (참조용)

| Context | 위치 | 설명 |
|---------|------|------|
| 시스템 아키텍처 | `.claude/context/architecture/INDEX.md` | 전체 구조, 통신 흐름, 디렉토리 구조 |
| 데이터베이스 | `.claude/context/architecture/database.md` | DB 스키마, Entity 관계 |
| 백엔드 기술 스택 | `.claude/context/backend/INDEX.md` | NestJS, tRPC, TypeORM 규칙 |
| 프론트엔드 기술 스택 | `.claude/context/frontend/INDEX.md` | React, TanStack Router, 스타일링 규칙 |
| 백오피스 페이지 패턴 | `.claude/skills/Frontend/backoffice-patterns.md` | 리스트/상세 레이아웃, FormPageLayout |
| 네이밍 규칙 | `.claude/context/conventions/naming.md` | 변수, 파일, 함수 네이밍 컨벤션 |
| 도메인: 캠페인 | `.claude/context/domain/campaign.md` | 인플루언서 캠페인 구조 |
| 도메인: 호텔 주문 | `.claude/context/domain/hotel-order.md` | 호텔 상품 주문 구조 |
| 도메인: 결제/주문 | `.claude/context/domain/payment-order.md` | 결제/주문 시스템 구조 |

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 2: AGENT 평가 (필수 - Context 절약)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Step 3 - Agent 평가: 각 Agent에 대해 다음을 명시하세요:
  - Agent 이름
  - YES 또는 NO (이 요청에 해당 Agent 활용이 필요한가?)
  - 한 줄 이유

Step 4 - Agent 활용: YES로 표시된 Agent는 Task 도구로 호출하세요.
  예: Task(subagent_type="task-planner", prompt="...")

---

### 탐색/분석 Agent (★ 필수 활용)

| Agent | 모델 | 언제 사용 | 위임할 작업 |
|-------|------|----------|------------|
| explore | Haiku | 파일 찾기, 패턴 검색 | Glob, Grep, 여러 파일 Read |
| context-collector | Sonnet | Context/패턴 파악 | 문서 읽기, 기존 코드 분석 |
| architect | Opus | 복잡한 설계/디버깅 | 아키텍처 분석, 의존성 추적 |

**반드시 explore 사용:**
- "~가 어디에 있어?" → `Task(subagent_type="explore", prompt="...")`
- "~를 사용하는 파일 찾아줘" → `Task(subagent_type="explore", prompt="...")`
- "~의 구조를 파악해줘" → `Task(subagent_type="explore", prompt="...")`

**반드시 context-collector 사용:**
- 새 기능 구현 전 → `Task(subagent_type="context-collector", prompt="[기능명] 구현에 필요한 패턴과 예시를 수집해줘")`
- 기존 코드 수정 전 → `Task(subagent_type="context-collector", prompt="[모듈명]의 현재 구조와 패턴을 분석해줘")`

### 계획 Agent

| Agent | 모델 | 언제 사용 | 위임할 작업 |
|-------|------|----------|------------|
| task-planner | Opus | 요구사항 명확화, 계획 수립 | TaskList 생성, 작업 분해 |
| impact-analyzer | Opus | 영향 분석 필요 시 | Code Flow, UserFlow, Breaking Change 분석 |

**task-planner 사용 시점:**
- 복잡한 기능 구현 → 계획 먼저
- 여러 파일 수정 필요 → 계획 먼저
- 애매한 요구사항 → 명확화 먼저

### 구현 Agent

| Agent | 모델 | 언제 사용 | 위임할 작업 |
|-------|------|----------|------------|
| code-writer | Sonnet | 백엔드 코드 구현 | Entity, Service, Controller, Router |
| designer | Sonnet | UI/UX 구현 | 컴포넌트, 스타일링, 레이아웃 |

**구현 Agent 사용 기준:**
- 여러 파일 생성/수정 → Subagent 위임
- 단일 파일 수정 → Main Agent 직접 처리 가능

### 검증 Agent (★ 구현 후 필수)

| Agent | 모델 | 언제 사용 | 위임할 작업 |
|-------|------|----------|------------|
| code-reviewer | Opus | 코드 작성 완료 후 | checklist 기반 리뷰, 품질 검증 |
| qa-tester | Sonnet | 구현 완료 후 | lint, 빌드, 테스트 실행 |

**구현 완료 후 반드시:**
```
Task(subagent_type="code-reviewer", prompt="방금 작성한 [파일들]을 리뷰해줘")
Task(subagent_type="qa-tester", prompt="빌드와 lint를 실행해줘")
```

### 유틸리티 Agent

| Agent | 모델 | 언제 사용 | 위임할 작업 |
|-------|------|----------|------------|
| git-manager | Haiku | 커밋/PR 생성 | Commit 메시지 작성, PR 생성 |
| context-manager | Sonnet | Context 문서 정리 | 파일 분리, 토큰 최적화, 구조 개선 |

**context-manager 사용 시점:**
- "context 파일들 정리해줘" → `Task(subagent_type="context-manager", prompt="...")`
- Context 문서가 너무 길 때 → 파일 분리 요청
- 중복 내용 정리 필요 시

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 3: 구현
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Step 5 - 구현: 모든 관련 Skill 활성화 및 Agent 호출 후에만 구현을 시작하세요.

---

### 작업 흐름 예시

```
1. 요청 받음: "주문 상태 변경 API 추가해줘"

2. Skill 평가: Backend YES, Frontend NO, Git NO
   → Skill(Backend) 활성화

3. 탐색 (★ Subagent 필수):
   → Task(subagent_type="explore", prompt="Order 관련 파일 위치 찾아줘")
   → Task(subagent_type="context-collector", prompt="Order 모듈의 현재 구조 분석해줘")

4. 계획:
   → Task(subagent_type="task-planner", prompt="주문 상태 변경 API 구현 계획 세워줘")
   → Task(subagent_type="impact-analyzer", prompt="Order 상태 변경이 미치는 영향 분석해줘")

5. 구현:
   → Main Agent가 직접 Edit/Write (파일 수 적으면)
   → 또는 Task(subagent_type="code-writer", ...) (파일 수 많으면)

6. 검증 (★ Subagent 필수):
   → Task(subagent_type="code-reviewer", prompt="작성한 코드 리뷰해줘")
   → Task(subagent_type="qa-tester", prompt="빌드와 lint 검증해줘")
```

### 평가 형식 예시

**Skill 평가:**
- Backend: YES - 새 API 엔드포인트 생성
- Frontend: NO - 프론트엔드 변경 없음
- Git: NO - 커밋/PR 작업 아님

**Agent 평가 (탐색/분석):**
- explore: YES - Order 관련 파일 위치 파악 필요
- context-collector: YES - 기존 Order 모듈 패턴 수집 필요
- architect: NO - 단순 기능 추가

**Agent 평가 (계획):**
- task-planner: YES - 구현 계획 필요
- impact-analyzer: NO - 단순 추가라 영향 적음

**Agent 평가 (구현):**
- code-writer: NO - 파일 수 적어 Main Agent 직접 처리

**Agent 평가 (검증):**
- code-reviewer: YES - 구현 후 리뷰 필수
- qa-tester: YES - 빌드 검증 필수

---

### 중요

- **탐색 작업은 반드시 Subagent로**: Main Context 절약
- **구현 후 검증은 필수**: code-reviewer + qa-tester
- **단순 작업은 예외**: 설정 파일 수정, 오타 수정은 직접 처리 가능
- Skill/Agent를 활성화하지 않으면 평가는 의미가 없습니다.

지금 바로 모든 사용 가능한 Skill과 Agent를 평가하세요.
EOF
