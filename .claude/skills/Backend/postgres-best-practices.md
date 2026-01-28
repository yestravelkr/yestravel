---
name: postgres-best-practices
description: PostgreSQL 성능 최적화 베스트 프랙티스. 인덱스 설계, 쿼리 최적화, TypeORM 적용 방법.
keywords: [PostgreSQL, 인덱스, 쿼리최적화, TypeORM, 성능, Index, 커넥션풀, Upsert, Deadlock, FK]
estimated_tokens: ~1200
---

# PostgreSQL 베스트 프랙티스

TypeORM 기반 프로젝트를 위한 PostgreSQL 성능 최적화 가이드입니다.

## 1. 인덱스 설계 (CRITICAL)

### WHERE/JOIN 컬럼에 인덱스 추가

인덱스 없이 필터링하면 Full Table Scan 발생 → 대용량 테이블에서 100-1000배 느림

```typescript
// ❌ Bad: 인덱스 없음
@Entity('order')
export class OrderEntity {
  @Column()
  customerId: number; // WHERE customerId = ? 시 Full Scan
}

// ✅ Good: 인덱스 추가
@Entity('order')
export class OrderEntity {
  @Column()
  @Index('IDX_order_customer_id')
  customerId: number;
}
```

### 복합 인덱스 (Multi-Column Queries)

여러 컬럼으로 필터링할 때 개별 인덱스보다 복합 인덱스가 5-10배 빠름

```typescript
// ❌ Bad: 개별 인덱스 (Bitmap Scan 필요)
@Index('IDX_order_status')
status: string;

@Index('IDX_order_created_at')
createdAt: Date;

// ✅ Good: 복합 인덱스
@Entity('order')
@Index('IDX_order_status_created', ['status', 'createdAt'])
export class OrderEntity {
  @Column()
  status: string;

  @Column()
  createdAt: Date;
}
```

**컬럼 순서 규칙**: 등호(=) 조건 먼저, 범위(>, <) 조건 나중에

```sql
-- WHERE status = 'pending' AND created_at > '2024-01-01'
-- 인덱스: (status, created_at) ✅
-- 인덱스: (created_at, status) ❌
```

### Partial Index (조건부 인덱스)

특정 조건의 데이터만 인덱싱하여 인덱스 크기 감소

```typescript
// 삭제되지 않은 주문만 인덱싱
@Entity('order')
@Index('IDX_order_active_status', ['status'], {
  where: '"deleted_at" IS NULL'
})
export class OrderEntity {
  @Column()
  status: string;

  @DeleteDateColumn()
  deletedAt: Date;
}
```

## 2. Foreign Key 인덱스 (HIGH)

PostgreSQL은 FK 컬럼에 **자동으로 인덱스를 생성하지 않음** → JOIN/CASCADE 시 Full Scan

```typescript
// ❌ Bad: FK에 인덱스 없음
@Entity('order')
export class OrderEntity {
  @ManyToOne(() => CustomerEntity)
  @JoinColumn({ name: 'customer_id' })
  customer: CustomerEntity;
  // customer_id에 인덱스 없음 → JOIN 느림
}

// ✅ Good: FK 컬럼에 인덱스 추가
@Entity('order')
export class OrderEntity {
  @Column()
  @Index('IDX_order_customer_id')
  customerId: number;

  @ManyToOne(() => CustomerEntity)
  @JoinColumn({ name: 'customer_id' })
  customer: CustomerEntity;
}
```

**누락된 FK 인덱스 찾기** (SQL):
```sql
SELECT conrelid::regclass AS table_name, a.attname AS fk_column
FROM pg_constraint c
JOIN pg_attribute a ON a.attrelid = c.conrelid AND a.attnum = ANY(c.conkey)
WHERE c.contype = 'f'
  AND NOT EXISTS (
    SELECT 1 FROM pg_index i
    WHERE i.indrelid = c.conrelid AND a.attnum = ANY(i.indkey)
  );
```

> 상세: `postgres/schema-foreign-key-indexes.md`

## 3. 데이터 타입 선택 (HIGH)

| 용도 | Bad | Good | 이유 |
|------|-----|------|------|
| ID | `int` | `bigint` | 2.1B 오버플로우 방지 |
| 문자열 | `varchar(255)` | `text` 또는 `varchar` | 성능 동일, 유연성 |
| 시간 | `timestamp` | `timestamptz` | 타임존 정보 보존 |
| 금액 | `float` | `numeric(10,2)` | 정확한 소수점 연산 |
| Boolean | `varchar(5)` | `boolean` | 1바이트 vs 가변 |

```typescript
// ✅ Good: 적절한 데이터 타입
@Entity('product')
export class ProductEntity {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number;

  @Column({ type: 'text' })
  name: string;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  price: number;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
```

## 4. 커넥션 풀링 (CRITICAL)

PostgreSQL 연결은 비용이 큼 (1-3MB RAM/연결). 풀링 없으면 동시 접속 시 DB 다운.

### TypeORM 커넥션 풀 설정

```typescript
// apps/api/config/localdev.js
module.exports = {
  type: 'postgres',
  host: '127.0.0.1',
  port: 54321,
  // 커넥션 풀 설정
  extra: {
    max: 10,                    // 최대 연결 수 (CPU cores * 2 + 1)
    min: 2,                     // 최소 연결 수
    idleTimeoutMillis: 30000,   // 유휴 연결 타임아웃
    connectionTimeoutMillis: 5000,
  },
};
```

### 권장 풀 크기

