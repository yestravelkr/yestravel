import { Test, TestingModule } from '@nestjs/testing';
import { ProductTemplateService } from './product-template.service';
import { RepositoryProvider } from '@src/module/shared/transaction/repository.provider';

describe('ProductTemplateService', () => {
  let service: ProductTemplateService;
  let repositoryProvider: RepositoryProvider;

  beforeEach(async () => {
    const mockQueryBuilder = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductTemplateService,
        {
          provide: RepositoryProvider,
          useValue: {
            ProductTemplateRepository: {
              createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
            },
          },
        },
      ],
    }).compile();

    service = module.get<ProductTemplateService>(ProductTemplateService);
    repositoryProvider = module.get<RepositoryProvider>(RepositoryProvider);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return empty array when no templates exist', async () => {
      // Arrange: Mock QueryBuilder to return empty result
      const mockQueryBuilder = repositoryProvider.ProductTemplateRepository.createQueryBuilder() as any;
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);

      // Act: Call service method
      const result = await service.findAll({
        page: 1,
        limit: 30,
        order: 'DESC',
      });

      // Assert: Check result structure
      expect(result).toEqual({
        data: [],
        total: 0,
        page: 1,
        limit: 30,
        totalPages: 0,
      });
    });

    it('should return templates with formatted data when templates exist', async () => {
      // Arrange: Mock templates data
      const mockTemplates = [
        {
          id: 1,
          type: 'HOTEL',
          name: '제주 리조트',
          useStock: true,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
          brand: { id: 1, name: '브랜드A' },
        },
        {
          id: 2,
          type: 'DELIVERY',
          name: '배송 상품',
          useStock: false,
          createdAt: new Date('2024-01-02'),
          updatedAt: new Date('2024-01-02'),
          brand: { id: 2, name: '브랜드B' },
        },
      ];

      const mockQueryBuilder = repositoryProvider.ProductTemplateRepository.createQueryBuilder() as any;
      mockQueryBuilder.getManyAndCount.mockResolvedValue([mockTemplates, 2]);

      // Act: Call service method
      const result = await service.findAll({
        page: 1,
        limit: 30,
        order: 'DESC',
      });

      // Assert: Check result structure and data formatting
      expect(result.total).toBe(2);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(30);
      expect(result.totalPages).toBe(1);
      expect(result.data).toHaveLength(2);

      // Check first template formatting
      expect(result.data[0]).toEqual({
        id: 1,
        type: 'HOTEL',
        name: '제주 리조트',
        brand: { id: 1, name: '브랜드A' },
        category: { id: 0, name: '' }, // TODO: 카테고리 연동 후 구현
        isIntegrated: false, // TODO: 연동 기능 추가 후 구현
        useStock: true,
        createdAt: mockTemplates[0].createdAt,
        updatedAt: mockTemplates[0].updatedAt,
      });

      // Check second template formatting
      expect(result.data[1]).toEqual({
        id: 2,
        type: 'DELIVERY',
        name: '배송 상품',
        brand: { id: 2, name: '브랜드B' },
        category: { id: 0, name: '' }, // TODO: 카테고리 연동 후 구현
        isIntegrated: false, // TODO: 연동 기능 추가 후 구현
        useStock: false,
        createdAt: mockTemplates[1].createdAt,
        updatedAt: mockTemplates[1].updatedAt,
      });
    });

    it('should calculate correct pagination when multiple pages exist', async () => {
      // Arrange: Mock 100 templates with limit 30
      const mockQueryBuilder = repositoryProvider.ProductTemplateRepository.createQueryBuilder() as any;
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 100]);

      // Act: Call service method for page 2
      const result = await service.findAll({
        page: 2,
        limit: 30,
        order: 'DESC',
      });

      // Assert: Check pagination calculation
      expect(result.total).toBe(100);
      expect(result.page).toBe(2);
      expect(result.limit).toBe(30);
      expect(result.totalPages).toBe(4); // ceil(100 / 30) = 4
    });

    it('should pass correct skip and take to QueryBuilder', async () => {
      // Arrange: Spy on QueryBuilder methods
      const mockQueryBuilder = repositoryProvider.ProductTemplateRepository.createQueryBuilder() as any;
      const skipSpy = jest.spyOn(mockQueryBuilder, 'skip');
      const takeSpy = jest.spyOn(mockQueryBuilder, 'take');

      // Act: Call service with page 3, limit 20
      await service.findAll({
        page: 3,
        limit: 20,
        order: 'DESC',
      });

      // Assert: Check QueryBuilder called with correct skip and take
      expect(skipSpy).toHaveBeenCalledWith(40); // (page 3 - 1) * limit 20 = 40
      expect(takeSpy).toHaveBeenCalledWith(20);
    });
  });
});
