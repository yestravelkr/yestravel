# Claude Code 개발 가이드

이 가이드는 Claude Code (claude.ai/code)가 YesTravel 코드베이스를 이해하고 효과적으로 작업할 수 있도록 특별히 설계되었습니다.

## 프로젝트 컨텍스트

YesTravel은 Hybrid tRPC + NestJS 마이크로서비스 아키텍처를 가진 여행 예약 플랫폼입니다. 프로젝트는 API 서버와 백오피스 프론트엔드를 위한 별도 애플리케이션이 있는 모노레포 구조를 사용합니다.

### 주요 기술
- **백엔드**: Node.js, NestJS, tRPC, TypeORM, PostgreSQL
- **프론트엔드**: React 19, TypeScript, Vite, TanStack Router, Tailwind CSS
- **개발**: Docker, Yarn workspaces, ESLint, Jest
- **데이터베이스**: TypeORM 마이그레이션을 사용하는 PostgreSQL

## 프로젝트 구조 개요

```
yestravel/
├── apps/
│   ├── api/                    # NestJS + tRPC API 서버
│   │   ├── src/
│   │   │   ├── module/         # 비즈니스 모듈 (자동 발견)
│   │   │   ├── database/       # 데이터베이스 설정 및 마이그레이션
│   │   │   └── trpc/          # tRPC 인프라
│   │   └── scripts/           # 유틸리티 스크립트 (generateEnv.ts)
│   └── backoffice/            # 관리자용 React 프론트엔드
├── packages/
│   └── api-types/             # 공유 TypeScript 타입
├── docker/                    # Docker 설정
├── docs/                      # 문서 (이 폴더)
└── CLAUDE.md                  # 메인 Claude Code 지침
```

## Claude Code를 위한 개발 워크플로우

### 1. 환경 설정
개발 시작 시 항상 이 명령어들을 순서대로 실행하세요:

```bash
# 1. Docker 서비스 시작 (PostgreSQL)
cd docker && ./startDocker.sh

# 2. 환경 변수 생성
cd ../apps/api && yarn generateEnv

# 3. 데이터베이스 마이그레이션 실행
yarn migration:run

# 4. 개발 서버 시작
yarn dev  # 3000 포트에서 실행
```

### 2. 아키텍처 이해

프로젝트는 독특한 **이중 애플리케이션** 패턴을 사용합니다:
- **tRPC 애플리케이션**: HTTP 요청을 처리하고 타입 안전한 API 엔드포인트 제공
- **NestJS 마이크로서비스**: 비즈니스 로직을 포함하고 인메모리 이벤트 버스를 통해 통신
- **통신 흐름**: 클라이언트 → tRPC Router → MicroserviceClient → EventBus → NestJS Controller → Service

### 3. 모듈 구조 패턴

모든 비즈니스 기능은 정확히 이 패턴을 따릅니다:

```
module/
├── module.router.ts      # tRPC 엔드포인트 (@Router 데코레이터)
├── module.controller.ts  # NestJS 메시지 핸들러 (@MessagePattern)
├── module.service.ts     # 비즈니스 로직
├── module.module.ts      # NestJS 모듈 설정
└── module.middleware.ts  # 인증 (선택사항)
```

### 4. 메시지 패턴 규약

모든 내부 통신은 이 패턴을 사용합니다:
- **tRPC Router**: `moduleName.methodName` 메시지 전송
- **NestJS Controller**: `@MessagePattern('moduleName.methodName')` 처리

예시:
```typescript
// Router
return this.microserviceClient.send('user.create', data);

// Controller
@MessagePattern('user.create')
async createUser(data: CreateUserDto) { ... }
```

## Claude Code를 위한 구현 가이드라인

### 새 기능 추가

1. **항상 모듈 구조 패턴 따르기**
2. **자동 발견 사용** - 새 라우터는 자동으로 로드됨
3. **명명 규칙 따르기**: 메시지 패턴에 `moduleName.methodName` 사용
4. **적절한 데코레이터 사용**: 라우터에 `@Router({ alias: 'moduleName' })` 사용
5. **적절한 에러 처리** TRPCError 사용
6. **입력/출력 검증에 Zod 스키마** 사용

### 코드 예시

