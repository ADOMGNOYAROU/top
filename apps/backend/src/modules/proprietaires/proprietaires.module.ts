import { Module } from '@nestjs/common';
import { ProprietairesController } from './proprietaires.controller';
import { ProprietairesService } from './proprietaires.service';

@Module({
  controllers: [ProprietairesController],
  providers: [ProprietairesService],
})
export class ProprietairesModule {}
