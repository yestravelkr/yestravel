module.exports = {
  name: 'test environment',
  envPrefix: 'T',
  database: {
    yestravel: {
      type: 'postgres',
      host: '127.0.0.1',
      roHost: '127.0.0.1',
      port: 55432,
      username: 'postgres',
      password: 'postgres',
      database: 'yestravel_test',
      migrationsRun: false,
      ssl: false,
      logging: false,
    },
  },
  auth: {
    jwt: {
      backoffice: {
        access: { secret: 'TEST_BACKOFFICE_ACCESS_SECRET' },
        refresh: { secret: 'TEST_BACKOFFICE_REFRESH_SECRET' },
      },
      store: {
        access: { secret: 'TEST_STORE_ACCESS_SECRET' },
        refresh: { secret: 'TEST_STORE_REFRESH_SECRET' },
      },
      influencer: {
        access: { secret: 'TEST_INFLUENCER_ACCESS_SECRET' },
        refresh: { secret: 'TEST_INFLUENCER_REFRESH_SECRET' },
      },
    },
  },
  cors: { origin: true },
  portone: { apiSecret: 'TEST_PORTONE_SECRET' },
  kakao: { clientId: 'TEST_KAKAO_ID', clientSecret: 'TEST_KAKAO_SECRET' },
};
