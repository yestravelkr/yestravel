---
name: development-workflow
description: Claude Code 기반 개발 워크플로우 - Agent 위임, Skill 자동화, 안전장치
keywords: [워크플로우, 개발프로세스, 자동화, 위임, 안전, Claude Code]
---

# 개발 워크플로우

## 목적

개발자가 Claude Code를 통해 코드 작업 시 일관된 품질과 안전성을 보장한다. 전문 Agent 위임으로 효율성을 높이고, Hook 기반 자동화로 규칙 준수를 강제한다.

## 핵심 기능

| 기능 | 설명 | 사용자 관점 |
|------|------|------------|
| Agent 자동 위임 | 작업 유형에 따라 전문 Agent가 처리 | 복잡한 작업도 일관된 품질 보장 |
| Skill 자동 활성화 | 프롬프트 내용에 맞는 개발 가이드라인 적용 | 프로젝트 규칙을 자동으로 준수 |
| 4단계 워크플로우 강제 | 계획→검증→구현→리뷰 순서 보장 | 사이드이펙트 사전 방지 |
| 위험 명령 차단 | rm -rf, force push 등 위험 명령 자동 차단 | 실수로 인한 데이터 손실 방지 |
| 세션 태스크 로딩 | GitHub Project 태스크를 세션 시작 시 표시 | 작업 연속성 및 우선순위 파악 |
| 인덱싱 최적화 | .claudeignore로 불필요한 파일 제외 | 빠른 코드베이스 탐색 및 토큰 절약 |

## 사용자 흐름

1. 개발자가 Claude Code 세션 시작 → GitHub Project 태스크 보드 자동 표시
2. 작업 요청 입력 → Skill/Agent 자동 평가 + 4단계 워크플로우 강제
3. 계획 수립 → 사용자 Confirm → 사이드이펙트 검증
4. 코드 수정 (작은 단위) → 단위별 커밋 → Self Code Review
5. 빌드/lint 검증 → 작업 완료

## 관련 Codebase Context

- [Claude Agents](../codebase/claude-agents.md)
- [Claude Hooks](../codebase/claude-hooks.md)
- [Claude Skills](../codebase/claude-skills.md)
- [Claude Settings](../codebase/claude-settings.md)
