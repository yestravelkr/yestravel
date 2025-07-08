import { Column, Entity } from 'typeorm';
import { BusinessType } from '@src/module/backoffice/domain/social-media-platform.enum';
import { BaseEntity } from '@src/module/backoffice/domain/base.entity';

@Entity('business_info')
export class BusinessInfoEntity extends BaseEntity {
  @Column({
    name: 'business_type',
    type: 'enum',
    enum: BusinessType,
    nullable: true,
  })
  type?: BusinessType;

  @Column({
    name: 'registration_number',
    type: 'varchar',
    length: 20,
    nullable: true,
  })
  registrationNumber?: string;

  @Column({
    name: 'representative_name',
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  representativeName?: string;

  @Column({
    name: 'partner_id',
    nullable: false,
  })
  partnerId: string;
}
