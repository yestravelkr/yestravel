---
name: Frontend-styling
description: 프론트엔드 스타일링 가이드. tailwind-styled-components 필수, $prefix 조건부 props, stroke-* 색상 var() 사용.
keywords: [스타일링, tailwind, styled-components, $prefix, stroke, var, className금지, tw]
estimated_tokens: ~600
---

# 스타일링 가이드

## tailwind-styled-components 필수

```typescript
import tw from 'tailwind-styled-components';

// ✅ 올바른 방법
const Container = tw.div`
  flex
  flex-col
  gap-4
  p-5
  bg-white
`;

// ❌ className 직접 사용 금지
<div className="flex flex-col gap-4 p-5 bg-white" />
```

## 조건부 스타일링

### $prefix 패턴 사용

```typescript
// ✅ $ 접두사로 조건부 props 정의
const Button = tw.button<{ $primary?: boolean; $size?: 'sm' | 'md' | 'lg' }>`
  px-4 py-2
  rounded-xl
  transition-colors
  ${({ $primary }) => $primary
    ? 'bg-bg-neutral-solid text-fg-on-surface'
    : 'bg-bg-layer text-fg-neutral'}
  ${({ $size }) => {
    switch ($size) {
      case 'sm': return 'text-sm h-8';
      case 'lg': return 'text-lg h-12';
      default: return 'text-base h-10';
    }
  }}
`;

// 사용
<Button $primary $size="lg">Submit</Button>
```

### switch 문 활용

```typescript
const Icon = tw.i<{ $size: 'small' | 'medium' | 'large' }>`
  icon
  icon-check-solid
  ${({ $size }) => {
    switch ($size) {
      case 'small': return 'text-[10px]';
      case 'large': return 'text-[16px]';
      default: return 'text-[14px]';
    }
  }}
`;
```

## 스타일 컴포넌트 위치

**파일 최하단에 모든 styled-components 정의**:

```typescript
// 컴포넌트 로직
export function MyComponent() {
  return (
    <Container>
      <Title>Hello</Title>
    </Container>
  );
}

// ========================================
// Styled Components (파일 최하단)
// ========================================

const Container = tw.div`
  flex
  flex-col
`;

const Title = tw.h1`
  text-xl
  font-bold
`;
```

## 색상 시스템

### stroke-* 변수 (특별 처리 필요)

```typescript
// ✅ var() 함수 사용 필수
// stroke-* 토큰은 CSS 변수(--stroke-*)로만 선언하고,
// border-color / outline-color 등에서 `var(--stroke-*)`로 소비한다.
// 이렇게 하면 Tailwind의 SVG용 `stroke-*` 유틸리티와 역할이 분리되어,
// 아이콘 stroke 색상이 border 토큰에 잘못 매핑되는 문제를 피할 수 있다.
const Card = tw.div`
  border
  border-[var(--stroke-neutral)]
  outline-[var(--stroke-hover)]
`;

// ❌ 직접 사용 금지:
// `border-stroke-neutral`처럼 stroke-* 토큰을 그대로 유틸리티 클래스화하면
// Tailwind의 SVG stroke 유틸리티(`stroke-*`)와 네이밍이 겹쳐
// SVG 아이콘에 stroke 색상이 의도치 않게 border 색상 토큰으로 바인딩될 수 있다.
<div className="border-stroke-neutral" />
```

### 일반 색상 변수

```typescript
// ✅ 직접 사용 가능
const Text = tw.p`
  text-fg-neutral
  bg-bg-layer
  bg-bg-neutral-solid
`;
```

### 주요 색상 토큰

| 카테고리 | 토큰 | 용도 |
|---------|------|-----|
| **fg-** | `fg-neutral`, `fg-muted`, `fg-primary`, `fg-disabled` | 텍스트 색상 |
| **bg-** | `bg-layer`, `bg-layer-base`, `bg-neutral-solid`, `bg-field` | 배경 색상 |
| **stroke-** | `stroke-neutral`, `stroke-hover` | 테두리 (var() 필수) |

## 아이콘

### lucide-react 사용

```typescript
import { Home, Search, X, ArrowLeft } from 'lucide-react';

<Home size={20} />
<Search size={24} className="text-fg-muted" />
```

### minim-icon (min-design-system 전용)

```typescript
// min-design-system 패키지에서만 사용
const CheckIcon = tw.i`
  icon
  icon-check-solid
  text-white
  text-[14px]
`;
```

## 폰트

```typescript
// ❌ 폰트 클래스 사용 금지 (전역 설정됨)
<p className="font-['Min_Sans_VF']" />

// ✅ 폰트는 tailwind.config.ts에서 전역 설정
```

## 동적 스타일 (style prop)

크기가 동적으로 변하는 경우 style prop 사용:

```typescript
// ✅ 동적 크기는 style prop
const SkeletonBox = tw.div`
  bg-gray-200
  rounded-xl
  animate-pulse
`;

<SkeletonBox style={{ width: '100%', height: '120px' }} />
```

## 참고 파일

- 색상 정의: `apps/shop/src/index.css`
- Tailwind 설정: `tailwind.config.ts`
- 컴포넌트 예시: `apps/shop/src/components/new-order/`
