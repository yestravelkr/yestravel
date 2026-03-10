import { create } from 'zustand';

export enum Role {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  GUEST = 'GUEST',
}

type User = {
  id: string;
  email: string;
  role: Role;
};

export function parseUserFromToken(token: string): User {
  const payload = JSON.parse(atob(token.split('.')[1]));
  return {
    id: String(payload.id),
    email: payload.email,
    role: Role.ADMIN,
  };
}

type AuthState = {
  user: User | null;
  role: Role;
  isLogin: boolean;
  accessToken: string | null;
};

type AuthActions = {
  login: (user: User, accessToken: string) => void;
  logout: () => void;
  setAccessToken: (token: string) => void;
  refreshToken: () => Promise<boolean>;
};

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>((set, get) => ({
  isLogin: false,
  role: Role.GUEST,
  user: null,
  accessToken: null,

  login: (user, accessToken) => {
    set({
      user,
      isLogin: true,
      role: user.role,
      accessToken,
    });
  },

  logout: () =>
    set({
      user: null,
      isLogin: false,
      role: Role.GUEST,
      accessToken: null,
    }),

  setAccessToken: (token: string) => {
    set({ accessToken: token });
  },

  refreshToken: async () => {
    try {
      const API_BASEURL =
        import.meta.env.VITE_API_BASEURL || 'http://localhost:3000';
      const response = await fetch(
        `${API_BASEURL}/trpc/backofficeAuth.refresh`,
        {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({}),
        },
      );

      if (!response.ok) {
        throw new Error('Token refresh failed');
      }

      const data = await response.json();
      const newAccessToken = data.result?.data?.accessToken;

      if (newAccessToken) {
        const user = parseUserFromToken(newAccessToken);
        set({
          accessToken: newAccessToken,
          user,
          isLogin: true,
          role: user.role,
        });
        return true;
      }

      return false;
    } catch (error) {
      console.error('Token refresh error:', error);
      // Refresh 실패 시 로그아웃
      set({
        user: null,
        isLogin: false,
        role: Role.GUEST,
        accessToken: null,
      });
      return false;
    }
  },
}));
