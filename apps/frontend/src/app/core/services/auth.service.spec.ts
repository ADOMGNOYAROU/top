import { TestBed, fakeAsync, flushMicrotasks } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { lastValueFrom } from 'rxjs';
import { AuthService, WARAHUser } from './auth.service';
import { SupabaseService } from './supabase.service';
import { environment } from '@env/environment';

const ME_URL = `${environment.apiUrl}/auth/me`;

const mockSession = { access_token: 'mock-token-123', user: { id: 'u1' } } as any;

const userProfileResponse = {
  id: 'u1',
  email: 'test@example.com',
  firstName: 'Kofi',
  lastName: 'Mensah',
  role: 'OWNER',
  accountStatus: 'ACTIVE',
};

const supabaseMock = {
  auth: {
    onAuthStateChange: jest.fn().mockReturnValue({ data: { subscription: { unsubscribe: jest.fn() } } }),
    signInWithPassword: jest.fn(),
    signUp: jest.fn(),
    signOut: jest.fn(),
    resetPasswordForEmail: jest.fn(),
    updateUser: jest.fn(),
  },
  getSession: jest.fn(),
};

const routerMock = { navigate: jest.fn() };

describe('AuthService', () => {
  let service: AuthService;
  let http: HttpTestingController;

  beforeEach(() => {
    jest.clearAllMocks();
    // Pas de session active au démarrage par défaut
    supabaseMock.getSession.mockResolvedValue({ data: { session: null } });

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: SupabaseService, useValue: supabaseMock },
        { provide: Router, useValue: routerMock },
      ],
    });

    service = TestBed.inject(AuthService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    // Ignorer les éventuelles requêtes /auth/me issues du constructeur (si session initiale)
    http.verify();
  });

  // ── État initial ─────────────────────────────────────────────────

  describe('getToken()', () => {
    it('renvoie null sans session active', () => {
      expect(service.getToken()).toBeNull();
    });
  });

  describe('isLoggedIn()', () => {
    it('renvoie false sans session active', () => {
      expect(service.isLoggedIn()).toBe(false);
    });
  });

  describe('getCurrentUser()', () => {
    it('renvoie null au démarrage', () => {
      expect(service.getCurrentUser()).toBeNull();
    });
  });

  // ── getDefaultRoute() ────────────────────────────────────────────

  describe('getDefaultRoute()', () => {
    it('renvoie /auth/login quand aucun utilisateur', () => {
      expect(service.getDefaultRoute()).toBe('/auth/login');
    });

    it.each([
      ['OWNER', '/dashboard'],
      ['TENANT', '/locataire'],
      ['MANAGER', '/gestionnaire'],
      ['ADMIN', '/admin'],
    ])('role %s → route %s', (role, expectedRoute) => {
      (service as any).currentUserSubject.next({ role } as WARAHUser);
      expect(service.getDefaultRoute()).toBe(expectedRoute);
    });

    it('renvoie /dashboard pour un rôle inconnu', () => {
      (service as any).currentUserSubject.next({ role: 'UNKNOWN' } as any);
      expect(service.getDefaultRoute()).toBe('/dashboard');
    });
  });

  // ── login() ──────────────────────────────────────────────────────

  describe('login()', () => {
    it('appelle signInWithPassword avec email et mot de passe', async () => {
      supabaseMock.auth.signInWithPassword.mockResolvedValue({
        data: { session: mockSession, user: mockSession.user },
        error: null,
      });

      const loginPromise = lastValueFrom(
        service.login({ email: 'test@example.com', motDePasse: 'secret' })
      );

      // Attendre la résolution de la promesse Supabase avant de flush l'HTTP
      await new Promise((r) => setTimeout(r, 0));

      const req = http.expectOne(ME_URL);
      req.flush(userProfileResponse);

      const user = await loginPromise;
      expect(supabaseMock.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'secret',
      });
      expect(user.email).toBe('test@example.com');
    });

    it('met à jour la session après connexion réussie', async () => {
      supabaseMock.auth.signInWithPassword.mockResolvedValue({
        data: { session: mockSession, user: mockSession.user },
        error: null,
      });

      const loginPromise = lastValueFrom(
        service.login({ email: 'test@example.com', motDePasse: 'secret' })
      );

      await new Promise((r) => setTimeout(r, 0));
      http.expectOne(ME_URL).flush(userProfileResponse);
      await loginPromise;

      expect(service.getToken()).toBe('mock-token-123');
      expect(service.isLoggedIn()).toBe(true);
    });

    it('met à jour currentUser$ après connexion', async () => {
      supabaseMock.auth.signInWithPassword.mockResolvedValue({
        data: { session: mockSession, user: mockSession.user },
        error: null,
      });

      const loginPromise = lastValueFrom(
        service.login({ email: 'test@example.com', motDePasse: 'secret' })
      );

      await new Promise((r) => setTimeout(r, 0));
      http.expectOne(ME_URL).flush(userProfileResponse);
      await loginPromise;

      expect(service.getCurrentUser()?.role).toBe('OWNER');
      expect(service.getCurrentUser()?.firstName).toBe('Kofi');
    });

    it('propage l\'erreur Supabase en cas d\'identifiants invalides', async () => {
      supabaseMock.auth.signInWithPassword.mockResolvedValue({
        data: { session: null, user: null },
        error: new Error('Invalid login credentials'),
      });

      await expect(
        lastValueFrom(service.login({ email: 'bad@example.com', motDePasse: 'wrong' }))
      ).rejects.toThrow('Invalid login credentials');
    });
  });

  // ── logout() ─────────────────────────────────────────────────────

  describe('logout()', () => {
    it('appelle signOut et navigue vers /auth/login', async () => {
      supabaseMock.auth.signOut.mockResolvedValue({});

      // Donner une session active
      (service as any).session = mockSession;
      (service as any).currentUserSubject.next({ id: 'u1', email: 'test@example.com', role: 'OWNER' });

      service.logout();

      await new Promise((r) => setTimeout(r, 0));

      expect(supabaseMock.auth.signOut).toHaveBeenCalled();
      expect(routerMock.navigate).toHaveBeenCalledWith(['/auth/login']);
    });

    it('réinitialise la session et l\'utilisateur courant', async () => {
      supabaseMock.auth.signOut.mockResolvedValue({});
      (service as any).session = mockSession;
      (service as any).currentUserSubject.next({ id: 'u1', email: 'test@example.com', role: 'OWNER' });

      service.logout();
      await new Promise((r) => setTimeout(r, 0));

      expect(service.getToken()).toBeNull();
      expect(service.getCurrentUser()).toBeNull();
    });
  });

  // ── mapRole() via register() ──────────────────────────────────────

  describe('mapRole() (via register)', () => {
    // On teste indirectement mapRole via le rôle qui sera envoyé à Supabase
    it.each([
      ['proprietaire_local', 'OWNER'],
      ['proprietaire_diaspora', 'OWNER'],
      ['locataire', 'TENANT'],
      ['gestionnaire', 'MANAGER'],
    ] as const)('type "%s" → rôle Supabase "%s"', async (type, expectedRole) => {
      supabaseMock.auth.signUp.mockResolvedValue({
        data: { session: mockSession, user: mockSession.user },
        error: null,
      });

      const registerPromise = lastValueFrom(
        service.register({
          prenom: 'Test',
          nom: 'User',
          email: 'test@example.com',
          telephone: '+22890000001',
          motDePasse: 'pass123',
          typeUtilisateur: type,
        })
      );

      await new Promise((r) => setTimeout(r, 0));
      http.expectOne(ME_URL).flush({ ...userProfileResponse, role: expectedRole });
      await registerPromise;

      const callOptions = supabaseMock.auth.signUp.mock.calls[0][0].options.data;
      expect(callOptions.role).toBe(expectedRole);
    });
  });
});
