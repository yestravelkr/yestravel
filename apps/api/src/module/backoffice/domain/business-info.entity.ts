import { Column } from 'typeorm';
import { BusinessType } from '@src/module/backoffice/domain/social-media-platform.enum';
import { BaseEntity } from '@src/module/backoffice/domain/base.entity';

export class BusinessInfoEntity extends BaseEntity {
  @Column({
    name: 'business_type',
    type: 'enum',
    enum: BusinessType,
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
