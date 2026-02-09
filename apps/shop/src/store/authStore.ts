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
  /** persist hydration 완료 여부 (localStorage에 저장되지 않음) */
  isHydrated: boolean;
};

type AuthActions = {
  login: (tokens: AuthTokens, member: Member) => void;
  logout: () => void;
  setMember: (member: Member) => void;
  setHydrated: () => void;
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
      isHydrated: false,

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

      setHydrated: () => {
        set({ isHydrated: true });
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
      onRehydrateStorage: () => state => {
        state?.setHydrated();
      },
    }
  )
);

/**
 * waitForHydration - persist hydration이 완료될 때까지 대기
 *
 * hydration 전에 API 호출 시 토큰이 null이 되어
 * 불필요한 401 → 로그아웃이 발생하는 것을 방지
 *
 * Usage:
 * await waitForHydration();
 * const { accessToken } = useAuthStore.getState();
 */
export const waitForHydration = (): Promise<void> => {
  return new Promise(resolve => {
    if (useAuthStore.getState().isHydrated) {
      resolve();
      return;
    }
    const unsub = useAuthStore.subscribe(state => {
      if (state.isHydrated) {
        unsub();
        resolve();
      }
    });
  });
};
