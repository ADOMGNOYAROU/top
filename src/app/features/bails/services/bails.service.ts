import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, combineLatest, of } from 'rxjs';
import { switchMap, map, catchError } from 'rxjs/operators';
import { environment } from '@env/environment';
import { Bail, CreateBailRequest, TerminateBailRequest, BailAvecLocataire } from '@core/models/locataire.model';

export interface LeaseHistoryEntry extends BailAvecLocataire {}

export interface PaginatedLeaseHistory {
  data: LeaseHistoryEntry[];
  total: number;
  page: number;
  limit: number;
}

@Injectable({ providedIn: 'root' })
export class BailsService {
  private readonly apiUrl = `${environment.apiUrl}/leases`;
  private readonly propertiesUrl = `${environment.apiUrl}/properties`;

  constructor(private http: HttpClient) {}

  createBail(dto: CreateBailRequest): Observable<Bail> {
    return this.http.post<Bail>(this.apiUrl, dto);
  }

  terminateBail(id: string, dto: TerminateBailRequest): Observable<Bail> {
    return this.http.post<Bail>(`${this.apiUrl}/${id}/terminate`, dto);
  }

  getHistoryByProperty(propertyId: string, page = 1, limit = 20): Observable<PaginatedLeaseHistory> {
    return this.http.get<PaginatedLeaseHistory>(
      `${this.propertiesUrl}/${propertyId}/tenants/history`,
      { params: { page, limit } }
    );
  }

  getHistoryByTenant(tenantUserId: string, page = 1, limit = 20): Observable<PaginatedLeaseHistory> {
    return this.http.get<PaginatedLeaseHistory>(
      `${environment.apiUrl}/tenants/${tenantUserId}/leases/history`,
      { params: { page, limit } }
    );
  }

  // GET /api/leases n'existe pas encore — agrège depuis l'historique par bien.
  getAllLeases(page = 1, limit = 50): Observable<PaginatedLeaseHistory> {
    return this.http.get<{ data: { id: string }[] }>(
      this.propertiesUrl, { params: { limit: 200, page: 1 } }
    ).pipe(
      switchMap(({ data: props }) => {
        if (!props.length) return of({ data: [], total: 0, page, limit });
        return combineLatest(
          props.map(p =>
            this.http.get<PaginatedLeaseHistory>(
              `${this.propertiesUrl}/${p.id}/tenants/history`,
              { params: { page: '1', limit: '100' } }
            ).pipe(catchError(() => of({ data: [] as BailAvecLocataire[], total: 0, page: 1, limit: 100 })))
          )
        ).pipe(
          map(results => {
            const all = results.flatMap(r => r.data);
            const total = all.length;
            const start = (page - 1) * limit;
            return { data: all.slice(start, start + limit), total, page, limit };
          })
        );
      })
    );
  }

  blockTenant(propertyId: string, tenantUserId: string, reason: string): Observable<any> {
    return this.http.post(
      `${this.propertiesUrl}/${propertyId}/tenants/${tenantUserId}/block`,
      { reason }
    );
  }
}
