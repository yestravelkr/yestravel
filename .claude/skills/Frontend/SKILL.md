---
name: Frontend
description: YesTravel 프론트엔드 개발 스킬. React 컴포넌트, tailwind-styled-components 스타일링, React Hook Form 폼 처리.
keywords: [프론트엔드, 컴포넌트, 스타일링, 폼, React, tailwind-styled-components, Modal, Toast, tRPC, Zustand, TanStack]
estimated_tokens: ~300
---

# 프론트엔드 개발 스킬

## 이 스킬이 필요할 때

- React 컴포넌트 작성
- 스타일링 (tailwind-styled-components)
- Modal, Toast 구현
- 폼 처리 (react-hook-form)

## 관련 문서

| 주제 | 위치 |
|-----|------|
| 스타일링 방법 | `styling.md` |
| 컴포넌트 패턴 | `components.md` |
| 폼 패턴 | `form-patterns.md` |

## 컴포넌트 작성 순서

1. Props interface 정의 (JSDoc 포함)
2. 컴포넌트 로직 작성
3. Usage 주석 추가
4. Styled components 정의 (파일 최하단)

## 필수 준수 사항

| 규칙 | 설명 |
|-----|------|
| **className 금지** | `tailwind-styled-components` 필수 사용 |
| **$prefix 패턴** | 조건부 props는 `$primary`, `$active` 형식 |
| **stroke-* 색상** | `var()` 함수로 사용 (예: `border-[var(--stroke-neutral)]`) |
| **아이콘** | `@minim/icon` 1순위, 없으면 `lucide-react` 사용 |
| **알림** | `alert()` 금지, `toast` from `sonner` 사용 |
| **폰트 이모지** | 금지 |

### 아이콘 사용 우선순위

1. **@minim/icon** (1순위): https://github.com/poposnail61/minim-icon
2. **lucide-react** (2순위): minim-icon에 없는 경우에만 사용

```typescript
// 1순위: @minim/icon
import { IconName } from '@minim/icon';

// 2순위: lucide-react (minim-icon에 없는 경우)
import { IconName } from 'lucide-react';
```

## 필수 체크리스트

- [ ] `className` 사용하지 않았는가?
- [ ] `tailwind-styled-components` 사용했는가?
- [ ] 조건부 props에 `$` 접두사 사용했는가?
- [ ] styled components가 파일 최하단에 있는가?
- [ ] JSDoc 주석과 Usage 예시 작성했는가?
- [ ] 아이콘은 `@minim/icon` 먼저 확인했는가?
- [ ] `alert()` 대신 `toast` 사용했는가?

## 빠른 참조

```typescript
// tailwind-styled-components 기본
import tw from 'tailwind-styled-components';

const Button = tw.button<{ $primary?: boolean }>`
  px-4 py-2 rounded
  ${({ $primary }) => $primary ? 'bg-blue-500' : 'bg-gray-500'}
`;
```
