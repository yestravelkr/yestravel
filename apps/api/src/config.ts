import * as dotenv from 'dotenv';
// 순서 중요!! - dotenv.config는 config보다 먼저 호출 되어야 함
dotenv.config();
import config from 'config';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';

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
} as const;
