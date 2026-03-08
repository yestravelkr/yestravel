import { create } from 'zustand';

export enum Role {
  PARTNER_SUPER = 'PARTNER_SUPER',
  PARTNER_STAFF = 'PARTNER_STAFF',
}

export enum PartnerType {
  BRAND = 'BRAND',
  INFLUENCER = 'INFLUENCER',
}

type User = {
  id: number;
  email: string;
  role: string;
  partnerId: number;
};

type AuthState = {
  user: User | null;
  isLogin: boolean;
  accessToken: string | null;
  partnerType: PartnerType | null;
};

type AuthActions = {
  login: (accessToken: string) => void;
  setUser: (user: User, partnerType: PartnerType) => void;
  logout: () => void;
  setAccessToken: (token: string) => void;
  setPartnerType: (partnerType: PartnerType) => void;
  refreshToken: () => Promise<boolean>;
};

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>((set, _get) => ({
  isLogin: false,
  user: null,
  accessToken: null,
  partnerType: null,

  login: (accessToken) => {
    set({
      isLogin: true,
      accessToken,
    });
  },

  setUser: (user, partnerType) => {
    set({
      user,
      partnerType,
    });
  },

  logout: () =>
    set({
      user: null,
      isLogin: false,
      accessToken: null,
      partnerType: null,
    }),

  setAccessToken: (token: string) => {
    set({ accessToken: token });
  },

  setPartnerType: (partnerType: PartnerType) => {
    set({ partnerType });
  },

  refreshToken: () => {
    const API_BASEURL =
      import.meta.env.VITE_API_BASEURL || 'http://localhost:3000';

    return fetch(`${API_BASEURL}/trpc/partnerAuth.refresh`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Token refresh failed');
        }
        return response.json();
      })
      .then((data) => {
        const newAccessToken = data.result?.data?.accessToken;

        if (newAccessToken) {
          set({ accessToken: newAccessToken });
          return true;
        }

        return false;
      })
      .catch((error) => {
        console.error('Token refresh error:', error);
        set({
          user: null,
          isLogin: false,
          accessToken: null,
          partnerType: null,
        });
        return false;
      });
  },
}));
