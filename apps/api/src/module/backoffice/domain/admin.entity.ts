import { LoginEntity } from '@src/module/backoffice/domain/login-entity';
import { Entity } from 'typeorm';

@Entity('admin')
export class AdminEntity extends LoginEntity {}
