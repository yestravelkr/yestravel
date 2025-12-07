import { HomeIcon } from '@/components/icons';
import { NavGroup } from '@/components/navigation/type';

export const NAV_GROUPS: NavGroup[] = [
  {
    title: '기본',
    items: [
      {
        title: '홈',
        url: '/',
        icon: HomeIcon,
      },
      {
        title: '브랜드',
        url: '/brand',
      },
      {
        title: '인플루언서',
        url: '/influencer',
      },
      {
        title: '품목',
        url: '/product-template',
      },
      {
        title: '상품',
        url: '/product',
      },
      {
        title: '캠페인',
        url: '/campaign',
      },
    ],
  },
  {
    title: '관리',
    items: [
      {
        title: '관리자 계정',
        url: '/admin',
      },
    ],
  },
  {
    title: '페이지',
    items: [
      {
        title: '에러',
        items: [
          {
            title: '403',
            url: '/unauthorized',
          },
        ],
      },
    ],
  },
];
