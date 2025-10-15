import { Test, TestingModule } from '@nestjs/testing';
import { ProductTemplateService } from './product-template.service';
import { RepositoryProvider } from '@src/module/shared/transaction/repository.provider';

describe('ProductTemplateService', () => {
  let service: ProductTemplateService;
  let repositoryProvider: RepositoryProvider;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductTemplateService,
        {
          provide: RepositoryProvider,
          useValue: {
            ProductTemplateRepository: {
              findAndCount: jest.fn(),
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
      // Arrange: Mock repository to return empty result
      jest
        .spyOn(repositoryProvider.ProductTemplateRepository, 'findAndCount')
        .mockResolvedValue([[], 0]);

      // Act: Call service method
      const result = await service.findAll({
        page: 1,
        limit: 30,
        order: 'DESC',
      });

      // Assert: Check result structure
      expect(result).toEqual({
        templates: [],
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

      jest
        .spyOn(repositoryProvider.ProductTemplateRepository, 'findAndCount')
        .mockResolvedValue([mockTemplates as any, 2]);

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
      expect(result.templates).toHaveLength(2);

      // Check first template formatting
      expect(result.templates[0]).toEqual({
        id: 1,
        type: 'HOTEL',
        name: '제주 리조트',
        brandName: '브랜드A',
        categoryName: '', // TODO
        isIntegrated: false, // TODO
        useStock: true,
        createdAt: mockTemplates[0].createdAt,
        updatedAt: mockTemplates[0].updatedAt,
      });

      // Check second template formatting
      expect(result.templates[1]).toEqual({
        id: 2,
        type: 'DELIVERY',
        name: '배송 상품',
        brandName: '브랜드B',
        categoryName: '', // TODO
        isIntegrated: false, // TODO
        useStock: false,
        createdAt: mockTemplates[1].createdAt,
        updatedAt: mockTemplates[1].updatedAt,
      });
    });

    it('should calculate correct pagination when multiple pages exist', async () => {
      // Arrange: Mock 100 templates with limit 30
      jest
        .spyOn(repositoryProvider.ProductTemplateRepository, 'findAndCount')
        .mockResolvedValue([[], 100]);

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

    it('should pass correct skip and take to repository', async () => {
      // Arrange: Spy on findAndCount
      const findAndCountSpy = jest
        .spyOn(repositoryProvider.ProductTemplateRepository, 'findAndCount')
        .mockResolvedValue([[], 0]);

      // Act: Call service with page 3, limit 20
      await service.findAll({
        page: 3,
        limit: 20,
        order: 'DESC',
      });

      // Assert: Check repository called with correct skip and take
      expect(findAndCountSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 40, // (page 3 - 1) * limit 20 = 40
          take: 20,
        })
      );
    });
  });
});
