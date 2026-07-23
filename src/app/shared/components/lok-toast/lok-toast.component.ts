import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { RealtimeNotificationsService, AppNotification } from '../../../core/services/realtime-notifications.service';

interface Toast {
  id: string;
  titre: string;
  event: string;
}

@Component({
  selector: 'lok-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      @for (toast of toasts; track toast.id) {
        <div class="toast" (click)="dismiss(toast.id)">
          <div class="toast-icon">
            <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
          </div>
          <div class="toast-content">
            <p class="toast-title">{{ toast.titre }}</p>
            <p class="toast-sub">Nouvelle notification</p>
          </div>
          <button class="toast-close" (click)="dismiss(toast.id)">✕</button>
        </div>
      }
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed; bottom: 1.5rem; right: 1.5rem;
      display: flex; flex-direction: column; gap: .75rem;
      z-index: 9999; pointer-events: none;
    }
    .toast {
      display: flex; align-items: center; gap: .875rem;
      background: white; border-radius: 12px;
      padding: .875rem 1rem;
      box-shadow: 0 8px 32px rgba(0,0,0,.15);
      border-left: 4px solid var(--color-primary);
      min-width: 280px; max-width: 360px;
      cursor: pointer; pointer-events: all;
      animation: slideIn .3s ease-out;
    }
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to   { transform: translateX(0);   opacity: 1; }
    }
    .toast-icon {
      width: 36px; height: 36px; border-radius: 50%;
      background: #EEF4FC; color: var(--color-primary);
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    }
    .toast-content { flex: 1; min-width: 0; }
    .toast-title { font-size: .875rem; font-weight: 700; color: #111827; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .toast-sub { font-size: .75rem; color: #9CA3AF; margin-top: .125rem; }
    .toast-close { background: none; border: none; color: #9CA3AF; cursor: pointer; font-size: .875rem; padding: .25rem; flex-shrink: 0; }
    .toast-close:hover { color: #374151; }
  `],
})
export class LokToastComponent implements OnInit, OnDestroy {
  toasts: Toast[] = [];
  private sub: Subscription | null = null;

  constructor(private realtimeService: RealtimeNotificationsService) {}

  ngOnInit(): void {
    this.sub = this.realtimeService.newNotification$.subscribe(notif => {
      this.show(notif);
    });
  }

  private show(notif: AppNotification): void {
    const toast: Toast = { id: notif.id, titre: notif.titre, event: notif.event };
    this.toasts = [toast, ...this.toasts].slice(0, 4);
    setTimeout(() => this.dismiss(toast.id), 5000);
  }

  dismiss(id: string): void {
    this.toasts = this.toasts.filter(t => t.id !== id);
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
}
