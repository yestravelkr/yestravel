import { ConfigProvider } from '@src/config';
import { DataSource, EntityManager } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';
import { TransactionService } from '@src/module/shared/transaction/transaction.service';

export class DataSources {
  private static yestravelInstance: DataSource;

  static get yestravel(): DataSource {
    if (!this.yestravelInstance) {
      const connectionOptions: PostgresConnectionOptions = {
        ...ConfigProvider.database.yestravel,
      };
      const readOnlyConnectionOptions: PostgresConnectionOptions = {
        ...connectionOptions,
        host: ConfigProvider.database.yestravel.roHost,
      };

      this.yestravelInstance = new DataSource({
        ...connectionOptions,
        replication: {
          master: connectionOptions,
          slaves: [readOnlyConnectionOptions],
        },
        name: 'yestravel',
        namingStrategy: new SnakeNamingStrategy(),
        synchronize: false,
      });
    }
    return this.yestravelInstance;
  }
}

export function getEntityManager(
  source?: EntityManager | TransactionService | DataSource
): EntityManager | DataSource {
  if (source instanceof TransactionService) {
    return source.getTransaction() ?? DataSources.yestravel;
  }
  return source ?? DataSources.yestravel;
}
