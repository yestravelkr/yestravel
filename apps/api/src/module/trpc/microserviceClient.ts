import {Injectable, Logger} from '@nestjs/common';
import {SharedEventBus} from "@src/module/trpc/eventBus";
import {transformToTRPCError} from "@src/utils/trpc-error-transformer";

@Injectable()
export class MicroserviceClient {
  private logger: Logger = new Logger(MicroserviceClient.name);
  async send(pattern: string, data?: any): Promise<any> {
    try {
      return await SharedEventBus.instance.call(pattern, data);
    } catch (error) {
      this.logger.error(error);
      // Transform any error from NestJS services to TRPCError
      throw transformToTRPCError(error);
    }
  }
}