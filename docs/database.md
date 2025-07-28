# 데이터베이스 가이드

이 가이드는 YesTravel 프로젝트의 데이터베이스 설정, 마이그레이션 및 모범 사례를 다룹니다.

## 데이터베이스 스택

- **데이터베이스**: PostgreSQL
- **ORM**: TypeORM
- **마이그레이션 시스템**: TypeORM 마이그레이션
- **환경**: Docker 기반 개발 설정

## 빠른 설정

### 1. 데이터베이스 시작

```bash
# 저장소 루트 또는 docker/ 디렉토리에서
cd docker
./startDocker.sh

# 또는 docker-compose 직접 사용
docker-compose up -d
```

### 2. 환경 생성

```bash
cd apps/api
yarn generateEnv  # 데이터베이스 연결 설정으로 .env 생성
```

### 3. 마이그레이션 실행

```bash
cd apps/api
yarn migration:run
```

## 데이터베이스 설정

### 연결 설정

데이터베이스 설정은 `apps/api/src/database/datasources.ts`에 위치합니다:

```typescript
export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_DATABASE || 'yestravel',
  synchronize: false, // 프로덕션에서는 항상 마이그레이션 사용
  logging: process.env.NODE_ENV === 'development',
  entities: ['src/**/*.entity.{ts,js}'],
  migrations: ['src/database/migration/*.{ts,js}'],
});
```

### 환경 변수

`generateEnv.ts`에 의해 자동 생성됩니다:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=password
DB_DATABASE=yestravel
```

## 마이그레이션 관리

### 마이그레이션 생성

**빈 마이그레이션 (사용자 정의 변경사항용):**
```bash
yarn migration:create CreateUserTable
```

**자동 생성 마이그레이션 (엔티티 변경사항으로부터):**
```bash
yarn migration:generate UpdateUserEntity
```

### 마이그레이션 실행

```bash
# 모든 대기중인 마이그레이션 실행
yarn migration:run

# 마지막 마이그레이션 되돌리기
yarn migration:revert
```

### 마이그레이션 파일 구조

마이그레이션은 `apps/api/src/database/migration/`에 위치합니다:

```typescript
import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateUserTable1749394858938 implements MigrationInterface {
  name = 'CreateUserTable1749394858938';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'users',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'email',
            type: 'varchar',
            isUnique: true,
          },
          {
            name: 'name',
            type: 'varchar',
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'now()',
          },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('users');
  }
}
```

## 엔티티 정의

### 기본 엔티티 구조

```typescript
import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  CreateDateColumn, 
  UpdateDateColumn 
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  name: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

### 고급 엔티티 기능

**관계:**
```typescript
@Entity('posts')
export class Post {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @ManyToOne(() => User, user => user.posts)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id' })
  userId: string;
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToMany(() => Post, post => post.user)
  posts: Post[];
}
```

**인덱스 및 제약 조건:**
```typescript
@Entity('users')
@Index(['email', 'status']) // 복합 인덱스
export class User {
  @Column({ unique: true })
  @Index() // 단일 컬럼 인덱스
  email: string;

  @Column({ 
    type: 'enum', 
    enum: ['active', 'inactive'],
    default: 'active'
  })
  status: string;
}
```

**JSON 컬럼:**
```typescript
@Entity('user_preferences')
export class UserPreferences {
  @Column({ type: 'jsonb' })
  settings: {
    theme: 'light' | 'dark';
    notifications: boolean;
    language: string;
  };
}
```

## 리포지토리 패턴

### 기본 리포지토리 사용법

```typescript
@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findById(id: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { id } });
  }

  async create(userData: CreateUserDto): Promise<User> {
    const user = this.userRepository.create(userData);
    return this.userRepository.save(user);
  }

  async update(id: string, updateData: UpdateUserDto): Promise<User> {
    await this.userRepository.update(id, updateData);
    return this.findById(id);
  }

  async delete(id: string): Promise<void> {
    await this.userRepository.delete(id);
  }
}
```

### 커스텀 리포지토리 패턴 (권장)

트랜잭션 지원과 도메인별 메서드를 위한 확장 리포지토리:

```typescript
// brand.entity.ts
import { Entity, EntityManager } from 'typeorm';
import { TransactionService } from '@src/module/shared/transaction/transaction.service';
import { getEntityManager } from '@src/database/datasources';
import { z } from 'zod';
import { registerBrandInputSchema } from './brand.schema';

@Entity('brand')
export class BrandEntity extends PartnerEntity {
  // 엔티티 필드들...
}

// 커스텀 리포지토리 확장
export const getBrandRepository = (
  source?: TransactionService | EntityManager  // 트랜잭션 지원
) => getEntityManager(source).getRepository(BrandEntity).extend({
  
  // 도메인별 생성 메서드
  async register(dto: z.infer<typeof registerBrandInputSchema>): Promise<BrandEntity> {
    const brand = new BrandEntity();
    brand.name = dto.name;
    brand.email = dto.email;
    brand.phoneNumber = dto.phoneNumber;
    
    if (dto.businessInfo) {
      brand.businessInfo = dto.businessInfo as any;
    }
    
    if (dto.bankInfo) {
      brand.bankInfo = dto.bankInfo as any;
    }
    
    return this.save(brand);
  },
  
  // 도메인별 조회 메서드
  async findWithRelations(id: number): Promise<BrandEntity | null> {
    return this.findOne({
      where: { id },
      relations: ['businessInfo', 'bankInfo', 'brandManagers'],
    });
  },
});
```

