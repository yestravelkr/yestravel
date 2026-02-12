---
name: developer-automation
description: AI 기반 코드 분석으로 프로젝트 문서를 자동 생성하여 개발 생산성을 높이는 자동화 프로세스
keywords: [자동화, 문서생성, context, 개발생산성, DX, AI, 자동문서화]
estimated_tokens: ~300
---

# 개발 자동화

## 목적

코드 변경 시 프로젝트 context 문서를 자동으로 생성/업데이트하여, 개발자와 AI Agent가 항상 최신 코드베이스 정보를 참조할 수 있도록 한다. 수동 문서 관리 부담을 줄이고, 코드와 문서 간 불일치를 방지한다.

## 핵심 기능

| 기능 | 설명 | 사용자 관점 |
|------|------|------------|
| PR 기반 Context 자동 생성 | PR 생성/업데이트 시 변경된 코드를 AI가 분석하여 context 문서 자동 생성 | 개발자가 문서를 직접 작성하지 않아도 코드 변경이 자동으로 문서화됨 |
| 선택적 머지 | 자동 생성된 문서를 별도 PR로 제공하여 리뷰 후 선택적으로 반영 | 팀이 자동 생성 문서의 품질을 확인하고 필요한 것만 머지 가능 |
| 무한루프 방지 | context 문서 변경은 재트리거하지 않음 | 불필요한 CI 실행 없이 안정적으로 동작 |

## 사용자 흐름

### Context 문서 자동 생성

1. 개발자가 feature 브랜치에서 코드 변경 후 PR 생성
2. GitHub Actions가 자동으로 Context 생성 워크플로우 실행
3. AI가 변경된 코드를 분석하여 codebase/business context 문서 생성
4. `{브랜치명}-generated-context` 브랜치에 문서가 push됨
5. 원본 PR 브랜치를 base로 하는 별도 PR이 생성됨
6. 개발자가 생성된 문서를 리뷰하고 선택적으로 머지

### PR 업데이트 시

1. 개발자가 PR에 새 커밋 push
2. Context 생성 워크플로우가 다시 실행
3. context 브랜치가 force push로 최신 상태로 업데이트
4. 기존 PR이 있으면 새로 생성하지 않고 기존 PR의 내용이 갱신됨

## 비즈니스 규칙

- PR 단위로 context를 생성하여 각 변경의 맥락을 정확하게 반영한다
- `.claude/context/**` 경로 변경은 무시하여 무한루프를 방지한다
- 자동 생성된 문서는 원본 PR에 직접 반영하지 않고, 별도 PR로 제공하여 팀의 검토를 거친다

## 관련 Codebase Context

- [github-actions-context-gen](../codebase/github-actions-context-gen.md)
