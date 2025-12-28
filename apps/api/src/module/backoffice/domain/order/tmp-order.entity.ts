import {OrderEntity} from "@src/module/backoffice/domain/order/order.entity";
import {Entity, EntityManager} from "typeorm";
import {TransactionService} from "@src/module/shared/transaction/transaction.service";
import {getEntityManager} from "@src/database/datasources";


@Entity('tmp_order')
export class TmpOrderEntity extends OrderEntity {}

export const getTmpOrderRepository = (source?: TransactionService | EntityManager) =>
  getEntityManager(source).getRepository(TmpOrderEntity);
