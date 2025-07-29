# 새 기능 추가하기

이 가이드는 YesTravel 코드베이스에서 새로운 기능을 구현하는 단계별 지침을 제공합니다.

## 빠른 시작 체크리스트

Claude Code 사용자를 위해 새 기능 추가 시 다음 체크리스트를 따르세요:

1. ✅ **모듈 디렉토리 구조 생성** (schema 파일 포함)
2. ✅ **Zod 스키마 정의** (`module.schema.ts`)
3. ✅ **tRPC 라우터 구현** (스키마 기반 검증)
4. ✅ **NestJS 컨트롤러 구현** (응답 포맷팅 포함)
5. ✅ **서비스 및 비즈니스 로직 구현**
6. ✅ **NestJS 모듈 설정** (적절한 모듈 그룹화)
7. ✅ **인증/권한 부여 추가** (필요시)
8. ✅ **데이터베이스 엔티티 및 마이그레이션 추가** (필요시)
9. ✅ **테스트 작성**
10. ✅ **문서 업데이트**

## 단계별 구현

### 1단계: 모듈 구조 생성

`apps/api/src/module/` 하위에 다음 구조로 새 디렉토리를 생성하세요:

```
apps/api/src/module/backoffice/brand/
├── brand.schema.ts          # Zod 스키마 및 타입 정의 (새로운!)
├── brand.router.ts          # tRPC 엔드포인트
├── brand.controller.ts      # 메시지 패턴 핸들러
├── brand.service.ts         # 비즈니스 로직
├── brand.module.ts          # NestJS 모듈 설정
└── brand.middleware.ts      # 인증/권한 부여 (선택사항)
```

**중요한 변경사항:**
- **`module.schema.ts` 파일이 추가**되어 모든 입력/출력 스키마를 중앙 관리
- 모듈들은 도메인별로 그룹화 (예: `backoffice/`, `shop/`)

## 실제 구현 예시: 브랜드 관리 모듈

백오피스 브랜드 관리 기능을 구현한 실제 예시를 통해 현재 패턴을 학습해보세요:

### 2단계: 스키마 정의 (`brand.schema.ts`)

**모든 입력/출력 스키마를 중앙에서 관리:**

```typescript
import { z } from 'zod';
import { BusinessType } from '@src/module/backoffice/domain/social-media-platform.enum';

// 중첩 객체용 기본 스키마
export const businessInfoSchema = z.object({
  type: z.nativeEnum(BusinessType).optional().nullable(),
  name: z.string().optional().nullable(),
  licenseNumber: z.string().optional().nullable(),
  ceoName: z.string().optional().nullable(),
});

export const bankInfoSchema = z.object({
  name: z.string().optional().nullable(),
  accountNumber: z.string().optional().nullable(),
  accountHolder: z.string().optional().nullable(),
});

// 메인 브랜드 스키마
export const brandSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().email().optional().nullable(),
  phoneNumber: z.string().optional().nullable(),
  businessInfo: businessInfoSchema.optional().nullable(),
  bankInfo: bankInfoSchema.optional().nullable(),
  createdAt: z.date(),
});

// 입력 스키마
export const registerBrandInputSchema = z.object({
  name: z.string().min(1, 'Brand name is required'),
  email: z.string().email().optional(),
  phoneNumber: z.string().optional(),
  businessInfo: businessInfoSchema.optional(),
  bankInfo: bankInfoSchema.optional(),
});

export const findBrandByIdInputSchema = z.object({
  id: z.number(),
});

// 타입은 사용하는 곳에서 z.infer로 추론 - export type 정의하지 않음!
```

### 3단계: tRPC 라우터 구현 (`brand.router.ts`)

**스키마 기반 검증과 인증을 포함한 실제 라우터:**

