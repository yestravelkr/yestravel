# Docker 설정 가이드

이 가이드는 YesTravel 개발 환경을 위한 Docker 설정 및 관리를 다룹니다.

## 개요

YesTravel 프로젝트는 개발 의존성, 주로 PostgreSQL 데이터베이스를 위해 Docker를 사용합니다. Docker 설정은 필수 서비스에 중점을 두고 간단하게 설계되었습니다.

## 디렉토리 구조

```
docker/
├── docker-compose.yml       # 메인 Docker Compose 설정
├── startDocker.sh          # 서비스 시작 편의 스크립트
├── README.md               # Docker 관련 문서
└── postgresql/
    ├── Dockerfile          # 사용자 정의 PostgreSQL 이미지
    ├── create-database.sql # 데이터베이스 초기화
    └── data/              # PostgreSQL 데이터 볼륨 (자동 생성)
```

## 빠른 시작

### 1. 서비스 시작

```bash
# 저장소 루트에서
cd docker
./startDocker.sh

# 또는 docker-compose 직접 사용
docker-compose up -d
```

### 2. 서비스 확인

```bash
# 실행 중인 컨테이너 확인
docker ps

# 5432 포트에서 실행 중인 PostgreSQL 컨테이너가 표시되어야 함
```

### 3. 데이터베이스 접근

```bash
# PostgreSQL에 연결
docker exec -it yestravel_postgres psql -U postgres -d yestravel

# 또는 호스트에서 (psql이 설치된 경우)
psql -h localhost -p 5432 -U postgres -d yestravel
```

## Docker Compose 설정

### 메인 설정 (`docker-compose.yml`)

```yaml
version: '3.8'

services:
  postgres:
    build:
      context: ./postgresql
      dockerfile: Dockerfile
    container_name: yestravel_postgres
    environment:
      POSTGRES_DB: yestravel
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
      POSTGRES_MULTIPLE_DATABASES: yestravel_test
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./postgresql/create-database.sql:/docker-entrypoint-initdb.d/create-database.sql
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres -d yestravel"]
      interval: 10s
      timeout: 5s
      retries: 5
    restart: unless-stopped

volumes:
  postgres_data:
    driver: local
```

### PostgreSQL 설정

**사용자 정의 Dockerfile (`postgresql/Dockerfile`):**
```dockerfile
FROM postgres:15-alpine

# 필요시 추가 확장 설치
RUN apk add --no-cache postgresql-contrib

# 초기화 스크립트 복사
COPY create-database.sql /docker-entrypoint-initdb.d/

# 시간대 설정
ENV TZ=UTC
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone
```

**데이터베이스 초기화 (`postgresql/create-database.sql`):**
```sql
-- 메인 데이터베이스 (POSTGRES_DB로 처리됨)
-- 테스트용 데이터베이스 생성
CREATE DATABASE yestravel_test;

-- 확장 생성
\c yestravel;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

\c yestravel_test;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
```

## 서비스 관리

### 서비스 시작

```bash
# 모든 서비스를 백그라운드에서 시작
docker-compose up -d

# 로그를 보며 시작
docker-compose up

# 특정 서비스 시작
docker-compose up -d postgres
```

### 서비스 중지

```bash
# 모든 서비스 중지
docker-compose down

# 볼륨과 함께 중지 (파괴적)
docker-compose down -v

# 특정 서비스 중지
docker-compose stop postgres
```

### 서비스 재시작

```bash
# 모든 서비스 재시작
docker-compose restart

# 특정 서비스 재시작
docker-compose restart postgres
```

## 데이터베이스 관리

### PostgreSQL 접근

```bash
# 대화형 psql 세션
docker exec -it yestravel_postgres psql -U postgres -d yestravel

# 단일 명령어 실행
docker exec yestravel_postgres psql -U postgres -d yestravel -c "SELECT version();"

# SQL 파일 실행
docker exec -i yestravel_postgres psql -U postgres -d yestravel < schema.sql
```

### 일반적인 PostgreSQL 명령어

```sql
-- 데이터베이스 목록
\l

-- 데이터베이스에 연결
\c yestravel

-- 테이블 목록
\dt

-- 테이블 설명
\d table_name

-- 실행 중인 쿼리 보기
SELECT * FROM pg_stat_activity;

-- 종료
\q
```

### 데이터베이스 백업 및 복원

**백업 생성:**
```bash
# 전체 데이터베이스 백업
docker exec yestravel_postgres pg_dump -U postgres yestravel > backup.sql

# 스키마만
docker exec yestravel_postgres pg_dump -U postgres --schema-only yestravel > schema.sql

# 데이터만
docker exec yestravel_postgres pg_dump -U postgres --data-only yestravel > data.sql

# 사용자 정의 형식 (더 작고 빠름)
docker exec yestravel_postgres pg_dump -U postgres -Fc yestravel > backup.dump
```

**백업 복원:**
```bash
# SQL 파일에서
docker exec -i yestravel_postgres psql -U postgres -d yestravel < backup.sql

# 사용자 정의 형식에서
docker exec yestravel_postgres pg_restore -U postgres -d yestravel backup.dump

# 복원 전 데이터베이스 삭제 후 재생성
docker exec yestravel_postgres psql -U postgres -c "DROP DATABASE IF EXISTS yestravel;"
docker exec yestravel_postgres psql -U postgres -c "CREATE DATABASE yestravel;"
docker exec -i yestravel_postgres psql -U postgres -d yestravel < backup.sql
```

