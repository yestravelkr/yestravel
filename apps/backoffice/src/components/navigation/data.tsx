import { NavGroup } from '@/components/navigation/type.ts';

export const NAV_GROUPS: NavGroup[] = [
  {
    title: '기본',
    items: [
      {
        title: '홈',
        url: '/',
        icon: () => <span>🏠</span>,
      },
      {
        title: '상품',
        url: '/product',
        icon: () => <span>🛍</span>,
      },
    ],
  },
  {
    title: '페이지',
    items: [
      {
        title: '에러',
        icon: () => <span>🐞</span>,
        items: [
          // {
          //   title: '404',
          //   url: '/404',
          //   icon: () => <span>🚫</span>,
          // },
          {
            title: '403',
            url: '/unauthorized',
            icon: () => <span>🔞</span>,
          },
        ],
      },
    ],
  },
];