```typescript
import {Router, Query, UseMiddlewares, Mutation, Input} from 'nestjs-trpc';
import { BackofficeAuthMiddleware } from '@src/module/backoffice/auth/backoffice.auth.middleware';
import { BackofficeAuthorizedContext } from '@src/module/backoffice/auth/backoffice.auth.middleware';
import { Ctx } from 'nestjs-trpc';
import { BaseTrpcRouter } from '@src/module/trpc/baseTrpcRouter';
import { z } from 'zod';
import { 
  registerBrandInputSchema,
  findBrandByIdInputSchema,
  brandSchema
} from '@src/module/backoffice/brand/brand.schema';

@Router({ alias: 'backofficeBrand' })  // 도메인 prefix 사용
export class BrandRouter extends BaseTrpcRouter {
  @UseMiddlewares(BackofficeAuthMiddleware)  // 인증 필수
  @Mutation({
    input: registerBrandInputSchema,
    output: brandSchema,
  })
  async register(
    @Ctx() ctx: BackofficeAuthorizedContext,
    @Input() input: z.infer<typeof registerBrandInputSchema>  // z.infer 사용
  ) {
    const output = await this.microserviceClient.send('backoffice.brand.register', input);
    return brandSchema.parse(output); // 응답 검증
  }
  
  @UseMiddlewares(BackofficeAuthMiddleware)
  @Query({
    output: z.array(brandSchema),  // 배열 응답
  })
  async findAll(@Ctx() ctx: BackofficeAuthorizedContext) {
    const output = await this.microserviceClient.send('backoffice.brand.findAll', {});
    return z.array(brandSchema).parse(output);
  }
  
  @UseMiddlewares(BackofficeAuthMiddleware)
  @Query({
    input: findBrandByIdInputSchema,
    output: brandSchema.nullable(),  // nullable 응답
  })
  async findById(
    @Ctx() ctx: BackofficeAuthorizedContext,
    @Input() input: z.infer<typeof findBrandByIdInputSchema>
  ) {
    const output = await this.microserviceClient.send('backoffice.brand.findById', input);
    return brandSchema.nullable().parse(output);
  }
}
```

### 4단계: NestJS 컨트롤러 구현 (`brand.controller.ts`)

**응답 포맷팅과 트랜잭션을 포함한 실제 컨트롤러:**

```typescript
import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { BrandService } from '@src/module/backoffice/brand/brand.service';
import { TransactionService } from '@src/module/shared/transaction/transaction.service';
import { Transactional } from '@src/module/shared/transaction/transaction.decorator';
import { BrandEntity } from '@src/module/backoffice/domain/brand.entity';
import { z } from 'zod';
import { 
  registerBrandInputSchema,
  findBrandByIdInputSchema,
  brandSchema
} from '@src/module/backoffice/brand/brand.schema';

@Controller()
export class BrandController {
  constructor(
    private readonly brandService: BrandService,
    private readonly transactionService: TransactionService
  ) {}

  // TypeORM 메타데이터 제거를 위한 응답 포맷팅 - 중요!
  private formatBrandResponse(brand: BrandEntity): z.infer<typeof brandSchema> {
    return {
      id: brand.id,
      name: brand.name,
      email: brand.email,
      phoneNumber: brand.phoneNumber,
      businessInfo: brand.businessInfo ? {
        type: brand.businessInfo.type,
        name: brand.businessInfo.name,
        licenseNumber: brand.businessInfo.licenseNumber,
        ceoName: brand.businessInfo.ceoName
      } : null,
      bankInfo: brand.bankInfo ? {
        name: brand.bankInfo.name,
        accountNumber: brand.bankInfo.accountNumber,
        accountHolder: brand.bankInfo.accountHolder
      } : null,
      createdAt: brand.createdAt,
    };
  }

  @MessagePattern('backoffice.brand.register')
  @Transactional  // 데이터베이스 트랜잭션
  async register(data: z.infer<typeof registerBrandInputSchema>): Promise<z.infer<typeof brandSchema>> {
    const brand = await this.brandService.register(data);
    return this.formatBrandResponse(brand);
  }
  
  @MessagePattern('backoffice.brand.findAll')
  async findAll(): Promise<Array<z.infer<typeof brandSchema>>> {
    const brands = await this.brandService.findAll();
    return brands.map(brand => this.formatBrandResponse(brand));
  }
  
  @MessagePattern('backoffice.brand.findById')
  async findById(data: z.infer<typeof findBrandByIdInputSchema>): Promise<z.infer<typeof brandSchema> | null> {
    const brand = await this.brandService.findById(data.id);
    
    if (!brand) {
      return null;
    }
    
    return this.formatBrandResponse(brand);
  }
}
```

