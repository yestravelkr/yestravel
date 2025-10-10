# Repository Guidelines
YesTravel 모노레포 기여자가 일관된 흐름으로 작업할 수 있도록 정리한 요약 가이드입니다.

## 프로젝트 구조 및 모듈 구성
- `apps/api`: NestJS 백엔드. 모듈은 `src/`에, 데이터베이스 마이그레이션은 `database/`에, Jest 스펙은 코드 인접 또는 `test/`에 둡니다.
- `apps/backoffice`, `apps/shop`: 직원/고객용 Vite + React 앱입니다. 공유 UI와 유틸은 `apps/*/src/shared`에서 재사용합니다.
- `packages/api-types`: tRPC 계약과 DTO의 단일 출처입니다. API나 프런트엔드 타입을 수정하기 전에 여기부터 갱신하세요.
- 문서는 `docs/`, Docker 컴포즈와 스크립트는 `docker/`에 있습니다.

## 빌드, 테스트 및 개발 명령어
- `.nvmrc`에 맞춰 Node `v22.16`을 사용하고 `yarn install --frozen-lockfile`로 의존성을 고정 설치합니다.
- 백엔드: `yarn workspace @yestravelkr/api dev`, `... build`, `... start:prod`; 데이터베이스 작업은 `... migration:run` 등 워크스페이스 스크립트를 활용합니다.
- 테스트: 병합 전 `yarn workspace @yestravelkr/api test`, `... test:e2e`, `... test:cov`를 실행합니다.
- 프런트엔드: `yarn workspace @yestravelkr/backoffice dev` 또는 `.../shop dev`; 배포 시 `yarn build` 후 `yarn preview`로 동작을 확인합니다.
- 루트 품질 점검: `yarn lint`, 자동 수정은 `yarn lint:fix`를 사용합니다.

## 코딩 스타일 및 네이밍 규칙
- Prettier는 2칸 들여쓰기, 80자 폭, 세미콜론 사용, 작은따옴표를 강제합니다. husky + lint-staged가 스테이징된 파일을 자동으로 정리합니다.
- 파일명은 케밥 케이스(`campaign.service.ts`), 클래스·컴포넌트는 PascalCase와 동일 파일명을 유지합니다.
- 응답 계약은 TypeScript `type` alias로 정의하고 `packages/api-types`를 통해 재노출합니다.
- NestJS 모듈은 `*.module.ts`, `*.controller.ts`, `*.service.ts` 패턴과 생성자 주입을 따릅니다.

## 코드 작성 방법

- codex는 직접 코드를 수정하지 않고 claude code cli를 활용해서 코드 작성을 함
- codex는 전반적인 코드의 구조와 컴포넌트 & 함수등의 재사용성 등 DX & SOLID 원칙 등을 준수하는지 감독함
- **⚠️ claude code CLI 파일 수정 권한**: claude code CLI는 **오직 다음 확장자를 가진 파일만 수정 가능**합니다: `.ts`, `.tsx`, `.js`, `.jsx`, `.html`, `.css`, `.scss`, `.sass`
- **⚠️ claude-task-n.txt 파일 작성 규칙**:
  - 작업 내용은 **반드시 한글로 기술**해야 함
  - 가능한 한 **기존에 구현된 컴포넌트와 유틸리티를 재사용**하도록 지시
  - 새로운 컴포넌트 작성 시에도 기존 패턴과 일관성을 유지하도록 명시
- claude-task-n.txt 파일에 작업 내용을 작성 후 claude code cli로 작업을 수행함
```bash
cat claude-task-1.txt | claude --dangerously-skip-permissions -p "customize task run message" --output-format json
```
- 이후 결과에 대해 코드리뷰 후 수정이 필요하면 다시 claude-task-n.txt 파일에 수정 내용을 작성 후 동일하게 작업을 수행함
- claude task 진행 완료 후 claude-task-n.txt 파일을 삭제함

## 환경 및 설정 팁
- API 기동 전 `docker/startDocker.sh` 또는 `docker-compose up -d`로 PostgreSQL을 실행한 뒤 마이그레이션을 적용합니다.
- 비밀이 갱신되면 `yarn workspace @yestravelkr/api generateEnv`로 환경 파일을 재생성하고 `.env`는 커밋하지 않습니다.