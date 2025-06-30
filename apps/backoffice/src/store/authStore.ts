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
  // 유저의 정보 저장
};

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
};

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>((set) => ({
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
}));
