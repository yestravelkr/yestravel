#!/bin/bash

# .claude/hooks/skill-forced-eval-hook.sh

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

YesTravel 도메인별 Skill 참조:

| Skill | 키워드 | 설명 |
|-------|--------|------|
| be-development | 백엔드, API, Router, Controller, Service, Repository, Migration, Entity, tRPC, NestJS | 백엔드 개발 전체 |
| fe-development | 프론트엔드, 컴포넌트, 스타일링, 폼, React, tailwind-styled-components, Modal, Toast | 프론트엔드 개발 전체 |
| pr-review | PR리뷰, 코드리뷰, MR, 머지리퀘스트, 체크리스트 | PR/MR 코드 리뷰 |

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 1.5: CONTEXT 확인
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Step 1.5 - Context 확인: 작업에 필요한 Context 문서가 있다면 먼저 읽으세요.

---

YesTravel Context 문서 참조:

| Context | 위치 | 설명 |
|---------|------|------|
| 시스템 아키텍처 | `.claude/context/architecture/INDEX.md` | 전체 구조, 통신 흐름, 디렉토리 구조 |
| 데이터베이스 | `.claude/context/architecture/database.md` | DB 스키마, Entity 관계 |
| 백엔드 기술 스택 | `.claude/context/backend/INDEX.md` | NestJS, tRPC, TypeORM 규칙 |
| 프론트엔드 기술 스택 | `.claude/context/frontend/INDEX.md` | React, TanStack Router, 스타일링 규칙 |
| 네이밍 규칙 | `.claude/context/conventions/naming.md` | 변수, 파일, 함수 네이밍 컨벤션 |

참조 시점:
- 아키텍처 이해 필요 → architecture/INDEX.md
- DB 관련 작업 → architecture/database.md
- 백엔드 개발 → backend/INDEX.md + be-development Skill
- 프론트엔드 개발 → frontend/INDEX.md + fe-development Skill
- 네이밍 확인 → conventions/naming.md

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 2: AGENT 평가
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Step 3 - Agent 평가: 각 Agent에 대해 다음을 명시하세요:
  - Agent 이름
  - YES 또는 NO (이 요청에 해당 Agent 활용이 필요한가?)
  - 한 줄 이유

Step 4 - Agent 활용: YES로 표시된 Agent는 Task 도구로 호출하세요.
  예: Task(subagent_type="pr-writer", prompt="...")

---

사용 가능한 Agent 참조:

| Agent | 키워드 | 설명 |
|-------|--------|------|
| pr-writer | PR생성, PR작성, 풀리퀘스트, 머지리퀘스트생성 | PR 작성 및 생성 (커밋 분석 → PR 제목/본문 작성 → GitHub PR 생성) |
| Explore | 코드탐색, 파일검색, 구조파악, 아키텍처분석 | 코드베이스 탐색 및 구조 파악 |
| Plan | 구현계획, 설계, 아키텍처설계, 전략수립 | 구현 전략 및 계획 수립 |

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 3: 구현
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Step 5 - 구현: 모든 관련 Skill 활성화 및 Agent 호출 후에만 구현을 시작하세요.

---

평가 형식 예시:

**Skill 평가:**
- be-development: YES - 새 API 엔드포인트 생성 및 Service 구현 필요
- fe-development: NO - 프론트엔드 변경 없음
- pr-review: NO - PR 리뷰 요청 아님

**Agent 평가:**
- pr-writer: NO - PR 생성 요청 아님
- Explore: YES - 기존 코드 구조 파악 필요
- Plan: NO - 단순 구현이라 계획 수립 불필요

그 다음: Skill(be-development), Task(subagent_type="Explore", ...)

---

중요:
- Skill/Agent를 활성화하지 않으면 평가는 의미가 없습니다.
- 활성화를 건너뛰면 = 분석을 무시하는 것 = 잘못된 결과물.

지금 바로 모든 사용 가능한 Skill과 Agent를 평가하세요.
EOF
