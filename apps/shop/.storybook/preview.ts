import type { Preview } from '@storybook/react-vite';

// 글로벌 스타일 import (Tailwind CSS + 디자인 시스템)
import '@/index.css';

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: 'todo',
    },

    // 모바일 퍼스트 뷰포트 설정
    viewport: {
      viewports: {
        mobile: {
          name: 'Mobile',
          styles: { width: '375px', height: '667px' },
        },
        mobileLarge: {
          name: 'Mobile Large',
          styles: { width: '414px', height: '896px' },
        },
        tablet: {
          name: 'Tablet',
          styles: { width: '768px', height: '1024px' },
        },
      },
      defaultViewport: 'mobile',
    },

    // 배경색 옵션
    backgrounds: {
      default: 'light',
      values: [
        { name: 'light', value: '#F4F4F5' },
        { name: 'white', value: '#FFFFFF' },
        { name: 'dark', value: '#1a1a1a' },
      ],
    },
  },
};

export default preview;
