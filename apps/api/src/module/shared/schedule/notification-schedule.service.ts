import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { RepositoryProvider } from '@src/module/shared/transaction/repository.provider';
import { SmtntService } from '@src/module/shared/notification/smtnt/smtnt.service';
import { ConfigProvider } from '@src/config';
import dayjs from 'dayjs';

/**
 * NotificationScheduleService - 알림톡 스케줄 발송 서비스
 *
 * 매일 정해진 시간에 조건에 맞는 주문을 조회하여 알림톡을 발송합니다.
 */
@Injectable()
export class NotificationScheduleService {
  private readonly logger = new Logger(NotificationScheduleService.name);
  private readonly CS_LINK = 'https://travelcs.channel.io/home';
  private readonly SHOP_URL = ConfigProvider.shopUrl;

  constructor(
    private readonly repositoryProvider: RepositoryProvider,
    private readonly smtntService: SmtntService
  ) {}

  /**
   * 매일 오전 9시: 체크인 3일 전 호텔 주문에 투숙 전 안내 알림톡 발송
   */
  @Cron('0 9 * * *', { name: 'hotel-pre-stay-guide', timeZone: 'Asia/Seoul' })
  async sendPreStayGuideAlimtalk(): Promise<void> {
    this.logger.log('[스케줄] 투숙 전 안내 알림톡 발송 시작');

    try {
      const targetDate = dayjs().add(3, 'day').format('YYYY-MM-DD');

      // 체크인 2일 전인 확정된 호텔 주문 조회
      const hotelOrders =
        await this.repositoryProvider.HotelOrderRepository.find({
          where: {
            checkInDate: targetDate,
            status: 'RESERVATION_CONFIRMED',
          },
        });

      this.logger.log(
        `[스케줄] 투숙 전 안내(D-3) 대상: ${hotelOrders.length}건 (체크인: ${targetDate})`
      );

      for (const order of hotelOrders) {
        await this.sendPreStayGuide(order);
      }

      this.logger.log('[스케줄] 투숙 전 안내 알림톡 발송 완료');
    } catch (error) {
      this.logger.error('[스케줄] 투숙 전 안내 알림톡 발송 실패', error);
    }
  }

  /**
   * 매일 오전 9시: 체크인 1일 전 호텔 주문에 체크인 리마인드 알림톡 발송
   */
  @Cron('0 9 * * *', {
    name: 'hotel-checkin-remind',
    timeZone: 'Asia/Seoul',
  })
  async sendCheckinRemindAlimtalk(): Promise<void> {
    this.logger.log('[스케줄] 체크인 리마인드 알림톡 발송 시작');

    try {
      const targetDate = dayjs().add(1, 'day').format('YYYY-MM-DD');

      const hotelOrders =
        await this.repositoryProvider.HotelOrderRepository.find({
          where: {
            checkInDate: targetDate,
            status: 'RESERVATION_CONFIRMED',
          },
        });

      this.logger.log(
        `[스케줄] 체크인 리마인드(D-1) 대상: ${hotelOrders.length}건 (체크인: ${targetDate})`
      );

      for (const order of hotelOrders) {
        await this.sendCheckinRemind(order);
      }

      this.logger.log('[스케줄] 체크인 리마인드 알림톡 발송 완료');
    } catch (error) {
      this.logger.error('[스케줄] 체크인 리마인드 알림톡 발송 실패', error);
    }
  }

  /**
   * 개별 주문에 투숙 전 안내 알림톡 발송
   */
  private async sendPreStayGuide(order: {
    id: number;
    customerName: string;
    customerPhone: string;
    orderNumber: string;
    productId: number;
    checkInDate: string | null;
  }): Promise<void> {
    try {
      const product = await this.repositoryProvider.ProductRepository.findOne({
        where: { id: order.productId },
        select: ['id', 'name'],
      });
      const productName = product?.name ?? '상품명 없음';
      const guideLink = `${this.SHOP_URL}/orders/${order.orderNumber}`;

      const message =
        `[예스트래블] 투숙 전 안내\n\n` +
        `안녕하세요, ${order.customerName} 고객님.\n\n` +
        `${productName}에서의 여행이 곧 시작됩니다.\n\n` +
        `★ 예약 정보\n` +
        `체크인: ${order.checkInDate}\n` +
        `상품명: ${productName}\n` +
        `주문번호: ${order.orderNumber}\n\n` +
        `★ 이용 가이드\n` +
        `아래 링크를 통해 주차, 조식 시간, 부대시설 이용 방법 등을 미리 확인해 보세요.\n` +
        `이용 가이드 확인: ${guideLink}\n\n` +
        `★ 고객센터 안내\n` +
        `여행 중 궁금한 점이나 도움이 필요하시면 고객센터로 문의해 주세요.\n` +
        `고객센터: ${this.CS_LINK}\n\n` +
        `즐거운 여행 되시길 바랍니다.\n` +
        `감사합니다.`;

      await this.smtntService.sendAlimtalk({
        phone: order.customerPhone,
        message,
        templateCode: 'SHOP_HOTEL_PRE_STAY_GUIDE',
        failedType: 'LMS',
        failedMessage: message,
      });

      this.logger.log(`투숙 전 안내 알림톡 발송 성공: orderId=${order.id}`);
    } catch (error) {
      this.logger.error(
        `투숙 전 안내 알림톡 발송 실패: orderId=${order.id}`,
        error
      );
    }
  }

  /**
   * 개별 주문에 체크인 리마인드 알림톡 발송 (D-1)
   */
  private async sendCheckinRemind(order: {
    id: number;
    customerName: string;
    customerPhone: string;
    orderNumber: string;
    productId: number;
    checkInDate: string | null;
  }): Promise<void> {
    try {
      const product = await this.repositoryProvider.ProductRepository.findOne({
        where: { id: order.productId },
        select: ['id', 'name'],
      });
      const productName = product?.name ?? '상품명 없음';

      const message =
        `[예스트래블] 체크인 리마인드\n\n` +
        `안녕하세요, ${order.customerName} 고객님.\n\n` +
        `내일 체크인 예정입니다.\n\n` +
        `★ 예약 정보\n` +
        `체크인: ${order.checkInDate}\n` +
        `상품명: ${productName}\n` +
        `주문번호: ${order.orderNumber}\n\n` +
        `★ 고객센터 안내\n` +
        `여행 중 궁금한 점이나 도움이 필요하시면 고객센터로 문의해 주세요.\n` +
        `고객센터: ${this.CS_LINK}\n\n` +
        `즐거운 여행 되세요!`;

      await this.smtntService.sendAlimtalk({
        phone: order.customerPhone,
        message,
        templateCode: 'SHOP_HOTEL_CHECKIN_REMIND',
        failedType: 'LMS',
        failedMessage: message,
      });

      this.logger.log(`체크인 리마인드 알림톡 발송 성공: orderId=${order.id}`);
    } catch (error) {
      this.logger.error(
        `체크인 리마인드 알림톡 발송 실패: orderId=${order.id}`,
        error
      );
    }
  }
}
