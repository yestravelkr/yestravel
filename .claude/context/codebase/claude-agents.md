---
name: claude-agents
description: Claude Code Agent 정의 - 15개 전문 Agent의 역할, 모델, 위임 체계
keywords: [agent, subagent, 위임, claude-code, architect, code-writer, git-manager, explore]
---

# Claude Agents

Claude Code의 전문 Agent 시스템. Main Agent의 Context 절약을 위해 작업을 전문 Subagent에 위임한다.

## 파일 구조

| 파일 | 역할 | 핵심 Agent |
|------|------|-----------|
| .claude/agents/architect.md | 시스템 구조 설계, 복잡한 버그 디버깅 | architect (opus) |
| .claude/agents/code-writer.md | 로직 작성, 기능 구현, 리팩토링 | code-writer (opus) |
| .claude/agents/simple-code-writer.md | 1-2개 파일 간단한 수정 | simple-code-writer (haiku) |
| .claude/agents/code-reviewer.md | 구현 완료 후 품질 검토 | code-reviewer (opus) |
| .claude/agents/git-manager.md | 커밋, PR, 브랜치 관리 | git-manager (sonnet) |
| .claude/agents/explore.md | 빠른 파일/코드 검색 | explore (haiku) |
| .claude/agents/context-collector.md | 소스코드 패턴/도메인 지식 수집 | context-collector (opus) |
| .claude/agents/context-generator.md | PR diff 기반 context 문서 자동 생성 (CI) | context-generator (opus) |
| .claude/agents/context-manager.md | context 문서 구조 최적화 | context-manager (sonnet) |
| .claude/agents/impact-analyzer.md | 코드 수정 전 영향 범위 분석 | impact-analyzer (opus) |
| .claude/agents/task-planner.md | 복잡한 작업 계획 수립 | task-planner (opus) |
| .claude/agents/qa-tester.md | 빌드/테스트/lint 검증 | qa-tester (sonnet) |
| .claude/agents/designer.md | UI 컴포넌트 구조/스타일 설계 | designer (sonnet) |
| .claude/agents/director.md | 프로젝트 스펙 정합성 검증 | director (opus) |
| .claude/agents/project-task-manager.md | GitHub Project 태스크 관리 | project-task-manager (haiku) |

## 핵심 흐름

1. 사용자 요청 → Main Agent가 작업 분류
2. Main Agent → 적합한 Subagent에 Task() 위임
3. Subagent 실행 → 결과 요약을 Main Agent에 반환
4. Main Agent → 사용자에게 결과 전달

## 위임 기준

| 조건 | 처리 방식 |
|------|----------|
| 1-2개 파일 수정 | Main Agent 직접 |
| 3개+ 파일 수정 | code-writer 위임 |
| 코드베이스 탐색 | explore 위임 |
| 모든 Git 작업 | git-manager 위임 |
| 영향 분석 | impact-analyzer 위임 |

## 관련 Business Context

- [개발 워크플로우](../business/development-workflow.md)
