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
├── module.schema.ts      # Zod 스키마 정의 (타입은 z.infer로 추론)
└── module.middleware.ts  # 인증 (선택사항)
```

**메시지 규약:** 모든 내부 통신에 `moduleName.methodName` 사용

**모듈 구조 (예: Brand):**
```
brand/
├── brand.router.ts       # tRPC 엔드포인트 (@Router)
├── brand.controller.ts   # 메시지 핸들러 (@MessagePattern)
├── brand.service.ts      # 비즈니스 로직
├── brand.module.ts       # NestJS 모듈
└── brand.schema.ts       # Zod 스키마 및 타입
```

## 필수 패턴

**스키마 정의 (module.schema.ts):**
```typescript
import { z } from 'zod';

// Input/Output 스키마 정의
export const createModuleInputSchema = z.object({
  name: z.string().min(1),
  email: z.string().email().optional(),
});

export const moduleSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().optional().nullable(),
  createdAt: z.date(),
});

// 타입은 필요한 곳에서 z.infer로 추론
```

**새 라우터:**
```typescript
@Router({ alias: 'moduleName' })
export class ModuleRouter extends BaseTrpcRouter {
  @UseMiddlewares(BackofficeAuthMiddleware)
  @Mutation({ 
    input: createModuleInputSchema, 
    output: moduleSchema 
  })
  async create(
    @Ctx() ctx: BackofficeAuthorizedContext,
    @Input() input: z.infer<typeof createModuleInputSchema>
  ) {
    const output = await this.microserviceClient.send('moduleName.create', input);
    return moduleSchema.parse(output);
  }
}
```

**컨트롤러 핸들러:**
```typescript
@Controller()
export class ModuleController {
  @MessagePattern('moduleName.create')
  @Transactional
  async create(data: z.infer<typeof createModuleInputSchema>): Promise<z.infer<typeof moduleSchema>> {
    const result = await this.moduleService.create(data);
    return this.formatResponse(result);
  }
  
  private formatResponse(entity: ModuleEntity): z.infer<typeof moduleSchema> {
    return {
      id: entity.id,
      name: entity.name,
      email: entity.email,
      createdAt: entity.createdAt,
    };
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
- **스키마 패턴**: 타입은 `z.infer<typeof schemaName>`으로 추론, 미리 정의하지 않음
- **모듈 구조**: BackofficeModule로 그룹화된 하위 모듈들 (Brand, Auth 등)
- **환경**: API 시작 전에 항상 `yarn generateEnv` 실행
- **포트**: tRPC 서버는 3000 포트에서 실행
- **데이터베이스**: Docker를 통한 PostgreSQL, TypeORM 마이그레이션으로 관리

## 실제 구현 예시

**Brand 모듈**: 브랜드 파트너 관리
- **Router**: `@Router({ alias: 'backofficeBrand' })`
- **Endpoints**: `register`, `findAll`, `findById`
- **Schema**: 중첩 객체 (businessInfo, bankInfo) 포함
- **인증**: BackofficeAuthMiddleware 적용

## 백오피스 프론트엔드 패턴

**기술 스택:**
- **React + Vite + TypeScript**: 빠른 개발 환경
- **TanStack Router**: 파일 기반 라우팅 시스템
- **Tailwind CSS + tailwind-styled-components**: 스타일링
- **tRPC + React Query**: 타입 안전한 API 통신
- **Zustand**: 전역 상태 관리

**폴더 구조:**
```
apps/backoffice/src/
├── components/
│   ├── auth/           # 인증 관련 컴포넌트
│   ├── icons/          # SVG 아이콘 컴포넌트
│   ├── navigation/     # 네비게이션 컴포넌트
│   └── ui/             # 공통 UI 컴포넌트
├── routes/             # 파일 기반 라우팅
│   ├── _auth/          # 인증된 사용자 레이아웃
│   └── login.tsx       # 로그인 페이지
├── shared/             # 공통 유틸리티
│   └── trpc/           # tRPC 클라이언트 설정
└── store/              # Zustand 스토어
    └── authStore.ts    # 인증 상태 관리
```

**스타일링 패턴:**
```typescript
import tw from 'tailwind-styled-components';

const Container = tw.div`
  flex 
  flex-col 
  h-screen 
  bg-gray-50
`;
```

**네비게이션 구조:**
- SVG 아이콘 사용 (폰트 이모지 대신)
- 그룹별로 구분된 메뉴 구조
- 액티브 상태 스타일링 지원

**디자인 가이드라인:**
- 포스타입/인스타그램 스타일의 미니멀한 UI
- 화이트/그레이 톤의 깔끔한 디자인
- 충분한 여백과 명확한 타이포그래피
- 호버 효과와 트랜지션 애니메이션

특정 주제에 대한 자세한 정보는 `/docs` 폴더의 해당 문서 파일을 참조하세요.