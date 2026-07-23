import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '@env/environment';

export interface DelegationManager {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface PowerDelegation {
  id: string;
  managerId: string;
  manager: DelegationManager;
  status: 'ACTIVE' | 'REVOKED';
  grantedAt: string;
  revokedAt?: string;
}

export interface DelegationReceived {
  id: string;
  ownerId: string;
  owner: DelegationManager;
  status: 'ACTIVE';
  grantedAt: string;
}

@Injectable({ providedIn: 'root' })
export class DelegationService {
  private readonly url = `${environment.apiUrl}/delegation`;

  private readonly _delegation$ = new BehaviorSubject<PowerDelegation | null>(null);
  readonly delegation$ = this._delegation$.asObservable();

  constructor(private http: HttpClient) {}

  get delegationActive(): boolean {
    return this._delegation$.value?.status === 'ACTIVE';
  }

  loadStatus(): Observable<PowerDelegation | null> {
    return this.http.get<PowerDelegation | null>(`${this.url}/status`).pipe(
      tap(d => this._delegation$.next(d)),
    );
  }

  getCandidates(): Observable<DelegationManager[]> {
    return this.http.get<DelegationManager[]>(`${this.url}/candidates`);
  }

  grant(payload: { managerId?: string; managerEmail?: string }): Observable<PowerDelegation> {
    return this.http.post<PowerDelegation>(this.url, payload).pipe(
      tap(d => this._delegation$.next(d)),
    );
  }

  revoke(): Observable<void> {
    return this.http.delete<void>(this.url).pipe(
      tap(() => this._delegation$.next(null)),
    );
  }

  getReceived(): Observable<DelegationReceived | null> {
    return this.http.get<DelegationReceived | null>(`${this.url}/received`);
  }
}
