import {Column, Entity, EntityManager, PrimaryGeneratedColumn} from "typeorm";
import * as bcrypt from "bcrypt";
import {TransactionService} from "@src/module/shared/transaction/transaction.service";
import {getEntityManager} from "@src/database/datasources";

@Entity('admin')
export class AdminEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 64, unique: true })
  email: string;

  @Column({ type: 'varchar'})
  password: string;


  async setPassword(plainPassword: string): Promise<void> {
    this.password = await bcrypt.hash(plainPassword, 10);
  }

  async checkPassword(plainPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, this.password);
  }

}

export const getAdminRepository = (source?: TransactionService | EntityManager) => getEntityManager(source).getRepository(AdminEntity).extend({
  async register(email: string, password: string): Promise<AdminEntity> {
    const admin = new AdminEntity();
    admin.email = email;
    await admin.setPassword(password);
    return this.save(admin);
  },
});