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
├── module.module.ts      # NestJS 모듈 설정
└── module.middleware.ts  # 인증/권한 부여 (선택사항)
```

### 라우터 구현 (`module.router.ts`)

```typescript
@Router({ alias: 'moduleName' })
export class ModuleRouter extends BaseTrpcRouter {
  @Query({ input: z.object({}), output: z.string() })
  async getData(): Promise<string> {
    return this.microserviceClient.send('moduleName.getData', {});
  }
}
```

### 컨트롤러 구현 (`module.controller.ts`)

```typescript
@Controller()
export class ModuleController {
  constructor(private readonly moduleService: ModuleService) {}

  @MessagePattern('moduleName.getData')
  async getData(): Promise<string> {
    return this.moduleService.getData();
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

- **tRPC 에러**: 자동 HTTP 상태 코드 매핑
- **검증 에러**: Zod 스키마 검증 에러
- **비즈니스 로직 에러**: 적절한 상태 코드를 가진 사용자 정의 에러 타입
- **데이터베이스 에러**: 자동 트랜잭션 롤백

### 에러 타입

```typescript
// 비즈니스 로직 에러
throw new TRPCError({
  code: 'BAD_REQUEST',
  message: '잘못된 입력 매개변수'
});

// 검증 에러 (Zod를 통한 자동)
// 데이터베이스 에러 (자동 롤백)
```

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

1. 모듈 디렉토리 구조 생성
2. `@Router` 데코레이터로 라우터 구현
3. `@MessagePattern` 데코레이터로 컨트롤러 구현
4. 비즈니스 로직으로 서비스 구현
5. NestJS 모듈 설정
6. 자동 발견이 등록 처리

### 테스트 전략

- **단위 테스트**: 서비스 계층 테스트
- **통합 테스트**: 목 서비스를 사용한 컨트롤러 테스트
- **E2E 테스트**: 전체 요청/응답 사이클 테스트
- **타입 테스트**: 컴파일 시간 타입 검사

이 아키텍처는 개발 속도와 코드 품질을 유지하면서 확장 가능하고 타입 안전한 API를 구축하기 위한 견고한 기반을 제공합니다.