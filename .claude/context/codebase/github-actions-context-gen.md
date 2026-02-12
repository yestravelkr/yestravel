---
name: github-actions-context-gen
description: Context 자동 생성 GitHub Actions 워크플로우 - PR 트리거 기반 context 문서 자동 생성 파이프라인
keywords: [CI, GitHub Actions, context, 자동생성, auto-generation, workflow, PR, claude-code-action]
estimated_tokens: ~350
---

# GitHub Actions Context Auto-Generation

PR 생성/업데이트 시 변경된 코드를 분석하여 `.claude/context/` 하위에 codebase/business 문서를 자동으로 생성하는 GitHub Actions 워크플로우이다. Claude Code Action을 사용하여 diff를 분석하고, 결과를 별도 브랜치에 push한 뒤 원본 PR로 머지 가능한 PR을 생성한다.

## 파일 구조

| 파일 | 역할 | 핵심 설정 |
|------|------|----------|
| .github/workflows/context-gen.yml | Context 자동 생성 워크플로우 정의 | on: pull_request (opened, synchronize) |
| .claude/agents/context-generator.md | Context Generator Agent 정의 | 에이전트 역할 및 프로세스 |
| .claude/skills/ContextGeneration/SKILL.md | Context 생성 스킬 가이드 | 문서 형식, 규칙, 템플릿 |

## 핵심 흐름

### Context 문서 생성

1. PR 이벤트(opened, synchronize) 발생 -> 워크플로우 트리거 (`.claude/context/**` 변경은 무시)
2. `actions/checkout@v4`로 PR 브랜치(`github.head_ref`) 체크아웃 (fetch-depth: 0)
3. Agent 정의 및 Skill 가이드 파일을 `GITHUB_OUTPUT`으로 읽기
4. `anthropics/claude-code-action@v1`로 Claude Code 실행 -> diff 분석 -> context 문서 생성/업데이트
5. 생성된 문서를 `{브랜치명}-generated-context` 브랜치에 force push
6. 원본 PR 브랜치를 base로 하는 별도 PR 생성 (기존 PR이 있으면 스킵)

### 무한루프 방지

- `paths-ignore: .claude/context/**` 설정으로 context 문서 변경 시 재트리거 방지

## 주요 설계 결정

- **PR 트리거 방식**: PR 단위로 context를 생성하여 각 변경의 맥락을 정확하게 반영
- **별도 브랜치/PR 전략**: 원본 PR에 직접 push하지 않고 별도 PR로 생성하여 선택적 머지 가능
- **force push 활용**: re-sync 시 context 브랜치를 force push로 업데이트하여 항상 최신 상태 유지
- **Claude Code Action 사용**: `anthropics/claude-code-action@v1`에 허용 도구를 제한하여 안전한 실행 보장

## 관련 Business Context

- [개발 자동화](../business/developer-automation.md)
