import {
  Building2,
  Calendar,
  CircleDollarSign,
  FileText,
  LayoutGrid,
  ShoppingBag,
  User as UserIcon,
  Users,
} from 'lucide-react';

import { NavGroup } from '@/components/navigation/type';

export const NAV_GROUPS: NavGroup[] = [
  {
    title: '상품관리',
    items: [
      { title: '품목', url: '/product-template', icon: LayoutGrid },
      { title: '상품', url: '/product', icon: ShoppingBag },
      { title: '캠페인', url: '/campaign', icon: Calendar },
    ],
  },
  {
    title: '주문관리',
    items: [
      { title: '주문목록', url: '/order/hotel', icon: FileText },
      { title: '정산', url: '/settlement', icon: CircleDollarSign },
    ],
  },
  {
    title: '설정',
    items: [
      { title: '브랜드', url: '/brand', icon: Building2 },
      { title: '인플루언서', url: '/influencer', icon: UserIcon },
      { title: '관리자 계정', url: '/admin', icon: Users },
    ],
  },
];
