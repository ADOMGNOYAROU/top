import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable, from, BehaviorSubject } from 'rxjs';
import { map, tap, switchMap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from '@env/environment';
import { SupabaseService } from './supabase.service';
import type { Session, User } from '@supabase/supabase-js';

export type UserRole = 'OWNER' | 'TENANT' | 'MANAGER' | 'ADMIN';

export interface WarahUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  phone?: string;
  accountStatus?: string;
}

export interface RegisterRequest {
  prenom: string;
  nom: string;
  email: string;
  telephone: string;
  motDePasse: string;
  typeUtilisateur: 'proprietaire_local' | 'proprietaire_diaspora' | 'locataire' | 'gestionnaire';
  pieceIdentite?: File;
  ville?: string;
  paysResidence?: string;
  zoneIntervention?: string[];
  tarifs?: string;
  references?: string;
}

export interface LoginRequest {
  email: string;
  motDePasse: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  nouveauMotDePasse: string;
}

// Correspondance rôles Supabase → routes Angular
const ROLE_ROUTES: Record<string, string> = {
  OWNER:   '/dashboard',
  TENANT:  '/locataire',
  MANAGER: '/gestionnaire',
  ADMIN:   '/admin',
};

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly apiUrl = `${environment.apiUrl}/auth`;
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  private currentUserSubject = new BehaviorSubject<WarahUser | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  // Session Supabase courante (contient le JWT access_token)
  private session: Session | null = null;

  constructor(
    private supabase: SupabaseService,
    private http: HttpClient,
    private router: Router,
  ) {
    if (this.isBrowser) {
      // Écouter les changements de session Supabase (refresh automatique, déconnexion)
      this.supabase.auth.onAuthStateChange(async (_event, session) => {
        this.session = session;
        if (session) {
          await this.loadWarahProfile();
        } else {
          this.currentUserSubject.next(null);
        }
      });

      // Charger la session existante au démarrage
      this.supabase.getSession().then(({ data }) => {
        this.session = data.session;
        if (data.session) {
          this.loadWarahProfile();
        }
      });
    }
  }

  // ── Authentification ─────────────────────────────────────────

  login(data: LoginRequest): Observable<WarahUser> {
    return from(
      this.supabase.auth.signInWithPassword({
        email: data.email,
        password: data.motDePasse,
      })
    ).pipe(
      tap(({ error }) => { if (error) throw error; }),
      tap(({ data: d }) => { this.session = d.session; }),
      switchMap(() => this.loadWarahProfile())
    );
  }

  register(data: RegisterRequest): Observable<WarahUser> {
    // Étape 1 : créer le compte Supabase
    return from(
      this.supabase.auth.signUp({
        email: data.email,
        password: data.motDePasse,
        options: {
          data: {
            first_name: data.prenom,
            last_name: data.nom,
            phone: data.telephone,
            role: this.mapRole(data.typeUtilisateur),
          },
        },
      })
    ).pipe(
      tap(({ error }) => { if (error) throw error; }),
      tap(({ data: d }) => { this.session = d.session; }),
      // Étape 2 : créer le profil côté backend (si une route /api/auth/register existe)
      // Pour l'instant, loadWarahProfile() via /api/auth/me suffit
      switchMap(() => this.loadWarahProfile())
    );
  }

  forgotPassword(data: ForgotPasswordRequest): Observable<void> {
    return from(
      this.supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })
    ).pipe(
      tap(({ error }) => { if (error) throw error; }),
      map(() => void 0)
    );
  }

  resetPassword(data: { token: string; nouveauMotDePasse: string }): Observable<void> {
    // Supabase injecte le token dans l'URL au retour de l'email de reset
    // On met à jour le mot de passe de la session courante
    return from(
      this.supabase.auth.updateUser({ password: data.nouveauMotDePasse })
    ).pipe(
      tap(({ error }) => { if (error) throw error; }),
      map(() => void 0)
    );
  }

  logout(): void {
    this.supabase.auth.signOut().then(() => {
      this.session = null;
      this.currentUserSubject.next(null);
      this.router.navigate(['/auth/login']);
    });
  }

  // ── Token / session ──────────────────────────────────────────

  getToken(): string | null {
    return this.session?.access_token ?? null;
  }

  isLoggedIn(): boolean {
    return !!this.session?.access_token;
  }

  getCurrentUser(): WarahUser | null {
    return this.currentUserSubject.value;
  }

  // ── Profil backend ────────────────────────────────────────────

  private async loadWarahProfile(): Promise<WarahUser> {
    const token = this.getToken();
    if (!token) {
      this.currentUserSubject.next(null);
      return Promise.reject(new Error('Pas de session'));
    }

    return new Promise((resolve, reject) => {
      this.http
        .get<any>(`${this.apiUrl}/me`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .subscribe({
          next: (profile) => {
            const user: WarahUser = {
              id: profile.id,
              email: profile.email,
              firstName: profile.firstName ?? profile.profile?.firstName ?? '',
              lastName: profile.lastName ?? profile.profile?.lastName ?? '',
              role: profile.role as UserRole,
              phone: profile.phone,
              accountStatus: profile.accountStatus,
            };
            this.currentUserSubject.next(user);
            resolve(user);
          },
          error: reject,
        });
    });
  }

  // Route par défaut selon le rôle de l'utilisateur
  getDefaultRoute(): string {
    const role = this.currentUserSubject.value?.role;
    return role ? (ROLE_ROUTES[role] ?? '/dashboard') : '/auth/login';
  }

  // ── Helpers ──────────────────────────────────────────────────

  private mapRole(type: RegisterRequest['typeUtilisateur']): UserRole {
    switch (type) {
      case 'proprietaire_local':
      case 'proprietaire_diaspora': return 'OWNER';
      case 'locataire':             return 'TENANT';
      case 'gestionnaire':          return 'MANAGER';
      default:                      return 'OWNER';
    }
  }
}