**tRPC Router 템플릿:**
```typescript
@Router({ alias: 'yourModule' })
export class YourModuleRouter extends BaseTrpcRouter {
  @Query({ 
    input: z.object({ id: z.string() }), 
    output: z.object({ id: z.string(), name: z.string() }) 
  })
  async getById(input: { id: string }) {
    return this.microserviceClient.send('yourModule.getById', input);
  }
}
```

**NestJS Controller 템플릿:**
```typescript
@Controller()
export class YourModuleController {
  constructor(private readonly yourModuleService: YourModuleService) {}

  @MessagePattern('yourModule.getById')
  async getById(data: { id: string }) {
    return this.yourModuleService.getById(data.id);
  }
}
```

### 데이터베이스 작업

**엔티티 정의:**
```typescript
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

**마이그레이션 명령어:**
```bash
# 새 마이그레이션 생성
yarn migration:create MigrationName

# 엔티티 변경사항에서 생성
yarn migration:generate MigrationName

# 마이그레이션 실행
yarn migration:run

# 마지막 마이그레이션 되돌리기
yarn migration:revert
```

**트랜잭션을 사용하는 서비스:**
```typescript
@Injectable()
export class YourModuleService {
  @Transactional()
  async complexOperation(data: any) {
    // 모든 작업이 트랜잭션으로 래핑됨
    // 오류 시 자동 롤백
  }
}
```

### 인증 패턴

```typescript
@UseMiddlewares(BackofficeAuthMiddleware)
@Query({ output: z.object({}) })
protectedRoute(@Ctx() ctx: BackofficeAuthorizedContext) {
  // ctx.admin을 통해 인증된 사용자에 접근
  return this.microserviceClient.send('module.protectedAction', { 
    userId: ctx.admin.id 
  });
}
```

## 테스트 및 품질 보증

### 테스트 및 린팅 실행

```bash
# API 서버
cd apps/api
yarn test              # 단위 테스트
yarn test:e2e          # End-to-end 테스트
yarn test:cov          # 커버리지 리포트
yarn lint              # ESLint

# 백오피스 프론트엔드
cd apps/backoffice
yarn test              # 컴포넌트 테스트
yarn lint              # ESLint

