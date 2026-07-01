import { Body, Controller, Get, HttpCode, Post } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../common/types/authenticated-user.type';
import { WebPushService } from './web-push.service';
import { SubscribePushDto } from './dto/subscribe-push.dto';
import { UnsubscribePushDto } from './dto/unsubscribe-push.dto';

@ApiTags('Push')
@ApiBearerAuth()
@Controller('push')
export class PushController {
  constructor(
    private readonly webPush: WebPushService,
    private readonly config: ConfigService,
  ) {}

  @Get('vapid-public-key')
  @ApiOperation({ summary: "Clé publique VAPID pour l'abonnement côté navigateur" })
  getVapidPublicKey(): { publicKey: string } {
    return { publicKey: this.config.getOrThrow<string>('VAPID_PUBLIC_KEY') };
  }

  @Post('subscribe')
  @HttpCode(204)
  @ApiOperation({
    summary: 'Enregistre un abonnement Web Push et active le consentement notifications',
  })
  async subscribe(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: SubscribePushDto,
  ): Promise<void> {
    await this.webPush.subscribe(user.id, dto);
  }

  @Post('unsubscribe')
  @HttpCode(204)
  @ApiOperation({
    summary: 'Supprime un abonnement Web Push et désactive le consentement notifications',
  })
  async unsubscribe(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UnsubscribePushDto,
  ): Promise<void> {
    await this.webPush.unsubscribe(user.id, dto.endpoint);
  }
}
