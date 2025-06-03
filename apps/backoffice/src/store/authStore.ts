import { persist } from 'zustand/middleware';
import { create } from 'zustand/react';

export enum Role {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  GUEST = 'GUEST',
}

type User = {
  id: string;
  email: string;
  role: Role;
  // 유저의 정보 저장
};

type AuthState = {
  user: User | null;
  role: Role;
  isLogin: boolean;
};

type AuthActions = {
  login: (user: User) => void;
  logout: () => void;
};

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      isLogin: false,
      role: Role.GUEST,
      user: null,
      login: (user) => {
        set({ user, isLogin: true, role: user.role });
      },
      logout: () =>
        set({
          user: null,
          isLogin: false,
          role: Role.GUEST,
        }),
    }),
    {
      name: 'auth-storage',
    },
  ),
);
