module.exports = {
  stage: process.env.NODE_ENV,
  name: '여기는 default.js 입니다.',
  envPrefix: '', // production 환경에서는 빈 문자열
  database: {
    yestravel: {
      type: 'postgres',
      host: process.env.POSTGRES_DB_HOST,
      roHost: process.env.POSTGRES_DB_HOST_RO || process.env.POSTGRES_DB_HOST,
      port: 5432,
      username: process.env.POSTGRES_DB_USERNAME,
      password: process.env.POSTGRES_DB_PASSWORD,
      database: process.env.POSTGRES_DB_NAME,
      migrationsRun: true,
      entities: ['dist/src/module/**/*.entity.js'],
      migrations: ['dist/src/database/migration/*.js'],
      ssl: {
        rejectUnauthorized: false
      }
    },
  },
  auth: {
    jwt: {
      backoffice: {
        access: {
          secret: process.env.JWT_BACKOFFICE_ACCESS_SECRET,
          expiresIn: '1h',
        },
        refresh: {
          secret: process.env.JWT_BACKOFFICE_REFRESH_SECRET,
          expiresIn: '30d',
        }
      },
      store: {
        access: {
          secret: process.env.JWT_STORE_ACCESS_SECRET,
          expiresIn: '1h',
        },
        refresh: {
          secret: process.env.JWT_STORE_REFRESH_SECRET,
          expiresIn: '7d',
        }
      },
      influencer: {
        access: {
          secret: process.env.JWT_INFLUENCER_ACCESS_SECRET,
          expiresIn: '1h',
        },
        refresh: {
          secret: process.env.JWT_INFLUENCER_REFRESH_SECRET,
          expiresIn: '7d',
        }
      }
    }
  },
  cors: {
    origin: (origin, callback) => {
      // 허용할 특정 도메인 목록
      const allowedOrigins = [
        'https://admin.yestravel.kr',
        'https://backoffice.yestravel.kr',
        'https://yestravel.kr',
        'https://www.yestravel.kr',
      ];
      
      // *.yestravel.co.kr 및 yestravel.co.kr 패턴 매칭 (서브도메인 optional)
      const productionPattern = /^https:\/\/([a-zA-Z0-9-]+\.)?yestravel\.co\.kr$/;
      
      // origin이 없는 경우 (같은 origin 요청)
      if (!origin) {
        return callback(null, true);
      }
      
      // 허용 목록에 있거나 production 패턴과 일치하는 경우
      if (allowedOrigins.includes(origin) || productionPattern.test(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`Not allowed by CORS ${origin}`));
      }
    },
    credentials: true,
  },
  aws: {
    region: 'ap-northeast-2',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    s3: {
      bucket: 'yestravel-assets',
    },
    cdn: {
      baseUrl: 'https://cdn.yestravel.kr',
    },
  },
  portone: {
    apiSecret: process.env.PORTONE_SECRET,
  },
  kakao: {
    clientId: process.env.KAKAO_CLIENT_ID,
    clientSecret: process.env.KAKAO_CLIENT_SECRET,
  },
  smtnt: {
    userId: process.env.SMTNT_ID,
    senderKey: process.env.SMTNT_PROFILE_KEY,
    callback: process.env.SMTNT_SEND_PHONE,
  },
};
