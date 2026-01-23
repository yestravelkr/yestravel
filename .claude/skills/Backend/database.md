---
name: database
description: 로컬 PostgreSQL 데이터베이스 접근 및 디버깅 가이드. Docker 컨테이너, psql 접속, 데이터 확인/수정.
keywords: [데이터베이스, PostgreSQL, psql, 디버깅, Docker, DB접속, 쿼리, 데이터확인, 데이터수정]
estimated_tokens: ~400
---

# 로컬 데이터베이스 접근 가이드

## 접속 정보

로컬 개발 환경의 PostgreSQL 접속 정보입니다.

| 항목 | 값 |
|------|-----|
| Host | `127.0.0.1` |
| Port | `54321` |
| Database | `yestravel` |
| Username | `postgres` |
| Password | `postgres` |

> 설정 파일: `apps/api/config/localdev.js`

## Docker 컨테이너

PostgreSQL은 Docker로 실행됩니다.

```bash
# Docker Compose 위치
cd docker

# 컨테이너 시작
docker-compose up -d

# 컨테이너 상태 확인
docker ps | grep yestravel-postgresql

# 컨테이너 로그 확인
docker logs yestravel-postgresql

# 컨테이너 중지
docker-compose down
```

> 설정 파일: `docker/docker-compose.yml`

## 데이터베이스 접속 방법

### 1. psql 직접 접속

```bash
# 로컬에서 psql로 접속
psql -h 127.0.0.1 -p 54321 -U postgres -d yestravel

# 패스워드 입력: postgres
```

### 2. Docker 컨테이너 내부에서 접속

```bash
# 컨테이너 bash 접속
docker exec -it yestravel-postgresql bash

# psql 접속
psql -U postgres -d yestravel
```

### 3. 환경변수로 패스워드 설정 (편의용)

```bash
PGPASSWORD=postgres psql -h 127.0.0.1 -p 54321 -U postgres -d yestravel
```

## 유용한 psql 명령어

```sql
-- 테이블 목록 확인
\dt

-- 특정 테이블 구조 확인
\d table_name

-- 데이터 조회
SELECT * FROM table_name LIMIT 10;

-- 데이터 수정
UPDATE table_name SET column = 'value' WHERE id = 1;

-- 데이터 삭제
DELETE FROM table_name WHERE id = 1;

-- 쿼리 실행 후 종료
\q
```

## 디버깅 시 활용

### 데이터 상태 확인

```sql
-- 특정 Entity 조회
SELECT * FROM "order" WHERE id = 'uuid-here';

-- 관계 데이터 확인 (JOIN)
SELECT o.*, p.*
FROM "order" o
JOIN "payment" p ON o.id = p.order_id
WHERE o.id = 'uuid-here';

-- 최근 생성된 데이터
SELECT * FROM "order" ORDER BY created_at DESC LIMIT 5;
```

### 테스트 데이터 초기화

```sql
-- 특정 테이블 데이터 삭제 (CASCADE 주의)
TRUNCATE TABLE table_name CASCADE;

-- 시퀀스 리셋
ALTER SEQUENCE table_name_id_seq RESTART WITH 1;
```

## 주의사항

- 로컬 개발용으로만 사용 (운영 DB 접근 금지)
- 데이터 수정 전 백업 권장
- Migration과 충돌하지 않도록 주의
- `CASCADE` 옵션 사용 시 연관 데이터 삭제됨