**서비스에서 사용:**

```typescript
@Injectable()
export class BrandService {
  constructor(private readonly transactionService: TransactionService) {}

  async register(dto: z.infer<typeof registerBrandInputSchema>): Promise<BrandEntity> {
    // 트랜잭션 컨텍스트와 함께 커스텀 리포지토리 사용
    const brandRepository = getBrandRepository(this.transactionService);
    return brandRepository.register(dto);
  }

  async findById(id: number): Promise<BrandEntity | null> {
    // 일반 컨텍스트에서 커스텀 리포지토리 사용
    const brandRepository = getBrandRepository();
    return brandRepository.findWithRelations(id);
  }
}
```

**패턴의 장점:**
- **트랜잭션 지원**: `TransactionService`를 통한 자동 트랜잭션 관리
- **도메인별 메서드**: 비즈니스 로직에 특화된 리포지토리 메서드
- **타입 안전성**: Zod 스키마와 통합된 타입 안전성
- **재사용성**: 다양한 서비스에서 공통 리포지토리 로직 재사용

### 쿼리 빌더

```typescript
async findUsersWithPosts(): Promise<User[]> {
  return this.userRepository
    .createQueryBuilder('user')
    .leftJoinAndSelect('user.posts', 'post')
    .where('user.status = :status', { status: 'active' })
    .orderBy('user.createdAt', 'DESC')
    .getMany();
}

async getUserStatistics(): Promise<any> {
  return this.userRepository
    .createQueryBuilder('user')
    .select('COUNT(*)', 'total')
    .addSelect('AVG(EXTRACT(epoch FROM (NOW() - user.created_at)))', 'avg_age_seconds')
    .getRawOne();
}
```

### 페이지네이션

```typescript
async findPaginated(page: number, limit: number): Promise<{
  items: User[];
  total: number;
  page: number;
  totalPages: number;
}> {
  const [items, total] = await this.userRepository.findAndCount({
    skip: (page - 1) * limit,
    take: limit,
    order: { createdAt: 'DESC' },
  });

  return {
    items,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}
```

## 트랜잭션 관리

### @Transactional 데코레이터 사용

```typescript
import { Transactional } from 'typeorm-transactional';

@Injectable()
export class UserService {
  @Transactional()
  async createUserWithProfile(userData: CreateUserDto, profileData: CreateProfileDto): Promise<User> {
    // 두 작업 모두 트랜잭션으로 래핑됨
    const user = await this.userRepository.save(userData);
    const profile = await this.profileRepository.save({
      ...profileData,
      userId: user.id,
    });
    
    // 어느 작업이든 실패하면 둘 다 롤백됨
    return user;
  }
}
```

### 수동 트랜잭션 관리

```typescript
async manualTransaction(): Promise<void> {
  const queryRunner = this.dataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    await queryRunner.manager.save(user);
    await queryRunner.manager.save(profile);
    await queryRunner.commitTransaction();
  } catch (err) {
    await queryRunner.rollbackTransaction();
    throw err;
  } finally {
    await queryRunner.release();
  }
}
```

## 데이터베이스 시딩

### 시드 데이터 생성

```typescript
// scripts/seed.ts
import { AppDataSource } from '../src/database/datasources';
import { User } from '../src/entities/user.entity';

async function seed() {
  await AppDataSource.initialize();

  const userRepository = AppDataSource.getRepository(User);

  const adminUser = userRepository.create({
    email: 'admin@example.com',
    name: '관리자',
    role: 'admin',
  });

  await userRepository.save(adminUser);

  console.log('시딩 완료');
  await AppDataSource.destroy();
}

seed().catch(console.error);
```

### 시드 실행

```bash
# package.json에 추가
"scripts": {
  "seed": "ts-node scripts/seed.ts"
}

# 시딩 실행
yarn seed
```

## 성능 최적화

### 쿼리 최적화

```typescript
// 나쁜 예: N+1 쿼리 문제
async getBadPosts(): Promise<Post[]> {
  const posts = await this.postRepository.find();
  // 각 post.user 접근 시 별도 쿼리 발생
  return posts;
}

// 좋은 예: 관계 또는 쿼리 빌더 사용
async getGoodPosts(): Promise<Post[]> {
  return this.postRepository.find({
    relations: ['user'], // JOIN을 사용한 단일 쿼리
  });
}
```

