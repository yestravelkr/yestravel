import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { CampaignService } from './campaign.service';
import { RepositoryProvider } from '@src/module/shared/transaction/repository.provider';
import type { CreateCampaignInput, UpdateCampaignInput } from './campaign.type';

// ===== Mock Repositories =====

const mockCampaignRepository = {
  find: jest.fn(),
  findOneByOrFail: jest.fn(),
  create: jest.fn((data: Record<string, unknown>) => ({ ...data })),
  save: jest.fn((entity: Record<string, unknown>) =>
    Promise.resolve({
      id: 1,
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-01-01'),
      ...entity,
    })
  ),
  softRemove: jest.fn(),
};

const mockCampaignProductRepository = {
  find: jest.fn(),
  create: jest.fn((data: Record<string, unknown>) => ({ ...data })),
  save: jest.fn((entity: unknown) => {
    if (Array.isArray(entity)) return Promise.resolve(entity);
    return Promise.resolve({ id: 1, ...(entity as Record<string, unknown>) });
  }),
  delete: jest.fn(),
};

const mockCampaignInfluencerRepository = {
  find: jest.fn(),
  create: jest.fn((data: Record<string, unknown>) => ({ ...data })),
  save: jest.fn((entity: Record<string, unknown>) =>
    Promise.resolve({ ...entity })
  ),
  delete: jest.fn(),
};

const mockCampaignInfluencerProductRepository = {
  create: jest.fn((data: Record<string, unknown>) => ({ ...data })),
  save: jest.fn((entity: Record<string, unknown>) =>
    Promise.resolve({ id: 1, ...entity })
  ),
  createQueryBuilder: jest.fn(),
};

const mockCampaignInfluencerHotelOptionRepository = {
  create: jest.fn((data: Record<string, unknown>) => ({ ...data })),
  save: jest.fn((entities: unknown) => Promise.resolve(entities)),
  createQueryBuilder: jest.fn(),
};

const mockProductRepository = {
  validateExistsByIds: jest.fn(),
};

const mockInfluencerRepository = {
  validateExistsByIds: jest.fn(),
};

const mockCategoryRepository = {
  createQueryBuilder: jest.fn(),
};

// ===== Mock RepositoryProvider =====

const mockRepositoryProvider = {
  get CampaignRepository() {
    return mockCampaignRepository;
  },
  get CampaignProductRepository() {
    return mockCampaignProductRepository;
  },
  get CampaignInfluencerRepository() {
    return mockCampaignInfluencerRepository;
  },
  get CampaignInfluencerProductRepository() {
    return mockCampaignInfluencerProductRepository;
  },
  get CampaignInfluencerHotelOptionRepository() {
    return mockCampaignInfluencerHotelOptionRepository;
  },
  get ProductRepository() {
    return mockProductRepository;
  },
  get InfluencerRepository() {
    return mockInfluencerRepository;
  },
  get CategoryRepository() {
    return mockCategoryRepository;
  },
};

// ===== Helper: QueryBuilder mock chain =====

function createMockQueryBuilder(overrides: Record<string, unknown> = {}) {
  const qb: Record<string, jest.Mock> = {
    select: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    innerJoin: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    getMany: jest.fn().mockResolvedValue([]),
    getRawAndEntities: jest
      .fn()
      .mockResolvedValue({ raw: [], entities: [] }),
    execute: jest.fn().mockResolvedValue(undefined),
  };
  Object.assign(qb, overrides);
  // Make chainable methods return itself
  for (const key of Object.keys(qb)) {
    if (
      !['getMany', 'getRawAndEntities', 'execute'].includes(key) &&
      !overrides[key]
    ) {
      qb[key] = jest.fn().mockReturnValue(qb);
    }
  }
  return qb;
}

// ===== Helper: 응답 빌드에 필요한 mock 설정 =====

function setupResponseBuildMocks() {
  // CampaignProductRepository.find -> 빈 배열 (products 조회)
  mockCampaignProductRepository.find.mockResolvedValue([]);

  // CampaignInfluencerRepository.find -> 빈 배열 (influencers 조회)
  // NOTE: find는 create/update 내에서 여러 번 호출됨
  //  - deleteRelatedEntities에서 1번
  //  - 응답 빌드에서 1번
  mockCampaignInfluencerRepository.find.mockResolvedValue([]);

  // CategoryRepository.createQueryBuilder -> 빈 결과
  const categoryQb = createMockQueryBuilder();
  mockCategoryRepository.createQueryBuilder.mockReturnValue(categoryQb);

  // CampaignInfluencerProductRepository.createQueryBuilder -> 빈 결과
  const influencerProductQb = createMockQueryBuilder();
  mockCampaignInfluencerProductRepository.createQueryBuilder.mockReturnValue(
    influencerProductQb
  );

  // CampaignInfluencerHotelOptionRepository.createQueryBuilder -> 빈 결과
  const hotelOptionQb = createMockQueryBuilder();
  mockCampaignInfluencerHotelOptionRepository.createQueryBuilder.mockReturnValue(
    hotelOptionQb
  );
}

