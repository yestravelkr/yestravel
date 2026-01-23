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

## 필수 체크리스트

- [ ] `className` 사용하지 않았는가?
- [ ] `tailwind-styled-components` 사용했는가?
- [ ] 조건부 props에 `$` 접두사 사용했는가?
- [ ] styled components가 파일 최하단에 있는가?
- [ ] JSDoc 주석과 Usage 예시 작성했는가?

## 빠른 참조

```typescript
// tailwind-styled-components 기본
import tw from 'tailwind-styled-components';

const Button = tw.button<{ $primary?: boolean }>`
  px-4 py-2 rounded
  ${({ $primary }) => $primary ? 'bg-blue-500' : 'bg-gray-500'}
`;
```
