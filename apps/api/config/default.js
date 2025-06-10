module.exports = {
  stage: process.env.NODE_ENV,
  name: '여기는 default.js 입니다.',
  database: {
    yestravel: {
      type: 'postgres',
      host: process.env.POSTGRES_DB_HOST,
      roHost: process.env.POSTGRES_DB_HOST_RO || process.env.POSTGRES_DB_HOST,
      port: 5432,
      username: process.env.POSTGRES_DB_USERNAME,
      password: process.env.POSTGRES_DB_PASSWORD,
      database: process.env.POSTGRES_DB_NAME,
      migrationsRun: false,
      entities: ['dist/src/module/**/*.entity.js'],
      migrations: ['dist/src/database/migration/*.js'],
    },
  },
  auth: {
    jwt: {
      access: {
        secret: process.env.JWT_ACCEESS_SECRET,
        expiresIn: '1h',
      },
      refresh: {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: '30d',
      }
    }
  }
};
