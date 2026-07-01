import { ApiProperty } from '@nestjs/swagger';
import { IsUrl } from 'class-validator';

export class UnsubscribePushDto {
  @ApiProperty({ example: 'https://fcm.googleapis.com/fcm/send/abc123' })
  @IsUrl({ require_tld: false })
  endpoint!: string;
}
