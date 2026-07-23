import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Subject } from 'rxjs';
import { RealtimeChannel } from '@supabase/supabase-js';
import { environment } from '@env/environment';
import { SupabaseService } from './supabase.service';
import { AuthService } from './auth.service';

export interface AppNotification {
  id: string;
  event: string;
  titre: string;
  channel: string;
  status: string;
  payload: Record<string, unknown> | null;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class RealtimeNotificationsService implements OnDestroy {
  private readonly apiUrl = `${environment.apiUrl}/notifications`;
  private channel: RealtimeChannel | null = null;

  private readonly _notifications$ = new BehaviorSubject<AppNotification[]>([]);
  readonly notifications$ = this._notifications$.asObservable();

  private readonly _newNotification$ = new Subject<AppNotification>();
  readonly newNotification$ = this._newNotification$.asObservable();

  get unreadCount(): number {
    const since = Date.now() - 24 * 60 * 60 * 1000;
    return this._notifications$.value.filter(
      n => new Date(n.createdAt).getTime() > since
    ).length;
  }

  constructor(
    private http: HttpClient,
    private supabase: SupabaseService,
    private auth: AuthService,
  ) {}

  init(): void {
    this.loadHistory();
    this.subscribeRealtime();
  }

  private loadHistory(): void {
    this.http.get<AppNotification[]>(`${this.apiUrl}?limit=30`).subscribe({
      next: (notifs) => this._notifications$.next(notifs),
      error: () => {},
    });
  }

  private subscribeRealtime(): void {
    const user = this.auth.getCurrentUser();
    if (!user?.id) return;

    this.channel = this.supabase.client
      .channel('notifications-' + user.id)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const raw = payload.new as Record<string, unknown>;
          const notif: AppNotification = {
            id: raw['id'] as string,
            event: raw['event'] as string,
            titre: this.labelFor(raw['event'] as string),
            channel: raw['channel'] as string,
            status: raw['status'] as string,
            payload: raw['payload'] as Record<string, unknown> | null,
            createdAt: raw['created_at'] as string,
          };
          this._notifications$.next([notif, ...this._notifications$.value]);
          this._newNotification$.next(notif);
        }
      )
      .subscribe();
  }

  private labelFor(event: string): string {
    const labels: Record<string, string> = {
      'receipt':                     'Quittance disponible',
      'payment-reminder':            'Rappel de loyer',
      'overdue-alert':               'Loyer impayé',
      'payment-declaration-pending': 'Paiement à confirmer',
      'monthly-report':              'Rapport mensuel disponible',
      'listing-contact':             'Nouveau contact annonce',
      'inactivity-warning':          'Compte bientôt suspendu',
      'account-suspended':           'Compte suspendu',
      'account-reactivated':         'Compte réactivé',
      'tenant-invitation':           'Invitation envoyée',
      'lease-created':               'Nouveau bail',
      'delegation-granted':          'Délégation reçue',
      'delegation-revoked':          'Fin de délégation',
    };
    return labels[event] ?? event;
  }

  ngOnDestroy(): void {
    if (this.channel) {
      this.supabase.client.removeChannel(this.channel);
    }
  }
}
