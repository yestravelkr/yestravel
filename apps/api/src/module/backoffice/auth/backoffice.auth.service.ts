import { Injectable } from '@nestjs/common';
import {RepositoryProvider} from "@src/module/shared/transaction/repository.provider";
import { JwtService } from '@nestjs/jwt';
import {ConfigProvider} from "@src/config";

const jwtService = new JwtService();

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
        throw new Error('Admin not found')
      });
    if (!admin.checkPassword(password)) {
      throw new Error('Invalid password');
    }
    const payload = { email: admin.email, id: admin.id };
    const accessToken = jwtService.sign(payload, ConfigProvider.auth.jwt.access);
    const refreshToken = jwtService.sign(payload, ConfigProvider.auth.jwt.refresh);
    return { accessToken, refreshToken };
  }
}
