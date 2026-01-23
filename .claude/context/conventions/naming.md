---
name: conventions-naming
description: YesTravel 프로젝트 네이밍 규칙. Enum 네이밍, 변수명, 파일명, 함수명 컨벤션.
keywords: [네이밍, Enum, 변수명, 파일명, 함수명, 컨벤션, camelCase, PascalCase, SCREAMING_SNAKE]
estimated_tokens: ~200
---

# 네이밍 규칙

## Enum 네이밍

| 패턴 | 형식 | 예시 |
|-----|------|-----|
| 값 배열 | `{NAME}_ENUM_VALUE` | `ROLE_ENUM_VALUE` |
| 타입 | `{Name}EnumType` | `RoleEnumType` |
| 객체 | `{Name}Enum` | `RoleEnum` |
| 스키마 | `{name}EnumSchema` | `roleEnumSchema` |

```typescript
export const ROLE_ENUM_VALUE = ['ADMIN', 'USER'] as const;
export type RoleEnumType = typeof ROLE_ENUM_VALUE[number];
export const RoleEnum = { ADMIN: 'ADMIN', USER: 'USER' };
export const roleEnumSchema = z.enum(ROLE_ENUM_VALUE);
```

## 메시지 패턴

tRPC-NestJS 내부 통신: `moduleName.methodName`

```typescript
@MessagePattern('shopOrder.create')
@MessagePattern('admin.findAll')
```

## 파일 네이밍

```
module.router.ts      # tRPC Router
module.controller.ts  # NestJS Controller
module.service.ts     # 비즈니스 로직
module.schema.ts      # Zod 스키마
module.dto.ts         # DTO 타입
```

## 변수명 규칙

- 한 글자 변수명 금지 (`i`, `p`, `x` → `item`, `product`, `value`)
- 의미 있는 이름 사용
