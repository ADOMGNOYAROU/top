import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Locataire, InviteLocataireRequest, InviteLocataireResponse } from '@core/models/locataire.model';
import { environment } from '@env/environment';

export interface LocatairesFilters {
  statut?: string;
  search?: string;
}

@Injectable({ providedIn: 'root' })
export class LocatairesService {
  private readonly tenantsUrl = `${environment.apiUrl}/tenants`;

  constructor(private http: HttpClient) {}

  getLocataires(filters?: LocatairesFilters): Observable<Locataire[]> {
    return this.http.get<Locataire[]>(this.tenantsUrl).pipe(
      map(locataires => {
        let result = locataires;
        if (filters?.statut) {
          result = result.filter(l => l.accountStatus === filters.statut);
        }
        if (filters?.search) {
          const q = filters.search.toLowerCase();
          result = result.filter(l =>
            l.firstName.toLowerCase().includes(q) ||
            l.lastName.toLowerCase().includes(q) ||
            (l.email ?? '').toLowerCase().includes(q) ||
            (l.phone ?? '').includes(q)
          );
        }
        return result;
      })
    );
  }

  getLocataireById(tenantUserId: string): Observable<Locataire> {
    return this.http.get<Locataire>(`${this.tenantsUrl}/${tenantUserId}`);
  }

  inviteLocataire(data: InviteLocataireRequest): Observable<InviteLocataireResponse> {
    return this.http.post<InviteLocataireResponse>(
      `${environment.apiUrl}/auth/invite/tenant`, data
    );
  }
}
