---
title: Entity 상속 패턴 (Single Table Inheritance)
estimated_tokens: ~400
---

# Entity 상속 패턴

## Single Table Inheritance (STI)

YesTravel에서는 **Single Table Inheritance** 패턴을 사용합니다.

### 부모 Entity

```typescript
// apps/api/src/module/backoffice/domain/product/product.entity.ts
@Entity('product')
@TableInheritance({ column: { type: 'varchar', name: 'type' } })
export class ProductEntity extends BaseEntity {
  @Column({
    type: 'enum',
    enum: PRODUCT_TYPE_ENUM_VALUE,
  })
  type: ProductTypeEnumType;

  @Column()
  name: string;

  @Column()
  price: number;
}
```

### 자식 Entity

```typescript
// apps/api/src/module/backoffice/domain/product/travel-product.entity.ts
@ChildEntity(ProductTypeEnum.TRAVEL)
export class TravelProductEntity extends ProductEntity {
  @Column({ name: 'destination', type: 'varchar' })
  destination: string;

  @Column({ name: 'duration_days', type: 'integer' })
  durationDays: number;
}

// apps/api/src/module/backoffice/domain/product/leisure-product.entity.ts
@ChildEntity(ProductTypeEnum.LEISURE)
export class LeisureProductEntity extends ProductEntity {
  @Column({ name: 'location', type: 'varchar' })
  location: string;

  @Column({ name: 'capacity', type: 'integer' })
  capacity: number;
}
```

## Migration 패턴

```typescript
// 단일 테이블에 모든 컬럼 포함
await queryRunner.query(`
  CREATE TABLE "product" (
    "id" SERIAL PRIMARY KEY,
    "type" varchar NOT NULL,
    "name" varchar NOT NULL,
    "price" integer NOT NULL,
    -- Travel 전용 컬럼
    "destination" varchar,
    "duration_days" integer,
    -- Leisure 전용 컬럼
    "location" varchar,
    "capacity" integer,
    "created_at" TIMESTAMP DEFAULT now(),
    "updated_at" TIMESTAMP DEFAULT now(),
    "deleted_at" TIMESTAMP
  )
`);
```

## Repository 사용

```typescript
// 부모 Repository - 모든 타입 조회
const allProducts = await this.repositoryProvider.ProductRepository.find();

// 자식 Repository - 특정 타입만 조회
const travelProducts = await this.repositoryProvider.TravelProductRepository.find();
const leisureProducts = await this.repositoryProvider.LeisureProductRepository.find();
```

## 타입별 Entity 생성

```typescript
// Service에서 타입별 분기
async createProduct(dto: CreateProductDto) {
  switch (dto.type) {
    case ProductTypeEnum.TRAVEL:
      return this.repositoryProvider.TravelProductRepository.save({
        ...dto,
        destination: dto.destination,
        durationDays: dto.durationDays,
      });
    case ProductTypeEnum.LEISURE:
      return this.repositoryProvider.LeisureProductRepository.save({
        ...dto,
        location: dto.location,
        capacity: dto.capacity,
      });
    default:
      throw new BadRequestException('Unknown product type');
  }
}
```

## 주의사항

- 자식 Entity 전용 컬럼은 nullable로 설정 (다른 타입에는 값이 없음)
- `@ChildEntity()` 데코레이터에 타입 값 명시
- 부모 Entity의 `type` 컬럼으로 구분

## 참고 파일

- Product Entity: `apps/api/src/module/backoffice/domain/product/`
- Order Entity: `apps/api/src/module/backoffice/domain/order/`
