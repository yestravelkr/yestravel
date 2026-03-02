// tRPC 타입 정의
export interface PartnerAuthRouter {
  register: {
    input: { email: string; password: string };
    output: { message: string };
  };
  login: {
    input: { email: string; password: string };
    output: { accessToken: string };
  };
}

export interface SampleRouter {
  getHello: {
    input: { name?: string };
    output: string;
  };
  getSample: {
    input: void;
    output: string;
  };
}

export interface AppRouter {
  partnerAuth: PartnerAuthRouter;
  sample: SampleRouter;
}
