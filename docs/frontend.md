# 프론트엔드 개발 가이드

이 가이드는 React 19와 최신 도구로 구축된 YesTravel 백오피스 애플리케이션의 프론트엔드 개발을 다룹니다.

## 기술 스택

- **프레임워크**: React 19 with TypeScript
- **빌드 도구**: Vite
- **라우팅**: TanStack Router (파일 기반)
- **스타일링**: Tailwind CSS + tailwind-styled-components
- **상태 관리**: Zustand
- **폼 처리**: React Hook Form
- **API 통합**: tRPC client

## 프로젝트 구조

```
apps/backoffice/
├── src/
│   ├── components/          # 재사용 가능한 UI 컴포넌트
│   │   ├── auth/           # 인증 관련 컴포넌트
│   │   ├── icons/          # SVG 아이콘 컴포넌트
│   │   ├── navigation/     # 네비게이션 컴포넌트
│   │   ├── ui/             # 공통 UI 컴포넌트
│   │   ├── header.tsx
│   │   └── index.ts
│   ├── routes/             # 페이지 컴포넌트 및 라우팅
│   │   ├── __root.tsx      # 루트 레이아웃
│   │   ├── _auth/          # 보호된 라우트
│   │   │   ├── route.tsx   # 인증된 사용자 레이아웃
│   │   │   └── index.tsx
│   │   ├── login.tsx
│   │   └── unauthorized.tsx
│   ├── store/              # Zustand 스토어
│   │   ├── authStore.ts
│   │   └── index.ts
│   ├── shared/             # 공유 유틸리티
│   │   ├── routes/         # 라우트 유틸리티
│   │   └── trpc/           # tRPC 클라이언트 설정
│   ├── assets/             # 정적 에셋
│   ├── App.tsx             # 메인 앱 컴포넌트
│   └── main.tsx            # 진입점
├── public/                 # 공개 에셋
├── index.html              # HTML 템플릿
└── vite.config.ts          # Vite 설정
```

## 개발 명령어

```bash
# 개발 서버 시작
yarn dev

# 프로덕션용 빌드
yarn build

# 프로덕션 빌드 미리보기
yarn preview

# 린팅 실행
yarn lint
```

## TanStack Router로 라우팅

### 파일 기반 라우팅

라우트는 `src/routes/` 디렉토리에 정의됩니다:

```typescript
// src/routes/__root.tsx - 루트 레이아웃
import { createRootRoute, Outlet } from '@tanstack/react-router';
import { Header } from '../components/header';

export const Route = createRootRoute({
  component: () => (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  ),
});
```

### 보호된 라우트

```typescript
// src/routes/_auth/route.tsx - 보호된 라우트 레이아웃
import { createFileRoute, redirect } from '@tanstack/react-router';
import { useAuthStore } from '../../store/authStore';

export const Route = createFileRoute('/_auth')({
  beforeLoad: ({ context }) => {
    const { admin } = useAuthStore.getState();
    if (!admin) {
      throw redirect({
        to: '/login',
        search: {
          redirect: location.href,
        },
      });
    }
  },
  component: AuthLayout,
});
```

## Zustand로 상태 관리

### 인증 스토어 예시

```typescript
// src/store/authStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Admin {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AuthState {
  admin: Admin | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setAdmin: (admin: Admin) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      admin: null,
      isLoading: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
          // 로그인 API 호출
          const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
          });
          
          const admin = await response.json();
          set({ admin, isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: () => {
        set({ admin: null });
      },

      setAdmin: (admin: Admin) => {
        set({ admin });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ admin: state.admin }),
    }
  )
);
```

## tRPC 통합

### 클라이언트 설정

```typescript
// src/lib/trpc.ts
import { createTRPCReact } from '@trpc/react-query';
import type { AppRouter } from '../../../api/src/app.router';

export const trpc = createTRPCReact<AppRouter>();
```

### tRPC 컴포넌트에서 사용

```typescript
import { trpc } from '../lib/trpc';

function UsersList() {
  const { data: users, isLoading, error } = trpc.user.getMany.useQuery({
    page: 1,
    limit: 10,
  });

  const createUserMutation = trpc.user.create.useMutation({
    onSuccess: () => {
      // 사용자 목록 무효화 및 다시 가져오기
      trpc.useContext().user.getMany.invalidate();
    },
  });

  const handleCreateUser = (userData: CreateUserData) => {
    createUserMutation.mutate(userData);
  };

  if (isLoading) return <div>로딩 중...</div>;
  if (error) return <div>오류: {error.message}</div>;

  return (
    <div>
      <h2>사용자</h2>
      {users?.items.map((user) => (
        <div key={user.id} className="user-item">
          {user.name} ({user.email})
        </div>
      ))}
    </div>
  );
}
```

## React Hook Form으로 폼 처리

### 기본 폼

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const userSchema = z.object({
  name: z.string().min(1, '이름은 필수입니다'),
  email: z.string().email('올바르지 않은 이메일입니다'),
  role: z.enum(['admin', 'user']),
});

