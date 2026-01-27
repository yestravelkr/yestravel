import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import dayjs from 'dayjs';
import { RepositoryProvider } from '@src/module/shared/transaction/repository.provider';
import { ProductTypeEnum } from '@src/module/backoffice/admin/admin.schema';
import {
  CreateHotelOrderInput,
  CreateHotelOrderOutput,
  GetTmpOrderInput,
  GetTmpOrderOutput,
  UpdateTmpOrderInput,
  UpdateTmpOrderOutput,
  GetOrderDetailInput,
  GetOrderDetailOutput,
  GetMyOrdersInput,
  GetMyOrdersOutput,
} from './shop.order.dto';
import {
  OrderStatusEnumType,
  OrderStatusEnum,
} from '@src/module/backoffice/domain/order/order.entity';
import { CampaignInfluencerProductEntity } from '@src/module/backoffice/domain/campaign-influencer-product.entity';
import { HotelOptionEntity } from '@src/module/backoffice/domain/product/hotel-option.entity';
import { HotelSkuEntity } from '@src/module/backoffice/domain/product/hotel-sku.entity';
import { HotelOrderOptionData } from '@src/module/backoffice/domain/order/hotel-order.entity';
import { TmpOrderRawData } from '@src/module/backoffice/domain/order/tmp-order.entity';
import { orderNumberParser } from '@src/module/backoffice/domain/order/order.entity';
import {
  HotelOptionSelector,
  HotelOptionSelectorConfig,
} from '@yestravelkr/option-selector';

interface SaleInfo {
  campaignInfluencerProduct: CampaignInfluencerProductEntity;
  productId: number;
  campaignId: number;
  influencerId: number;
}

interface HotelPriceResult {
  totalPrice: number;
  priceByDate: Record<string, number>;
}

@Injectable()
export class ShopOrderService {
  constructor(private readonly repositoryProvider: RepositoryProvider) {}

  async createHotelOrder(
    input: CreateHotelOrderInput
  ): Promise<CreateHotelOrderOutput> {
    const { saleId, checkInDate, checkOutDate, optionId } = input;

    // 1. saleId 기반으로 campaign, product, influencer 가져옴
    const saleInfo = await this.getSaleInfo(saleId);

    // 2. product가 hotel 타입이 맞는지 검증
    this.validateHotelProduct(saleInfo.campaignInfluencerProduct.product.type);

    // 3. option이 해당 product에 해당하는 option인지 검증
    const hotelOption = await this.getValidatedHotelOption(
      optionId,
      saleInfo.productId
    );

    // 4. 남은 재고 수량 확인
    await this.validateHotelSkuQuantity(
      saleInfo.productId,
      checkInDate,
      checkOutDate
    );

    // 5. HotelOptionSelector로 해당 옵션, checkInDate, checkOutDate로 가격 조회
    const priceResult = await this.calculateHotelPrice(
      saleInfo.productId,
      optionId,
      checkInDate,
      checkOutDate
    );

    // 6. TmpOrderEntity 생성 후 저장
    const orderOptionSnapshot: HotelOrderOptionData = {
      type: 'HOTEL',
      checkInDate,
      checkOutDate,
      hotelOptionId: optionId,
      hotelOptionName: hotelOption.name,
      priceByDate: priceResult.priceByDate,
    };

    const raw: TmpOrderRawData = {
      customerName: '',
      customerPhone: '',
      productId: saleInfo.productId,
      totalAmount: priceResult.totalPrice,
      influencerId: saleInfo.influencerId,
      campaignId: saleInfo.campaignId,
      orderOptionSnapshot,
    };

    const tmpOrder = this.repositoryProvider.TmpOrderRepository.create({
      type: ProductTypeEnum.HOTEL,
      raw,
    });

    const savedTmpOrder =
      await this.repositoryProvider.TmpOrderRepository.save(tmpOrder);
    const orderNumber = orderNumberParser.encode(
      [savedTmpOrder.id],
      savedTmpOrder.createdAt
    );

    return { orderNumber };
  }

