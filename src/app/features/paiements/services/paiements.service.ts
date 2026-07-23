import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, combineLatest, of } from 'rxjs';
import { switchMap, map, catchError } from 'rxjs/operators';
import { Paiement, StatutPaiement, FrequencePaiement, ModePaiement } from '../../../core/models/paiement.model';
import { BailAvecLocataire } from '@core/models/locataire.model';
import { environment } from '@env/environment';

export interface PaiementsFilters {
  statut?: StatutPaiement;
  bienId?: string;
  locataireId?: string;
  dateDebut?: Date;
  dateFin?: Date;
  montantMin?: number;
  montantMax?: number;
  modePaiement?: ModePaiement;
}

export interface PaiementRequest {
  locataireId: string;
  bienId: string;
  montant: number;
  montantEcheance: number;
  frequence: FrequencePaiement;
  datePaiement: Date;
  dateEcheance: Date;
  modePaiement: ModePaiement;
  numeroTransaction?: string;
}

const FREQ_MAP: Record<string, FrequencePaiement> = {
  MONTHLY:   FrequencePaiement.MENSUEL,
  QUARTERLY: FrequencePaiement.TRIMESTRIEL,
  BIANNUAL:  FrequencePaiement.SEMESTRIEL,
  ANNUAL:    FrequencePaiement.ANNUEL,
};

@Injectable({ providedIn: 'root' })
export class PaiementsService {
  private readonly propertiesUrl = `${environment.apiUrl}/properties`;
  // Conservé pour les méthodes qui seront actives quand le backend
  // implémentera le module paiements.
  private readonly apiUrl = `${environment.apiUrl}/paiements`;

  constructor(private http: HttpClient) {}

  // Dérive les échéances attendues depuis les baux actifs.
  // Le backend ne dispose pas encore de module paiements — cette méthode
  // agrège GET /api/properties → GET /api/properties/:id/tenants/history
  // et génère une ligne "ATTENDU" par bail actif pour le mois courant.
  getPaiements(filters?: PaiementsFilters): Observable<Paiement[]> {
    return this.http.get<{ data: { id: string }[] }>(
      this.propertiesUrl, { params: { limit: 200, page: 1 } }
    ).pipe(
      switchMap(({ data: props }) => {
        if (!props.length) return of([]);
        return combineLatest(
          props.map(p =>
            this.http.get<{ data: BailAvecLocataire[] }>(
              `${this.propertiesUrl}/${p.id}/tenants/history`,
              { params: { limit: '100' } }
            ).pipe(catchError(() => of({ data: [] as BailAvecLocataire[] })))
          )
        ).pipe(
          map(results => {
            const now = new Date();
            const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const monthKey = firstOfMonth.toISOString().slice(0, 7);
            let paiements: Paiement[] = [];

            for (const res of results) {
              for (const bail of res.data) {
                if (bail.status !== 'ACTIVE') continue;
                const montant = bail.monthlyRent + (bail.monthlyCharges ?? 0);
                paiements.push({
                  id: `ech-${bail.id}-${monthKey}`,
                  bienId: bail.propertyId,
                  locataireId: bail.tenantUserId,
                  montant,
                  montantEcheance: montant,
                  frequence: FREQ_MAP[bail.paymentFrequency] ?? FrequencePaiement.MENSUEL,
                  datePaiement: firstOfMonth,
                  dateEcheance: firstOfMonth,
                  statut: StatutPaiement.ATTENDU,
                  modePaiement: ModePaiement.ESPECES,
                  // Champs d'affichage enrichis issus du bail
                  _locataire: `${bail.tenant.firstName} ${bail.tenant.lastName}`,
                  _bien: `${bail.property.address}, ${bail.property.city}`,
                } as any);
              }
            }

            // Filtres côté client
            if (filters?.statut) paiements = paiements.filter(p => p.statut === filters.statut);
            if (filters?.bienId) paiements = paiements.filter(p => p.bienId === filters.bienId);
            if (filters?.locataireId) paiements = paiements.filter(p => p.locataireId === filters.locataireId);
            if (filters?.montantMin != null) paiements = paiements.filter(p => p.montant >= filters.montantMin!);
            if (filters?.montantMax != null) paiements = paiements.filter(p => p.montant <= filters.montantMax!);
            return paiements;
          })
        );
      })
    );
  }

  getPaiementById(id: string): Observable<Paiement> {
    return this.http.get<Paiement>(`${this.apiUrl}/${id}`);
  }

  createPaiement(paiement: PaiementRequest): Observable<Paiement> {
    return this.http.post<Paiement>(this.apiUrl, paiement);
  }

  updatePaiement(id: string, paiement: Partial<Paiement>): Observable<Paiement> {
    return this.http.put<Paiement>(`${this.apiUrl}/${id}`, paiement);
  }

  deletePaiement(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getImpayes(): Observable<Paiement[]> {
    return this.getPaiements({ statut: StatutPaiement.IMPAYE });
  }

  envoyerRappel(paiementId: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${paiementId}/rappel`, {});
  }

  getStatistiques(): Observable<{
    total: number;
    totalMontant: number;
    payes: number;
    impayes: number;
    enRetard: number;
    tauxRecouvrement: number;
    attendus: number;
    montantAttendu: number;
  }> {
    return this.getPaiements().pipe(
      map(paiements => {
        const attendus = paiements.filter(p => p.statut === StatutPaiement.ATTENDU);
        const payes    = paiements.filter(p => p.statut === StatutPaiement.PAYE);
        const impayes  = paiements.filter(p => p.statut === StatutPaiement.IMPAYE);
        const enRetard = paiements.filter(p => p.statut === StatutPaiement.EN_RETARD);
        return {
          total:          paiements.length,
          totalMontant:   payes.reduce((s, p) => s + p.montant, 0),
          payes:          payes.length,
          impayes:        impayes.length,
          enRetard:       enRetard.length,
          tauxRecouvrement: paiements.length ? Math.round(payes.length / paiements.length * 100) : 0,
          attendus:       attendus.length,
          montantAttendu: attendus.reduce((s, p) => s + p.montantEcheance, 0),
        };
      })
    );
  }

  telechargerQuittance(paiementId: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${paiementId}/quittance`, { responseType: 'blob' });
  }

  envoyerQuittanceEmail(paiementId: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${paiementId}/quittance/email`, {});
  }

  processMobileMoneyPayment(paymentData: {
    bienId: string;
    provider: 'tmoney' | 'flooz';
    telephone: string;
    pin: string;
    montant: number;
    periode: string;
  }): Observable<any> {
    return this.http.post(`${this.apiUrl}/mobile-money`, paymentData);
  }
}
