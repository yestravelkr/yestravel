// Role 관련 상수 정의
export const ROLE_VALUES = {
  ADMIN_SUPER: 'ADMIN_SUPER',
  ADMIN_STAFF: 'ADMIN_STAFF',
  PARTNER_SUPER: 'PARTNER_SUPER',
  PARTNER_STAFF: 'PARTNER_STAFF',
} as const;

export const ROLE_LABELS = {
  [ROLE_VALUES.ADMIN_SUPER]: '최고 관리자',
  [ROLE_VALUES.ADMIN_STAFF]: '관리자',
  [ROLE_VALUES.PARTNER_SUPER]: '대표 관리자',
  [ROLE_VALUES.PARTNER_STAFF]: '관리자',
} as const;

export type RoleType = (typeof ROLE_VALUES)[keyof typeof ROLE_VALUES];
