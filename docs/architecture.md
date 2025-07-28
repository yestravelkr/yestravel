# 아키텍처 개요

## Hybrid tRPC + NestJS 마이크로서비스 아키텍처

YesTravel은 최적의 성능과 타입 안전성을 위해 인메모리 통신을 사용하여 tRPC와 NestJS 마이크로서비스를 결합한 독특한 아키텍처를 구현합니다.

### 핵심 아키텍처 구성 요소

**이중 애플리케이션 설정:**
- **메인 애플리케이션**: 비즈니스 로직을 처리하는 NestJS 마이크로서비스
- **tRPC 애플리케이션**: tRPC 엔드포인트를 제공하는 API 게이트웨이
- 두 애플리케이션은 인메모리 이벤트 버스를 통해 통신하며 동일한 프로세스에서 실행됩니다

**통신 흐름:**
```
클라이언트 요청 → tRPC Router → MicroserviceClient → EventBus → MessageHandler → Service → 응답
```

### 주요 아키텍처 원칙

1. **타입 안전성**: 클라이언트에서 데이터베이스까지 완전한 end-to-end 타입 안전성
2. **모듈러 설계**: 각 비즈니스 도메인이 자체 모듈로 캡슐화됨
3. **관심사의 분리**: API 계층(tRPC)과 비즈니스 로직(NestJS) 간의 명확한 분리
4. **인메모리 통신**: 네트워크 오버헤드 없이 고성능 통신
5. **자동 발견**: 라우터 및 모듈의 자동 로딩

## 모듈 구조 패턴

모든 비즈니스 모듈은 일관된 구조를 따릅니다:

```
module/
├── module.router.ts      # tRPC 엔드포인트 정의
├── module.controller.ts  # 메시지 패턴 핸들러 (@MessagePattern)
├── module.service.ts     # 비즈니스 로직 구현
├── module.schema.ts      # Zod 스키마 및 타입 정의
├── module.module.ts      # NestJS 모듈 설정
└── module.middleware.ts  # 인증/권한 부여 (선택사항)
```

### 스키마 중심 설계 (`module.schema.ts`)

타입 안전성과 런타임 검증을 위해 Zod 스키마를 중심으로 설계:

```typescript
import { z } from 'zod';

// 입력 스키마
export const createModuleInputSchema = z.object({
  name: z.string().min(1),
  email: z.string().email().optional(),
});

// 출력 스키마  
export const moduleSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().optional().nullable(),
  createdAt: z.date(),
});

// 타입은 사용하는 곳에서 z.infer로 추론
// export type 정의하지 않음
```

### 라우터 구현 (`module.router.ts`)

tRPC 라우터는 클라이언트 요청을 받아 마이크로서비스로 전달하고 응답을 검증합니다:

```typescript
@Router({ alias: 'backofficeBrand' })
export class BrandRouter extends BaseTrpcRouter {
  @UseMiddlewares(BackofficeAuthMiddleware)
  @Mutation({
    input: registerBrandInputSchema,
    output: brandSchema,
  })
  async register(
    @Ctx() ctx: BackofficeAuthorizedContext,
    @Input() input: z.infer<typeof registerBrandInputSchema>
  ) {
    const output = await this.microserviceClient.send('backoffice.brand.register', input);
    return brandSchema.parse(output); // 응답 검증
  }
  
  @UseMiddlewares(BackofficeAuthMiddleware)
  @Query({
    output: z.array(brandSchema),
  })
  async findAll(@Ctx() ctx: BackofficeAuthorizedContext) {
    const output = await this.microserviceClient.send('backoffice.brand.findAll', {});
    return z.array(brandSchema).parse(output);
  }
}
```

### 컨트롤러 구현 (`module.controller.ts`)

컨트롤러는 메시지를 받아 서비스 로직을 호출하고 응답을 포맷팅합니다:

