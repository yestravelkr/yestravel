import 'dotenv/config';
import 'tsconfig-paths/register';
import { DataSource } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { seedAdmin } from './admin.seed';
import { ConfigProvider } from '@src/config';

async function runSeeds() {
  // migration과 동일한 방식으로 DataSource 생성
  const dataSource = new DataSource({
    ...ConfigProvider.database.yestravel,
    name: 'seed',
    namingStrategy: new SnakeNamingStrategy(),
    synchronize: false,
    entities: ['src/module/**/*.entity.ts'],
  });

  try {
    console.log('🌱 Starting database seeding...\n');

    // DataSource 초기화
    await dataSource.initialize();
    console.log('✅ Database connection established\n');

    // Admin seed 실행
    console.log('📝 Seeding admin account...');
    await seedAdmin(dataSource);
    console.log('');

    console.log('🎉 All seeds completed successfully!');
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    process.exit(1);
  } finally {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
      console.log('\n✅ Database connection closed');
    }
  }
}

// 스크립트 실행
runSeeds();