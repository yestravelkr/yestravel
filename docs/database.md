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

### ⚠️ 중요: Repository 접근 규칙

**잘못된 방법 - 직접 TypeORM 주입 사용 금지:**
```typescript
// ❌ 금지된 패턴
@Module({
  imports: [TypeOrmModule.forFeature([AdminEntity])], // 사용 금지
  // ...
})

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) // 사용 금지
    private readonly userRepository: Repository<User>,
  ) {}
}
```

**올바른 방법 - RepositoryProvider만 사용:**
```typescript
// ✅ 권장 패턴
@Module({
  // imports에 TypeOrmModule.forFeature() 없이
  providers: [UserService],
  // ...
})

@Injectable()
export class UserService {
  constructor(
    private readonly repositoryProvider: RepositoryProvider, // 이것만 사용
  ) {}

  async findById(id: string): Promise<User | null> {
    return this.repositoryProvider.UserRepository.findOne({ where: { id } });
  }

  async create(userData: CreateUserDto): Promise<User> {
    const user = this.repositoryProvider.UserRepository.create(userData);
    return this.repositoryProvider.UserRepository.save(user);
  }

  async update(id: string, updateData: UpdateUserDto): Promise<User> {
    await this.repositoryProvider.UserRepository.update(id, updateData);
    return this.findById(id);
  }

  async delete(id: string): Promise<void> {
    await this.repositoryProvider.UserRepository.delete(id);
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
  constructor(
    private readonly repositoryProvider: RepositoryProvider // RepositoryProvider 사용
  ) {}

  async register(dto: z.infer<typeof registerBrandInputSchema>): Promise<BrandEntity> {
    // RepositoryProvider를 통해 리포지토리 접근
    return this.repositoryProvider.BrandRepository.register(dto);
  }

  async findById(id: number): Promise<BrandEntity | null> {
    // RepositoryProvider를 통해 커스텀 메서드 사용
    return this.repositoryProvider.BrandRepository.findWithRelations(id);
  }
}
```

**RepositoryProvider에서 커스텀 리포지토리 등록:**

```typescript
// repository.provider.ts
@Injectable()
export class RepositoryProvider {
  constructor(private readonly transaction?: TransactionService) {}

  get BrandRepository() {
    return getBrandRepository(this.transaction);
  }
  
  // 다른 리포지토리들도 동일하게 등록
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

## PostgreSQL INHERITS 테이블 상속

### 개요

이 프로젝트는 PostgreSQL의 네이티브 테이블 상속 기능(`INHERITS`)을 사용합니다. TypeORM의 상속 데코레이터(`@TableInheritance`, `@ChildEntity`)는 **사용하지 않습니다**.

### 테이블 계층 구조

```
BaseEntity (id, created_at, updated_at)
  └─ SoftDeleteEntity (deleted_at)
      └─ product_template (type, name, brand_id, ...)
          ├─ hotel_template (base_capacity, max_capacity, ...)
          ├─ delivery_template (use_options, delivery, ...)
          └─ eticket_template (use_options)
```

### Entity 정의 패턴

**부모 Entity (SoftDeleteEntity):**
```typescript
// base.entity.ts
import { DeleteDateColumn } from 'typeorm';
import { Nullish } from '@src/types/utility.type';

export abstract class BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

export abstract class SoftDeleteEntity extends BaseEntity {
  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Nullish<Date>;
}
```

**부모 Entity (ProductTemplateEntity):**
```typescript
@Entity('product_template')
export class ProductTemplateEntity extends SoftDeleteEntity {
  @Column({
    type: 'enum',
    enum: PRODUCT_TYPE_ENUM_VALUE,
  })
  type: ProductTypeEnumType;

  @Column()
  name: string;

  @Column({ name: 'brand_id' })
  brandId: number;
  