```
최대 연결 수 = (CPU 코어 수 * 2) + 1
예: 4코어 서버 → max: 9
```

## 5. Upsert 패턴 (MEDIUM)

SELECT 후 INSERT/UPDATE는 Race Condition 발생 → `ON CONFLICT` 사용

```typescript
// ❌ Bad: Race Condition 발생
const existing = await repo.findOne({ where: { key: 'theme', userId } });
if (existing) {
  existing.value = 'dark';
  await repo.save(existing);
} else {
  await repo.save({ key: 'theme', userId, value: 'dark' });
}

// ✅ Good: Upsert (TypeORM)
await repo.upsert(
  { key: 'theme', userId, value: 'dark' },
  ['key', 'userId']  // conflict 컬럼
);

// 또는 QueryBuilder
await repo.createQueryBuilder()
  .insert()
  .values({ key: 'theme', userId, value: 'dark' })
  .orUpdate(['value'], ['key', 'userId'])
  .execute();
```

> 상세: `postgres/data-upsert.md`

## 6. Deadlock 방지 (MEDIUM-HIGH)

트랜잭션이 다른 순서로 락을 획득하면 Deadlock 발생

```typescript
// ❌ Bad: 순서 없이 업데이트
await manager.transaction(async (tx) => {
  await tx.update(Account, { id: 1 }, { balance: () => 'balance - 100' });
  await tx.update(Account, { id: 2 }, { balance: () => 'balance + 100' });
  // 동시에 다른 트랜잭션이 id:2 → id:1 순서로 실행하면 Deadlock!
});

// ✅ Good: ID 순서로 락 획득
await manager.transaction(async (tx) => {
  // 먼저 정렬된 순서로 락 획득
  await tx.createQueryBuilder()
    .select()
    .from(Account, 'a')
    .where('a.id IN (:...ids)', { ids: [1, 2] })
    .orderBy('a.id')
    .setLock('pessimistic_write')
    .getMany();

  // 이제 안전하게 업데이트
  await tx.update(Account, { id: 1 }, { balance: () => 'balance - 100' });
  await tx.update(Account, { id: 2 }, { balance: () => 'balance + 100' });
});
```

> 상세: `postgres/lock-deadlock-prevention.md`

## 7. 대량 데이터 처리 (MEDIUM)

### Batch Insert

개별 INSERT는 각각 트랜잭션 + 네트워크 왕복 → 대량 삽입 시 10-50배 느림

```typescript
// ❌ Bad: 개별 Insert
for (const item of items) {
  await repository.save(item);
}

// ✅ Good: Batch Insert
await repository.save(items); // TypeORM이 자동으로 배치 처리

// 또는 chunk로 나눠서
const chunkSize = 1000;
for (let i = 0; i < items.length; i += chunkSize) {
  const chunk = items.slice(i, i + chunkSize);
  await repository.save(chunk);
}
```

### Pagination (대량 조회)

OFFSET은 큰 값에서 비효율적 → Cursor 기반 페이지네이션 권장

```typescript
// ❌ Bad: OFFSET 기반 (느림)
const items = await repository.find({
  skip: 10000,
  take: 20,
});

// ✅ Good: Cursor 기반 (빠름)
const items = await repository.find({
  where: { id: MoreThan(lastId) },
  take: 20,
  order: { id: 'ASC' },
});
```

## 8. 쿼리 최적화 팁

### N+1 문제 해결

```typescript
// ❌ Bad: N+1 쿼리
const orders = await orderRepository.find();
for (const order of orders) {
  const customer = await customerRepository.findOne({ id: order.customerId });
}

// ✅ Good: JOIN으로 한 번에
const orders = await orderRepository.find({
  relations: ['customer'],
});
```

### SELECT 필드 제한

```typescript
// ❌ Bad: 모든 컬럼 조회
const orders = await orderRepository.find();

// ✅ Good: 필요한 컬럼만
const orders = await orderRepository.find({
  select: ['id', 'status', 'totalAmount'],
});
```

## 9. 디버깅: 실행 계획 확인

```sql
-- 쿼리 실행 계획 확인
EXPLAIN ANALYZE SELECT * FROM "order" WHERE customer_id = 123;

-- 결과 해석
-- Seq Scan: 전체 테이블 스캔 (인덱스 필요)
-- Index Scan: 인덱스 사용 (좋음)
-- Bitmap Index Scan: 여러 인덱스 조합 (괜찮음)
```

## 상세 Reference (Supabase)

상세한 SQL 예제와 설명은 `postgres/` 폴더 참조:

| 우선순위 | 카테고리 | 파일 Prefix | 영향도 |
|---------|---------|-------------|--------|
| 1 | Query Performance | `query-` | CRITICAL |
| 2 | Connection Management | `conn-` | CRITICAL |
| 3 | Security & RLS | `security-` | CRITICAL |
| 4 | Schema Design | `schema-` | HIGH |
| 5 | Concurrency & Locking | `lock-` | MEDIUM-HIGH |
| 6 | Data Access Patterns | `data-` | MEDIUM |
| 7 | Monitoring & Diagnostics | `monitor-` | LOW-MEDIUM |
| 8 | Advanced Features | `advanced-` | LOW |

예시: `postgres/query-missing-indexes.md`, `postgres/conn-pooling.md`

## 참고 자료

- [PostgreSQL Documentation](https://www.postgresql.org/docs/current/)
- [TypeORM Index Documentation](https://typeorm.io/indices)
- Supabase Postgres Best Practices (MIT License, by Supabase)