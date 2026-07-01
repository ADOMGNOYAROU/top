import { Global, Module } from '@nestjs/common';
import { PushController } from './push.controller';
import { WebPushService } from './web-push.service';

@Global()
@Module({
  controllers: [PushController],
  providers: [WebPushService],
  exports: [WebPushService],
})
export class PushModule {}
