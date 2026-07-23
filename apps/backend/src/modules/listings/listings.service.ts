import { randomUUID } from 'node:crypto';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PropertyStatus, PropertyType, ListingStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { AuthenticatedUser } from '../../common/types/authenticated-user.type';
import { CreateListingDto } from './dto/create-listing.dto';
import { ContactListingDto } from './dto/contact-listing.dto';
import { ListListingsQueryDto } from './dto/list-listings-query.dto';

export interface ListingPublic {
  id: string;
  slug: string;
  titre: string;
  description: string;
  type: 'LOCATION';
  typeBien: string;
  prix: number;
  charges: number;
  adresse: { quartier: string; ville: string; adresseComplete: string };
  bienId: string;
  photos: string[];
  statut: 'ACTIVE' | 'EXPIREE';
  dateCreation: Date;
  contact: { nom: string; telephone: string };
}

const PROPERTY_TYPE_LABEL: Record<PropertyType, string> = {
  VILLA: 'Villa',
  APARTMENT: 'Appartement',
  STUDIO: 'Studio',
  COMMERCIAL: 'Local commercial',
};

@Injectable()
export class ListingsService {
  // Cache de la liste publique (sans filtres) — TTL 5 min
  // Le cache des URLs signées est centralisé dans StorageService (TTL 55 min)
  private listingsCache: { data: ListingPublic[]; expiresAt: number } | null = null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
  ) {}

  async findAll(query: ListListingsQueryDto): Promise<ListingPublic[]> {
    // Cache de la liste publique 5 min (sans filtres uniquement)
    const isDefaultQuery = !query.ville && !query.type && !query.prixMin && !query.prixMax && !query.recherche
      && (!query.page || query.page === 1) && (!query.limit || query.limit === 20);
    if (isDefaultQuery && this.listingsCache && Date.now() < this.listingsCache.expiresAt) {
      return this.listingsCache.data;
    }

    const where: Record<string, unknown> = { status: ListingStatus.ACTIVE };
    if (query.ville) where['property'] = { ...((where['property'] as object) ?? {}), city: { contains: query.ville, mode: 'insensitive' } };
    if (query.type)  where['property'] = { ...((where['property'] as object) ?? {}), type: query.type };
    if (query.prixMin !== undefined || query.prixMax !== undefined) {
      const r: Record<string, number> = {};
      if (query.prixMin !== undefined) r['gte'] = query.prixMin;
      if (query.prixMax !== undefined) r['lte'] = query.prixMax;
      where['property'] = { ...((where['property'] as object) ?? {}), monthlyRent: r };
    }
    if (query.recherche) {
      where['property'] = { ...((where['property'] as object) ?? {}), OR: [
        { neighborhood: { contains: query.recherche, mode: 'insensitive' } },
        { city: { contains: query.recherche, mode: 'insensitive' } },
        { description: { contains: query.recherche, mode: 'insensitive' } },
      ]};
    }
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const listings = await this.prisma.listing.findMany({
      where, skip: (page - 1) * limit, take: limit, orderBy: { publishedAt: 'desc' },
      // Pour la liste, on ne prend que la 1re photo (moins d'URLs signées à générer)
      include: {
        property: { include: { photos: { orderBy: { position: 'asc' }, take: 1 } } },
        publishedBy: { select: { firstName: true, lastName: true, phone: true } },
      },
    });
    const result = await this.toPublicBatch(listings);
    if (isDefaultQuery) {
      this.listingsCache = { data: result, expiresAt: Date.now() + 5 * 60 * 1000 };
    }
    return result;
  }

  async findByOwner(userId: string): Promise<ListingPublic[]> {
    const listings = await this.prisma.listing.findMany({
      where: { publishedByUserId: userId },
      orderBy: { publishedAt: 'desc' },
      include: {
        property: { include: { photos: { orderBy: { position: 'asc' }, take: 1 } } },
        publishedBy: { select: { firstName: true, lastName: true, phone: true } },
      },
    });
    return this.toPublicBatch(listings);
  }

  async findOne(idOrSlug: string): Promise<ListingPublic> {
    const listing = await this.prisma.listing.findFirst({
      where: { OR: [{ id: idOrSlug }, { slug: idOrSlug }] },
      include: {
        property: { include: { photos: { orderBy: { position: 'asc' } } } },
        publishedBy: { select: { firstName: true, lastName: true, phone: true } },
      },
    });
    if (!listing) throw new NotFoundException('Annonce introuvable');
    // Détail : toutes les photos via batch
    const paths = listing.property.photos.map((p) => p.storagePath);
    const urlMap = await this.storage.getSignedUrls('property-photos', paths, 3600);
    return this.buildPublic(listing, paths.map((p) => urlMap.get(p) ?? '').filter(Boolean));
  }

  async create(user: AuthenticatedUser, dto: CreateListingDto): Promise<ListingPublic> {
    const property = await this.prisma.property.findFirst({
      where: { id: dto.propertyId, ownerId: user.id },
    });
    if (!property) throw new ForbiddenException('Bien introuvable ou accès refusé');
    if (property.status !== PropertyStatus.VACANT) {
      throw new BadRequestException('Seul un bien VACANT peut être mis en annonce');
    }

    const existing = await this.prisma.listing.findFirst({
      where: { propertyId: dto.propertyId, status: ListingStatus.ACTIVE },
    });
    if (existing) throw new ConflictException('Ce bien a déjà une annonce active');

    const slug = `${property.type.toLowerCase()}-${property.city.toLowerCase().replace(/\s+/g, '-')}-${randomUUID().slice(0, 8)}`;

    const listing = await this.prisma.listing.create({
      data: {
        propertyId: dto.propertyId,
        publishedByUserId: user.id,
        slug,
        status: ListingStatus.ACTIVE,
      },
      include: {
        property: { include: { photos: { orderBy: { position: 'asc' } } } },
        publishedBy: { select: { firstName: true, lastName: true, phone: true } },
      },
    });

    this.listingsCache = null;
    const results = await this.toPublicBatch([listing]);
    return results[0];
  }

  async disable(user: AuthenticatedUser, id: string): Promise<void> {
    const listing = await this.prisma.listing.findFirst({
      where: { id, publishedByUserId: user.id },
    });
    if (!listing) throw new NotFoundException('Annonce introuvable ou accès refusé');

    await this.prisma.listing.update({
      where: { id },
      data: { status: ListingStatus.DISABLED, deactivatedAt: new Date() },
    });
    this.listingsCache = null;
  }

  async contact(idOrSlug: string, dto: ContactListingDto): Promise<void> {
    const listing = await this.prisma.listing.findFirst({
      where: { OR: [{ id: idOrSlug }, { slug: idOrSlug }], status: ListingStatus.ACTIVE },
    });
    if (!listing) throw new NotFoundException('Annonce introuvable ou inactive');

    await this.prisma.listingContact.create({
      data: {
        listingId: listing.id,
        firstName: dto.firstName,
        phone: dto.phone,
        message: dto.message,
      },
    });
  }

  // Batch : StorageService gère le cache des URLs (TTL 55 min centralisé)
  private async toPublicBatch(listings: Array<{
    id: string; slug: string; status: ListingStatus; publishedAt: Date;
    property: { id: string; type: PropertyType; address: string; neighborhood: string; city: string; monthlyRent: number; monthlyCharges: number; description: string | null; photos: { storagePath: string }[] };
    publishedBy: { firstName: string; lastName: string; phone: string | null };
  }>): Promise<ListingPublic[]> {
    if (listings.length === 0) return [];

    const allPaths = listings.flatMap((l) => l.property.photos.map((p) => p.storagePath));
    const urlMap = allPaths.length > 0
      ? await this.storage.getSignedUrls('property-photos', allPaths)
      : new Map<string, string>();

    return listings.map((l) => {
      const photos = l.property.photos.map((p) => urlMap.get(p.storagePath) ?? '').filter(Boolean);
      return this.buildPublic(l, photos);
    });
  }

  private buildPublic(listing: {
    id: string; slug: string; status: ListingStatus; publishedAt: Date;
    property: { id: string; type: PropertyType; address: string; neighborhood: string; city: string; monthlyRent: number; monthlyCharges: number; description: string | null; photos: { storagePath: string }[] };
    publishedBy: { firstName: string; lastName: string; phone: string | null };
  }, photoUrls: string[]): ListingPublic {
    const p = listing.property;
    const typeLabel = PROPERTY_TYPE_LABEL[p.type] ?? p.type;
    return {
      id: listing.id,
      slug: listing.slug,
      titre: `${typeLabel} à louer — ${p.neighborhood}, ${p.city}`,
      description: p.description ?? '',
      type: 'LOCATION',
      typeBien: typeLabel,
      prix: p.monthlyRent,
      charges: p.monthlyCharges,
      adresse: { quartier: p.neighborhood, ville: p.city, adresseComplete: p.address },
      bienId: p.id,
      photos: photoUrls,
      statut: listing.status === ListingStatus.ACTIVE ? 'ACTIVE' : 'EXPIREE',
      dateCreation: listing.publishedAt,
      contact: {
        nom: `${listing.publishedBy.firstName} ${listing.publishedBy.lastName}`,
        telephone: listing.publishedBy.phone ?? '',
      },
    };
  }
}
