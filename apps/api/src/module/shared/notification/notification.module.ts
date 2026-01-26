import { Module } from '@nestjs/common';
import { SmtntService } from './smtnt/smtnt.service';

/**
 * NotificationModule - 알림 발송 모듈
 *
 * 알림톡, SMS 등 알림 발송 서비스를 제공합니다.
 */
@Module({
  providers: [SmtntService],
  exports: [SmtntService],
})
export class NotificationModule {}
