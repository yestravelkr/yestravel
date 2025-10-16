import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  EntityManager,
} from 'typeorm';
import { Nullish } from '@src/types/utility.type';
import { TransactionService } from '@src/module/shared/transaction/transaction.service';
import { getEntityManager } from '@src/database/datasources';

/**
 * 계층형 카테고리 엔티티
 *
 * 예시 구조:
 * [호텔 카테고리]
 * - 호텔 (id: 1, name: '호텔', productType: 'HOTEL', parentId: null, level: 0)
 *   ├── 국내호텔 (id: 2, name: '국내호텔', productType: 'HOTEL', parentId: 1, level: 1)
 *   │   ├── 제주도 (id: 3, name: '제주도', productType: 'HOTEL', parentId: 2, level: 2)
 *   │   └── 부산 (id: 4, name: '부산', productType: 'HOTEL', parentId: 2, level: 2)
 *   └── 해외호텔 (id: 5, name: '해외호텔', productType: 'HOTEL', parentId: 1, level: 1)
 *
 * [배송상품 카테고리]
 * - 배송상품 (id: 6, name: '배송상품', productType: 'DELIVERY', parentId: null, level: 0)
 *   ├── 식품 (id: 7, name: '식품', productType: 'DELIVERY', parentId: 6, level: 1)
 *   └── 생활용품 (id: 8, name: '생활용품', productType: 'DELIVERY', parentId: 6, level: 1)
 *
 * [e-ticket상품 카테고리]
 * - e-ticket상품 (id: 9, name: 'e-ticket상품', productType: 'E-TICKET', parentId: null, level: 0)
 */
@Entity('categories')
export class CategoryEntity {
  /** 카테고리 고유 ID */
  @PrimaryGeneratedColumn()
  id: number;

  /** 상위 카테고리 ID (null이면 최상위 카테고리) */
  @Column({ type: 'int', nullable: true })
  parentId: Nullish<number>;

  /** 카테고리 이름 (예: '호텔', '국내호텔', '제주도') */
  @Column({ type: 'varchar', length: 255 })
  name: string;

  /** 상품 타입 구분 (PRODUCT_TYPE_ENUM_VALUE: 'HOTEL', 'DELIVERY', 'E-TICKET') */
  @Column({ type: 'varchar', length: 50 })
  productType: string;

  /** 계층 깊이 (0: 최상위, 1: 2단계, 2: 3단계...) */
  @Column({ type: 'int', default: 0 })
  level: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Nullish<Date>;

  /** 상위 카테고리 관계 (자기 참조) */
  @ManyToOne(() => CategoryEntity, category => category.children, {
    nullable: true,
  })
  @JoinColumn({ name: 'parent_id' })
  parent: Nullish<CategoryEntity>;

  /** 하위 카테고리 목록 (자기 참조) */
  @OneToMany(() => CategoryEntity, category => category.parent)
  children: CategoryEntity[];
}

export const getCategoryRepository = (
  source?: TransactionService | EntityManager
) => getEntityManager(source).getRepository(CategoryEntity);
