import { ClipboardList, Home } from 'lucide-react';

import { NavGroup } from '@/components/navigation/type';

/** 브랜드 파트너 네비게이션 그룹 */
export const BRAND_NAV_GROUPS: NavGroup[] = [
  {
    title: '브랜드 관리',
    items: [
      {
        title: '대시보드',
        url: '/brand',
        icon: Home,
      },
    ],
  },
  {
    title: '주문관리',
    items: [
      {
        title: '숙박 주문',
        url: '/brand/order/hotel',
        icon: ClipboardList,
      },
    ],
  },
];

/** 인플루언서 파트너 네비게이션 그룹 */
export const INFLUENCER_NAV_GROUPS: NavGroup[] = [
  {
    title: '인플루언서 관리',
    items: [
      {
        title: '대시보드',
        url: '/influencer',
        icon: Home,
      },
    ],
  },
  {
    title: '주문관리',
    items: [
      {
        title: '숙박 주문',
        url: '/influencer/order/hotel',
        icon: ClipboardList,
      },
    ],
  },
];
