/**
 * Nullish 타입 유틸리티 - Zod의 nullish() 동작과 일치
 * 값이 T, null, 또는 undefined일 수 있도록 허용
 * Zod 스키마 정의와 일치하도록 엔티티의 선택적 필드에 사용
 */
export type Nullish<T> = T | null | undefined;

/**
 * Enum 타입 유틸리티 - 문자열 리터럴 타입을 Record 형태로 변환
 * enum 대신 사용하여 tree-shaking이 가능하고 타입 안전성을 보장
 * 예시: EnumType<'ADMIN' | 'USER'> = { ADMIN: 'ADMIN', USER: 'USER' }
 */
export type EnumType<T extends string> = Record<T, T>;