  // 공통 필드들...
}
```

**자식 Entity (HotelTemplateEntity):**
```typescript
@Entity('hotel_template')
export class HotelTemplateEntity extends ProductTemplateEntity {
  constructor() {
    super();
    this.type = ProductTypeEnum.HOTEL;
  }

  @Column({ name: 'base_capacity', type: 'integer' })
  baseCapacity: number;

  @Column({ name: 'max_capacity', type: 'integer' })
  maxCapacity: number;
  
  // 호텔 전용 필드들...
}
```

**⚠️ 금지사항:**
```typescript
// ❌ 사용 금지 - TypeORM 상속 데코레이터
@TableInheritance({ column: { type: 'varchar', name: 'type' } })
@ChildEntity(ProductTypeEnum.HOTEL)

// ✅ 올바른 방법 - 데코레이터 없이 일반 상속만
@Entity('hotel_template')
export class HotelTemplateEntity extends ProductTemplateEntity {
```

### Migration 패턴

**부모 테이블 생성:**
```typescript
export class CreateProductTemplateMigration implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Enum 타입 생성
    await queryRunner.query(
      `CREATE TYPE "product_type_enum" AS ENUM('HOTEL', 'E-TICKET', 'DELIVERY')`
    );

    // 2. 부모 테이블 생성
    await queryRunner.query(
      `CREATE TABLE "product_template" (
        "id" SERIAL NOT NULL,
        "type" "product_type_enum" NOT NULL,
        "name" varchar NOT NULL,
        "brand_id" integer NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        CONSTRAINT "PK_product_template" PRIMARY KEY ("id")
      )`
    );

    // 3. 자식 테이블 생성 (INHERITS 사용)
    await queryRunner.query(
      `CREATE TABLE "hotel_template" (
        "base_capacity" integer NOT NULL,
        "max_capacity" integer NOT NULL,
        CONSTRAINT "PK_hotel_template" PRIMARY KEY ("id")
      ) INHERITS ("product_template")`
    );
  }
}
```

**⚠️ 컬럼 추가/삭제 시 중요 규칙:**

PostgreSQL INHERITS를 사용하면 부모 테이블의 컬럼 변경사항이 **자동으로 자식 테이블에 상속**됩니다.

```typescript
// ✅ 올바른 방법 - 부모 테이블에만 추가
export class AddDeletedAtMigration implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // product_template에만 추가하면
    // hotel_template, delivery_template, eticket_template에 자동으로 추가됨
    await queryRunner.query(
      `ALTER TABLE "product_template" ADD "deleted_at" TIMESTAMP`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // product_template에서만 제거하면
    // 자식 테이블에서도 자동으로 제거됨
    await queryRunner.query(
      `ALTER TABLE "product_template" DROP COLUMN "deleted_at"`
    );
  }
}
```

```typescript
// ❌ 잘못된 방법 - 각 테이블에 개별 추가 (불필요하며 에러 발생)
export class WrongMigration implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "product_template" ADD "deleted_at" TIMESTAMP`
    );
    // 아래는 불필요 - 이미 상속됨
    await queryRunner.query(
      `ALTER TABLE "hotel_template" ADD "deleted_at" TIMESTAMP`
    );
    await queryRunner.query(
      `ALTER TABLE "delivery_template" ADD "deleted_at" TIMESTAMP`
    );
  }
}
```

**외래키 제약조건:**
```typescript
// 외래키는 각 테이블에 개별 추가 필요
await queryRunner.query(
  `ALTER TABLE "product_template" ADD CONSTRAINT "FK_product_template_brand"
   FOREIGN KEY ("brand_id") REFERENCES "brand"("id")`
);

await queryRunner.query(
  `ALTER TABLE "hotel_template" ADD CONSTRAINT "FK_hotel_template_brand"
   FOREIGN KEY ("brand_id") REFERENCES "brand"("id")`
);
```

### Service 조회 패턴