```typescript
@Controller()
export class BrandController {
  constructor(private readonly brandService: BrandService) {}

  // TypeORM 메타데이터 제거를 위한 응답 포맷팅
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
  @Transactional
  async register(data: z.infer<typeof registerBrandInputSchema>): Promise<z.infer<typeof brandSchema>> {
    const brand = await this.brandService.register(data);
    return this.formatBrandResponse(brand);
  }
  
  @MessagePattern('backoffice.brand.findAll')
  async findAll(): Promise<Array<z.infer<typeof brandSchema>>> {
    const brands = await this.brandService.findAll();
    return brands.map(brand => this.formatBrandResponse(brand));
  }
}
```

## 주요 구성 요소

### BaseTrpcRouter (`apps/api/src/module/trpc/baseTrpcRouter.ts`)

모든 tRPC 라우터의 기본 클래스로 다음을 제공:
- 내부 통신을 위한 `MicroserviceClient` 접근
- 요청 처리를 위한 일관된 패턴
- 내장된 에러 처리 및 로깅

사용법: `@Router({ alias: 'moduleName' })` 데코레이터

### 자동 발견 시스템 (`apps/api/src/module/trpc/routerModule.ts`)

자동으로 발견하고 로드:
- 패턴과 일치하는 라우터: `**/*.{router,middleware}.{ts,js}`
- 수동 라우터 등록 제거
- 개발 중 핫 리로딩 지원

### 인메모리 마이크로서비스 전략 (`apps/api/src/module/trpc/inmemoryMicroserviceStrategy.ts`)

다음 기능을 갖춘 사용자 정의 전송 계층:
- 통신을 위한 `SharedEventBus` (EventEmitter 기반)
- 요청/응답 패턴을 위한 5초 타임아웃
- 제로 네트워크 오버헤드
- 완전한 관찰 가능성 및 디버깅 지원

## 메시지 패턴 규약

모든 내부 통신은 일관된 명명 패턴을 따릅니다:

- **패턴**: `moduleName.methodName`
- **라우터 메서드**: 컨트롤러에 메시지 전송
- **컨트롤러 메서드**: `@MessagePattern('moduleName.methodName')` 사용

예시:
```typescript
// 라우터
return this.microserviceClient.send('user.create', createUserDto);

// 컨트롤러
@MessagePattern('user.create')
async createUser(createUserDto: CreateUserDto) {
  return this.userService.create(createUserDto);
}
```

## 인증 및 권한 부여

### 미들웨어 시스템

```typescript
@UseMiddlewares(BackofficeAuthMiddleware)
@Query({ output: z.object({}) })
protectedRoute(@Ctx() ctx: BackofficeAuthorizedContext) {
  // ctx.admin을 통해 인증된 사용자에 접근
}
```

### 컨텍스트 타입

- `BackofficeAuthorizedContext`: 인증된 관리자 사용자 포함
- `PublicContext`: 공개 엔드포인트용
- 다양한 인증 스키마를 위한 사용자 정의 컨텍스트 생성 가능

## 데이터베이스 계층

### TypeORM 통합

- **ORM**: PostgreSQL과 함께 TypeORM
- **설정**: `apps/api/src/database/`에 위치
- **마이그레이션**: `apps/api/src/database/migration/`에 위치
- **엔티티**: 모듈과 함께 배치

### 트랜잭션 지원

```typescript
@MessagePattern('module.transactionalOperation')
@Transactional
async performTransaction(data: any) {
  // 이 메서드 내의 모든 작업은 트랜잭션으로 래핑됨
  // 오류 시 자동 롤백
}
```

## 타입 시스템

### 생성된 타입

- **위치**: `packages/api-types/src/`
- **사용법**: tRPC 라우터와 클라이언트 간 공유
- **검증**: 런타임 검증을 위한 Zod 스키마

### 스키마 검증

```typescript
@Query({ 
  input: z.object({
    id: z.string(),
    name: z.string().min(1)
  }), 
  output: z.object({
    id: z.string(),
    name: z.string(),
    createdAt: z.date()
  })
})
```

## 에러 처리

### 중앙집중식 에러 처리

