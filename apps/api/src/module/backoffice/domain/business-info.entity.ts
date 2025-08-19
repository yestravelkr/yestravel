import { Column } from 'typeorm';

// Business type as string literal union
type BusinessType = 'CORPORATION' | 'SOLE_PROPRIETOR' | 'INDIVIDUAL';

export class BusinessInfoEntity {
  @Column({
    name: 'business_type',
    type: 'enum',
    enum: ['CORPORATION', 'SOLE_PROPRIETOR', 'INDIVIDUAL'],
    nullable: true,
  })
  type?: BusinessType;

  @Column({
    name: 'name',
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  name?: string;

  @Column({
    name: 'license_number',
    type: 'varchar',
    length: 30,
    nullable: true,
  })
  licenseNumber?: string;

  @Column({
    name: 'ceo_name',
    type: 'varchar',
    length: 20,
    nullable: true,
  })
  ceoName?: string;
}
