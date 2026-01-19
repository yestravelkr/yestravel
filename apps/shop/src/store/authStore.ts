import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Member - Shop 회원 정보
 */
export interface Member {
  id: number;
  phone: string;
  name: string | null;
}

/**
 * AuthTokens - 인증 토큰
 */
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

type AuthState = {
  member: Member | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoggedIn: boolean;
};

type AuthActions = {
  login: (tokens: AuthTokens, member: Member) => void;
  logout: () => void;
  setMember: (member: Member) => void;
};

type AuthStore = AuthState & AuthActions;

/**
 * useAuthStore - Shop 인증 상태 관리
 *
 * localStorage에 persist되어 새로고침 시에도 로그인 상태 유지
 *
 * Usage:
 * const { member, isLoggedIn, login, logout } = useAuthStore();
 */
export const useAuthStore = create<AuthStore>()(
  persist(
    set => ({
      member: null,
      accessToken: null,
      refreshToken: null,
      isLoggedIn: false,

      login: (tokens, member) => {
        set({
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          member,
          isLoggedIn: true,
        });
      },

      logout: () => {
        set({
          member: null,
          accessToken: null,
          refreshToken: null,
          isLoggedIn: false,
        });
      },

      setMember: (member: Member) => {
        set({ member });
      },
    }),
    {
      name: 'shop-auth-storage',
      partialize: state => ({
        member: state.member,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isLoggedIn: state.isLoggedIn,
      }),
    }
  )
);
