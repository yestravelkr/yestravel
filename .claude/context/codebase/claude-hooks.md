---
name: claude-hooks
description: Claude Code Hook 스크립트 - 세션/프롬프트/명령어 이벤트별 자동 실행
keywords: [hook, skill-forced, workflow-enforced, dangerous-command, task-loader, 자동실행]
---

# Claude Hooks

Claude Code의 이벤트 기반 자동 실행 스크립트. settings.json에서 이벤트와 스크립트를 바인딩한다.

## 파일 구조

| 파일 | 역할 | 핵심 기능 |
|------|------|----------|
| .claude/hooks/task-loader.sh | 세션 시작 시 GitHub Project 태스크 표시 | gh CLI로 프로젝트 태스크 조회, 우선순위 정렬 |
| .claude/hooks/skill-forced.sh | 사용자 프롬프트 제출 시 Skill/Agent 평가 강제 | 모든 Skill YES/NO 평가, context 로딩, Agent 위임 규칙 |
| .claude/hooks/workflow-enforced.sh | 사용자 프롬프트 제출 시 4단계 워크플로우 강제 | Planning→Validation→Implementation→Review 순서 |
| .claude/hooks/skill-forced-subagent.sh | Subagent 시작 시 Skill 평가 강제 | .claude/skills/ 자동 스캔, 관련 Skill 활성화 |
| .claude/hooks/dangerous-command-blocker.sh | Bash 명령 실행 전 위험 명령 차단 | rm -rf, sudo, force push, chmod 777 등 차단 |

## 핵심 흐름

1. **SessionStart** → task-loader.sh → GitHub Project 태스크 보드 표시
2. **UserPromptSubmit** → skill-forced.sh + workflow-enforced.sh → Skill/Agent 평가 + 워크플로우 강제
3. **SubagentStart** → skill-forced-subagent.sh → Subagent용 Skill 자동 평가
4. **PreToolUse (Bash)** → dangerous-command-blocker.sh → 위험 명령 차단

## 설정 파일

| 파일 | 역할 | 핵심 설정 |
|------|------|----------|
| .claude/settings.json | Hook 이벤트 바인딩 | SessionStart, UserPromptSubmit, SubagentStart, PreToolUse 매핑 |

## 관련 Business Context

- [개발 워크플로우](../business/development-workflow.md)
