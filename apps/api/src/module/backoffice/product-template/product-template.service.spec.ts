import { Test, TestingModule } from '@nestjs/testing';
import { ProductTemplateService } from './product-template.service';
import { RepositoryProvider } from '@src/module/shared/transaction/repository.provider';
import { TransactionService } from '@src/module/shared/transaction/transaction.service';

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
              find: jest.fn(),
              findOne: jest.fn(),
              count: jest.fn(),
            },
          },
        },
        {
          provide: TransactionService,
          useValue: {},
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
    // 테스트 케이스는 다음 단계에서 추가
  });
});
