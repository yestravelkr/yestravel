import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import {RepositoryProvider} from "@src/module/shared/transaction/repository.provider";
import { JwtService } from '@nestjs/jwt';
import {ConfigProvider} from "@src/config";

const jwtService = new JwtService();

export type AdminAuthPayload = {
  id: number;
  email: string;
}

@Injectable()
export class BackofficeAuthService {
  constructor(
    private readonly repositoryProvider: RepositoryProvider
  ) {}

  async register(email: string, password: string) {
    return this.repositoryProvider.AdminRepository.register(email, password);
  }

  async login(email: string, password: string): Promise<{ accessToken: string, refreshToken: string }> {
    const admin = await this.repositoryProvider.AdminRepository.findOneByOrFail({email})
      .catch(() => {
        throw new NotFoundException('Admin not found')
      });
    if (!admin.checkPassword(password)) {
      throw new UnauthorizedException('Invalid password');
    }
    const payload: AdminAuthPayload = { email: admin.email, id: admin.id };
    const accessToken = jwtService.sign(payload, ConfigProvider.auth.jwt.backoffice.access);
    const refreshToken = jwtService.sign(payload, ConfigProvider.auth.jwt.backoffice.refresh);
    return { accessToken, refreshToken };
  }

  async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    let payload: AdminAuthPayload;
    
    try {
      payload = jwtService.verify(refreshToken, ConfigProvider.auth.jwt.backoffice.refresh);
    } catch (e) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // 사용자가 여전히 존재하는지 확인
    const admin = await this.repositoryProvider.AdminRepository.findOneByOrFail({
      id: payload.id,
      email: payload.email
    }).catch(() => {
      throw new NotFoundException('Admin not found');
    });

    // 새로운 access token 발급
    const newPayload: AdminAuthPayload = { email: admin.email, id: admin.id };
    const accessToken = jwtService.sign(newPayload, ConfigProvider.auth.jwt.backoffice.access);
    
    return { accessToken };
  }
}
