#!/bin/bash

# .claude/hooks/skill-forced.sh
# Skill/Agent 평가 프로토콜 - UserPromptSubmit hook

echo "✅ [Hook] Skill/Agent 평가 프로토콜 실행됨"

cat << 'EOF'
MANDATORY SKILL & AGENT EVALUATION PROTOCOL

작업을 시작하기 전에 반드시 아래 단계를 순서대로 완료하세요:

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
PART 1.5: CONTEXT 확인
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Step 1.5 - Context 확인: 작업에 필요한 Context 문서가 있다면 먼저 읽으세요.

---

### Context 문서 목록

| Context | 위치 | 설명 |
|---------|------|------|
| 시스템 아키텍처 | `.claude/context/architecture/INDEX.md` | 전체 구조, 통신 흐름, 디렉토리 구조 |
| 데이터베이스 | `.claude/context/architecture/database.md` | DB 스키마, Entity 관계 |
| 백엔드 기술 스택 | `.claude/context/backend/INDEX.md` | NestJS, tRPC, TypeORM 규칙 |
| 프론트엔드 기술 스택 | `.claude/context/frontend/INDEX.md` | React, TanStack Router, 스타일링 규칙 |
| **백오피스 페이지 패턴** | `.claude/skills/Frontend/backoffice-patterns.md` | 리스트/상세 레이아웃, FormPageLayout, SelectDropdown |
| 네이밍 규칙 | `.claude/context/conventions/naming.md` | 변수, 파일, 함수 네이밍 컨벤션 |

### 참조 시점

- 아키텍처 이해 필요 → architecture/INDEX.md
- DB 관련 작업 → architecture/database.md
- 백엔드 개발 → backend/INDEX.md + Backend Skill
- 프론트엔드 개발 → frontend/INDEX.md + Frontend Skill
- **백오피스 FE 개발** → `.claude/skills/Frontend/backoffice-patterns.md` (필수 참조)
- 네이밍 확인 → conventions/naming.md

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 2: AGENT 평가
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Step 3 - Agent 평가: 각 Agent에 대해 다음을 명시하세요:
  - Agent 이름
  - YES 또는 NO (이 요청에 해당 Agent 활용이 필요한가?)
  - 한 줄 이유

Step 4 - Agent 활용: YES로 표시된 Agent는 Task 도구로 호출하세요.
  예: Task(subagent_type="task-planner", prompt="...")

---

### 분석 Agent (Phase 0-1)

| Agent | 모델 | 키워드 | 설명 |
|-------|------|--------|------|
| explore | Haiku | 탐색, 검색, 파일찾기, 패턴매칭, 구조파악 | 빠른 코드베이스 탐색, 파일 위치 찾기 |
| context-collector | Sonnet | Context수집, 문서확인, 패턴파악, Skill식별 | Context 문서 수집, 기존 코드 패턴 파악 |
| architect | Opus | 아키텍처, 설계, 디버깅, 시스템구조, 기술부채 | 아키텍처 설계, 복잡한 디버깅 |

### 계획 Agent (Phase 2-3)

| Agent | 모델 | 키워드 | 설명 |
|-------|------|--------|------|
| task-planner | Opus | TaskList, 계획수립, 요구사항명확화, 작업분해 | TaskList 생성, 코드 수정 계획 |
| impact-analyzer | Opus | 사이드이펙트, CodeFlow, UserFlow, BreakingChange | Code Flow/UserFlow 영향 분석, Breaking Change 탐지 |

### 구현 Agent (Phase 4-5)

| Agent | 모델 | 키워드 | 설명 |
|-------|------|--------|------|
| code-writer | Sonnet | 코드작성, 구현, 개발, Entity, Service | 백엔드 코드 구현 |
| designer | Sonnet | UI, UX, 스타일링, 컴포넌트, 레이아웃 | 프론트엔드 UI/UX 설계 및 스타일링 |

### 검증 Agent (Phase 6-7)

| Agent | 모델 | 키워드 | 설명 |
|-------|------|--------|------|
| code-reviewer | Opus | 코드리뷰, 체크리스트, lint, 규칙검증 | Self Code Review, checklist 기반 검토 |
| qa-tester | Sonnet | 테스트, QA, 빌드검증, lint실행 | 빌드/테스트 검증, 품질 확인 |

### 유틸리티 Agent

| Agent | 모델 | 키워드 | 설명 |
|-------|------|--------|------|
| git-manager | Haiku | 커밋, PR생성, 브랜치, push, merge | Commit 메시지 작성, PR 생성 |
| Explore | - | 코드탐색, 파일검색, 구조파악 | 코드베이스 탐색 (Built-in) |
| Plan | - | 구현계획, 설계, 아키텍처설계 | 구현 전략 수립 (Built-in) |

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 3: 구현
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Step 5 - 구현: 모든 관련 Skill 활성화 및 Agent 호출 후에만 구현을 시작하세요.

---

### 평가 형식 예시

**Skill 평가:**
- Backend: YES - 새 API 엔드포인트 생성 및 Service 구현 필요
- Frontend: NO - 프론트엔드 변경 없음
- Git: NO - 커밋/PR/리뷰 작업 아님

**Agent 평가 (분석):**
- explore: NO - context-collector에서 탐색 수행
- context-collector: YES - 관련 Context 수집 필요
- architect: NO - 단순 기능 구현이므로

**Agent 평가 (계획):**
- task-planner: YES - 요구사항 명확화 및 TaskList 생성 필요
- impact-analyzer: YES - 기존 코드 영향 분석 필요

**Agent 평가 (구현):**
- code-writer: NO - 계획 수립 후 실행
- designer: NO - UI 작업 아님

**Agent 평가 (검증):**
- code-reviewer: NO - 구현 완료 후 실행
- qa-tester: NO - 구현 완료 후 실행

**Agent 평가 (유틸리티):**
- git-manager: NO - 커밋/PR 생성 아님

그 다음: Skill(Backend), Task(subagent_type="context-collector", ...)

---

### 중요

- Skill/Agent를 활성화하지 않으면 평가는 의미가 없습니다.
- 활성화를 건너뛰면 = 분석을 무시하는 것 = 잘못된 결과물.
- 단순 작업(설정 파일 수정, 오타 수정 등)은 Agent 없이 직접 처리 가능.

지금 바로 모든 사용 가능한 Skill과 Agent를 평가하세요.
EOF