# 루트 레벨
yarn lint              # 모든 워크스페이스 린트
yarn lint:fix          # 린팅 문제 수정
```

### 코드 품질 검사

변경사항 커밋 전에 항상 실행하세요:
1. `yarn lint` - 모든 린팅 문제 수정
2. `yarn test` - 모든 테스트 통과 확인
3. `yarn build` - 빌드 성공 확인
4. `yarn migration:run` - 새 마이그레이션 적용

## 중요한 패턴과 규칙

### 1. 자동 발견 시스템
- 새 라우터는 `**/*.{router,middleware}.{ts,js}` 패턴에서 자동으로 발견됨
- 수동 등록 불필요
- 파일 명명 규칙을 정확히 따르세요

### 2. 에러 처리
```typescript
// 일관된 에러 응답을 위해 TRPCError 사용
throw new TRPCError({
  code: 'BAD_REQUEST',
  message: '잘못된 입력 매개변수'
});
```

### 3. 입력 검증
```typescript
// 항상 Zod 스키마 사용
const CreateUserSchema = z.object({
  name: z.string().min(1, '이름은 필수입니다').max(100, '이름은 100자를 초과할 수 없습니다'),
  email: z.string().email('올바른 이메일을 입력해주세요'),
});

@Mutation({ input: CreateUserSchema })
async create(input: z.infer<typeof CreateUserSchema>) {
  // 입력이 자동으로 검증됨
}
```

### 4. 데이터베이스 모범 사례
- UUID 기본 키 사용: `@PrimaryGeneratedColumn('uuid')`
- 항상 타임스탬프 포함: `@CreateDateColumn()`, `@UpdateDateColumn()`
- 적절한 관계 사용: `@ManyToOne`, `@OneToMany` 등
- 다단계 작업에 `@Transactional()` 적용

### 5. 프론트엔드 패턴
- 라우팅에 TanStack Router 사용
- 적절한 로딩 상태 구현
- Zod 검증과 함께 React Hook Form 사용
- Tailwind CSS 규칙 따르기
- 상태 관리에 Zustand 사용

## 파일 위치 참조

Claude Code가 파일을 찾거나 수정해야 할 때:

### 백엔드 파일
- **라우터**: `apps/api/src/module/{moduleName}/{moduleName}.router.ts`
- **컨트롤러**: `apps/api/src/module/{moduleName}/{moduleName}.controller.ts`
- **서비스**: `apps/api/src/module/{moduleName}/{moduleName}.service.ts`
- **엔티티**: `apps/api/src/module/{moduleName}/entities/{entity}.entity.ts`
- **마이그레이션**: `apps/api/src/database/migration/{timestamp}-{name}.ts`

### 프론트엔드 파일
- **페이지**: `apps/backoffice/src/routes/{pageName}.tsx`
- **컴포넌트**: `apps/backoffice/src/components/{componentName}.tsx`
- **스토어**: `apps/backoffice/src/store/{storeName}.ts`
- **타입**: `packages/api-types/src/{moduleName}.ts`

### 설정 파일
- **API 설정**: `apps/api/src/config.ts`
- **데이터베이스 설정**: `apps/api/src/database/datasources.ts`
- **Docker 설정**: `docker/docker-compose.yml`
- **환경 변수**: `apps/api/.env` (자동 생성)

## 일반적인 명령어 참조

### 개발
```bash
# 모든 것 시작
cd docker && ./startDocker.sh && cd ../apps/api && yarn generateEnv && yarn migration:run && yarn dev

# API 개발
cd apps/api
yarn dev                    # 핫 리로드로 시작
yarn generateEnv           # .env 파일 생성
yarn migration:run         # 마이그레이션 적용

# 프론트엔드 개발
cd apps/backoffice
yarn dev                   # Vite 개발 서버 시작
```

### 데이터베이스
```bash
cd apps/api
yarn migration:create <name>     # 마이그레이션 생성
yarn migration:generate <name>   # 엔티티에서 생성
yarn migration:run              # 마이그레이션 적용
yarn migration:revert           # 마지막 마이그레이션 되돌리기
```

### Docker
```bash
cd docker
./startDocker.sh                # 서비스 시작
docker-compose down             # 서비스 중지
docker exec -it yestravel_postgres psql -U postgres -d yestravel  # DB 접근
```

## 디버깅 및 문제 해결

### 일반적인 문제와 해결책

1. **3000 포트가 이미 사용 중**: 기존 프로세스 종료 또는 포트 변경
2. **데이터베이스 연결 실패**: Docker가 실행 중이고 마이그레이션이 적용되었는지 확인
3. **환경 변수 누락**: `yarn generateEnv` 실행
4. **TypeScript 오류**: 가져오기 및 타입 정의 확인
5. **tRPC 라우터를 찾을 수 없음**: 파일 명명 및 데코레이터 사용 확인

### 디버깅 도구

```bash
# 실행 중인 서비스 확인
docker ps

# API 로그 보기
cd apps/api && yarn dev  # 터미널에 로그 표시

# 데이터베이스 확인
docker exec -it yestravel_postgres psql -U postgres -d yestravel

# 마이그레이션 상태 보기
cd apps/api && yarn migration:show
```

## Claude Code를 위한 모범 사례

1. **새 기능 구현 전에 항상 기존 코드 읽기**
2. **기존 패턴을 정확히 따르기** - 새로운 패턴 만들지 말기
3. **전체적으로 적절한 TypeScript 타입 사용**
4. **포괄적인 에러 처리 구현**
5. **새 기능에 대한 테스트 작성**
6. **작업 완료 고려 전에 린팅 및 테스트 실행**
7. **수동 등록 대신 자동 발견 시스템 사용**
8. **메시지 패턴 규칙 엄격히 따르기**
9. **엔티티 변경 후 데이터베이스 마이그레이션 적용**
10. **구현 후 엔드포인트 테스트**

## 통합 지점

### API에서 프론트엔드로
- tRPC는 end-to-end 타입 안전성 제공
- 타입은 `packages/api-types/`에서 생성됨
- 프론트엔드는 모든 API 호출에 tRPC 클라이언트 사용

### 데이터베이스 통합
- TypeORM이 모든 데이터베이스 작업 처리
- 마이그레이션이 스키마 변경 관리
- 엔티티가 데이터베이스 구조 정의
- 리포지토리가 데이터 접근 계층 제공

### 인증
- 보호된 라우트에 미들웨어 패턴 사용
- 컨텍스트가 인증된 사용자 정보 제공
- 여러 인증 스키마 지원

이 가이드는 Claude Code가 YesTravel 코드베이스 아키텍처, 패턴 및 개발 워크플로우를 포괄적으로 이해할 수 있도록 제공합니다.