### 인덱싱 전략

```typescript
@Entity('users')
@Index('idx_user_email_status', ['email', 'status']) // 공통 쿼리를 위한 복합 인덱스
@Index('idx_user_created_at', ['createdAt']) // 날짜별 정렬/필터링용
export class User {
  @Column({ unique: true })
  email: string;

  @Column()
  status: string;

  @CreateDateColumn()
  createdAt: Date;
}
```

### 연결 풀링

```typescript
// datasources.ts
export const AppDataSource = new DataSource({
  // ... 다른 설정
  extra: {
    max: 20, // 풀의 최대 연결 수
    min: 5,  // 풀의 최소 연결 수
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  },
});
```

## 백업 및 복구

### 데이터베이스 백업

```bash
# 백업 생성
docker exec -t postgres_container pg_dump -U postgres yestravel > backup.sql

# 백업 복원
docker exec -i postgres_container psql -U postgres yestravel < backup.sql
```

### 스키마 백업

```bash
# 스키마만 내보내기
docker exec -t postgres_container pg_dump -U postgres --schema-only yestravel > schema.sql
```

## 개발 모범 사례

### 1. 항상 마이그레이션 사용

- 프로덕션에서는 절대 `synchronize: true` 사용 금지
- 모든 스키마 변경에 대해 마이그레이션 생성
- 실행 전 생성된 마이그레이션 검토

### 2. 엔티티 명명 규칙

- 엔티티 클래스명은 PascalCase 사용
- 데이터베이스 테이블/컬럼명은 snake_case 사용
- 관계에 대해서는 설명적인 이름 사용

### 3. 리포지토리 모범 사례

- 생성자를 통해 리포지토리 주입
- 적절한 에러 처리 사용
- 적절한 페이지네이션 구현
- 다단계 작업에 트랜잭션 사용

### 4. 쿼리 최적화

- JOIN 쿼리에는 항상 relations 사용
- 복잡한 쿼리에는 쿼리 빌더 사용
- 적절한 인덱스 추가
- 쿼리 성능 모니터링

### 5. 데이터 검증

```typescript
@Entity('users')
export class User {
  @Column({ length: 255 })
  @IsEmail()
  email: string;

  @Column({ length: 100 })
  @IsNotEmpty()
  @Length(2, 100)
  name: string;
}
```

## 문제 해결

### 일반적인 문제

**연결 문제:**
```bash
# PostgreSQL이 실행 중인지 확인
docker ps | grep postgres

# 로그 확인
docker logs postgres_container
```

**마이그레이션 문제:**
```bash
# 마이그레이션 상태 확인
yarn migration:show

# 마이그레이션 재설정 (개발 전용)
yarn migration:revert # 필요시 여러 번 실행
```

**중복 생성 오류 해결:**
마이그레이션 실행 시 "이미 존재합니다" 오류가 발생하는 경우:

```bash
# 오류 예시: CREATE TYPE "public"."admin_role_enum" 에서 중복 오류 발생
```

**해결 방법:**
1. **마이그레이션 파일 검토**: 중복 생성 확인
   ```typescript
   // 잘못된 예: 이미 존재하는 테이블/타입 재생성
   await queryRunner.query(`CREATE TYPE "public"."admin_role_enum" AS ENUM('admin', 'super_admin')`);
   await queryRunner.query(`CREATE TABLE "admin" (...)`);
   
   // 수정: 중복 생성 제거 또는 IF NOT EXISTS 사용
   await queryRunner.query(`CREATE TYPE IF NOT EXISTS "public"."admin_role_enum" AS ENUM('admin', 'super_admin')`);
   ```

2. **마이그레이션 순서 확인**: 이전 마이그레이션에서 이미 생성된 항목 확인
3. **개발 환경 재설정** (필요시):
   ```bash
   # 주의: 모든 데이터가 삭제됩니다
   docker-compose down -v
   docker-compose up -d
   yarn migration:run
   ```

**성능 문제:**
```sql
-- 쿼리 로깅 활성화
SET log_statement = 'all';

-- 느린 쿼리 분석
EXPLAIN ANALYZE SELECT * FROM users WHERE email = 'test@example.com';
```

## Docker 데이터베이스 관리

### PostgreSQL 접근

```bash
# 데이터베이스에 연결
docker exec -it postgres_container psql -U postgres -d yestravel

# SQL 명령어 실행
\dt          # 테이블 목록
\d users     # users 테이블 설명
\q           # 종료
```

### 데이터베이스 재설정

```bash
# 컨테이너 중지
docker-compose down

# 볼륨 제거 (파괴적)
docker-compose down -v

# 재시작
docker-compose up -d
```

Claude Code 사용자를 위해: 데이터베이스 상태를 변경하기 전에 항상 현재 상태를 확인하고, 프로덕션에 적용하기 전에 마이그레이션을 적절히 테스트하세요.