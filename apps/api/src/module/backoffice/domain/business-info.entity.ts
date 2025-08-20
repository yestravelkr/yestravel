import { Column } from 'typeorm';
import { BusinessType, BUSINESS_TYPE_ENUM } from '@src/module/backoffice/admin/admin.schema';

export class BusinessInfoEntity {
  @Column({
    name: 'business_type',
    type: 'enum',
    enum: BUSINESS_TYPE_ENUM,
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
