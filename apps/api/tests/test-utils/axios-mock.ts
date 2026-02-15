import axios from 'axios';

export function setupPortoneMocks() {
  const postSpy = jest.spyOn(axios, 'post');
  const getSpy = jest.spyOn(axios, 'get');

  postSpy.mockImplementation(async (url: string, data?: any, config?: any) => {
    if (url.includes('/login/api-secret')) {
      return {
        data: {
          accessToken: 'test-access-token',
          refreshToken: 'test-refresh-token',
        },
      };
    }
    if (url.includes('/confirm')) {
      return { data: { status: 'PAID' } };
    }
    if (url.includes('/cancel')) {
      return { data: { cancellationId: 'test-cancel-id' } };
    }
    throw new Error(`예상치 못한 POST 요청: ${url}`);
  });

  getSpy.mockImplementation(async (url: string, config?: any) => {
    if (url.includes('/payments/')) {
      return {
        data: {
          status: 'PAID',
          method: { type: 'CARD', card: { name: 'Test Card' } },
          amount: { total: 100000 },
        },
      };
    }
    throw new Error(`예상치 못한 GET 요청: ${url}`);
  });

  return { postSpy, getSpy };
}

export function clearPortoneMocks() {
  jest.restoreAllMocks();
}