## 볼륨 관리

### 데이터 지속성

PostgreSQL 데이터는 컨테이너 재시작 간에 지속되는 명명된 볼륨 `postgres_data`에 저장됩니다.

```bash
# 볼륨 목록
docker volume ls

# 볼륨 검사
docker volume inspect docker_postgres_data

# 볼륨 제거 (파괴적)
docker volume rm docker_postgres_data
```

### 볼륨 백업

```bash
# 볼륨 백업 생성
docker run --rm -v docker_postgres_data:/data -v $(pwd):/backup alpine tar czf /backup/postgres_backup.tar.gz -C /data .

# 볼륨 백업 복원
docker run --rm -v docker_postgres_data:/data -v $(pwd):/backup alpine tar xzf /backup/postgres_backup.tar.gz -C /data
```

## 개발 워크플로우

### 일일 개발

```bash
# 1. Docker 서비스 시작
cd docker && ./startDocker.sh

# 2. API 환경 생성
cd ../apps/api && yarn generateEnv

# 3. 마이그레이션 실행
yarn migration:run

# 4. 개발 서버 시작
yarn dev
```

### 데이터베이스 재설정 (개발용)

```bash
# 서비스 중지 및 데이터 제거
docker-compose down -v

# 서비스 시작 (데이터베이스 재생성)
docker-compose up -d

# 데이터베이스 준비 대기
sleep 10

# 마이그레이션 실행
cd ../apps/api && yarn migration:run
```

## 환경 설정

### Docker 환경 변수

환경 변수는 여러 방법으로 설정할 수 있습니다:

**1. 환경 파일 (`.env`):**
```env
# docker/.env
POSTGRES_DB=yestravel
POSTGRES_USER=postgres
POSTGRES_PASSWORD=password
POSTGRES_PORT=5432
```

**2. Docker Compose 오버라이드:**
```yaml
# docker-compose.override.yml
version: '3.8'

services:
  postgres:
    environment:
      POSTGRES_PASSWORD: custom_password
    ports:
      - "5433:5432"  # 다른 포트 사용
```

**3. 시스템 환경:**
```bash
# docker-compose 실행 전 설정
export POSTGRES_PASSWORD=secure_password
docker-compose up -d
```

### 애플리케이션 설정

API 애플리케이션은 다음 기본값을 사용하여 Docker 서비스에 연결합니다:

```typescript
// apps/api/src/config.ts
export default {
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_DATABASE || 'yestravel',
  }
};
```

## 모니터링 및 로그

### 컨테이너 로그

```bash
# 모든 서비스 로그 보기
docker-compose logs

# 실시간으로 로그 따라가기
docker-compose logs -f

# 특정 서비스 로그 보기
docker-compose logs postgres

# 마지막 100줄 보기
docker-compose logs --tail=100 postgres
```

### PostgreSQL 로그

```bash
# PostgreSQL 로그 보기
docker exec yestravel_postgres tail -f /var/log/postgresql/postgresql.log

# 또는 Docker 로그 확인
docker logs yestravel_postgres
```

### 헬스 체크

```bash
# 서비스 상태 확인
docker-compose ps

# 특정 서비스 헬스 확인
docker exec yestravel_postgres pg_isready -U postgres -d yestravel
```

## 문제 해결

### 일반적인 문제

**포트가 이미 사용 중:**
```bash
# 5432 포트를 사용하는 프로세스 확인
lsof -i :5432

# 포트를 사용하는 프로세스 종료
sudo kill -9 $(lsof -t -i:5432)

# 또는 docker-compose.yml에서 다른 포트 사용
ports:
  - "5433:5432"
```

**권한 문제:**
```bash
# 볼륨 권한 수정
sudo chown -R $(id -u):$(id -g) docker/postgresql/data
```

**데이터베이스 연결 문제:**
```bash
# 컨테이너가 실행 중인지 확인
docker ps | grep postgres

# 컨테이너 로그 확인
docker logs yestravel_postgres

# 연결 테스트
docker exec yestravel_postgres pg_isready -U postgres
```

**컨테이너가 시작되지 않음:**
```bash
# 컨테이너와 볼륨 제거
docker-compose down -v

# 충돌하는 컨테이너 제거
docker rm -f yestravel_postgres

# 다시 시작
docker-compose up -d
```

### 디버깅

**컨테이너 셸 접근:**
```bash
# 컨테이너 셸 접근
docker exec -it yestravel_postgres /bin/bash

# PostgreSQL 프로세스 확인
ps aux | grep postgres

# 디스크 사용량 확인
df -h
```

**네트워크 문제:**
```bash
# Docker 네트워크 목록
docker network ls

# 네트워크 검사
docker network inspect docker_default

# 다른 컨테이너에서 연결 테스트
docker run --rm --network docker_default alpine ping yestravel_postgres
```

Claude Code 사용자를 위한 안내:
- 개발 전에 항상 Docker 서비스를 시작하세요
- 편의를 위해 제공된 스크립트를 사용하세요
- 디버깅 문제에 대해서는 로그를 모니터링하세요
- 파괴적인 작업 전에 데이터를 백업하세요
- 프로덕션 배포에는 보안 모범 사례를 따르세요