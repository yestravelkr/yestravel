import { Test, TestingModule } from '@nestjs/testing';
import { CategoryService } from './category.service';
import { RepositoryProvider } from '@src/module/shared/transaction/repository.provider';
import { CategoryEntity } from '@src/module/backoffice/domain/category.entity';

describe('CategoryService', () => {
  let service: CategoryService;
  let repositoryProvider: RepositoryProvider;

  const mockQueryBuilder = {
    where: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    addOrderBy: jest.fn().mockReturnThis(),
    getMany: jest.fn(),
  };

  const mockCategoryRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    createQueryBuilder: jest.fn(() => mockQueryBuilder),
  };

  const mockRepositoryProvider = {
    get CategoryRepository() {
      return mockCategoryRepository;
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoryService,
        {
          provide: RepositoryProvider,
          useValue: mockRepositoryProvider,
        },
      ],
    }).compile();

    service = module.get<CategoryService>(CategoryService);
    repositoryProvider = module.get<RepositoryProvider>(RepositoryProvider);

    // Reset all mocks
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('최상위 카테고리를 생성해야 한다 (parentId가 null)', async () => {
      const input = {
        name: '호텔',
        productType: 'HOTEL' as const,
        parentId: null,
      };

      const savedCategory: CategoryEntity = {
        id: 1,
        name: input.name,
        productType: input.productType,
        parentId: null,
        level: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        parent: null,
        children: [],
      };

      mockCategoryRepository.save.mockResolvedValue(savedCategory);

      const result = await service.create(input);

      expect(mockCategoryRepository.save).toHaveBeenCalledWith({
        name: input.name,
        productType: input.productType,
        parentId: null,
        level: 0,
      });
      expect(result).toEqual(savedCategory);
      expect(result.level).toBe(0);
    });

    it('하위 카테고리를 생성해야 한다 (parentId가 있을 때)', async () => {
      const parentCategory: CategoryEntity = {
        id: 1,
        name: '호텔',
        productType: 'HOTEL',
        parentId: null,
        level: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        parent: null,
        children: [],
      };

      const input = {
        name: '국내호텔',
        productType: 'HOTEL' as const,
        parentId: 1,
      };

      const savedCategory: CategoryEntity = {
        id: 2,
        name: input.name,
        productType: input.productType,
        parentId: input.parentId,
        level: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        parent: parentCategory,
        children: [],
      };

      mockCategoryRepository.findOne.mockResolvedValue(parentCategory);
      mockCategoryRepository.save.mockResolvedValue(savedCategory);

      const result = await service.create(input);

      expect(mockCategoryRepository.findOne).toHaveBeenCalledWith({
        where: { id: input.parentId },
      });
      expect(mockCategoryRepository.save).toHaveBeenCalledWith({
        name: input.name,
        productType: input.productType,
        parentId: input.parentId,
        level: 1,
      });
      expect(result.level).toBe(1);
    });

    it('존재하지 않는 parentId가 주어지면 NotFoundException을 던져야 한다', async () => {
      const input = {
        name: '국내호텔',
        productType: 'HOTEL' as const,
        parentId: 999,
      };

      mockCategoryRepository.findOne.mockResolvedValue(null);

      await expect(service.create(input)).rejects.toThrow(
        '상위 카테고리를 찾을 수 없습니다'
      );
    });
  });

  describe('findAll', () => {
    it('전체 카테고리를 조회해야 한다 (productType 필터 없이)', async () => {
      const mockCategories: CategoryEntity[] = [
        {
          id: 1,
          name: '호텔',
          productType: 'HOTEL',
          parentId: null,
          level: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
          parent: null,
          children: [],
        },
        {
          id: 2,
          name: 'E-티켓',
          productType: 'E-TICKET',
          parentId: null,
          level: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
          parent: null,
          children: [],
        },
      ];

      mockQueryBuilder.getMany.mockResolvedValue(mockCategories);

      const result = await service.findAll({ productType: null });

      expect(mockCategoryRepository.createQueryBuilder).toHaveBeenCalledWith(
        'category'
      );
      expect(mockQueryBuilder.where).not.toHaveBeenCalled();
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith(
        'category.level',
        'ASC'
      );
      expect(mockQueryBuilder.addOrderBy).toHaveBeenCalledWith(
        'category.id',
        'ASC'
      );
      expect(result).toEqual(mockCategories);
      expect(result).toHaveLength(2);
    });

    it('productType으로 필터링하여 조회해야 한다', async () => {
      const mockHotelCategories: CategoryEntity[] = [
        {
          id: 1,
          name: '호텔',
          productType: 'HOTEL',
          parentId: null,
          level: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
          parent: null,
          children: [],
        },
        {
          id: 3,
          name: '국내호텔',
          productType: 'HOTEL',
          parentId: 1,
          level: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
          parent: null,
          children: [],
        },
      ];

      mockQueryBuilder.getMany.mockResolvedValue(mockHotelCategories);

      const result = await service.findAll({ productType: 'HOTEL' });

      expect(mockCategoryRepository.createQueryBuilder).toHaveBeenCalledWith(
        'category'
      );
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'category.productType = :productType',
        { productType: 'HOTEL' }
      );
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith(
        'category.level',
        'ASC'
      );
      expect(result).toEqual(mockHotelCategories);
      expect(result.every(cat => cat.productType === 'HOTEL')).toBe(true);
    });

    it('계층 구조에 따라 정렬되어 조회되어야 한다', async () => {
      const mockCategories: CategoryEntity[] = [
        {
          id: 1,
          name: '호텔',
          productType: 'HOTEL',
          parentId: null,
          level: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
          parent: null,
          children: [],
        },
        {
          id: 2,
          name: '국내호텔',
          productType: 'HOTEL',
          parentId: 1,
          level: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
          parent: null,
          children: [],
        },
        {
          id: 3,
          name: '서울',
          productType: 'HOTEL',
          parentId: 2,
          level: 2,
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
          parent: null,
          children: [],
        },
      ];

      mockQueryBuilder.getMany.mockResolvedValue(mockCategories);

      const result = await service.findAll({ productType: 'HOTEL' });

      expect(result[0].level).toBe(0);
      expect(result[1].level).toBe(1);
      expect(result[2].level).toBe(2);
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith(
        'category.level',
        'ASC'
      );
      expect(mockQueryBuilder.addOrderBy).toHaveBeenCalledWith(
        'category.id',
        'ASC'
      );
    });
  });
});
