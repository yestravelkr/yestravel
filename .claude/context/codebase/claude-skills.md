---
name: claude-skills
description: Claude Code Skill 정의 - 7개 스킬 그룹의 코딩/Git/문서화 가이드라인
keywords: [skill, backend, frontend, react, git, coding, documentation, prompt, 스킬]
---

# Claude Skills

Claude Code의 작업별 방법론/절차 가이드. Hook에 의해 자동으로 평가되어 관련 Skill이 활성화된다.

## 파일 구조

| 파일 | 역할 | 핵심 내용 |
|------|------|----------|
| .claude/skills/Backend/SKILL.md | NestJS/TypeORM 백엔드 개발 | Controller→Service→Repository 레이어 변환, find vs queryBuilder 기준 |
| .claude/skills/Frontend/SKILL.md | YesTravel 프론트엔드 개발 | Props→Logic→Usage→Styled 순서, className 4개+ 시 styled 전환 |
| .claude/skills/Coding/SKILL.md | 범용 코딩 원칙 | SRP, 결합도/응집도 판단, then-catch 선호, 삼항연산자 제한 |
| .claude/skills/Git/SKILL.md | Git 스킬 인덱스 | PREFIX 규칙 (FEAT/FIX/REFACTOR/CHORE/DOCS) |
| .claude/skills/Git/git.md | 커밋/PR/브랜치 상세 | 커밋 메시지 형식, 7단계 PR 워크플로우, 안전 규칙 |
| .claude/skills/Git/pr-review.md | PR 코드 리뷰 | Review Plan 템플릿, Critical/Suggestions 분류 |
| .claude/skills/Git/pr-apply.md | PR 피드백 적용 | 피드백 분류(Critical/Suggestion/Question), 수락/반론 원칙 |
| .claude/skills/React/SKILL.md | React 개발 인덱스 | 컴포넌트 분류, 상태/훅 규칙, 성능 최적화 |
| .claude/skills/React/react-hook-form.md | React Hook Form + Zod | Schema 파일 분리, zodResolver, TRPC 연동 |
| .claude/skills/React/tailwind-styled.md | tailwind-styled-components | DOM depth 최소화, $prefix 트랜지언트 props |
| .claude/skills/React/tanstack-router.md | TanStack Router 파일 기반 라우팅 | $ 동적, _ 레이아웃, beforeLoad 가드 |
| .claude/skills/PromptStructuring/SKILL.md | 프롬프트 구조화 인덱스 | XML 태그, 긍정 표현, 흐름 기호, 출력 최적화 |
| .claude/skills/PromptStructuring/xml-tags.md | XML 태그 표준 | 8개 표준 태그 (role, instructions, rules 등) |
| .claude/skills/PromptStructuring/positive-phrasing.md | 긍정 표현 전환 | 금지→위임/행동 변환 패턴 |
| .claude/skills/PromptStructuring/output-optimization.md | Hook/프롬프트 출력 최적화 | 50줄/hook, 150줄 총합, 약어 기법 |
| .claude/skills/ContextHandoff/SKILL.md | Context 압축 핸드오프 | HANDOFF.md 형식, 500자 제한, /clear 워크플로우 |
| .claude/skills/Director/SKILL.md | 프로젝트 스펙 문서 구조 | 스펙 디렉토리 템플릿, 5축 검증, 충돌 탐지 |
| .claude/skills/Documentation/SKILL.md | .claude 문서 작성 | frontmatter, 파일 길이 제한, 템플릿 |

## 핵심 흐름

1. UserPromptSubmit → skill-forced.sh → 모든 Skill 목록 스캔
2. 프롬프트 내용과 Skill keywords 매칭 → 관련 Skill 활성화
3. 활성화된 Skill의 규칙에 따라 코드 작성/리뷰

## 관련 Business Context

- [개발 워크플로우](../business/development-workflow.md)
