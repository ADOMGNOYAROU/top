import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../common/types/authenticated-user.type';
import { AuthService, AuthMeResponse, RegisterDto } from './auth.service';

@ApiTags('Auth')
@ApiBearerAuth()
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @ApiOperation({
    summary: "Créer ou récupérer le profil applicatif après inscription Supabase",
    description:
      "Doit être appelé avec un Bearer token Supabase valide juste après signUp(). Crée l'entrée User en base si elle n'existe pas encore (idempotent). Les champs du body surchargent les user_metadata Supabase.",
  })
  register(
    @Req() req: Request,
    @Body() dto: RegisterDto,
  ): Promise<AuthMeResponse> {
    const token = (req.headers.authorization ?? '').replace('Bearer ', '').trim();
    return this.authService.register(token, dto);
  }

  @Get('me')
  @ApiOperation({
    summary: "Profil de l'utilisateur courant",
    description:
      "Renvoie l'utilisateur courant avec son profil de rôle (Owner/Tenant/Manager/Admin), son statut de compte et ses préférences de notification.",
  })
  me(@CurrentUser() user: AuthenticatedUser): Promise<AuthMeResponse> {
    return this.authService.getMe(user);
  }
}