**부모 테이블 조회 (공통 필드만):**
```typescript
// ⚠️ QueryBuilder 사용 불가 - TypeORM이 자식 컬럼도 SELECT에 포함
// ✅ Raw Query 사용 필수
async findAll(): Promise<ProductTemplateListResponse> {
  const dataQuery = `
    SELECT
      pt.id,
      pt.type,
      pt.name,
      pt.brand_id,
      pt.created_at,
      pt.updated_at,
      b.name as brand_name
    FROM product_template pt
    LEFT JOIN brand b ON b.id = pt.brand_id AND b.deleted_at IS NULL
    WHERE pt.deleted_at IS NULL
    ORDER BY pt.created_at DESC
  `;

  const result = await this.repositoryProvider.ProductTemplateRepository.query(
    dataQuery
  );

  return result;
}
```

**자식 테이블 조회 (전체 필드):**
```typescript
// ✅ 자식 Repository 사용 - QueryBuilder 가능
async findHotelDetail(id: number): Promise<HotelTemplate> {
  const hotel = await this.repositoryProvider.HotelTemplateRepository
    .createQueryBuilder('hotel')
    .leftJoinAndSelect('hotel.brand', 'brand')
    .where('hotel.id = :id', { id })
    .getOne();

  return hotel;
}
```

### Soft Delete 사용

TypeORM의 `@DeleteDateColumn`을 사용하여 soft delete 구현:

```typescript
// Soft delete 수행
await repository.softRemove(entity);
// 또는
await repository.softDelete(id);

// 삭제된 항목 포함 조회
const withDeleted = await repository.find({ withDeleted: true });

// 삭제된 항목만 조회
const onlyDeleted = await repository
  .createQueryBuilder('entity')
  .where('entity.deleted_at IS NOT NULL')
  .withDeleted()
  .getMany();

// 복원
await repository.restore(id);
```

### 핵심 규칙 요약

**✅ 해야 할 것:**
1. Migration에서 PostgreSQL INHERITS 사용
2. Entity에서 TypeScript extends만 사용 (데코레이터 제거)
3. 부모 테이블 조회 시 Raw Query 사용
4. 자식 테이블 조회 시 해당 Repository 사용
5. 컬럼 추가/삭제는 부모 테이블에만 수행

**❌ 금지사항:**
1. `@TableInheritance` 데코레이터 사용
2. `@ChildEntity` 데코레이터 사용
3. 부모 Repository에서 QueryBuilder로 `find()`, `findAndCount()` 사용
4. 자식 테이블에 개별적으로 컬럼 추가/삭제

**장점:**
- PostgreSQL 네이티브 기능 활용 (성능 우수)
- 각 타입별 독립적인 테이블 관리
- nullable 필드 최소화
- 각 타입별 인덱스 최적화 가능

## 개발 모범 사례

### 1. 항상 마이그레이션 사용

- 프로덕션에서는 절대 `synchronize: true` 사용 금지
- 모든 스키마 변경에 대해 마이그레이션 생성
- 실행 전 생성된 마이그레이션 검토
- **INHERITS 테이블의 경우 부모 테이블에만 컬럼 추가/삭제**

### 2. 엔티티 명명 규칙

- 엔티티 클래스명은 PascalCase 사용
- 데이터베이스 테이블/컬럼명은 snake_case 사용
- 관계에 대해서는 설명적인 이름 사용

### 3. 리포지토리 모범 사례

- 생성자를 통해 리포지토리 주입
- 적절한 에러 처리 사용
- 적절한 페이지네이션 구현
- 다단계 작업에 트랜잭션 사용
- **INHERITS 부모 테이블 조회 시 Raw Query 사용**

### 4. 쿼리 최적화

- JOIN 쿼리에는 항상 relations 사용
- 복잡한 쿼리에는 쿼리 빌더 사용
- 적절한 인덱스 추가
- 쿼리 성능 모니터링
- **INHERITS 자식 테이블에는 각각 인덱스 추가 가능**

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