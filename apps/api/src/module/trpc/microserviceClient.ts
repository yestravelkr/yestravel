import { Injectable } from '@nestjs/common';
import {SharedEventBus} from "@src/module/trpc/eventBus";

@Injectable()
export class MicroserviceClient {
  async send(pattern: string, data: any): Promise<any> {
    return await SharedEventBus.instance.call(pattern, data);
  }

  // 편의 메서드들
  async callBackofficeAuth(cmd: string, data: any) {
    return await this.send(`backoffice.auth.${cmd}`, data);
  }
}