# 새 기능 추가하기

이 가이드는 YesTravel 코드베이스에서 새로운 기능을 구현하는 단계별 지침을 제공합니다.

## 빠른 시작 체크리스트

Claude Code 사용자를 위해 새 기능 추가 시 다음 체크리스트를 따르세요:

1. ✅ 모듈 디렉토리 구조 생성
2. ✅ 적절한 데코레이터로 tRPC 라우터 구현
3. ✅ 메시지 패턴으로 NestJS 컨트롤러 구현
4. ✅ 비즈니스 로직으로 서비스 구현
5. ✅ NestJS 모듈 설정
6. ✅ 필요시 인증/권한 부여 추가
7. ✅ 필요시 데이터베이스 엔티티 및 마이그레이션 추가
8. ✅ 테스트 작성
9. ✅ 문서 업데이트

## 단계별 구현

### 1단계: 모듈 구조 생성

`apps/api/src/module/` 하위에 다음 구조로 새 디렉토리를 생성하세요:

```
apps/api/src/module/your-module/
├── your-module.router.ts
├── your-module.controller.ts
├── your-module.service.ts
├── your-module.module.ts
└── your-module.middleware.ts (선택사항)
```

### 2단계: tRPC 라우터 구현

```typescript
// your-module.router.ts
import { z } from 'zod';
import { BaseTrpcRouter } from '../trpc/baseTrpcRouter';
import { Router, Query, Mutation } from '../trpc/decorators';

@Router({ alias: 'yourModule' })
export class YourModuleRouter extends BaseTrpcRouter {
  @Query({ 
    input: z.object({ id: z.string() }), 
    output: z.object({ id: z.string(), name: z.string() }) 
  })
  async getById(input: { id: string }) {
    return this.microserviceClient.send('yourModule.getById', input);
  }

  @Mutation({ input: z.object({ name: z.string() }) })
  async create(input: { name: string }) {
    return this.microserviceClient.send('yourModule.create', input);
  }
}
```

### 3단계: NestJS 컨트롤러 구현

```typescript
// your-module.controller.ts
import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { YourModuleService } from './your-module.service';

@Controller()
export class YourModuleController {
  constructor(private readonly yourModuleService: YourModuleService) {}

  @MessagePattern('yourModule.getById')
  async getById(data: { id: string }) {
    return this.yourModuleService.getById(data.id);
  }

  @MessagePattern('yourModule.create')
  async create(data: { name: string }) {
    return this.yourModuleService.create(data);
  }
}
```

### 4단계: 서비스 계층 구현

```typescript
// your-module.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { YourEntity } from './entities/your-entity.entity';

@Injectable()
export class YourModuleService {
  constructor(
    @InjectRepository(YourEntity)
    private readonly yourEntityRepository: Repository<YourEntity>,
  ) {}

  async getById(id: string): Promise<YourEntity> {
    const entity = await this.yourEntityRepository.findOne({ where: { id } });
    if (!entity) {
      throw new Error('엔티티를 찾을 수 없습니다');
    }
    return entity;
  }

  async create(data: { name: string }): Promise<YourEntity> {
    const entity = this.yourEntityRepository.create(data);
    return this.yourEntityRepository.save(entity);
  }
}
```

### 5단계: NestJS 모듈 설정

```typescript
// your-module.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { YourModuleController } from './your-module.controller';
import { YourModuleService } from './your-module.service';
import { YourEntity } from './entities/your-entity.entity';

@Module({
  imports: [TypeOrmModule.forFeature([YourEntity])],
  controllers: [YourModuleController],
  providers: [YourModuleService],
  exports: [YourModuleService],
})
export class YourModuleModule {}
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

## Claude Code를 위한 중요 사항

1. **자동 발견**: 새 라우터는 자동으로 발견되고 로드됩니다
2. **메시지 패턴**: 항상 `moduleName.methodName` 규칙을 따르세요
3. **타입 안전성**: 입력/출력 검증을 위해 Zod 스키마를 사용하세요
4. **에러 처리**: 일관된 에러 응답을 위해 TRPCError를 사용하세요
5. **데이터베이스**: TypeORM 데코레이터 및 마이그레이션을 사용하세요
6. **인증**: 제공된 미들웨어 패턴을 사용하세요
7. **테스트**: 단위, 통합, E2E 테스트를 작성하세요
8. **트랜잭션**: 데이터베이스 작업에 `@Transactional` 데코레이터를 사용하세요

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