### 5단계: 서비스 계층 구현 (`brand.service.ts`)

**HttpException을 사용한 적절한 에러 처리:**

```typescript
import { Injectable, NotFoundException } from '@nestjs/common';
import { TransactionService } from '@src/module/shared/transaction/transaction.service';
import { BrandEntity, getBrandRepository } from '@src/module/backoffice/domain/brand.entity';
import { z } from 'zod';
import { registerBrandInputSchema } from '@src/module/backoffice/brand/brand.schema';

@Injectable()
export class BrandService {
  constructor(private readonly transactionService: TransactionService) {}

  async register(dto: z.infer<typeof registerBrandInputSchema>): Promise<BrandEntity> {
    const brandRepository = getBrandRepository(this.transactionService);
    return brandRepository.register(dto);
  }

  async findAll(): Promise<BrandEntity[]> {
    const brandRepository = getBrandRepository();
    return brandRepository.find({
      relations: ['businessInfo', 'bankInfo'],
    });
  }

  async findById(id: number): Promise<BrandEntity | null> {
    const brandRepository = getBrandRepository();
    const brand = await brandRepository.findOne({
      where: { id },
      relations: ['businessInfo', 'bankInfo'],
    });
    
    // null 반환 - 컨트롤러에서 처리
    return brand;
  }
}
```

**Repository 패턴 (`brand.entity.ts`):**

```typescript
import { Entity, EntityManager } from 'typeorm';
import { PartnerEntity } from '@src/module/backoffice/domain/partner-entity.abstract';
import { TransactionService } from '@src/module/shared/transaction/transaction.service';
import { getEntityManager } from '@src/database/datasources';
import { z } from 'zod';
import { registerBrandInputSchema } from "@src/module/backoffice/brand/brand.schema";

@Entity('brand')
export class BrandEntity extends PartnerEntity {
  // 엔티티 필드들...
}

// 커스텀 Repository 확장
export const getBrandRepository = (
  source?: TransactionService | EntityManager
) => getEntityManager(source).getRepository(BrandEntity).extend({
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
});
```

### 6단계: NestJS 모듈 설정 및 조직화

**개별 모듈 (`brand.module.ts`):**

```typescript
import { Module } from '@nestjs/common';
import { BrandController } from '@src/module/backoffice/brand/brand.controller';
import { BrandService } from '@src/module/backoffice/brand/brand.service';

@Module({
  controllers: [BrandController],
  providers: [BrandService],
  exports: [BrandService],
})
export class BrandModule {}
```

**계층적 모듈 조직 (`backoffice.module.ts`):**

```typescript
import { Module } from '@nestjs/common';
import { AuthModule } from '@src/module/backoffice/auth/auth.module';
import { BrandModule } from '@src/module/backoffice/brand/brand.module';

@Module({
  imports: [
    AuthModule,
    BrandModule,
    // 기타 백오피스 모듈들
  ],
})
export class BackofficeModule {}
```

**최상위 모듈 (`app.module.ts`):**

