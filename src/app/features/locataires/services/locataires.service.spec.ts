import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { LocatairesService } from './locataires.service';
import { environment } from '@env/environment';

const TENANTS_API = `${environment.apiUrl}/tenants`;
const AUTH_API    = `${environment.apiUrl}/auth`;

const locataireMock = {
  id: 't1',
  firstName: 'Kofi',
  lastName: 'Mensah',
  email: 'kofi@example.com',
  phone: '+22890000001',
  role: 'TENANT' as const,
  accountStatus: 'ACTIVE',
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-01T00:00:00.000Z',
};

describe('LocatairesService', () => {
  let service: LocatairesService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        LocatairesService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(LocatairesService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  describe('getLocataires()', () => {
    it('récupère la liste depuis GET /api/tenants', (done) => {
      service.getLocataires().subscribe(locataires => {
        expect(locataires.length).toBe(1);
        expect(locataires[0].firstName).toBe('Kofi');
        expect(locataires[0].accountStatus).toBe('ACTIVE');
        done();
      });
      http.expectOne(TENANTS_API).flush([locataireMock]);
    });

    it('filtre par statut', (done) => {
      service.getLocataires({ statut: 'ACTIVE' }).subscribe(locataires => {
        expect(locataires.length).toBe(1);
        done();
      });
      http.expectOne(TENANTS_API).flush([locataireMock]);
    });

    it('filtre par recherche textuelle', (done) => {
      service.getLocataires({ search: 'kofi' }).subscribe(locataires => {
        expect(locataires.length).toBe(1);
        done();
      });
      http.expectOne(TENANTS_API).flush([locataireMock]);
    });

    it('retourne une liste vide si le backend renvoie []', (done) => {
      service.getLocataires().subscribe(locataires => {
        expect(locataires).toEqual([]);
        done();
      });
      http.expectOne(TENANTS_API).flush([]);
    });
  });

  describe('getLocataireById()', () => {
    it('appelle GET /api/tenants/:id', (done) => {
      service.getLocataireById('t1').subscribe(loc => {
        expect(loc.id).toBe('t1');
        expect(loc.firstName).toBe('Kofi');
        done();
      });
      http.expectOne(`${TENANTS_API}/t1`).flush(locataireMock);
    });
  });

  describe('inviteLocataire()', () => {
    it('poste sur POST /api/auth/invite/tenant', () => {
      const payload = {
        firstName: 'Yao',
        lastName: 'Koffi',
        email: 'yao@example.com',
        propertyId: 'p1',
      };
      service.inviteLocataire(payload).subscribe();
      const req = http.expectOne(`${AUTH_API}/invite/tenant`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body.email).toBe('yao@example.com');
      req.flush({ user: {}, invitationUrl: 'https://example.com/invite/...' });
    });
  });
});