  /**
   * 임시 주문 조회
   */
  async getTmpOrder(input: GetTmpOrderInput): Promise<GetTmpOrderOutput> {
    const { orderNumber } = input;
    const [orderId] = orderNumberParser.decode(orderNumber);

    if (!orderId) {
      throw new BadRequestException(
        `유효하지 않은 주문번호입니다 (orderNumber: ${orderNumber})`
      );
    }

    const tmpOrder = await this.repositoryProvider.TmpOrderRepository.findOne({
      where: { id: orderId },
    });

    if (!tmpOrder) {
      throw new NotFoundException(
        `주문을 찾을 수 없습니다 (orderNumber: ${orderNumber})`
      );
    }

    const hotelProduct =
      await this.repositoryProvider.HotelProductRepository.findOne({
        where: { id: tmpOrder.raw.productId, type: ProductTypeEnum.HOTEL },
      });

    if (!hotelProduct) {
      throw new NotFoundException(
        `상품을 찾을 수 없습니다 (productId: ${tmpOrder.raw.productId})`
      );
    }

    return {
      type: tmpOrder.type,
      totalAmount: tmpOrder.raw.totalAmount,
      product: {
        name: hotelProduct.name,
        thumbnailUrl: hotelProduct.thumbnailUrls[0] ?? null,
        checkInTime: hotelProduct.checkInTime ?? '15:00:00',
        checkOutTime: hotelProduct.checkOutTime ?? '11:00:00',
      },
      orderOptionSnapshot: tmpOrder.raw.orderOptionSnapshot,
    };
  }

  /**
   * 임시 주문 정보 업데이트 (고객 정보)
   */
  async updateTmpOrder(
    input: UpdateTmpOrderInput
  ): Promise<UpdateTmpOrderOutput> {
    const { orderNumber, customerName, customerPhone } = input;
    const [orderId] = orderNumberParser.decode(orderNumber);

    if (!orderId) {
      throw new BadRequestException(
        `유효하지 않은 주문번호입니다 (orderNumber: ${orderNumber})`
      );
    }

    const tmpOrder = await this.repositoryProvider.TmpOrderRepository.findOne({
      where: { id: orderId },
    });

    if (!tmpOrder) {
      throw new NotFoundException(
        `주문을 찾을 수 없습니다 (orderNumber: ${orderNumber})`
      );
    }

    // raw 데이터 업데이트
    tmpOrder.raw = {
      ...tmpOrder.raw,
      customerName,
      customerPhone,
    };

    await this.repositoryProvider.TmpOrderRepository.save(tmpOrder);

    return {
      success: true,
      customerName,
      customerPhone,
    };
  }

  /**
   * saleId로 CampaignInfluencerProduct 조회 및 관련 정보 추출
   */
  private async getSaleInfo(saleId: number): Promise<SaleInfo> {
    const campaignInfluencerProduct =
      await this.repositoryProvider.CampaignInfluencerProductRepository.findOne(
        {
          where: { id: saleId },
          relations: [
            'campaignInfluencer',
            'campaignInfluencer.campaign',
            'campaignInfluencer.influencer',
            'product',
          ],
        }
      );

    if (!campaignInfluencerProduct) {
      throw new NotFoundException(
        `판매 상품을 찾을 수 없습니다 (saleId: ${saleId})`
      );
    }

    const { campaignInfluencer, product } = campaignInfluencerProduct;

    return {
      campaignInfluencerProduct,
      productId: product.id,
      campaignId: campaignInfluencer.campaign.id,
      influencerId: campaignInfluencer.influencer.id,
    };
  }

  /**
   * 상품이 호텔 타입인지 검증
   */
  private validateHotelProduct(productType: string): void {
    if (productType !== ProductTypeEnum.HOTEL) {
      throw new BadRequestException('호텔 타입 상품만 주문할 수 있습니다');
    }
  }

  /**
   * 호텔 옵션이 해당 상품에 속하는지 검증 후 반환
   */
  private async getValidatedHotelOption(
    optionId: number,
    productId: number
  ): Promise<HotelOptionEntity> {
    const hotelOption =
      await this.repositoryProvider.HotelOptionRepository.findOne({
        where: { id: optionId, productId },
      });

    if (!hotelOption) {
      throw new BadRequestException(
        `유효하지 않은 호텔 옵션입니다 (optionId: ${optionId})`
      );
    }

    return hotelOption;
  }