```typescript
import { Module } from '@nestjs/common';
import { BackofficeModule } from '@src/module/backoffice/backoffice.module';
import { ShopModule } from '@src/module/shop/shop.module';

@Module({
  imports: [
    BackofficeModule,  // 도메인별 그룹화
    ShopModule,
    // 기타 도메인 모듈들
  ],
})
export class AppModule {}
```

### 6단계: 인증 추가 (선택사항)

엔드포인트에 인증이 필요한 경우:

```typescript
// your-module.middleware.ts
import { UseMiddlewares } from '../trpc/decorators';
import { BackofficeAuthMiddleware } from '../auth/backoffice-auth.middleware';

@Router({ alias: 'yourModule' })
export class YourModuleRouter extends BaseTrpcRouter {
  @UseMiddlewares(BackofficeAuthMiddleware)
  @Query({ output: z.object({}) })
  async protectedEndpoint(@Ctx() ctx: BackofficeAuthorizedContext) {
    // ctx.admin을 통해 인증된 사용자에 접근
    return this.microserviceClient.send('yourModule.protectedAction', { 
      userId: ctx.admin.id 
    });
  }
}
```

### 7단계: 데이터베이스 엔티티 및 마이그레이션

기능에 데이터베이스 변경이 필요한 경우:

```typescript
// entities/your-entity.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('your_entities')
export class YourEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

마이그레이션 생성:
```bash
cd apps/api
yarn migration:generate YourModuleMigration
```

### 8단계: App 모듈에 모듈 등록

```typescript
// apps/api/src/app.module.ts
import { YourModuleModule } from './module/your-module/your-module.module';

@Module({
  imports: [
    // ... 다른 imports
    YourModuleModule,
  ],
  // ... 나머지 모듈 설정
})
export class AppModule {}
```

## 고급 패턴

### 트랜잭션 지원

데이터베이스 트랜잭션이 필요한 작업의 경우:

```typescript
import { Transactional } from 'typeorm-transactional';

@MessagePattern('yourModule.complexOperation')
@Transactional
async complexOperation(data: any) {
  // 이 메서드의 모든 데이터베이스 작업은 트랜잭션으로 래핑됨
  // 오류 시 자동 롤백
  await this.yourEntityRepository.save(entity1);
  await this.anotherEntityRepository.save(entity2);
  return result;
}
```

### 입력 검증

포괄적인 검증을 위한 Zod 스키마 사용:

```typescript
const CreateYourEntitySchema = z.object({
  name: z.string().min(1, '이름은 필수입니다').max(100, '이름은 100자를 초과할 수 없습니다'),
  email: z.string().email('올바른 이메일을 입력해주세요'),
  age: z.number().min(0, '나이는 0 이상이어야 합니다').max(150, '나이는 150 이하여야 합니다'),
  tags: z.array(z.string()).optional(),
});

@Mutation({ input: CreateYourEntitySchema })
async create(input: z.infer<typeof CreateYourEntitySchema>) {
  // 입력이 자동으로 검증됨
  return this.microserviceClient.send('yourModule.create', input);
}
```

### 에러 처리

```typescript
import { TRPCError } from '@trpc/server';

@MessagePattern('yourModule.getById')
async getById(data: { id: string }) {
  const entity = await this.yourModuleService.getById(data.id);
  if (!entity) {
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: '엔티티를 찾을 수 없습니다',
    });
  }
  return entity;
}
```

### 페이지네이션

```typescript
const PaginationSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
});

@Query({ input: PaginationSchema })
async getMany(input: z.infer<typeof PaginationSchema>) {
  return this.microserviceClient.send('yourModule.getMany', input);
}

