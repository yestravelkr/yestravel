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
        title: '상품',
        url: '/product',
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