  /**
   * 체크인~체크아웃 기간 동안 재고 수량 검증
   */
  private async validateHotelSkuQuantity(
    productId: number,
    checkInDate: string,
    checkOutDate: string
  ): Promise<void> {
    const skus = await this.getHotelSkusInRange(
      productId,
      checkInDate,
      checkOutDate
    );

    // 체크인부터 체크아웃 전날까지 모든 날짜에 재고가 있어야 함
    const requiredDates = this.getDateRange(checkInDate, checkOutDate);

    for (const date of requiredDates) {
      const sku = skus.find(s => s.date === date);
      if (!sku || sku.quantity <= 0) {
        throw new BadRequestException(`${date} 날짜에 재고가 없습니다`);
      }
    }
  }

  /**
   * 호텔 가격 계산 (HotelOptionSelector 사용)
   */
  private async calculateHotelPrice(
    productId: number,
    optionId: number,
    checkInDate: string,
    checkOutDate: string
  ): Promise<HotelPriceResult> {
    // 호텔 옵션과 SKU 조회
    const [hotelOptions, hotelSkus] = await Promise.all([
      this.repositoryProvider.HotelOptionRepository.find({
        where: { productId },
      }),
      this.repositoryProvider.HotelSkuRepository.find({ where: { productId } }),
    ]);

    const config: HotelOptionSelectorConfig = {
      hotelOptions: hotelOptions.map(opt => ({
        id: opt.id,
        name: opt.name,
        priceByDate: opt.priceByDate,
      })),
      skus: hotelSkus.map(sku => ({
        id: sku.id,
        quantity: sku.quantity,
        date: sku.date,
      })),
    };

    const selector = HotelOptionSelector.fromJSON(config, {
      checkInDate,
      checkOutDate,
      selectedHotelOptionId: optionId,
    });

    // 선택된 옵션의 priceByDate에서 숙박 기간만 추출
    const selectedOption = hotelOptions.find(opt => opt.id === optionId);
    const stayDates = this.getDateRange(checkInDate, checkOutDate);
    const priceByDate: Record<string, number> = {};

    for (const date of stayDates) {
      priceByDate[date] = selectedOption?.priceByDate[date] ?? 0;
    }

    return {
      totalPrice: selector.getTotalPrice(),
      priceByDate,
    };
  }

  /**
   * 특정 기간의 호텔 SKU 조회
   */
  private async getHotelSkusInRange(
    productId: number,
    checkInDate: string,
    checkOutDate: string
  ): Promise<HotelSkuEntity[]> {
    const requiredDates = this.getDateRange(checkInDate, checkOutDate);

    return this.repositoryProvider.HotelSkuRepository.createQueryBuilder('sku')
      .where('sku.productId = :productId', { productId })
      .andWhere('sku.date IN (:...dates)', { dates: requiredDates })
      .getMany();
  }

