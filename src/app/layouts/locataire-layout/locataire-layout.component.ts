import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-locataire-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="layout">
      <button class="mobile-btn" type="button" (click)="sidebarOpen = !sidebarOpen" aria-label="Menu">
        <span></span><span></span><span></span>
      </button>

      @if (sidebarOpen) {
        <div class="overlay" (click)="sidebarOpen = false"></div>
      }

      <aside class="sidebar" [class.open]="sidebarOpen">
        <div class="sidebar-logo">
          <div class="logo-box">
            <img src="/assets/WARAH-logo.png" alt="WARAH" class="logo-img">
          </div>
          <button class="close-btn" type="button" (click)="sidebarOpen = false" aria-label="Fermer">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div class="user-card">
          <div class="user-avatar">{{ initiales }}</div>
          <div class="user-info">
            <p class="user-name">{{ prenom }} {{ nom }}</p>
            <span class="user-role">Locataire</span>
          </div>
        </div>

        <nav class="sidebar-nav" (click)="sidebarOpen = false">
          <a routerLink="/locataire" routerLinkActive="active" [routerLinkActiveOptions]="{exact:true}" class="nav-item">
            <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="7" height="7" rx="1"></rect>
              <rect x="14" y="3" width="7" height="7" rx="1"></rect>
              <rect x="14" y="14" width="7" height="7" rx="1"></rect>
              <rect x="3" y="14" width="7" height="7" rx="1"></rect>
            </svg>
            <span>Mon espace</span>
          </a>

          <div class="nav-section-label">Ma location</div>

          <a routerLink="/locataire/paiements" routerLinkActive="active" class="nav-item">
            <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
              <line x1="1" y1="10" x2="23" y2="10"></line>
            </svg>
            <span>Mes paiements</span>
          </a>

          <a routerLink="/annonces" routerLinkActive="active" class="nav-item">
            <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <span>Chercher un logement</span>
          </a>

          <div class="nav-section-label">Compte</div>

          <a routerLink="/locataire/notifications" routerLinkActive="active" class="nav-item">
            <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
            <span>Notifications</span>
          </a>
        </nav>

        <div class="sidebar-footer">
          <a routerLink="/" class="footer-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
            <span>Accueil</span>
          </a>
          <button class="logout-btn" type="button" (click)="deconnecter()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      <main class="main-content">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .layout { display: flex; min-height: 100vh; background: #F4F1ED; }

    .mobile-btn {
      display: none; position: fixed; top: 1rem; left: 1rem; z-index: 200;
      width: 44px; height: 44px; border-radius: 10px; border: none;
      background: var(--color-primary); box-shadow: 0 4px 12px rgba(15,76,129,0.4);
      flex-direction: column; align-items: center; justify-content: center; gap: 5px; cursor: pointer;
    }
    .mobile-btn span { display: block; width: 20px; height: 2px; background: white; border-radius: 2px; }
    .overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.45); z-index: 99; backdrop-filter: blur(2px); }

    /* ── Sidebar blanche (identique propriétaire) ── */
    .sidebar {
      width: 256px;
      background: #FFFFFF;
      border-right: 1px solid #E8E1D8;
      display: flex; flex-direction: column; position: fixed; left: 0; top: 0; height: 100vh;
      z-index: 100; box-shadow: 2px 0 12px rgba(10,38,80,0.06);
      transition: transform 0.3s cubic-bezier(0.4,0,0.2,1);
    }

    .close-btn { display: none; background: none; border: none; color: #9CA3AF; cursor: pointer; padding: 4px; border-radius: 6px; transition: all 0.15s; }
    .close-btn svg { width: 20px; height: 20px; }
    .close-btn:hover { color: #374151; background: #F4F1ED; }

    .sidebar-logo {
      padding: 20px 20px 16px; border-bottom: 1px solid #EEE8DF;
      display: flex; align-items: center; justify-content: space-between;
    }
    .logo-box { display: inline-flex; align-items: center; }
    .logo-img { height: 44px; width: auto; display: block; }

    .user-card {
      padding: 14px 16px; border-bottom: 1px solid #EEE8DF;
      display: flex; align-items: center; gap: 12px;
    }
    .user-avatar {
      width: 40px; height: 40px; border-radius: 10px;
      background: linear-gradient(135deg, #0F4C81, #0A2650);
      display: flex; align-items: center; justify-content: center;
      font-weight: 700; font-size: 14px; color: white; flex-shrink: 0;
    }
    .user-name { font-size: 13px; font-weight: 600; color: #0A2650; line-height: 1.3; }
    .user-role {
      display: inline-block; font-size: 10px; font-weight: 700;
      color: #C9982E; letter-spacing: 0.08em; text-transform: uppercase; margin-top: 2px;
    }

    .sidebar-nav { flex: 1; padding: 10px 12px; overflow-y: auto; scrollbar-width: thin; scrollbar-color: #E8E1D8 transparent; }
    .nav-section-label {
      font-size: 10px; font-weight: 700; letter-spacing: 0.1em;
      text-transform: uppercase; color: #9CA3AF; padding: 12px 10px 6px;
    }
    .nav-item {
      display: flex; align-items: center; gap: 10px; padding: 9px 12px;
      border-radius: 8px; color: #4B5563; text-decoration: none;
      font-size: 13.5px; font-weight: 500; transition: all 0.15s ease;
      margin-bottom: 1px; border-left: 3px solid transparent;
    }
    .nav-item:hover { background: #EAF1F8; color: #0F4C81; border-left-color: #C9982E; }
    .nav-item.active { background: #EAF1F8; color: #0F4C81; border-left-color: #C9982E; font-weight: 600; }
    .nav-icon { width: 17px; height: 17px; flex-shrink: 0; }

    .sidebar-footer {
      padding: 10px 12px 16px; border-top: 1px solid #EEE8DF;
      display: flex; flex-direction: column; gap: 2px;
    }
    .footer-item, .logout-btn {
      display: flex; align-items: center; gap: 10px; padding: 9px 12px;
      border-radius: 8px; color: #6B7280; font-size: 13px; font-weight: 500;
      text-decoration: none; transition: all 0.15s; background: none; border: none;
      cursor: pointer; width: 100%; text-align: left;
    }
    .footer-item svg, .logout-btn svg { width: 17px; height: 17px; flex-shrink: 0; }
    .footer-item:hover { background: #EAF1F8; color: #0F4C81; }
    .logout-btn:hover { background: #FEE2E2; color: #DC2626; }

    .main-content { flex: 1; margin-left: 256px; min-height: 100vh; overflow-x: hidden; }

    @media (max-width: 1024px) { .sidebar { width: 240px; } .main-content { margin-left: 240px; } }
    @media (max-width: 768px) {
      .mobile-btn { display: flex; }
      .close-btn { display: flex; }
      .sidebar { transform: translateX(-100%); width: 280px; }
      .sidebar.open { transform: translateX(0); }
      .main-content { margin-left: 0; padding-top: 3.5rem; }
    }
  `]
})
export class LocataireLayoutComponent implements OnInit {
  sidebarOpen = false;
  prenom = '';
  nom = '';
  initiales = 'L';

  ngOnInit(): void {
    try {
      const raw = localStorage.getItem('WARAH_user');
      if (raw) {
        const u = JSON.parse(raw);
        this.prenom = u.prenom || '';
        this.nom = u.nom || '';
        this.initiales = ((u.prenom?.[0] || '') + (u.nom?.[0] || '')).toUpperCase() || 'L';
      }
    } catch {}
  }

  deconnecter(): void {
    localStorage.removeItem('WARAH_token');
    localStorage.removeItem('WARAH_user');
    window.location.href = '/auth/login';
  }
}
