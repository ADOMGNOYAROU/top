import { Component, OnInit, OnDestroy, signal, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { Meta, Title } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { Annonce, TypeAnnonce, StatutAnnonce } from '@core/models/annonce.model';
import { AnnoncesService } from '../../services/annonces.service';
import { catchError, of } from 'rxjs';
import { LokSkeletonComponent } from '../../../../shared/components/lok-skeleton/lok-skeleton.component';
import { LokEmptyStateComponent } from '../../../../shared/components/lok-empty-state/lok-empty-state.component';

const MOCK: Annonce[] = [
  { id: '1', titre: 'Villa moderne avec jardin', description: 'Magnifique villa 5 pièces avec jardin et garage. Quartier calme et sécurisé.', type: TypeAnnonce.LOCATION, typeBien: 'Villa', prix: 350000, adresse: { quartier: 'Adewui', ville: 'Lomé' }, bienId: 'b1', photos: ['https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80'], statut: StatutAnnonce.ACTIVE, dateCreation: new Date('2026-06-01'), dateExpiration: new Date('2026-12-01'), contact: { nom: 'Jean Koffi', telephone: '+228 90 11 22 33', note: 4.8, nombreBiensGeres: 5 } },
  { id: '2', titre: 'Appartement 3 pièces lumineux', description: 'Bel appartement au 3ème étage avec vue dégagée. Cuisine équipée, 2 chambres.', type: TypeAnnonce.LOCATION, typeBien: 'Appartement', prix: 150000, adresse: { quartier: 'Bè', ville: 'Lomé' }, bienId: 'b2', photos: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80'], statut: StatutAnnonce.ACTIVE, dateCreation: new Date('2026-06-10'), dateExpiration: new Date('2026-12-10'), contact: { nom: 'Afi Mensah', telephone: '+228 90 44 55 66', note: 4.5, nombreBiensGeres: 3 } },
  { id: '3', titre: 'Studio meublé Tokoin', description: 'Studio entièrement meublé, idéal étudiant ou professionnel célibataire. Climatisé.', type: TypeAnnonce.LOCATION, typeBien: 'Studio', prix: 75000, adresse: { quartier: 'Tokoin', ville: 'Lomé' }, bienId: 'b3', photos: ['https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&q=80'], statut: StatutAnnonce.ACTIVE, dateCreation: new Date('2026-06-15'), dateExpiration: new Date('2026-12-15'), contact: { nom: 'Kofi Amoussou', telephone: '+228 90 77 88 99', note: 4.2, nombreBiensGeres: 8 } },
  { id: '4', titre: 'Maison 4 pièces Nyékonakpoè', description: 'Grande maison avec cour intérieure, idéale pour une famille. Quartier résidentiel.', type: TypeAnnonce.LOCATION, typeBien: 'Maison', prix: 200000, adresse: { quartier: 'Nyékonakpoè', ville: 'Lomé' }, bienId: 'b4', photos: ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80'], statut: StatutAnnonce.ACTIVE, dateCreation: new Date('2026-05-20'), dateExpiration: new Date('2026-11-20'), contact: { nom: 'Sœur Ayi', telephone: '+228 91 22 33 44', note: 4.7, nombreBiensGeres: 2 } },
  { id: '5', titre: 'Bureau aménagé centre-ville', description: 'Espace bureau 80m² en open space, 2 salles de réunion. Idéal PME/TPE. Parking.', type: TypeAnnonce.LOCATION, typeBien: 'Bureau', prix: 280000, adresse: { quartier: 'Kodjoviakopé', ville: 'Lomé' }, bienId: 'b5', photos: ['https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80'], statut: StatutAnnonce.ACTIVE, dateCreation: new Date('2026-06-05'), dateExpiration: new Date('2026-12-05'), contact: { nom: 'Ibrahim Touré', telephone: '+228 92 55 66 77', note: 4.9, nombreBiensGeres: 12 } },
  { id: '6', titre: 'Villa de luxe piscine Hédzranawé', description: 'Villa d\'exception 6 pièces avec piscine privée, terrain paysagé. Standing supérieur.', type: TypeAnnonce.LOCATION, typeBien: 'Villa', prix: 650000, adresse: { quartier: 'Hédzranawé', ville: 'Lomé' }, bienId: 'b6', photos: ['https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&q=80'], statut: StatutAnnonce.ACTIVE, dateCreation: new Date('2026-06-20'), dateExpiration: new Date('2026-12-20'), contact: { nom: 'Marc Dosseh', telephone: '+228 93 00 11 22', note: 5.0, nombreBiensGeres: 7 } },
  { id: '7', titre: 'Appartement 2 pièces Agoè', description: 'Appartement neuf en résidence sécurisée. Accès gardé 24h, groupe électrogène.', type: TypeAnnonce.LOCATION, typeBien: 'Appartement', prix: 120000, adresse: { quartier: 'Agoè', ville: 'Lomé' }, bienId: 'b7', photos: ['https://images.unsplash.com/photo-1560440021-33f9b867899d?w=800&q=80'], statut: StatutAnnonce.ACTIVE, dateCreation: new Date('2026-07-01'), dateExpiration: new Date('2027-01-01'), contact: { nom: 'Adjoa Sagna', telephone: '+228 94 33 44 55', note: 4.6, nombreBiensGeres: 4 } },
  { id: '8', titre: 'Maison à vendre Kara', description: 'Belle maison 4 pièces, terrain 400m², idéale résidence principale. Vue sur la montagne.', type: TypeAnnonce.VENTE, typeBien: 'Maison', prix: 15000000, adresse: { quartier: 'Centre', ville: 'Kara' }, bienId: 'b8', photos: ['https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=800&q=80'], statut: StatutAnnonce.ACTIVE, dateCreation: new Date('2026-05-10'), dateExpiration: new Date('2026-11-10'), contact: { nom: 'Yao Djangbé', telephone: '+228 90 88 99 00', note: 4.4, nombreBiensGeres: 2 } },
  { id: '9', titre: 'Studio meublé Adewui', description: 'Studio moderne tout équipé, résidence étudiante. Wi-Fi inclus, gardienné.', type: TypeAnnonce.LOCATION, typeBien: 'Studio', prix: 55000, adresse: { quartier: 'Adewui', ville: 'Lomé' }, bienId: 'b9', photos: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80'], statut: StatutAnnonce.ACTIVE, dateCreation: new Date('2026-07-05'), dateExpiration: new Date('2027-01-05'), contact: { nom: 'Komla Agboka', telephone: '+228 91 66 77 88', note: 4.3, nombreBiensGeres: 15 } },
];

@Component({
  selector: 'app-annonces-public',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, LokSkeletonComponent, LokEmptyStateComponent],
  template: `
<div class="pub-page">

  <!-- ── NAVBAR (identique landing) ── -->
  <nav class="nav" [class.nav-solid]="navScrolled()">
    <div class="nav-inner">
      <a routerLink="/" class="nav-logo">
        <img src="/assets/WARAH-logo.png" alt="WARAH" class="logo-img">
      </a>
      <ul class="nav-links">
        <li><a routerLink="/" class="nl">Accueil</a></li>
        <li><a routerLink="/annonces" class="nl nl-active">Annonces</a></li>
        <li><a routerLink="/a-propos" class="nl">À propos</a></li>
      </ul>
      <div class="nav-cta">
        <a routerLink="/auth/login" class="btn-ghost">Connexion</a>
        <a routerLink="/auth/register" class="btn-nav-primary">S'inscrire</a>
      </div>
      <button class="hamburger" (click)="menuOpen.set(!menuOpen())" aria-label="Menu">
        <span></span><span></span><span></span>
      </button>
    </div>
    @if (menuOpen()) {
      <div class="m-menu" (click)="menuOpen.set(false)">
        <a routerLink="/" class="mm-link">Accueil</a>
        <a routerLink="/annonces" class="mm-link">Annonces</a>
        <a routerLink="/a-propos" class="mm-link">À propos</a>
        <div class="mm-sep"></div>
        <a routerLink="/auth/login" class="mm-link">Connexion</a>
        <a routerLink="/auth/register" class="mm-cta">S'inscrire gratuitement</a>
      </div>
    }
  </nav>

  <!-- ── HERO ── -->
  <section class="hero">
    <img
      src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
      alt="Immobilier Lomé Togo"
      class="hero-bg">
    <div class="hero-ov"></div>

    <div class="hero-content">

      <!-- Texte hero -->
      <div class="hero-body">
        <div class="hero-badge">
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M8 1l1.9 3.9 4.3.6-3.1 3 .7 4.3L8 10.8l-3.8 2-.7-4.3-3.1-3 4.3-.6z"/></svg>
          Annonces vérifiées · Lomé, Togo
        </div>
        <h1 class="hero-title">Trouvez votre logement idéal<br>au Togo</h1>
        <p class="hero-sub">Villas, appartements, studios — gérés en toute transparence sur WARAH</p>
        <div class="hero-stats">
          <div class="hstat">
            <span class="hstat-n">{{ allAnnonces().length }}</span>
            <span class="hstat-l">annonces disponibles</span>
          </div>
          <div class="hstat-sep"></div>
          <div class="hstat">
            <span class="hstat-n">6</span>
            <span class="hstat-l">villes couvertes</span>
          </div>
          <div class="hstat-sep"></div>
          <div class="hstat">
            <span class="hstat-n">500+</span>
            <span class="hstat-l">propriétaires actifs</span>
          </div>
        </div>
      </div>

      <!-- ── FILTRE HERO (déborde en bas) ── -->
      <div class="filter-card">
        <div class="filter-row">
          <div class="fg">
            <label class="fg-label">
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 9l5-7 5 7v6a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z"/><polyline points="6 16 6 9 10 9 10 16"/></svg>
              Type de bien
            </label>
            <select [(ngModel)]="typeFilter" (ngModelChange)="onFilter()" class="fg-select">
              <option value="">Tous les types</option>
              <option value="Villa">Villa</option>
              <option value="Appartement">Appartement</option>
              <option value="Studio">Studio</option>
              <option value="Maison">Maison</option>
              <option value="Bureau">Bureau</option>
            </select>
          </div>
          <div class="fg-divider"></div>
          <div class="fg">
            <label class="fg-label">
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M8 1C5.2 1 3 3.2 3 6c0 4 5 9 5 9s5-5 5-9c0-2.8-2.2-5-5-5z"/><circle cx="8" cy="6" r="2"/></svg>
              Ville
            </label>
            <select [(ngModel)]="villeFilter" (ngModelChange)="onFilter()" class="fg-select">
              <option value="">Toutes les villes</option>
              <option value="Lomé">Lomé</option>
              <option value="Kara">Kara</option>
              <option value="Sokodé">Sokodé</option>
              <option value="Atakpamé">Atakpamé</option>
              <option value="Kpalimé">Kpalimé</option>
              <option value="Tsévié">Tsévié</option>
            </select>
          </div>
          <div class="fg-divider"></div>
          <div class="fg">
            <label class="fg-label">
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="1" y="3" width="14" height="10" rx="1.5"/><path d="M1 7h14"/></svg>
              Budget maximum
            </label>
            <select [(ngModel)]="budgetFilter" (ngModelChange)="onFilter()" class="fg-select">
              <option value="">Tous les budgets</option>
              <option value="75000">— 75 000 FCFA</option>
              <option value="150000">— 150 000 FCFA</option>
              <option value="300000">— 300 000 FCFA</option>
              <option value="500000">— 500 000 FCFA</option>
            </select>
          </div>
          <button class="fg-btn" (click)="onFilter()">
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="8.5" cy="8.5" r="5.5"/><path d="M15 15l3.5 3.5"/></svg>
            Rechercher
          </button>
        </div>
        @if (hasFilters()) {
          <div class="filter-active">
            <span class="fa-count">{{ filtered().length }} résultat{{ filtered().length !== 1 ? 's' : '' }}</span>
            <button class="fa-reset" (click)="clearFilters()">
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 4L4 12M4 4l8 8"/></svg>
              Effacer les filtres
            </button>
          </div>
        }
      </div>

    </div>
  </section>

  <!-- ── ANNONCES ── -->
  <section class="listings">
    <div class="listings-head">
      <p class="listings-count">
        @if (!loading()) { {{ filtered().length }} bien{{ filtered().length !== 1 ? 's' : '' }} disponible{{ filtered().length !== 1 ? 's' : '' }} }
        @else { Chargement des annonces… }
      </p>
      <div class="listings-sort">
        <select class="sort-select" [(ngModel)]="sortOrder" (ngModelChange)="onFilter()">
          <option value="recent">Plus récents</option>
          <option value="prix_asc">Prix croissant</option>
          <option value="prix_desc">Prix décroissant</option>
        </select>
      </div>
    </div>

    @if (loading()) {
      <div class="ann-grid">
        @for (i of [1,2,3,4,5,6,7,8,9]; track i) {
          <lok-skeleton type="card"></lok-skeleton>
        }
      </div>
    } @else if (filtered().length === 0) {
      <lok-empty-state
        titre="Aucun bien trouvé"
        description="Aucune annonce ne correspond à vos critères de recherche."
        ctaLabel="Effacer les filtres"
        icon="default"
        (ctaAction)="clearFilters()"
      ></lok-empty-state>
    } @else {
      <div class="ann-grid">
        @for (a of filtered(); track a.id) {
          <article class="ann-card" (click)="viewAnnonce(a.id)" tabindex="0" role="button">
            <div class="ann-img-wrap">
              <img [src]="a.photos[0]" [alt]="a.titre" class="ann-img" loading="lazy">
              <div class="ann-img-gradient"></div>
              <span class="ann-badge-type" [class.badge-loc]="a.type === 'LOCATION'" [class.badge-vente]="a.type === 'VENTE'">
                {{ a.type === 'LOCATION' ? 'Location' : 'Vente' }}
              </span>
              @if (a.statut === 'ACTIVE') {
                <span class="ann-badge-dispo">Disponible</span>
              }
              <div class="ann-price">
                {{ a.prix | number:'1.0-0' }} FCFA@if (a.type === 'LOCATION') {<small>/mois</small>}
              </div>
            </div>

            <div class="ann-body">
              <div class="ann-meta">
                @if (a.typeBien) { <span class="ann-chip">{{ a.typeBien }}</span> }
                <span class="ann-quartier">
                  <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6 1a3.5 3.5 0 0 1 3.5 3.5c0 3-3.5 6.5-3.5 6.5S2.5 7.5 2.5 4.5A3.5 3.5 0 0 1 6 1z"/><circle cx="6" cy="4.5" r="1.2"/></svg>
                  {{ a.adresse.quartier }}, {{ a.adresse.ville }}
                </span>
              </div>
              <h3 class="ann-title">{{ a.titre }}</h3>
              <p class="ann-desc">{{ a.description }}</p>
              <div class="ann-footer">
                <div class="ann-contact">
                  <div class="ann-avatar">{{ a.contact.nom[0] }}</div>
                  <div class="ann-contact-info">
                    <span class="ann-contact-name">{{ a.contact.nom }}</span>
                    @if (a.contact.note) {
                      <span class="ann-note">★ {{ a.contact.note }}</span>
                    }
                  </div>
                </div>
                <button class="ann-cta">Voir le bien →</button>
              </div>
            </div>
          </article>
        }
      </div>
    }
  </section>

</div>
  `,
  styles: `
    * { box-sizing: border-box; margin: 0; padding: 0; }
    .pub-page { min-height: 100vh; background: #f4f7fb; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; }

    /* ── NAVBAR (identique landing) ── */
    .nav { position: fixed; top: 0; left: 0; right: 0; z-index: 200; transition: background .35s, box-shadow .35s; }
    .nav.nav-solid { background: #0A2650; box-shadow: 0 2px 24px rgba(0,0,0,0.35); }
    .nav-inner { max-width: 1200px; margin: 0 auto; padding: 0 24px; height: 70px; display: flex; align-items: center; gap: 32px; }
    .nav-logo { flex-shrink: 0; text-decoration: none; }
    .logo-img { height: 38px; width: auto; display: block; }
    .nav-links { display: flex; gap: 28px; flex: 1; list-style: none; padding: 0; margin: 0; }
    .nl { color: rgba(255,255,255,0.75); font-size: 14.5px; font-weight: 500; transition: color .2s; text-decoration: none; }
    .nl:hover { color: white; }
    .nl-active { color: white; font-weight: 700; border-bottom: 2px solid #C9982E; padding-bottom: 2px; }
    .nav-cta { display: flex; align-items: center; gap: 12px; flex-shrink: 0; }
    .btn-ghost { color: rgba(255,255,255,0.88); font-size: 14px; font-weight: 500; padding: 8px 16px; border-radius: 8px; transition: background .2s; text-decoration: none; }
    .btn-ghost:hover { background: rgba(255,255,255,0.1); }
    .btn-nav-primary { background: #C9982E; color: #fff; font-size: 14px; font-weight: 700; padding: 9px 20px; border-radius: 8px; transition: background .2s; text-decoration: none; }
    .btn-nav-primary:hover { background: #b8881f; }
    .hamburger { display: none; flex-direction: column; gap: 5px; background: none; border: none; cursor: pointer; padding: 6px; }
    .hamburger span { display: block; width: 22px; height: 2px; background: #fff; border-radius: 2px; }
    .m-menu { background: #081E41; padding: 16px 24px 24px; display: flex; flex-direction: column; gap: 4px; border-top: 1px solid rgba(255,255,255,0.1); }
    .mm-link { color: rgba(255,255,255,0.85); font-size: 15px; padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.07); text-decoration: none; }
    .mm-sep { height: 12px; }
    .mm-cta { margin-top: 8px; background: #C9982E; color: #fff; text-align: center; padding: 13px; border-radius: 8px; font-weight: 700; text-decoration: none; }

    /* ── HERO ── */
    .hero { position: relative; height: 560px; display: flex; flex-direction: column; overflow: visible; }
    .hero-bg { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: center 40%; }
    .hero-ov { position: absolute; inset: 0; background: linear-gradient(135deg, rgba(8,30,65,0.94) 0%, rgba(10,38,80,0.88) 50%, rgba(15,76,129,0.82) 100%); }
    .hero-content { position: relative; z-index: 2; display: flex; flex-direction: column; max-width: 1280px; width: 100%; margin: 0 auto; padding: 70px 32px 0; height: 100%; }

    /* Texte hero */
    .hero-body { flex: 1; display: flex; flex-direction: column; justify-content: center; padding-bottom: 16px; }
    .hero-badge { display: inline-flex; align-items: center; gap: 7px; color: rgba(255,255,255,0.7); font-size: 12px; font-weight: 600; letter-spacing: .06em; text-transform: uppercase; margin-bottom: 16px; }
    .hero-badge svg { width: 13px; height: 13px; color: rgba(255,255,255,0.6); }
    .hero-title { font-size: clamp(28px, 4vw, 46px); font-weight: 800; color: white; line-height: 1.18; margin-bottom: 14px; text-wrap: balance; }
    .hero-sub { font-size: 16px; color: rgba(255,255,255,0.72); margin-bottom: 24px; }
    .hero-stats { display: flex; align-items: center; gap: 20px; flex-wrap: wrap; }
    .hstat { display: flex; flex-direction: column; gap: 2px; }
    .hstat-n { font-size: 22px; font-weight: 800; color: white; line-height: 1; }
    .hstat-l { font-size: 11px; color: rgba(255,255,255,0.55); text-transform: uppercase; letter-spacing: .05em; }
    .hstat-sep { width: 1px; height: 32px; background: rgba(255,255,255,0.2); }

    /* ── FILTER CARD ── */
    .filter-card {
      position: absolute;
      bottom: -48px;
      left: 0; right: 0;
      background: white;
      border-radius: 18px;
      box-shadow: 0 24px 72px rgba(0,0,0,0.18), 0 4px 16px rgba(0,0,0,0.08);
      padding: 0;
      overflow: hidden;
    }
    .filter-row { display: flex; align-items: stretch; }
    .fg { flex: 1; display: flex; flex-direction: column; gap: 4px; padding: 18px 20px; }
    .fg-divider { width: 1px; background: #E5E7EB; flex-shrink: 0; margin: 12px 0; }
    .fg-label { font-size: 10.5px; font-weight: 700; color: #9CA3AF; text-transform: uppercase; letter-spacing: .08em; display: flex; align-items: center; gap: 5px; }
    .fg-label svg { width: 12px; height: 12px; }
    .fg-select { border: none; outline: none; font-size: 14px; font-weight: 600; color: #0A2650; background: transparent; cursor: pointer; padding: 0; width: 100%; appearance: none; -webkit-appearance: none; }
    .fg-btn { flex-shrink: 0; background: #0F4C81; color: white; border: none; cursor: pointer; padding: 0 28px; font-size: 14px; font-weight: 700; display: flex; align-items: center; gap: 8px; transition: background .2s; border-radius: 0 18px 0 0; }
    .fg-btn:hover { background: #0A2650; }
    .fg-btn svg { width: 16px; height: 16px; }
    .filter-active { display: flex; align-items: center; justify-content: space-between; padding: 10px 20px; background: #EEF4FC; border-top: 1px solid #DBEAFE; }
    .fa-count { font-size: 13px; font-weight: 700; color: #0F4C81; }
    .fa-reset { display: flex; align-items: center; gap: 6px; font-size: 12.5px; font-weight: 600; color: #6B7280; background: none; border: none; cursor: pointer; padding: 4px 8px; border-radius: 6px; transition: background .2s; }
    .fa-reset:hover { background: rgba(15,76,129,0.08); color: #0F4C81; }
    .fa-reset svg { width: 12px; height: 12px; }

    /* ── LISTINGS ── */
    .listings { max-width: 1280px; margin: 0 auto; padding: 96px 32px 60px; }
    .listings-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; }
    .listings-count { font-size: 15px; color: #6B7280; font-weight: 500; }
    .sort-select { border: 1px solid #E5E7EB; border-radius: 8px; padding: 8px 14px; font-size: 13px; color: #374151; background: white; cursor: pointer; outline: none; }

    .ann-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }

    /* ── CARD ── */
    .ann-card { background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,0.07); transition: transform .25s cubic-bezier(0.34,1.56,0.64,1), box-shadow .25s ease; cursor: pointer; border: 1px solid #E5E7EB; }
    .ann-card:hover { transform: translateY(-6px); box-shadow: 0 20px 48px rgba(15,76,129,0.14); }
    .ann-card:focus { outline: 2px solid #0F4C81; outline-offset: 2px; }

    .ann-img-wrap { position: relative; height: 220px; overflow: hidden; }
    .ann-img { width: 100%; height: 100%; object-fit: cover; transition: transform .4s ease; }
    .ann-card:hover .ann-img { transform: scale(1.06); }
    .ann-img-gradient { position: absolute; inset: 0; background: linear-gradient(to top, rgba(10,38,80,0.75) 0%, transparent 55%); }

    .ann-badge-type { position: absolute; top: 12px; left: 12px; font-size: 10.5px; font-weight: 700; text-transform: uppercase; letter-spacing: .05em; padding: 4px 10px; border-radius: 20px; }
    .badge-loc { background: rgba(15,76,129,0.92); color: white; }
    .badge-vente { background: rgba(10,38,80,0.92); color: white; }
    .ann-badge-dispo { position: absolute; top: 12px; right: 12px; font-size: 10.5px; font-weight: 700; text-transform: uppercase; letter-spacing: .05em; padding: 4px 10px; border-radius: 20px; background: rgba(255,255,255,0.2); backdrop-filter: blur(4px); color: white; border: 1px solid rgba(255,255,255,0.4); }
    .ann-price { position: absolute; bottom: 12px; left: 12px; font-size: 17px; font-weight: 800; color: white; }
    .ann-price small { font-size: 11px; font-weight: 500; opacity: 0.75; }

    .ann-body { padding: 16px 18px 18px; }
    .ann-meta { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; flex-wrap: wrap; }
    .ann-chip { font-size: 11px; font-weight: 700; color: #0F4C81; background: #EEF4FC; padding: 3px 10px; border-radius: 20px; }
    .ann-quartier { display: flex; align-items: center; gap: 4px; font-size: 12px; color: #9CA3AF; }
    .ann-quartier svg { width: 11px; height: 11px; flex-shrink: 0; }
    .ann-title { font-size: 15px; font-weight: 700; color: #0A2650; margin-bottom: 6px; line-height: 1.3; }
    .ann-desc { font-size: 12.5px; color: #6B7280; line-height: 1.6; margin-bottom: 14px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
    .ann-footer { display: flex; align-items: center; justify-content: space-between; }
    .ann-contact { display: flex; align-items: center; gap: 8px; }
    .ann-avatar { width: 32px; height: 32px; border-radius: 8px; background: #0F4C81; color: white; font-weight: 700; font-size: 13px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .ann-contact-name { display: block; font-size: 12px; font-weight: 600; color: #374151; }
    .ann-note { display: block; font-size: 11px; color: #9CA3AF; }
    .ann-cta { background: #0F4C81; color: white; border: none; border-radius: 8px; padding: 9px 16px; font-size: 12.5px; font-weight: 700; cursor: pointer; white-space: nowrap; transition: background .2s; }
    .ann-cta:hover { background: #0A2650; }

    /* ── RESPONSIVE ── */
    @media (max-width: 1024px) { .ann-grid { grid-template-columns: repeat(2, 1fr); } }
    @media (max-width: 768px) {
      .nav-links, .nav-cta { display: none; }
      .hamburger { display: flex; }
      .hero { height: auto; min-height: 420px; }
      .hero-content { padding: 70px 20px 0; }
      .hero-title { font-size: 26px; }
      .filter-row { flex-direction: column; }
      .fg-divider { width: auto; height: 1px; margin: 0 20px; }
      .fg-btn { border-radius: 0; padding: 16px; justify-content: center; }
      .filter-card { position: static; margin: 0 -20px; border-radius: 0; box-shadow: 0 8px 32px rgba(0,0,0,0.12); }
      .listings { padding: 24px 20px 48px; }
      .ann-grid { grid-template-columns: 1fr; }
      .hstat-sep { display: none; }
    }
  `
})
export class AnnoncesPublicComponent implements OnInit, OnDestroy {
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private scrollFn?: () => void;

  loading      = signal(true);
  navScrolled  = signal(false);
  menuOpen     = signal(false);
  typeFilter   = '';
  villeFilter  = '';
  budgetFilter = '';
  sortOrder    = 'recent';

  allAnnonces  = signal<Annonce[]>([]);
  filtered     = signal<Annonce[]>([]);

  constructor(
    private readonly annoncesService: AnnoncesService,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly titleService: Title,
    private readonly metaService: Meta,
  ) {}

  ngOnInit(): void {
    this.titleService.setTitle('Annonces immobilières au Togo | WARAH');
    this.metaService.updateTag({ name: 'description', content: 'Trouvez villas, appartements et studios à louer ou à vendre au Togo sur WARAH.' });

    if (this.isBrowser) {
      this.scrollFn = () => this.navScrolled.set(window.scrollY > 40);
      window.addEventListener('scroll', this.scrollFn, { passive: true });
    }

    this.route.queryParams.subscribe(p => {
      this.typeFilter  = p['type']  || '';
      this.villeFilter = p['ville'] || '';
      this.loadAnnonces();
    });
  }

  ngOnDestroy(): void {
    if (this.isBrowser && this.scrollFn) {
      window.removeEventListener('scroll', this.scrollFn);
    }
  }

  loadAnnonces(): void {
    this.loading.set(true);
    this.annoncesService.getAllAnnonces().pipe(
      catchError(() => of(MOCK))
    ).subscribe(data => {
      const list = data?.length ? data : MOCK;
      this.allAnnonces.set(list);
      this.applyFilters(list);
      this.loading.set(false);
    });
  }

  onFilter(): void { this.applyFilters(this.allAnnonces()); }

  private applyFilters(src: Annonce[]): void {
    let res = [...src];
    if (this.typeFilter)   res = res.filter(a => a.typeBien === this.typeFilter);
    if (this.villeFilter)  res = res.filter(a => a.adresse.ville === this.villeFilter);
    if (this.budgetFilter) res = res.filter(a => a.prix <= +this.budgetFilter);
    if (this.sortOrder === 'prix_asc')  res.sort((a, b) => a.prix - b.prix);
    if (this.sortOrder === 'prix_desc') res.sort((a, b) => b.prix - a.prix);
    this.filtered.set(res);
  }

  hasFilters(): boolean { return !!(this.typeFilter || this.villeFilter || this.budgetFilter); }

  clearFilters(): void {
    this.typeFilter = ''; this.villeFilter = ''; this.budgetFilter = '';
    this.applyFilters(this.allAnnonces());
  }

  viewAnnonce(id: string): void { this.router.navigate(['/annonces', id]); }
}
