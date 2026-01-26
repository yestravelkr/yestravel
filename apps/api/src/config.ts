import * as dotenv from 'dotenv';
// 순서 중요!! - dotenv.config는 config보다 먼저 호출 되어야 함
dotenv.config();
import config from 'config';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';

type JwtConfigType = {
  secret: string;
  expiresIn: string;
};

type AppJwtConfigType = {
  access: JwtConfigType;
  refresh: JwtConfigType;
};

type CorsConfigType = {
  origin: boolean | string | string[];
  credentials: boolean;
  methods?: string[];
  allowedHeaders?: string[];
};

type AwsConfigType = {
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
  s3: {
    bucket: string;
  };
};

type PortOneConfigType = {
  apiSecret: string;
};

type KakaoConfigType = {
  clientId: string;
  clientSecret: string;
};

type SmtntConfigType = {
  /** API URL의 사용자 ID */
  userId: string;
  /** 카카오 발신 프로필 키 */
  senderKey: string;
  /** 발신번호 */
  callback: string;
};

// eslint-disable-next-line @typescript-eslint/naming-convention
export const ConfigProvider = {
  stage: config.get<string>('stage'),
  database: {
    yestravel: {
      ...config.get<PostgresConnectionOptions & { roHost: string }>(
        'database.yestravel'
      ),
      logger: 'debug',
      logging: true,
      synchronize: false,
    },
  },
  auth: {
    jwt: {
      backoffice: config.get<AppJwtConfigType>('auth.jwt.backoffice'),
      store: config.get<AppJwtConfigType>('auth.jwt.store'),
      influencer: config.get<AppJwtConfigType>('auth.jwt.influencer'),
    },
  },
  cors: config.get<CorsConfigType>('cors'),
  aws: config.has('aws') ? config.get<AwsConfigType>('aws') : undefined,
  portone: config.has('portone')
    ? config.get<PortOneConfigType>('portone')
    : { apiSecret: '' },
  kakao: config.has('kakao')
    ? config.get<KakaoConfigType>('kakao')
    : { clientId: '', clientSecret: '' },
  smtnt: config.has('smtnt') ? config.get<SmtntConfigType>('smtnt') : undefined,
} as const;
