import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { RepositoryProvider } from '@src/module/shared/transaction/repository.provider';
import { ProductTypeEnum } from '@src/module/backoffice/admin/admin.schema';
import {
  CreateHotelOrderInput,
  CreateHotelOrderOutput,
  GetTmpOrderInput,
  GetTmpOrderOutput,
} from './shop.order.dto';
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
}
