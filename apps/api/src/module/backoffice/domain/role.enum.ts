export enum RoleType {
  ADMIN_SUPER = 'ADMIN_SUPER', // 예스트레블 모든 권한
  ADMIN_STAFF = 'ADMIN_STAFF', // 예스트레블 직원

  PARTNER_SUPER = 'PARTNER_SUPER', // 브랜드, 인플루언서 모든 권한
  PARTNER_STAFF = 'PARTNER_STAFF', // 브랜드, 인플루언서 직원 권한
}

export enum PermissionKey {
  ADMIN_CREATE = 'admin.create',
  ADMIN_UPDATE = 'admin.update',
  ADMIN_DELETE = 'admin.delete',
  ADMIN_VIEW = 'admin.view',

  ORDER_VIEW = 'order.view',
  SETTLEMENT_VIEW = 'settlement.view',
  PARTNER_CREATE = 'partner.create',
  PARTNER_UPDATE = 'partner.update',
  PARTNER_DELETE = 'partner.delete',
  PARTNER_VIEW = 'partner.view',
}

const PARTNER_STAFF_PERMISSIONS = [
  PermissionKey.ORDER_VIEW,
  PermissionKey.PARTNER_VIEW,
  PermissionKey.PARTNER_UPDATE,
];

const PARTNER_SUPER_PERMISSIONS = [
  PermissionKey.ADMIN_CREATE,
  PermissionKey.ADMIN_DELETE,
  PermissionKey.SETTLEMENT_VIEW,
  PermissionKey.PARTNER_CREATE,
  PermissionKey.PARTNER_DELETE,
  ...PARTNER_STAFF_PERMISSIONS,
];

const ADMIN_STAFF_PERMISSIONS = [
  PermissionKey.ADMIN_VIEW,
  PermissionKey.ADMIN_UPDATE,
  ...PARTNER_STAFF_PERMISSIONS,
];

export const ROLE_PERMISSION_MAP: Record<RoleType, PermissionKey[] | ['*']> = {
  [RoleType.ADMIN_SUPER]: ['*'],
  [RoleType.ADMIN_STAFF]: ADMIN_STAFF_PERMISSIONS,
  [RoleType.PARTNER_SUPER]: PARTNER_SUPER_PERMISSIONS,
  [RoleType.PARTNER_STAFF]: PARTNER_STAFF_PERMISSIONS,
};
