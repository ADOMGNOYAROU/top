import { Module } from '@nestjs/common';
import { GestionnaireController } from './gestionnaire.controller';
import { GestionnaireService } from './gestionnaire.service';

@Module({
  controllers: [GestionnaireController],
  providers: [GestionnaireService],
})
export class GestionnaireModule {}
