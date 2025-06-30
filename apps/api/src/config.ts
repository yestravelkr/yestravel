import * as dotenv from 'dotenv';
// 순서 중요!! - dotenv.config는 config보다 먼저 호출 되어야 함
dotenv.config();
import config from 'config';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';

type JwtConfigType = {
  secret: string;
  expiresIn: string;
}

type CorsConfigType = {
  origin: boolean | string | string[];
  credentials: boolean;
  methods?: string[];
  allowedHeaders?: string[];
}

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
      access: config.get<JwtConfigType>('auth.jwt.access'),
      refresh: config.get<JwtConfigType>('auth.jwt.refresh')
    }
  },
  cors: config.get<CorsConfigType>('cors')
} as const;
