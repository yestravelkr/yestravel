import { LoginEntity } from '@src/module/backoffice/domain/login-entity';
import type { PartnerType } from '@src/module/partner/auth/partner-auth.schema';
import type { RoleEnumType } from '../admin.schema';

/**
 * PartnerManagerResult - findManagerById 결과 타입
 */
export interface PartnerManagerResult {
  manager: LoginEntity;
  partnerId: number;
}

/**
 * CreateManagerParams - 매니저 생성 파라미터
 */
export interface CreateManagerParams {
  partnerId: number;
  email: string;
  password: string;
  name: string;
  phoneNumber: string;
  role: RoleEnumType;
}

/**
 * UpdateManagerRoleParams - 매니저 권한 수정 파라미터
 */
export interface UpdateManagerRoleParams {
  id: number;
  partnerId: number;
  role: RoleEnumType;
}

/**
 * PartnerManagerStrategy - 파트너 매니저 CRUD Strategy 인터페이스
 *
 * Brand/Influencer별 매니저 관리 로직을 캡슐화합니다.
 */
export interface PartnerManagerStrategy {
  getSupportedType(): PartnerType;
  createManager(params: CreateManagerParams): Promise<LoginEntity>;
  findManagers(partnerId: number): Promise<LoginEntity[]>;
  deleteManager(id: number, partnerId: number): Promise<void>;
  findManagerById(id: number): Promise<PartnerManagerResult>;
  updateManagerRole(params: UpdateManagerRoleParams): Promise<LoginEntity>;
}
