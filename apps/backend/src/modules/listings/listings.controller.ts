import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../common/types/authenticated-user.type';
import { ListingsService, ListingPublic } from './listings.service';
import { CreateListingDto } from './dto/create-listing.dto';
import { ContactListingDto } from './dto/contact-listing.dto';
import { ListListingsQueryDto } from './dto/list-listings-query.dto';

@ApiTags('Annonces')
@Controller('annonces')
export class ListingsController {
  constructor(private readonly listingsService: ListingsService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'Liste publique des annonces actives' })
  findAll(@Query() query: ListListingsQueryDto): Promise<ListingPublic[]> {
    return this.listingsService.findAll(query);
  }

  @Get('mine')
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @ApiOperation({ summary: 'Mes annonces (propriétaire connecté)' })
  findMine(@CurrentUser() user: AuthenticatedUser): Promise<ListingPublic[]> {
    return this.listingsService.findByOwner(user.id);
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: "Détail d'une annonce par id ou slug" })
  findOne(@Param('id') id: string): Promise<ListingPublic> {
    return this.listingsService.findOne(id);
  }

  @Post()
  @HttpCode(201)
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @ApiOperation({ summary: 'Publier un bien en annonce (propriétaire uniquement)' })
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateListingDto,
  ): Promise<ListingPublic> {
    return this.listingsService.create(user, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @ApiOperation({ summary: 'Désactiver une annonce' })
  async disable(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ): Promise<void> {
    return this.listingsService.disable(user, id);
  }

  @Post(':id/contact')
  @Public()
  @HttpCode(201)
  @ApiOperation({ summary: 'Envoyer une demande de contact au propriétaire' })
  contact(
    @Param('id') id: string,
    @Body() dto: ContactListingDto,
  ): Promise<void> {
    return this.listingsService.contact(id, dto);
  }
}