시스템은 NestJS 서비스에서 발생한 에러를 tRPC 에러로 자동 변환합니다:

**에러 변환 흐름:**
```
Service (HttpException) → InMemoryMicroserviceStrategy → transformToTRPCError → tRPC Client
```

### 에러 타입 및 패턴

**서비스 계층에서는 NestJS HttpException 사용:**
```typescript
import { NotFoundException, UnauthorizedException, BadRequestException } from '@nestjs/common';

// 비즈니스 로직 에러
throw new NotFoundException('Brand not found');
throw new UnauthorizedException('Invalid credentials'); 
throw new BadRequestException('Validation failed');
```

**Repository 계층에서의 에러 처리:**
```typescript
const brand = await this.brandRepository.findOneBy({ id });
if (!brand) {
  throw new NotFoundException(`Brand with id ${id} not found`);
}
```

**자동 변환되는 에러 코드:**
- `BadRequestException` → `BAD_REQUEST`
- `UnauthorizedException` → `UNAUTHORIZED`
- `NotFoundException` → `NOT_FOUND`
- `ForbiddenException` → `FORBIDDEN`
- `InternalServerErrorException` → `INTERNAL_SERVER_ERROR`

**검증 에러:**
- Zod 스키마 검증 에러는 자동으로 `BAD_REQUEST`로 변환
- 입력/출력 스키마 불일치 시 런타임에서 자동 감지

**트랜잭션 에러:**
- `@Transactional` 데코레이터 사용 시 에러 발생 시 자동 롤백
- 데이터베이스 제약 조건 위반 시 적절한 에러 메시지 제공

## 성능 고려사항

### 인메모리 통신의 이점

1. **제로 네트워크 지연 시간**: TCP/HTTP 오버헤드 없음
2. **공유 메모리**: 가능한 경우 참조로 객체 전달
3. **타입 안전성**: 직렬화/역직렬화 오버헤드 없음
4. **디버깅**: 서비스 경계를 넘나든 완전한 스택 추적

### 확장성 패턴

- **수평 확장**: 로드 밸런서 뒤의 여러 인스턴스
- **데이터베이스 연결 풀링**: 최적화된 연결 관리
- **캐싱**: 세션 및 데이터 캐싱을 위한 Redis 통합
- **백그라운드 작업**: 무거운 작업을 위한 큐 기반 처리

## 개발 패턴

### 새 모듈 추가

1. **모듈 디렉토리 구조 생성**
2. **스키마 파일 작성** (`module.schema.ts`)
   - 입력/출력 스키마 정의
   - z.infer 타입 추론 사용
3. **라우터 구현** (`@Router` 데코레이터)
   - 스키마 기반 입력/출력 검증
   - 인증 미들웨어 적용
4. **컨트롤러 구현** (`@MessagePattern` 데코레이터)
   - 응답 포맷팅 메서드 구현
   - 트랜잭션 데코레이터 적용
5. **서비스 및 비즈니스 로직 구현**
6. **NestJS 모듈 설정 및 등록**

### 모듈 조직 패턴

**계층적 모듈 구조:**
```typescript
// BackofficeModule이 관련 모듈들을 그룹화
@Module({
  imports: [
    AuthModule,
    BrandModule,
    // 기타 백오피스 모듈들
  ],
})
export class BackofficeModule {}

// AppModule에서는 최상위 모듈만 import
@Module({
  imports: [
    BackofficeModule,
    ShopModule,
    // 기타 도메인 모듈들
  ],
})
export class AppModule {}
```

### 테스트 전략

- **단위 테스트**: 서비스 계층 테스트
- **통합 테스트**: 목 서비스를 사용한 컨트롤러 테스트
- **E2E 테스트**: 전체 요청/응답 사이클 테스트
- **타입 테스트**: 컴파일 시간 타입 검사

이 아키텍처는 개발 속도와 코드 품질을 유지하면서 확장 가능하고 타입 안전한 API를 구축하기 위한 견고한 기반을 제공합니다.