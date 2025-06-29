# CLAUDE.md

이 파일은 이 저장소에서 코드 작업 시 Claude Code (claude.ai/code)에게 가이드를 제공합니다.

## 문서

**완전한 문서는 `/docs` 폴더에서 확인할 수 있습니다:**

- **[README.md](./docs/README.md)** - 문서 개요 및 네비게이션
- **[개발 명령어](./docs/development-commands.md)** - 개발에 사용 가능한 모든 명령어
- **[아키텍처 개요](./docs/architecture.md)** - 시스템 아키텍처 및 설계 패턴
- **[새 기능 추가하기](./docs/adding-features.md)** - 기능 구현을 위한 단계별 가이드
- **[데이터베이스 가이드](./docs/database.md)** - 데이터베이스 설정, 마이그레이션 및 모범 사례
- **[프론트엔드 개발](./docs/frontend.md)** - React 프론트엔드 개발 가이드
- **[Docker 설정](./docs/docker.md)** - Docker 환경 설정 및 관리
- **[Claude Code 가이드](./docs/claude-code-guide.md)** - Claude Code 전용 종합 가이드

## 빠른 시작

### 개발 워크플로우
```bash
# 1. Docker 서비스 시작
cd docker && ./startDocker.sh

# 2. API 환경 설정
cd ../apps/api && yarn generateEnv

# 3. 데이터베이스 마이그레이션 실행
yarn migration:run

# 4. 개발 서버 시작
yarn dev  # 3000 포트에서 실행
```

### 주요 명령어
- `yarn dev` - API 개발 서버 시작 (apps/api)
- `yarn dev` - 프론트엔드 개발 서버 시작 (apps/backoffice)
- `yarn lint` - 모든 워크스페이스에서 린팅 실행
- `yarn test` - 테스트 실행
- `yarn migration:run` - 데이터베이스 마이그레이션 적용

## 아키텍처 요약

**Hybrid tRPC + NestJS 마이크로서비스 아키텍처:**
- **tRPC 애플리케이션**: 타입 안전한 엔드포인트를 가진 API 게이트웨이
- **NestJS 마이크로서비스**: 인메모리 통신을 사용하는 비즈니스 로직
- **통신**: 클라이언트 → tRPC Router → MicroserviceClient → EventBus → NestJS Controller → Service

**모듈 패턴:**
```
module/
├── module.router.ts      # tRPC 엔드포인트 (@Router 데코레이터)
├── module.controller.ts  # 메시지 핸들러 (@MessagePattern)
├── module.service.ts     # 비즈니스 로직
├── module.module.ts      # NestJS 모듈 설정
└── module.middleware.ts  # 인증 (선택사항)
```

**메시지 규약:** 모든 내부 통신에 `moduleName.methodName` 사용

## 필수 패턴

**새 라우터:**
```typescript
@Router({ alias: 'moduleName' })
export class ModuleRouter extends BaseTrpcRouter {
  @Query({ input: z.object({}), output: z.string() })
  async getData() {
    return this.microserviceClient.send('moduleName.getData', {});
  }
}
```

**컨트롤러 핸들러:**
```typescript
@Controller()
export class ModuleController {
  @MessagePattern('moduleName.getData')
  async getData() {
    return this.moduleService.getData();
  }
}
```

**인증:**
```typescript
@UseMiddlewares(BackofficeAuthMiddleware)
@Query({ output: z.object({}) })
protectedRoute(@Ctx() ctx: BackofficeAuthorizedContext) {
  // 인증된 사용자를 위해 ctx.admin 접근
}
```

**데이터베이스 트랜잭션:**
```typescript
@MessagePattern('module.transactionalOperation')
@Transactional
async performTransaction(data: any) {
  // 오류 시 롤백과 함께 트랜잭션으로 자동 래핑
}
```

## 중요 사항

- **자동 발견**: 새 라우터는 자동으로 로드됩니다 (수동 등록 불필요)
- **타입 안전성**: 모든 입력/출력 검증에 Zod 스키마 사용
- **환경**: API 시작 전에 항상 `yarn generateEnv` 실행
- **포트**: tRPC 서버는 3000 포트에서 실행
- **데이터베이스**: Docker를 통한 PostgreSQL, TypeORM 마이그레이션으로 관리

특정 주제에 대한 자세한 정보는 `/docs` 폴더의 해당 문서 파일을 참조하세요.