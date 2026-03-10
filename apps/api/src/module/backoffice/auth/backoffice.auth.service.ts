import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { RepositoryProvider } from '@src/module/shared/transaction/repository.provider';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { ConfigProvider } from '@src/config';
import {
  PartnerAuthPayload,
  PartnerType,
} from '@src/module/partner/auth/partner-auth.schema';

const jwtService = new JwtService();

export type AdminAuthPayload = {
  id: number;
  email: string;
  role: string;
};

@Injectable()
export class BackofficeAuthService {
  constructor(private readonly repositoryProvider: RepositoryProvider) {}

  async register(
    email: string,
    password: string,
    name: string,
    phoneNumber: string,
    role: string
  ) {
    return this.repositoryProvider.AdminRepository.register(
      email,
      password,
      name,
      phoneNumber,
      role
    );
  }

  async login(
    email: string,
    password: string
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const admin = await this.repositoryProvider.AdminRepository.findOneByOrFail(
      { email }
    ).catch(() => {
      throw new NotFoundException('존재하지 않는 계정입니다');
    });
    if (!(await admin.checkPassword(password))) {
      throw new UnauthorizedException('비밀번호가 틀렸습니다');
    }
    const payload: AdminAuthPayload = {
      email: admin.email,
      id: admin.id,
      role: admin.role,
    };
    const accessToken = jwtService.sign(
      payload,
      ConfigProvider.auth.jwt.backoffice.access as JwtSignOptions
    );
    const refreshToken = jwtService.sign(
      payload,
      ConfigProvider.auth.jwt.backoffice.refresh as JwtSignOptions
    );
    return { accessToken, refreshToken };
  }

  async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    let payload: AdminAuthPayload;

    try {
      payload = jwtService.verify(
        refreshToken,
        ConfigProvider.auth.jwt.backoffice.refresh
      );
    } catch {
      throw new UnauthorizedException('유효하지 않은 토큰입니다');
    }

    // 사용자가 여전히 존재하는지 확인
    const admin = await this.repositoryProvider.AdminRepository.findOneByOrFail(
      {
        id: payload.id,
        email: payload.email,
      }
    ).catch(() => {
      throw new NotFoundException('존재하지 않는 계정입니다');
    });

    // 새로운 access token 발급
    const newPayload: AdminAuthPayload = {
      email: admin.email,
      id: admin.id,
      role: admin.role,
    };
    const accessToken = jwtService.sign(
      newPayload,
      ConfigProvider.auth.jwt.backoffice.access as JwtSignOptions
    );

    return { accessToken };
  }

  async partnerLogin(
    email: string,
    password: string,
    partnerType: PartnerType
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const { manager, partnerId } =
      partnerType === 'BRAND'
        ? await this.findBrandManager(email)
        : await this.findInfluencerManager(email);

    if (!(await manager.checkPassword(password))) {
      throw new UnauthorizedException('비밀번호가 틀렸습니다');
    }

    const payload: PartnerAuthPayload = {
      id: manager.id,
      email: manager.email,
      partnerType,
      role: manager.role,
      partnerId,
    };

    const accessToken = jwtService.sign(
      payload,
      ConfigProvider.auth.jwt.partner.access as JwtSignOptions
    );
    const refreshToken = jwtService.sign(
      payload,
      ConfigProvider.auth.jwt.partner.refresh as JwtSignOptions
    );

    return { accessToken, refreshToken };
  }

  async partnerRefreshToken(
    refreshToken: string
  ): Promise<{ accessToken: string }> {
    let payload: PartnerAuthPayload;

    try {
      payload = jwtService.verify(
        refreshToken,
        ConfigProvider.auth.jwt.partner.refresh
      );
    } catch {
      throw new UnauthorizedException('유효하지 않은 토큰입니다');
    }

    if (payload.partnerType === 'BRAND') {
      await this.repositoryProvider.BrandManagerRepository.findOneByOrFail({
        id: payload.id,
        email: payload.email,
      }).catch(() => {
        throw new NotFoundException('존재하지 않는 계정입니다');
      });
    } else {
      await this.repositoryProvider.InfluencerManagerRepository.findOneByOrFail(
        {
          id: payload.id,
          email: payload.email,
        }
      ).catch(() => {
        throw new NotFoundException('존재하지 않는 계정입니다');
      });
    }

    const newPayload: PartnerAuthPayload = {
      id: payload.id,
      email: payload.email,
      partnerType: payload.partnerType,
      role: payload.role,
      partnerId: payload.partnerId,
    };

    const accessToken = jwtService.sign(
      newPayload,
      ConfigProvider.auth.jwt.partner.access as JwtSignOptions
    );

    return { accessToken };
  }

  private async findBrandManager(email: string) {
    const manager =
      await this.repositoryProvider.BrandManagerRepository.findOne({
        where: { email },
        relations: ['brand'],
      });
    if (!manager) throw new NotFoundException('존재하지 않는 계정입니다');
    return { manager, partnerId: manager.brand.id };
  }

  private async findInfluencerManager(email: string) {
    const manager =
      await this.repositoryProvider.InfluencerManagerRepository.findOne({
        where: { email },
        relations: ['influencer'],
      });
    if (!manager) throw new NotFoundException('존재하지 않는 계정입니다');
    return { manager, partnerId: manager.influencer.id };
  }
}
