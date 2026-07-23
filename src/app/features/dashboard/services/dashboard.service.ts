import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, combineLatest, of } from 'rxjs';
import { switchMap, map, catchError } from 'rxjs/operators';
import { StatutPaiement } from '@core/models/paiement.model';
import { PropertyStatus } from '@core/models/bien.model';
import { BailAvecLocataire } from '@core/models/locataire.model';
import { environment } from '@env/environment';

export interface DashboardKPI {
  totalBiens: number;
  biensOccupes: number;
  biensVacants: number;
  totalLocataires: number;
  revenusMensuels: number;
  revenusAnnuels: number;
  impayes: number;
  tauxOccupation: number;
}

export interface RevenuMensuel {
  mois: string;
  montant: number;
  paiements: number;
}

export interface Alerte {
  id: string;
  type: 'retard' | 'impaye' | 'bientot_expire' | 'maintenance';
  titre: string;
  description: string;
  date: Date;
  priorite: 'haute' | 'moyenne' | 'basse';
  bienId?: string;
  locataireId?: string;
}

export interface DernierPaiement {
  id: string;
  locataire: string;
  bien: string;
  montant: number;
  date: Date;
  statut: StatutPaiement;
}

export interface DernierBien {
  id: string;
  neighborhood: string;
  type: string;
  city: string;
  monthlyRent: number;
  status: PropertyStatus;
  createdAt: string;
}

interface PropertyItem {
  id: string;
  status: string;
  neighborhood: string;
  type: string;
  city: string;
  monthlyRent: number;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly propertiesUrl = `${environment.apiUrl}/properties`;

  constructor(private http: HttpClient) {}

  // Calcule les KPIs depuis GET /api/properties + historiques de baux.
  // Pas de module /api/dashboard côté backend — dérivation côté frontend.
  getKPIs(): Observable<DashboardKPI> {
    return this.http.get<{ data: PropertyItem[]; total: number }>(
      this.propertiesUrl, { params: { limit: 200, page: 1 } }
    ).pipe(
      switchMap(({ data: props, total }) => {
        const totalBiens    = total;
        const biensOccupes  = props.filter(p => p.status === 'OCCUPIED').length;
        const biensVacants  = props.filter(p => p.status === 'VACANT').length;
        const tauxOccupation = total > 0 ? Math.round(biensOccupes / total * 100) : 0;

        if (!props.length) {
          return of<DashboardKPI>({
            totalBiens, biensOccupes, biensVacants,
            totalLocataires: 0, revenusMensuels: 0, revenusAnnuels: 0,
            impayes: 0, tauxOccupation,
          });
        }

        return combineLatest(
          props.map(p =>
            this.http.get<{ data: BailAvecLocataire[] }>(
              `${this.propertiesUrl}/${p.id}/tenants/history`,
              { params: { limit: '50' } }
            ).pipe(catchError(() => of({ data: [] as BailAvecLocataire[] })))
          )
        ).pipe(
          map(results => {
            const allBails    = results.flatMap(r => r.data);
            const activeBails = allBails.filter(b => b.status === 'ACTIVE');
            const seenTenants = new Set(activeBails.map(b => b.tenant.id));
            const revenusMensuels = activeBails.reduce(
              (s, b) => s + b.monthlyRent + (b.monthlyCharges ?? 0), 0
            );
            return {
              totalBiens,
              biensOccupes,
              biensVacants,
              totalLocataires:  seenTenants.size,
              revenusMensuels,
              revenusAnnuels:   revenusMensuels * 12,
              impayes:          0,
              tauxOccupation,
            };
          })
        );
      })
    );
  }

  // Génère 12 mois de revenus attendus depuis les baux actifs.
  getRevenusMensuels(annee: number = new Date().getFullYear()): Observable<RevenuMensuel[]> {
    return this.http.get<{ data: { id: string }[] }>(
      this.propertiesUrl, { params: { limit: 200, page: 1 } }
    ).pipe(
      switchMap(({ data: props }) => {
        if (!props.length) return of(this.buildEmptyMonths(annee));
        return combineLatest(
          props.map(p =>
            this.http.get<{ data: BailAvecLocataire[] }>(
              `${this.propertiesUrl}/${p.id}/tenants/history`,
              { params: { limit: '50' } }
            ).pipe(catchError(() => of({ data: [] as BailAvecLocataire[] })))
          )
        ).pipe(
          map(results => {
            const activeBails = results.flatMap(r => r.data).filter(b => b.status === 'ACTIVE');
            return Array.from({ length: 12 }, (_, i) => {
              const d = new Date(annee, i, 1);
              const relevant = activeBails.filter(b => {
                const start = new Date(b.startDate);
                const end   = b.endDate ? new Date(b.endDate) : null;
                return start <= d && (!end || end >= d);
              });
              return {
                mois:      d.toISOString().slice(0, 7),
                montant:   relevant.reduce((s, b) => s + b.monthlyRent + (b.monthlyCharges ?? 0), 0),
                paiements: relevant.length,
              };
            });
          })
        );
      })
    );
  }

  // Le backend n'expose pas encore d'alertes — retourne une liste vide.
  getAlertes(): Observable<Alerte[]> {
    return of([]);
  }

  // Les paiements récents ne sont pas encore exposés par le backend.
  getDerniersPaiements(_limit: number = 5): Observable<DernierPaiement[]> {
    return of([]);
  }

  getDerniersBiens(limit: number = 5): Observable<DernierBien[]> {
    return this.http.get<{ data: DernierBien[] }>(
      this.propertiesUrl, { params: { limit, page: 1 } }
    ).pipe(
      map(res => res.data.slice(0, limit)),
      catchError(() => of([]))
    );
  }

  marquerAlerteLue(_alerteId: string): Observable<void> {
    return of(undefined);
  }

  private buildEmptyMonths(annee: number): RevenuMensuel[] {
    return Array.from({ length: 12 }, (_, i) => ({
      mois:      new Date(annee, i, 1).toISOString().slice(0, 7),
      montant:   0,
      paiements: 0,
    }));
  }
}
