---
name: frontend-index
description: YesTravel 프론트엔드 기술 스택 및 스타일링 규칙. React, TanStack Router, Zustand, tailwind-styled-components.
keywords: [프론트엔드, React, TanStack, Zustand, tRPC, tailwind, lucide, sonner, className금지]
estimated_tokens: ~200
---

# 프론트엔드 기술 스택

## 기술

| 영역 | 기술 |
|-----|------|
| **Framework** | React 18, TypeScript 5.x |
| **Routing** | TanStack Router (파일 기반) |
| **State** | Zustand (전역), React Hook Form (폼) |
| **API** | tRPC Client |
| **Styling** | tailwind-styled-components |
| **UI** | lucide-react, sonner, react-snappy-modal |

## 앱 구조

```
apps/backoffice/     # 관리자 앱
apps/shop/           # 고객용 앱
packages/min-design-system/  # 디자인 시스템
```

## 스타일링 규칙

- `className` 직접 사용 금지
- `tailwind-styled-components` 필수
- 조건부 props: `$` 접두사 (`$primary`, `$active`)
- `stroke-*` 색상: `var()` 함수 사용

## 아이콘

- `lucide-react`만 사용
- 폰트 이모지 금지

## 알림

- `alert()` 금지
- `toast` from `sonner` 사용

## 개발 방법

`.claude/skills/fe-development/`