// 서비스에서
async getMany(pagination: { page: number; limit: number }) {
  const [items, total] = await this.yourEntityRepository.findAndCount({
    skip: (pagination.page - 1) * pagination.limit,
    take: pagination.limit,
  });
  
  return {
    items,
    total,
    page: pagination.page,
    totalPages: Math.ceil(total / pagination.limit),
  };
}
```

## 새 기능 테스트

### 단위 테스트

```typescript
// your-module.service.spec.ts
describe('YourModuleService', () => {
  let service: YourModuleService;
  let repository: Repository<YourEntity>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        YourModuleService,
        {
          provide: getRepositoryToken(YourEntity),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<YourModuleService>(YourModuleService);
    repository = module.get<Repository<YourEntity>>(getRepositoryToken(YourEntity));
  });

  it('엔티티를 생성해야 함', async () => {
    const data = { name: '테스트' };
    const result = await service.create(data);
    expect(result).toBeDefined();
  });
});
```

### 통합 테스트

```typescript
// your-module.controller.spec.ts
describe('YourModuleController', () => {
  let controller: YourModuleController;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [YourModuleController],
      providers: [
        {
          provide: YourModuleService,
          useValue: {
            getById: jest.fn(),
            create: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<YourModuleController>(YourModuleController);
  });

  it('getById 메시지를 처리해야 함', async () => {
    const result = await controller.getById({ id: '1' });
    expect(result).toBeDefined();
  });
});
```

### E2E 테스트

```typescript
// your-module.e2e-spec.ts
describe('YourModule (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/your-module/create (POST)', () => {
    return request(app.getHttpServer())
      .post('/your-module/create')
      .send({ name: '테스트' })
      .expect(201);
  });
});
```

## 핵심 패턴 및 원칙

### 스키마 중심 설계 (`module.schema.ts`)
- **모든 입력/출력 스키마를 중앙 관리**
- **z.infer 타입 추론 사용** - export type 정의하지 않음
- **중첩 객체는 별도 스키마로분리**
- **런타임 검증과 타입 안전성 보장**

### 응답 포맷팅 패턴
- **TypeORM 메타데이터 제거를 위한 formatResponse 메서드**
- **중첩 엔티티 처리 (businessInfo, bankInfo)**
- **null 안전성 보장**

### 모듈 조직 패턴
- **계층적 모듈 구조** (BackofficeModule → BrandModule)
- **도메인별 그룹화** (backoffice/, shop/)
- **관심사 분리 및 명확한 책임**

### 에러 처리 패턴
- **서비스 계층**: NestJS HttpException 사용
  - `NotFoundException`, `UnauthorizedException`, `BadRequestException`
- **자동 변환**: HttpException → tRPC Error
- **Repository 패턴**: findOneBy 사용 후 에러 처리

### 트랜잭션 패턴
- **`@Transactional` 데코레이터 사용**
- **TransactionService 의존성 주입**
- **커스텀 Repository에서 트랜잭션 컨텍스트 활용**

## Claude Code를 위한 중요 사항

1. **🎯 스키마 중심**: `module.schema.ts`에서 모든 스키마 정의, z.infer 사용
2. **🔄 응답 포맷팅**: TypeORM 메타데이터 제거를 위한 formatResponse 메서드 필수
3. **🏗️ 계층적 모듈**: BackofficeModule → 개별 모듈 구조 사용
4. **⚠️ 에러 처리**: 서비스에서 HttpException, 자동 tRPC 변환
5. **💾 트랜잭션**: 데이터 변경 시 `@Transactional` 데코레이터 사용
6. **🔐 인증**: UseMiddlewares로 BackofficeAuthMiddleware 적용
7. **📨 메시지 패턴**: `domain.module.method` 규칙 (예: backoffice.brand.register)
8. **🧪 테스트**: 단위, 통합, E2E 테스트 작성
9. **🔍 자동 발견**: 라우터 자동 로드, 수동 등록 불필요

## 실행 및 테스트

기능 구현 후:

```bash
# 환경 생성 (필요시)
yarn generateEnv

# 개발 서버 시작
yarn dev

# 테스트 실행
yarn test

# 린팅 실행
yarn lint
```

서버가 시작되면 새로운 기능이 tRPC 엔드포인트에서 자동으로 사용 가능해집니다.