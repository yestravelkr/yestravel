// tRPC 타입 정의
export interface BackofficeAuthRouter {
  register: {
    input: { email: string; password: string };
    output: { message: string };
  };
  login: {
    input: { email: string; password: string };
    output: { accessToken: string };
  };
  test: {
    input: void;
    output: { message: string };
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
  backofficeAuth: BackofficeAuthRouter;
  sample: SampleRouter;
}
