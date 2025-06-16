module.exports = {
  name: '여기는 localdev.js 입니다.',
  database: {
    yestravel: {
      type: 'postgres',
      host: '127.0.0.1',
      roHost: '127.0.0.1',
      port: 54321,
      username: 'postgres',
      password: 'postgres',
      database: 'yestravel',
      migrationsRun: false
    },
  },

  auth: {
    jwt: {
      access: {
        secret: 'JWT_ACCEESS_SECRET',
      },
      refresh: {
        secret: 'JWT_REFRESH_SECRET',
      }
    }
  }
};