type UserFormData = z.infer<typeof userSchema>;

function UserForm({ onSubmit }: { onSubmit: (data: UserFormData) => void }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium">
          이름
        </label>
        <input
          {...register('name')}
          type="text"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
      >
        {isSubmitting ? '제출 중...' : '제출'}
      </button>
    </form>
  );
}
```

## 컴포넌트 패턴

### 재사용 가능한 버튼 컴포넌트

```typescript
// src/components/Button.tsx
import { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '../lib/utils';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}: ButtonProps) {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-md transition-colors';
  
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700',
    outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  return (
    <button
      className={cn(baseClasses, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </button>
  );
}
```

### 로딩 상태

```typescript
// src/components/Loading.tsx
export function Loading() {
  return (
    <div className="flex items-center justify-center p-4">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  );
}

// 컴포넌트에서 사용
function UsersList() {
  const { data, isLoading } = trpc.user.getMany.useQuery();

  if (isLoading) return <Loading />;

  return (
    <div>
      {/* 사용자 목록 내용 */}
    </div>
  );
}
```

## Tailwind CSS로 스타일링

### tailwind-styled-components 사용

```typescript
import tw from 'tailwind-styled-components';

// 레이아웃 컴포넌트
const Container = tw.div`
  flex 
  flex-col 
  h-screen 
  bg-gray-50
`;

const ContentWrapper = tw.div`
  flex 
  flex-1 
  overflow-hidden
`;

// 헤더 컴포넌트
const HeaderContainer = tw.header`
  bg-white 
  border-b 
  border-gray-200
  sticky 
  top-0 
  z-50
`;

// 네비게이션 링크
const StyledLink = tw(Link)`
  flex 
  items-center 
  gap-2 
  px-3 
  py-2 
  text-sm 
  text-gray-600 
  rounded-lg 
  transition-colors
  hover:bg-gray-100 
  hover:text-gray-900
  [&.active]:bg-blue-50
  [&.active]:text-blue-600
  [&.active]:font-medium
`;
```

### 디자인 가이드라인

- **포스타입/인스타그램 스타일**: 미니멀하고 깔끔한 UI
- **색상 팔레트**: 주로 화이트/그레이 톤 사용
- **타이포그래피**: 명확하고 읽기 쉬운 폰트 계층 구조
- **여백**: 충분한 여백으로 콘텐츠 강조
- **인터랙션**: 부드러운 호버 효과와 트랜지션

## 성능 최적화

### 코드 분할

```typescript
// 페이지 지연 로딩
import { lazy, Suspense } from 'react';

const UsersPage = lazy(() => import('./pages/Users'));
const SettingsPage = lazy(() => import('./pages/Settings'));

function App() {
  return (
    <Router>
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/users" element={<UsersPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </Suspense>
    </Router>
  );
}
```

### 메모이제이션

```typescript
import { memo, useMemo } from 'react';

const UserCard = memo(({ user }: { user: User }) => {
  const displayName = useMemo(() => {
    return user.firstName && user.lastName
      ? `${user.firstName} ${user.lastName}`
      : user.email;
  }, [user.firstName, user.lastName, user.email]);

  return (
    <div className="user-card">
      <h3>{displayName}</h3>
      <p>{user.email}</p>
    </div>
  );
});
```

## 테스트

### 컴포넌트 테스트

```typescript
// src/components/__tests__/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '../Button';

describe('Button', () => {
  it('올바르게 렌더링됨', () => {
    render(<Button>클릭하세요</Button>);
    expect(screen.getByText('클릭하세요')).toBeInTheDocument();
  });

  it('클릭 시 onClick 호출', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>클릭하세요</Button>);
    
    fireEvent.click(screen.getByText('클릭하세요'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

## 빌드 및 배포

### Vite 설정

```typescript
// vite.config.ts
import tailwindcss from '@tailwindcss/vite';
import TanStackRouterVite from '@tanstack/router-plugin/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    TanStackRouterVite({ autoCodeSplitting: true }),
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
});
```

## 아이콘 시스템

### SVG 아이콘 컴포넌트

```typescript
// src/components/icons/index.tsx
export const HomeIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);
```

### 네비게이션 구조

```typescript
// src/components/navigation/data.tsx
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
];
```

## Claude Code 사용자를 위한 안내

- **스타일링**: tailwind-styled-components를 사용하여 스타일 컴포넌트 생성
- **아이콘**: 폰트 이모지 대신 SVG 아이콘 컴포넌트 사용
- **레이아웃**: 포스타입/인스타그램 스타일의 미니멀한 디자인 적용
- **타입 안전성**: 모든 컴포넌트에 TypeScript 사용
- **파일 구조**: 기능별로 그룹화된 컴포넌트 구조 유지
- **라우팅**: TanStack Router의 파일 기반 라우팅 활용