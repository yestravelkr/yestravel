import { DataSource } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

let testDataSource: DataSource | null = null;

export async function getTestDataSource(): Promise<DataSource> {
  if (testDataSource?.isInitialized) {
    return testDataSource;
  }

  testDataSource = new DataSource({
    type: 'postgres',
    host: '127.0.0.1',
    port: 55432,
    username: 'postgres',
    password: 'postgres',
    database: 'yestravel_test',
    namingStrategy: new SnakeNamingStrategy(),
    synchronize: false,
    logging: false,
    entities: [__dirname + '/../module/**/*.entity.ts'],
  });

  await testDataSource.initialize();
  return testDataSource;
}

export async function destroyTestDataSource(): Promise<void> {
  if (testDataSource?.isInitialized) {
    await testDataSource.destroy();
    testDataSource = null;
  }
}