// ===== Test Suite =====

describe('CampaignService', () => {
  let service: CampaignService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CampaignService,
        {
          provide: RepositoryProvider,
          useValue: mockRepositoryProvider,
        },
      ],
    }).compile();

    service = module.get<CampaignService>(CampaignService);

    jest.clearAllMocks();
  });

  describe('create', () => {
    const baseInput: CreateCampaignInput = {
      title: '테스트 캠페인',
      startAt: new Date('2025-01-01'),
      endAt: new Date('2025-01-31'),
      description: '테스트 설명',
      thumbnail: null,
      products: [],
      influencers: [],
    };

    it('캠페인 생성 시 인플루언서의 호텔옵션 수수료가 저장되어야 한다', async () => {
      const commissionByDate = {
        '2025-01-15': 5000,
        '2025-01-16': 7000,
      };

      const input: CreateCampaignInput = {
        ...baseInput,
        influencers: [
          {
            influencerId: 10,
            periodType: 'DEFAULT',
            startAt: null,
            endAt: null,
            feeType: 'NONE',
            fee: null,
            status: 'VISIBLE',
            products: [
              {
                productId: 100,
                status: 'VISIBLE',
                useCustomCommission: true,
                hotelOptions: [
                  {
                    hotelOptionId: 200,
                    commissionByDate,
                  },
                ],
              },
            ],
          },
        ],
      };

      setupResponseBuildMocks();

      await service.create(input);

      // CampaignInfluencerHotelOptionRepository.create가 commissionByDate와 함께 호출되는지 검증
      expect(
        mockCampaignInfluencerHotelOptionRepository.create
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          hotelOptionId: 200,
          influencerId: 10,
          commissionByDate,
        })
      );

      // save가 호출되는지 검증
      expect(
        mockCampaignInfluencerHotelOptionRepository.save
      ).toHaveBeenCalled();
    });

    it('인플루언서 상품의 useCustomCommission이 저장되어야 한다', async () => {
      const input: CreateCampaignInput = {
        ...baseInput,
        influencers: [
          {
            influencerId: 10,
            periodType: 'DEFAULT',
            startAt: null,
            endAt: null,
            feeType: 'NONE',
            fee: null,
            status: 'VISIBLE',
            products: [
              {
                productId: 100,
                status: 'VISIBLE',
                useCustomCommission: true,
                hotelOptions: [],
              },
            ],
          },
        ],
      };

      setupResponseBuildMocks();

      await service.create(input);

      expect(
        mockCampaignInfluencerProductRepository.create
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          useCustomCommission: true,
        })
      );
    });

    it('인플루언서 상품의 status가 저장되어야 한다', async () => {
      const input: CreateCampaignInput = {
        ...baseInput,
        influencers: [
          {
            influencerId: 10,
            periodType: 'DEFAULT',
            startAt: null,
            endAt: null,
            feeType: 'NONE',
            fee: null,
            status: 'VISIBLE',
            products: [
              {
                productId: 100,
                status: 'HIDDEN',
                useCustomCommission: false,
                hotelOptions: [],
              },
            ],
          },
        ],
      };

      setupResponseBuildMocks();

      await service.create(input);

      expect(
        mockCampaignInfluencerProductRepository.create
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'HIDDEN',
        })
      );
    });

    it('hotelOptions가 빈 배열이면 호텔옵션을 생성하지 않아야 한다', async () => {
      const input: CreateCampaignInput = {
        ...baseInput,
        influencers: [
          {
            influencerId: 10,
            periodType: 'DEFAULT',
            startAt: null,
            endAt: null,
            feeType: 'NONE',
            fee: null,
            status: 'VISIBLE',
            products: [
              {
                productId: 100,
                status: 'VISIBLE',
                useCustomCommission: false,
                hotelOptions: [],
              },
            ],
          },
        ],
      };

      setupResponseBuildMocks();

      await service.create(input);

      expect(
        mockCampaignInfluencerHotelOptionRepository.create
      ).not.toHaveBeenCalled();
      expect(
        mockCampaignInfluencerHotelOptionRepository.save
      ).not.toHaveBeenCalled();
    });

    it('인플루언서가 없으면 인플루언서 관련 엔티티를 생성하지 않아야 한다', async () => {
      const input: CreateCampaignInput = {
        ...baseInput,
        influencers: [],
      };

      setupResponseBuildMocks();

      await service.create(input);

      expect(
        mockCampaignInfluencerRepository.create
      ).not.toHaveBeenCalled();
      expect(
        mockCampaignInfluencerProductRepository.create
      ).not.toHaveBeenCalled();
      expect(
        mockCampaignInfluencerHotelOptionRepository.create
      ).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    const baseUpdateInput: UpdateCampaignInput = {
      id: 1,
      title: '수정된 캠페인',
      startAt: new Date('2025-02-01'),
      endAt: new Date('2025-02-28'),
      description: '수정된 설명',
      thumbnail: null,
      products: [],
      influencers: [],
    };

    it('캠페인 수정 시 기존 데이터를 삭제하고 인플루언서 수수료를 재생성해야 한다', async () => {
      const newCommissionByDate = {
        '2025-02-10': 8000,
        '2025-02-11': 9000,
      };

      const input: UpdateCampaignInput = {
        ...baseUpdateInput,
        influencers: [
          {
            influencerId: 20,
            periodType: 'CUSTOM',
            startAt: new Date('2025-02-01'),
            endAt: new Date('2025-02-15'),
            feeType: 'CUSTOM',
            fee: 100000,
            status: 'VISIBLE',
            products: [
              {
                productId: 200,
                status: 'VISIBLE',
                useCustomCommission: true,
                hotelOptions: [
                  {
                    hotelOptionId: 300,
                    commissionByDate: newCommissionByDate,
                  },
                ],
              },
            ],
          },
        ],
      };

      // findOneByOrFail -> 기존 캠페인 반환
      const existingCampaign = {
        id: 1,
        title: '기존 캠페인',
        startAt: new Date('2025-01-01'),
        endAt: new Date('2025-01-31'),
        description: '기존 설명',
        thumbnail: null,
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-01'),
      };
      mockCampaignRepository.findOneByOrFail.mockResolvedValue(
        existingCampaign
      );

      // deleteRelatedEntities에서 사용하는 mock 설정
      // CampaignInfluencerRepository.find (deleteRelatedEntities 내부)
      // 첫 번째 호출: deleteRelatedEntities 내부 find (기존 인플루언서 조회)
      // 두 번째 호출: 응답 빌드용 find (relations 포함)
      const deleteQb = createMockQueryBuilder();
      mockCampaignInfluencerProductRepository.createQueryBuilder.mockReturnValue(
        deleteQb
      );
      const hotelOptionDeleteQb = createMockQueryBuilder();
      mockCampaignInfluencerHotelOptionRepository.createQueryBuilder.mockReturnValue(
        hotelOptionDeleteQb
      );

      // find 호출 순서: deleteRelatedEntities -> 응답 빌드
      mockCampaignInfluencerRepository.find
        .mockResolvedValueOnce([{ id: '1_10' }]) // deleteRelatedEntities
        .mockResolvedValueOnce([]); // 응답 빌드

      // deleteRelatedEntities 내부 QB (products 조회)
      deleteQb.getMany.mockResolvedValueOnce([{ id: 1 }]); // 기존 products

      setupResponseBuildMocks();

      await service.update(1, input);

      // 인플루언서 삭제가 호출됨
      expect(mockCampaignInfluencerRepository.delete).toHaveBeenCalledWith({
        campaignId: 1,
      });

      // 새로운 호텔옵션 수수료가 저장됨
      expect(
        mockCampaignInfluencerHotelOptionRepository.create
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          hotelOptionId: 300,
          influencerId: 20,
          commissionByDate: newCommissionByDate,
        })
      );

      expect(
        mockCampaignInfluencerHotelOptionRepository.save
      ).toHaveBeenCalled();
    });

    it('존재하지 않는 캠페인 수정 시 NotFoundException을 던져야 한다', async () => {
      mockCampaignRepository.findOneByOrFail.mockRejectedValue(
        new Error('Entity not found')
      );

      await expect(service.update(999, baseUpdateInput)).rejects.toThrow(
        NotFoundException
      );
    });
  });
});
