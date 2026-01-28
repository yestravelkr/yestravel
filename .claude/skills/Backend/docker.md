---
name: Backend-docker
description: Docker 개발 환경 설정 가이드. PostgreSQL 컨테이너 관리.
keywords: [docker, docker-compose, postgresql, 컨테이너, 데이터베이스, 개발환경]
estimated_tokens: ~300
---

# Docker 설정 가이드

## 디렉토리 구조

```
docker/
├── docker-compose.yml       # Docker Compose 설정
├── startDocker.sh          # 시작 스크립트
└── postgresql/
    ├── Dockerfile          # PostgreSQL 이미지
    └── create-database.sql # DB 초기화
```

## 빠른 시작

```bash
cd docker
./startDocker.sh       # 또는 docker-compose up -d
```

## 서비스 관리

```bash
# 시작
docker-compose up -d
docker-compose up      # 로그 보며 시작

# 중지
docker-compose down
docker-compose down -v # 볼륨 포함 삭제 (데이터 삭제)

# 재시작
docker-compose restart
```

## PostgreSQL 접근

```bash
# 컨테이너 접속
docker exec -it yestravel_postgres psql -U postgres -d yestravel

# SQL 명령어 실행
docker exec yestravel_postgres psql -U postgres -d yestravel -c "SELECT version();"
```

## 일반적인 PostgreSQL 명령어

```sql
\l         -- 데이터베이스 목록
\dt        -- 테이블 목록
\d table   -- 테이블 설명
\q         -- 종료
```

## 백업/복원

```bash
# 백업
docker exec yestravel_postgres pg_dump -U postgres yestravel > backup.sql

# 복원
docker exec -i yestravel_postgres psql -U postgres -d yestravel < backup.sql
```

## 문제 해결

### 포트 충돌

```bash
lsof -i :5432                    # 5432 포트 사용 프로세스 확인
sudo kill -9 $(lsof -t -i:5432)  # 프로세스 종료
```

### 데이터베이스 재설정

```bash
docker-compose down -v  # 볼륨 삭제
docker-compose up -d    # 재시작
sleep 10
cd ../apps/api && yarn migration:run
```

### 연결 확인

```bash
docker ps | grep postgres                              # 컨테이너 확인
docker exec yestravel_postgres pg_isready -U postgres  # 연결 테스트
```
