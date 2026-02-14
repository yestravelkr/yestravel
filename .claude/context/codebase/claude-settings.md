---
name: claude-settings
description: Claude Code 프로젝트 설정 - settings.json Hook 구성, .claudeignore 인덱싱 최적화
keywords: [설정, settings, claudeignore, hook, 인덱싱, 성능]
---

# Claude Settings

Claude Code 프로젝트 설정 파일로, Hook 이벤트 구성과 인덱싱 제외 패턴을 관리한다.

## 파일 구조

| 파일 | 역할 | 핵심 설정 |
|------|------|----------|
| .claude/settings.json | Hook 이벤트별 실행 스크립트 구성 | SessionStart, UserPromptSubmit, SubagentStart, PreToolUse |
| .claudeignore | Claude Code 인덱싱 제외 패턴 | yarn.lock, 바이너리, 빌드 캐시, 환경 파일 등 |

## 핵심 흐름

### settings.json Hook 구성

1. **SessionStart** → `task-loader.sh` 실행 (GitHub Project 태스크 로딩)
2. **UserPromptSubmit** → `skill-forced.sh` + `workflow-enforced.sh` 실행 (Skill/워크플로우 강제)
3. **SubagentStart** → `skill-forced-subagent.sh` 실행 (Subagent Skill 강제)
4. **PreToolUse (Bash)** → `dangerous-command-blocker.sh` 실행 (위험 명령 차단)

### .claudeignore 제외 카테고리

1. **대용량 파일**: yarn.lock (616KB)
2. **바이너리/미디어**: png, jpg, gif, ico, woff, ttf 등
3. **빌드/캐시**: .tanstack/, *.tsbuildinfo, coverage/
4. **환경/보안**: .env, .env.*
5. **IDE/OS**: .idea/, .vscode/, .DS_Store
6. **인프라**: .ebextensions/, .platform/, Dockerrun.aws.json
7. **기타**: .husky/, .mcp.json, lint-staged.config.js

## 관련 Business Context

- [개발 워크플로우](../business/development-workflow.md)
