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

## 설계 원칙

> **참조**: `.claude/skills/Coding/SKILL.md` - SRP, 결합도, 응집도 공통 원칙

### 프론트엔드 특화 규칙

| 규칙 | 설명 |
|------|------|
| **Props Drilling 지양** | 3단계 이상이면 Context 또는 Store 사용 |
| **common 독립성** | common 컴포넌트는 도메인(auth, product 등) import 금지 |
| **index.ts 공개 API** | 폴더 외부는 index.ts 통해서만 import |

## 필수 준수 사항

| 규칙 | 설명 |
|-----|------|
| **className 제한** | 4개 이상 클래스 사용 시 `tailwind-styled-components` 필수. 3개 이하는 `className` 허용 |
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

- [ ] `className`에 4개 이상 클래스가 있다면 styled component로 분리했는가?
- [ ] `tailwind-styled-components` 사용했는가?
- [ ] 조건부 props에 `$` 접두사 사용했는가?
- [ ] styled components가 파일 최하단에 있는가?
- [ ] JSDoc 주석과 Usage 예시 작성했는가?
- [ ] 아이콘은 `@minim/icon` 먼저 확인했는가?
- [ ] `alert()` 대신 `toast` 사용했는가?

## 스타일링 가독성 및 중첩 최소화

### className vs styled component 기준

```typescript
// ✅ 3개 이하 - className 허용
<div className="flex items-center gap-2">

// ❌ 4개 이상 - styled component 사용
<div className="flex items-center gap-2 p-4 bg-white rounded-lg">

// ✅ 4개 이상은 styled component로 분리
const Container = tw.div`
  flex items-center gap-2
  p-4 bg-white rounded-lg
`;
```

### 불필요한 div 중첩 제거

```typescript
// ❌ 의미 없는 중첩
<Wrapper><Container><Inner><Content>텍스트</Content></Inner></Container></Wrapper>

// ✅ 필요한 만큼만
<Card><Content>텍스트</Content></Card>
```

### tailwind 클래스 가독성

```typescript
// ❌ 한 줄에 모든 클래스
const Button = tw.button`flex items-center px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600`;

// ✅ 논리적 그룹으로 줄바꿈
const Button = tw.button`
  flex items-center
  px-4 py-2
  bg-blue-500 text-white rounded
  hover:bg-blue-600
`;
```

### 조건부 스타일 가독성

```typescript
// ❌ 삼항 중첩
${({ $v }) => $v === 'a' ? 'bg-blue' : $v === 'b' ? 'bg-gray' : 'bg-white'}

// ✅ 객체 매핑
const styles = { a: 'bg-blue', b: 'bg-gray', c: 'bg-white' };
${({ $v }) => styles[$v]}
```

## 빠른 참조

```typescript
// tailwind-styled-components 기본
import tw from 'tailwind-styled-components';

const Button = tw.button<{ $primary?: boolean }>`
  px-4 py-2 rounded
  ${({ $primary }) => $primary ? 'bg-blue-500' : 'bg-gray-500'}
`;
```
