module.exports = {
  name: '여기는 localdev.js 입니다.',
  envPrefix: 'L', // 로컬 환경
  database: {
    yestravel: {
      type: 'postgres',
      host: '127.0.0.1',
      roHost: '127.0.0.1',
      port: 54321,
      username: 'postgres',
      password: 'postgres',
      database: 'yestravel',
      migrationsRun: true,
      ssl: false
    },
  },

  auth: {
    jwt: {
      backoffice: {
        access: {
          secret: 'JWT_BACKOFFICE_ACCESS_SECRET_DEV',
        },
        refresh: {
          secret: 'JWT_BACKOFFICE_REFRESH_SECRET_DEV',
        }
      },
      store: {
        access: {
          secret: 'JWT_STORE_ACCESS_SECRET_DEV',
        },
        refresh: {
          secret: 'JWT_STORE_REFRESH_SECRET_DEV',
        }
      },
      influencer: {
        access: {
          secret: 'JWT_INFLUENCER_ACCESS_SECRET_DEV',
        },
        refresh: {
          secret: 'JWT_INFLUENCER_REFRESH_SECRET_DEV',
        }
      }
    }
  },
  cors: {
    origin: true,
  }
};
