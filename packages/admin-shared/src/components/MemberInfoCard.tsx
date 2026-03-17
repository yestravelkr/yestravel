/**
 * MemberInfoCard - 회원정보 카드 컴포넌트
 *
 * 회원 이름, 연락처 표시
 */

import { Card } from './base/Card';
import { DescriptionList } from './base/DescriptionList';

/** 회원 정보 타입 */
export interface MemberInfo {
  name: string;
  phone: string;
}

interface MemberInfoCardProps {
  /** 회원 정보 */
  member: MemberInfo;
}

/**
 * Usage:
 * ```tsx
 * <MemberInfoCard
 *   member={{
 *     name: '홍길동',
 *     phone: '010-0000-0000',
 *   }}
 * />
 * ```
 */
export function MemberInfoCard({ member }: MemberInfoCardProps) {
  return (
    <Card title="회원정보">
      <DescriptionList
        items={[
          { label: '이름', value: member.name },
          { label: '연락처', value: member.phone },
        ]}
      />
    </Card>
  );
}