  /**
   * 체크인부터 체크아웃 전날까지의 날짜 배열 생성
   */
  private getDateRange(checkInDate: string, checkOutDate: string): string[] {
    const dates: string[] = [];
    const currentDate = new Date(checkInDate);
    const endDate = new Date(checkOutDate);

    while (currentDate < endDate) {
      dates.push(currentDate.toISOString().split('T')[0]);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return dates;
  }

  /**
   * 실제 주문 상세 조회
   */
  async getOrderDetail(
    input: GetOrderDetailInput
  ): Promise<GetOrderDetailOutput> {
    const { orderNumber } = input;
    const [orderId] = orderNumberParser.decode(orderNumber);

    if (!orderId) {
      throw new BadRequestException(
        `유효하지 않은 주문번호입니다 (orderNumber: ${orderNumber})`
      );
    }

    const order = await this.repositoryProvider.OrderRepository.findOne({
      where: { id: orderId },
      relations: ['payments'],
    });

    if (!order) {
      throw new NotFoundException(
        `주문을 찾을 수 없습니다 (orderNumber: ${orderNumber})`
      );
    }

    const [hotelProduct, influencer] = await Promise.all([
      this.repositoryProvider.HotelProductRepository.findOne({
        where: { id: order.productId, type: ProductTypeEnum.HOTEL },
      }),
      this.repositoryProvider.InfluencerRepository.findOne({
        where: { id: order.influencerId },
      }),
    ]);

    if (!hotelProduct) {
      throw new NotFoundException(
        `상품을 찾을 수 없습니다 (productId: ${order.productId})`
      );
    }

    return {
      type: 'accommodation',
      orderId: order.id,
      orderNumber: order.orderNumber,
      orderDate: this.formatOrderDate(order.createdAt),
      status: this.mapOrderStatusToFrontend(order.status),
      statusDescription: null,
      influencerSlug: influencer?.slug ?? null,
      accommodation: {
        thumbnail: hotelProduct.thumbnailUrls[0] ?? null,
        hotelName: hotelProduct.name,
        roomName: hotelProduct.name,
        optionName: order.orderOptionSnapshot.hotelOptionName,
      },
      checkIn: {
        date: this.formatDateWithDay(order.orderOptionSnapshot.checkInDate),
        time: this.formatTime(hotelProduct.checkInTime ?? '15:00:00'),
      },
      checkOut: {
        date: this.formatDateWithDay(order.orderOptionSnapshot.checkOutDate),
        time: this.formatTime(hotelProduct.checkOutTime ?? '11:00:00'),
      },
      user: {
        name: order.customerName,
        phone: order.customerPhone,
      },
      payment: {
        totalAmount: order.totalAmount,
        productAmount: order.totalAmount,
        paymentMethod: this.getPaymentMethod(order.payments),
      },
    };
  }

  /**
   * 주문 생성일시 포맷팅 ("25.01.01 13:00")
   */
  private formatOrderDate(date: Date): string {
    return dayjs(date).format('YY.MM.DD HH:mm');
  }

  /**
   * 날짜를 요일 포함 형식으로 포맷팅 ("25.12.10(금)")
   */
  private formatDateWithDay(dateStr: string): string {
    const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
    const d = dayjs(dateStr);
    const dayOfWeek = weekdays[d.day()];
    return `${d.format('YY.MM.DD')}(${dayOfWeek})`;
  }

  /**
   * 시간 문자열에서 초 제거 ("15:00:00" -> "15:00")
   */
  private formatTime(timeStr: string): string {
    const parts = timeStr.split(':');
    return `${parts[0]}:${parts[1]}`;
  }

  /**
   * 백엔드 주문 상태를 프론트엔드 상태로 매핑
   */
  private mapOrderStatusToFrontend(status: OrderStatusEnumType): string {
    const statusMap: Record<OrderStatusEnumType, string> = {
      [OrderStatusEnum.PENDING]: 'PENDING_PAYMENT',
      [OrderStatusEnum.PAID]: 'RESERVATION_CONFIRMED',
      [OrderStatusEnum.COMPLETED]: 'COMPLETED',
      [OrderStatusEnum.CANCELLED]: 'CANCELLED',
      [OrderStatusEnum.REFUNDED]: 'CANCELLED',
    };
    return statusMap[status] ?? status;
  }

  /**
   * 주문 상태에 대한 설명 텍스트 반환
   */
  private getStatusDescription(status: OrderStatusEnumType): string | null {
    const descriptionMap: Record<OrderStatusEnumType, string | null> = {
      [OrderStatusEnum.PENDING]: null,
      [OrderStatusEnum.PAID]: null,
      [OrderStatusEnum.COMPLETED]: null,
      [OrderStatusEnum.CANCELLED]: null,
      [OrderStatusEnum.REFUNDED]: null,
    };
    return descriptionMap[status] ?? null;
  }

  /**
   * 결제 수단 추출 (pgRawData에서 실제 결제 수단 확인)
   * PortOne v2 API 응답 구조 기준
   */
  private getPaymentMethod(
    payments:
      | { pgProvider: string; pgRawData?: Record<string, any> | null }[]
      | undefined
  ): string {
    if (!payments || payments.length === 0) {
      return '미결제';
    }

    const payment = payments[0];
    const rawData = payment.pgRawData;

    if (!rawData) {
      return '카드결제';
    }

    // PortOne v2 응답 구조: method.type, method.provider
    const method = rawData.method;
    if (method) {
      // 간편결제인 경우 (method.provider에 NAVERPAY, KAKAOPAY 등)
      if (method.provider) {
        const easyPayMap: Record<string, string> = {
          KAKAOPAY: '카카오페이',
          NAVERPAY: '네이버페이',
          TOSSPAY: '토스페이',
          PAYCO: '페이코',
          SAMSUNGPAY: '삼성페이',
          APPLEPAY: '애플페이',
        };
        return easyPayMap[method.provider] ?? method.provider;
      }

      // 일반 결제 수단 타입으로 판단
      const methodType = method.type;
      if (methodType) {
        const methodTypeMap: Record<string, string> = {
          PaymentMethodCard: '신용카드',
          PaymentMethodVirtualAccount: '무통장입금',
          PaymentMethodTransfer: '계좌이체',
          PaymentMethodMobile: '휴대폰결제',
          PaymentMethodEasyPay: '간편결제',
        };
        return methodTypeMap[methodType] ?? '카드결제';
      }
    }

    return '카드결제';
  }

  /**
   * 내 주문내역 조회
   */
  async getMyOrders(
    memberId: number,
    input: GetMyOrdersInput
  ): Promise<GetMyOrdersOutput> {
    const { offset = 0, limit = 20 } = input;

    const [orders, total] =
      await this.repositoryProvider.OrderRepository.findAndCount({
        where: { memberId },
        relations: ['product', 'influencer'],
        order: { createdAt: 'DESC' },
        skip: offset,
        take: limit,
      });

    const orderItems = await Promise.all(
      orders.map(async order => {
        // saleId(CampaignInfluencerProduct) 조회
        const sale =
          await this.repositoryProvider.CampaignInfluencerProductRepository.findOne(
            {
              where: {
                productId: order.productId,
                campaignInfluencer: {
                  influencerId: order.influencerId,
                  campaignId: order.campaignId,
                },
              },
              relations: ['campaignInfluencer'],
            }
          );

        const baseFields = {
          orderId: order.id,
          orderNumber: order.orderNumber,
          orderDate: this.formatOrderDate(order.createdAt),
          status: this.mapOrderStatusToFrontend(order.status),
          statusDescription: this.getStatusDescription(order.status),
          totalAmount: order.totalAmount,
          influencerSlug: order.influencer?.slug ?? '',
          saleId: sale?.id ?? 0,
        };

        // 호텔 상품인 경우
        if (order.type === ProductTypeEnum.HOTEL) {
          const hotelProduct =
            await this.repositoryProvider.HotelProductRepository.findOne({
              where: { id: order.productId, type: ProductTypeEnum.HOTEL },
            });

          return {
            ...baseFields,
            type: 'HOTEL' as const,
            accommodation: {
              thumbnail: hotelProduct?.thumbnailUrls[0] ?? null,
              hotelName: hotelProduct?.name ?? '',
              roomName: hotelProduct?.name ?? '',
              optionName: order.orderOptionSnapshot.hotelOptionName,
            },
            checkIn: {
              date: this.formatDateWithDay(
                order.orderOptionSnapshot.checkInDate
              ),
              time: this.formatTime(hotelProduct?.checkInTime ?? '15:00:00'),
            },
            checkOut: {
              date: this.formatDateWithDay(
                order.orderOptionSnapshot.checkOutDate
              ),
              time: this.formatTime(hotelProduct?.checkOutTime ?? '11:00:00'),
            },
          };
        }

        // 배송 상품인 경우 (TODO: 배송 상품 정보 조회 구현)
        return {
          ...baseFields,
          type: 'DELIVERY' as const,
          products: [],
        };
      })
    );

    return {
      orders: orderItems,
      total,
      hasMore: offset + limit < total,
    };
  }
}
