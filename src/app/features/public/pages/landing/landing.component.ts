import {
  Component, OnInit, OnDestroy, AfterViewInit,
  ElementRef, ViewChild, PLATFORM_ID, inject,
  signal, WritableSignal,
} from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { catchError, of } from 'rxjs';
import { environment } from '@env/environment';
import { Bien, PROPERTY_TYPE_LABELS } from '@core/models/bien.model';
import { PublicFooterComponent } from '../../../../shared/components/public-footer/public-footer.component';

interface HeroSlide { badge: string; title: string; subtitle: string; cta: string; link: string; }

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterModule, PublicFooterComponent],
  template: `
<div class="lp">

  <!-- ── NAVBAR ── -->
  <nav class="nav" [class.nav-solid]="navScrolled()">
    <div class="nav-inner">
      <a routerLink="/" class="nav-logo">
        <img src="/assets/WARAH-logo.png" alt="WARAH" class="logo-img">
      </a>
      <ul class="nav-links">
        <li><a routerLink="/" class="nl" data-text="Accueil">Accueil</a></li>
        <li><a routerLink="/annonces" class="nl" data-text="Annonces">Annonces</a></li>
        <li><a routerLink="/a-propos" class="nl" data-text="À propos">À propos</a></li>
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
    <div class="hero-bg-deco">
      <div class="deco-circle deco-c1"></div>
      <div class="deco-circle deco-c2"></div>
      <div class="deco-line"></div>
    </div>
    <div class="slides">
      @for (s of slides; track s.badge; let i = $index) {
        <div class="slide" [class.slide-on]="currentSlide() === i">
          <div class="slide-text">
            <span class="s-badge">{{ s.badge }}</span>
            <h1 class="s-title">{{ s.title }}</h1>
            <p class="s-sub">{{ s.subtitle }}</p>
            <a [routerLink]="s.link" class="s-cta">
              {{ s.cta }}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="s-arrow">
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </a>
          </div>
          <div class="slide-visual">
            @switch (i) {
              @case (0) {
                <svg class="s-svg" viewBox="0 0 430 306" xmlns="http://www.w3.org/2000/svg">
                  <defs><filter id="s0sh" x="-8%" y="-8%" width="116%" height="128%"><feDropShadow dx="0" dy="8" stdDeviation="14" flood-color="rgba(0,0,0,0.28)"/></filter></defs>
                  <rect x="6" y="6" width="418" height="294" rx="11" fill="white" filter="url(#s0sh)"/>
                  <rect x="6" y="6" width="418" height="30" rx="11" fill="#EAECF0"/>
                  <rect x="6" y="24" width="418" height="12" fill="#EAECF0"/>
                  <circle cx="22" cy="21" r="4.5" fill="#FF5F57"/><circle cx="36" cy="21" r="4.5" fill="#FFBD2E"/><circle cx="50" cy="21" r="4.5" fill="#27C93F"/>
                  <rect x="66" y="13" width="272" height="16" rx="8" fill="white" opacity="0.75"/>
                  <text x="202" y="24" text-anchor="middle" fill="#9CA3AF" font-size="8" font-family="Arial,sans-serif">warah.tg/dashboard/biens</text>
                  <rect x="6" y="36" width="66" height="264" fill="#0A2650"/>
                  <rect x="6" y="289" width="66" height="11" fill="#0A2650"/>
                  <rect x="13" y="46" width="52" height="17" rx="3" fill="rgba(255,255,255,0.12)"/>
                  <text x="39" y="57.5" text-anchor="middle" fill="white" font-size="7.5" font-weight="bold" font-family="Arial,sans-serif">WARAH</text>
                  <rect x="11" y="74" width="56" height="19" rx="4" fill="rgba(201,152,46,0.22)"/>
                  <text x="39" y="87" text-anchor="middle" fill="#C9982E" font-size="7.5" font-weight="bold" font-family="Arial,sans-serif">Biens</text>
                  <text x="39" y="108" text-anchor="middle" fill="rgba(255,255,255,0.42)" font-size="7" font-family="Arial,sans-serif">Locataires</text>
                  <text x="39" y="126" text-anchor="middle" fill="rgba(255,255,255,0.42)" font-size="7" font-family="Arial,sans-serif">Paiements</text>
                  <text x="39" y="144" text-anchor="middle" fill="rgba(255,255,255,0.42)" font-size="7" font-family="Arial,sans-serif">Baux</text>
                  <text x="84" y="56" fill="#0A2650" font-size="12" font-weight="bold" font-family="Arial,sans-serif">Mes biens</text>
                  <text x="84" y="69" fill="#9CA3AF" font-size="7" font-family="Arial,sans-serif">12 biens · Lomé, Togo</text>
                  <rect x="348" y="44" width="68" height="19" rx="5" fill="#0F4C81"/>
                  <text x="382" y="57" text-anchor="middle" fill="white" font-size="7.5" font-family="Arial,sans-serif">+ Nouveau bien</text>
                  <rect x="80" y="78" width="88" height="44" rx="6" fill="#F8F9FC" stroke="#E5E7EB" stroke-width="0.8"/>
                  <text x="92" y="93" fill="#6B7280" font-size="7" font-family="Arial,sans-serif">Total biens</text>
                  <text x="92" y="112" fill="#0F4C81" font-size="16" font-weight="bold" font-family="Arial,sans-serif">12</text>
                  <rect x="176" y="78" width="88" height="44" rx="6" fill="#F8F9FC" stroke="#E5E7EB" stroke-width="0.8"/>
                  <text x="188" y="93" fill="#6B7280" font-size="7" font-family="Arial,sans-serif">Occupés</text>
                  <text x="188" y="112" fill="#16A34A" font-size="16" font-weight="bold" font-family="Arial,sans-serif">9</text>
                  <rect x="272" y="78" width="148" height="44" rx="6" fill="#F8F9FC" stroke="#E5E7EB" stroke-width="0.8"/>
                  <text x="284" y="93" fill="#6B7280" font-size="7" font-family="Arial,sans-serif">Revenus mensuels</text>
                  <text x="284" y="112" fill="#C9982E" font-size="13" font-weight="bold" font-family="Arial,sans-serif">1 250 000 F</text>
                  <rect x="80" y="132" width="338" height="18" rx="4" fill="#F3F4F6"/>
                  <text x="90" y="144" fill="#6B7280" font-size="7" font-family="Arial,sans-serif">TYPE</text>
                  <text x="145" y="144" fill="#6B7280" font-size="7" font-family="Arial,sans-serif">BIEN &amp; LOCALISATION</text>
                  <text x="300" y="144" fill="#6B7280" font-size="7" font-family="Arial,sans-serif">LOYER</text>
                  <text x="358" y="144" fill="#6B7280" font-size="7" font-family="Arial,sans-serif">STATUT</text>
                  <rect x="80" y="150" width="338" height="27" fill="white"/>
                  <rect x="88" y="156" width="38" height="13" rx="4" fill="#EDE9FE"/>
                  <text x="107" y="166" text-anchor="middle" fill="#7C3AED" font-size="7" font-family="Arial,sans-serif">Villa</text>
                  <text x="134" y="162" fill="#111827" font-size="7.5" font-family="Arial,sans-serif">Villa des Cocotiers</text>
                  <text x="134" y="172" fill="#9CA3AF" font-size="6.5" font-family="Arial,sans-serif">Adewui · Lomé</text>
                  <text x="298" y="166" fill="#111827" font-size="7.5" font-family="Arial,sans-serif">350 000 FCFA</text>
                  <rect x="355" y="155" width="44" height="13" rx="6" fill="#DCFCE7"/>
                  <text x="377" y="165" text-anchor="middle" fill="#15803D" font-size="7" font-family="Arial,sans-serif">Occupé</text>
                  <line x1="80" y1="177" x2="418" y2="177" stroke="#F3F4F6" stroke-width="1"/>
                  <rect x="80" y="177" width="338" height="27" fill="white"/>
                  <rect x="88" y="183" width="46" height="13" rx="4" fill="#DBEAFE"/>
                  <text x="111" y="193" text-anchor="middle" fill="#1D4ED8" font-size="7" font-family="Arial,sans-serif">Appart.</text>
                  <text x="142" y="189" fill="#111827" font-size="7.5" font-family="Arial,sans-serif">Appartement Bè</text>
                  <text x="142" y="199" fill="#9CA3AF" font-size="6.5" font-family="Arial,sans-serif">Bè · Lomé</text>
                  <text x="298" y="193" fill="#111827" font-size="7.5" font-family="Arial,sans-serif">150 000 FCFA</text>
                  <rect x="355" y="182" width="44" height="13" rx="6" fill="#DCFCE7"/>
                  <text x="377" y="192" text-anchor="middle" fill="#15803D" font-size="7" font-family="Arial,sans-serif">Occupé</text>
                  <line x1="80" y1="204" x2="418" y2="204" stroke="#F3F4F6" stroke-width="1"/>
                  <rect x="80" y="204" width="338" height="27" fill="white"/>
                  <rect x="88" y="210" width="38" height="13" rx="4" fill="#FEF9C3"/>
                  <text x="107" y="220" text-anchor="middle" fill="#854D0E" font-size="7" font-family="Arial,sans-serif">Studio</text>
                  <text x="134" y="216" fill="#111827" font-size="7.5" font-family="Arial,sans-serif">Studio Adewui</text>
                  <text x="134" y="226" fill="#9CA3AF" font-size="6.5" font-family="Arial,sans-serif">Adewui · Lomé</text>
                  <text x="298" y="220" fill="#111827" font-size="7.5" font-family="Arial,sans-serif">85 000 FCFA</text>
                  <rect x="353" y="209" width="48" height="13" rx="6" fill="#FEF3C7"/>
                  <text x="377" y="219" text-anchor="middle" fill="#B45309" font-size="7" font-family="Arial,sans-serif">Vacant</text>
                  <line x1="80" y1="231" x2="418" y2="231" stroke="#F3F4F6" stroke-width="1"/>
                  <rect x="80" y="231" width="338" height="27" fill="white"/>
                  <rect x="88" y="237" width="38" height="13" rx="4" fill="#EDE9FE"/>
                  <text x="107" y="247" text-anchor="middle" fill="#7C3AED" font-size="7" font-family="Arial,sans-serif">Villa</text>
                  <text x="134" y="243" fill="#111827" font-size="7.5" font-family="Arial,sans-serif">Villa Agoè Nord</text>
                  <text x="134" y="253" fill="#9CA3AF" font-size="6.5" font-family="Arial,sans-serif">Agoè · Lomé</text>
                  <text x="298" y="247" fill="#111827" font-size="7.5" font-family="Arial,sans-serif">265 000 FCFA</text>
                  <rect x="355" y="236" width="44" height="13" rx="6" fill="#DCFCE7"/>
                  <text x="377" y="246" text-anchor="middle" fill="#15803D" font-size="7" font-family="Arial,sans-serif">Occupé</text>
                </svg>
              }
              @case (1) {
                <svg class="s-svg" viewBox="0 0 430 306" xmlns="http://www.w3.org/2000/svg">
                  <defs><filter id="s1sh" x="-8%" y="-8%" width="116%" height="128%"><feDropShadow dx="0" dy="8" stdDeviation="14" flood-color="rgba(0,0,0,0.28)"/></filter></defs>
                  <rect x="6" y="6" width="418" height="294" rx="11" fill="white" filter="url(#s1sh)"/>
                  <rect x="6" y="6" width="418" height="30" rx="11" fill="#EAECF0"/>
                  <rect x="6" y="24" width="418" height="12" fill="#EAECF0"/>
                  <circle cx="22" cy="21" r="4.5" fill="#FF5F57"/><circle cx="36" cy="21" r="4.5" fill="#FFBD2E"/><circle cx="50" cy="21" r="4.5" fill="#27C93F"/>
                  <rect x="66" y="13" width="272" height="16" rx="8" fill="white" opacity="0.75"/>
                  <text x="202" y="24" text-anchor="middle" fill="#9CA3AF" font-size="8" font-family="Arial,sans-serif">warah.tg/dashboard/paiements</text>
                  <text x="18" y="56" fill="#0A2650" font-size="12" font-weight="bold" font-family="Arial,sans-serif">Paiements — Juillet 2026</text>
                  <rect x="358" y="43" width="58" height="17" rx="4" fill="#0F4C81"/>
                  <text x="387" y="54.5" text-anchor="middle" fill="white" font-size="7" font-family="Arial,sans-serif">Juillet ▾</text>
                  <rect x="14" y="68" width="118" height="48" rx="7" fill="#F0FDF4" stroke="#BBF7D0" stroke-width="0.8"/>
                  <text x="26" y="83" fill="#15803D" font-size="7" font-family="Arial,sans-serif">Total collecté</text>
                  <text x="26" y="104" fill="#15803D" font-size="13" font-weight="bold" font-family="Arial,sans-serif">2 450 000 F</text>
                  <rect x="142" y="68" width="118" height="48" rx="7" fill="#FFFBEB" stroke="#FDE68A" stroke-width="0.8"/>
                  <text x="154" y="83" fill="#B45309" font-size="7" font-family="Arial,sans-serif">En attente</text>
                  <text x="154" y="104" fill="#B45309" font-size="13" font-weight="bold" font-family="Arial,sans-serif">450 000 F</text>
                  <rect x="270" y="68" width="144" height="48" rx="7" fill="#FFF1F2" stroke="#FECDD3" stroke-width="0.8"/>
                  <text x="282" y="83" fill="#B91C1C" font-size="7" font-family="Arial,sans-serif">Impayés</text>
                  <text x="282" y="104" fill="#B91C1C" font-size="13" font-weight="bold" font-family="Arial,sans-serif">150 000 F</text>
                  <rect x="14" y="126" width="400" height="18" rx="4" fill="#F3F4F6"/>
                  <text x="44" y="138" fill="#6B7280" font-size="7" font-family="Arial,sans-serif">LOCATAIRE</text>
                  <text x="168" y="138" fill="#6B7280" font-size="7" font-family="Arial,sans-serif">BIEN</text>
                  <text x="258" y="138" fill="#6B7280" font-size="7" font-family="Arial,sans-serif">MONTANT</text>
                  <text x="328" y="138" fill="#6B7280" font-size="7" font-family="Arial,sans-serif">DATE</text>
                  <text x="386" y="138" fill="#6B7280" font-size="7" font-family="Arial,sans-serif">STATUT</text>
                  <rect x="14" y="144" width="400" height="27" fill="white"/>
                  <circle cx="28" cy="158" r="8" fill="#DBEAFE"/>
                  <text x="28" y="162" text-anchor="middle" fill="#1D4ED8" font-size="8" font-weight="bold" font-family="Arial,sans-serif">K</text>
                  <text x="42" y="157" fill="#111827" font-size="7.5" font-family="Arial,sans-serif">Kofi Agbenu</text>
                  <text x="168" y="158" fill="#374151" font-size="7.5" font-family="Arial,sans-serif">Studio Adewui</text>
                  <text x="258" y="158" fill="#111827" font-size="7.5" font-weight="bold" font-family="Arial,sans-serif">85 000 F</text>
                  <text x="328" y="158" fill="#374151" font-size="7.5" font-family="Arial,sans-serif">01/07/2026</text>
                  <rect x="378" y="148" width="32" height="13" rx="6" fill="#DCFCE7"/>
                  <text x="394" y="158" text-anchor="middle" fill="#15803D" font-size="6.5" font-weight="bold" font-family="Arial,sans-serif">PAYÉ</text>
                  <line x1="14" y1="171" x2="414" y2="171" stroke="#F3F4F6" stroke-width="1"/>
                  <rect x="14" y="171" width="400" height="27" fill="white"/>
                  <circle cx="28" cy="185" r="8" fill="#FCE7F3"/>
                  <text x="28" y="189" text-anchor="middle" fill="#9D174D" font-size="8" font-weight="bold" font-family="Arial,sans-serif">A</text>
                  <text x="42" y="184" fill="#111827" font-size="7.5" font-family="Arial,sans-serif">Aminata Diallo</text>
                  <text x="168" y="185" fill="#374151" font-size="7.5" font-family="Arial,sans-serif">Villa Cocotiers</text>
                  <text x="258" y="185" fill="#111827" font-size="7.5" font-weight="bold" font-family="Arial,sans-serif">350 000 F</text>
                  <text x="328" y="185" fill="#374151" font-size="7.5" font-family="Arial,sans-serif">01/07/2026</text>
                  <rect x="378" y="175" width="32" height="13" rx="6" fill="#DCFCE7"/>
                  <text x="394" y="185" text-anchor="middle" fill="#15803D" font-size="6.5" font-weight="bold" font-family="Arial,sans-serif">PAYÉ</text>
                  <line x1="14" y1="198" x2="414" y2="198" stroke="#F3F4F6" stroke-width="1"/>
                  <rect x="14" y="198" width="400" height="27" fill="#FFFBEB"/>
                  <circle cx="28" cy="212" r="8" fill="#FEF3C7"/>
                  <text x="28" y="216" text-anchor="middle" fill="#92400E" font-size="8" font-weight="bold" font-family="Arial,sans-serif">I</text>
                  <text x="42" y="211" fill="#111827" font-size="7.5" font-family="Arial,sans-serif">Ibrahim Mensah</text>
                  <text x="168" y="212" fill="#374151" font-size="7.5" font-family="Arial,sans-serif">Appt. Bè</text>
                  <text x="258" y="212" fill="#111827" font-size="7.5" font-weight="bold" font-family="Arial,sans-serif">150 000 F</text>
                  <text x="328" y="212" fill="#374151" font-size="7.5" font-family="Arial,sans-serif">05/07/2026</text>
                  <rect x="367" y="202" width="48" height="13" rx="6" fill="#FEF3C7"/>
                  <text x="391" y="212" text-anchor="middle" fill="#B45309" font-size="6" font-weight="bold" font-family="Arial,sans-serif">EN ATTENTE</text>
                  <line x1="14" y1="225" x2="414" y2="225" stroke="#F3F4F6" stroke-width="1"/>
                  <rect x="14" y="225" width="400" height="27" fill="#FFF1F2"/>
                  <circle cx="28" cy="239" r="8" fill="#FECDD3"/>
                  <text x="28" y="243" text-anchor="middle" fill="#9F1239" font-size="8" font-weight="bold" font-family="Arial,sans-serif">F</text>
                  <text x="42" y="238" fill="#111827" font-size="7.5" font-family="Arial,sans-serif">Fatou Kéita</text>
                  <text x="168" y="239" fill="#374151" font-size="7.5" font-family="Arial,sans-serif">Studio Agoè</text>
                  <text x="258" y="239" fill="#111827" font-size="7.5" font-weight="bold" font-family="Arial,sans-serif">75 000 F</text>
                  <text x="328" y="239" fill="#B91C1C" font-size="7.5" font-family="Arial,sans-serif">01/07/2026</text>
                  <rect x="369" y="229" width="44" height="13" rx="6" fill="#FECDD3"/>
                  <text x="391" y="239" text-anchor="middle" fill="#B91C1C" font-size="6.5" font-weight="bold" font-family="Arial,sans-serif">IMPAYÉ</text>
                  <rect x="14" y="265" width="400" height="26" fill="white"/>
                  <rect x="334" y="269" width="78" height="16" rx="5" fill="#C9982E"/>
                  <text x="373" y="280" text-anchor="middle" fill="white" font-size="7.5" font-weight="bold" font-family="Arial,sans-serif">Envoyer rappels</text>
                </svg>
              }
              @case (2) {
                <svg class="s-svg" viewBox="0 0 380 310" xmlns="http://www.w3.org/2000/svg">
                  <defs><filter id="s2sh" x="-10%" y="-10%" width="120%" height="130%"><feDropShadow dx="0" dy="10" stdDeviation="16" flood-color="rgba(0,0,0,0.22)"/></filter></defs>
                  <rect x="24" y="10" width="332" height="290" rx="6" fill="white" filter="url(#s2sh)"/>
                  <rect x="24" y="10" width="332" height="6" rx="3" fill="#C9982E"/>
                  <rect x="36" y="28" width="50" height="24" rx="4" fill="#0F4C81"/>
                  <text x="61" y="44" text-anchor="middle" fill="white" font-size="9" font-weight="bold" font-family="Arial,sans-serif">WARAH</text>
                  <text x="96" y="37" fill="#0A2650" font-size="9" font-weight="bold" font-family="Arial,sans-serif">Gestion immobilière locative</text>
                  <text x="96" y="49" fill="#9CA3AF" font-size="7" font-family="Arial,sans-serif">Lomé, Togo · contact&#64;warah.tg</text>
                  <line x1="36" y1="60" x2="344" y2="60" stroke="#C9982E" stroke-width="1.5"/>
                  <text x="190" y="82" text-anchor="middle" fill="#0A2650" font-size="14" font-weight="bold" font-family="Arial,sans-serif">QUITTANCE DE LOYER</text>
                  <text x="190" y="97" text-anchor="middle" fill="#6B7280" font-size="8" font-family="Arial,sans-serif">Période du 1er au 31 Juillet 2026</text>
                  <line x1="36" y1="107" x2="344" y2="107" stroke="#E5E7EB" stroke-width="0.8"/>
                  <text x="36" y="122" fill="#9CA3AF" font-size="7" font-weight="bold" font-family="Arial,sans-serif">BAILLEUR</text>
                  <text x="36" y="135" fill="#111827" font-size="8" font-weight="bold" font-family="Arial,sans-serif">M. Jean KOFFI</text>
                  <text x="36" y="147" fill="#6B7280" font-size="7.5" font-family="Arial,sans-serif">15 Rue des Palmiers · Lomé</text>
                  <text x="190" y="122" fill="#9CA3AF" font-size="7" font-weight="bold" font-family="Arial,sans-serif">LOCATAIRE</text>
                  <text x="190" y="135" fill="#111827" font-size="8" font-weight="bold" font-family="Arial,sans-serif">Mme Aminata DIALLO</text>
                  <text x="190" y="147" fill="#6B7280" font-size="7.5" font-family="Arial,sans-serif">Villa des Cocotiers · Adewui</text>
                  <line x1="36" y1="162" x2="344" y2="162" stroke="#E5E7EB" stroke-width="0.8"/>
                  <rect x="36" y="172" width="308" height="54" rx="8" fill="#0F4C81"/>
                  <text x="190" y="192" text-anchor="middle" fill="rgba(255,255,255,0.72)" font-size="8" font-family="Arial,sans-serif">Montant total reçu</text>
                  <text x="190" y="215" text-anchor="middle" fill="white" font-size="20" font-weight="bold" font-family="Arial,sans-serif">350 000 FCFA</text>
                  <text x="36" y="244" fill="#6B7280" font-size="7.5" font-family="Arial,sans-serif">Loyer : 320 000 FCFA</text>
                  <text x="190" y="244" fill="#6B7280" font-size="7.5" font-family="Arial,sans-serif">Charges : 30 000 FCFA</text>
                  <text x="36" y="258" fill="#6B7280" font-size="7.5" font-family="Arial,sans-serif">Mode : Virement · 02/07/2026</text>
                  <line x1="36" y1="270" x2="344" y2="270" stroke="#E5E7EB" stroke-width="0.8"/>
                  <text x="50" y="288" fill="#9CA3AF" font-size="7" font-family="Arial,sans-serif">Signature du bailleur :</text>
                  <line x1="50" y1="293" x2="140" y2="293" stroke="#D1D5DB" stroke-width="0.8"/>
                  <circle cx="316" cy="286" r="24" fill="none" stroke="#0F4C81" stroke-width="2" stroke-dasharray="4 2"/>
                  <circle cx="316" cy="286" r="18" fill="rgba(15,76,129,0.06)"/>
                  <text x="316" y="282" text-anchor="middle" fill="#0F4C81" font-size="7" font-weight="bold" font-family="Arial,sans-serif">WARAH</text>
                  <text x="316" y="294" text-anchor="middle" fill="#C9982E" font-size="7" font-weight="bold" font-family="Arial,sans-serif">VALIDÉ</text>
                </svg>
              }
              @case (3) {
                <svg class="s-svg" viewBox="0 0 430 306" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <filter id="s3sh" x="-8%" y="-8%" width="116%" height="128%"><feDropShadow dx="0" dy="8" stdDeviation="14" flood-color="rgba(0,0,0,0.28)"/></filter>
                    <linearGradient id="g3a" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#0A2650"/><stop offset="100%" stop-color="#0F4C81"/></linearGradient>
                    <linearGradient id="g3b" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#064E3B"/><stop offset="100%" stop-color="#065F46"/></linearGradient>
                    <linearGradient id="g3c" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#312E81"/><stop offset="100%" stop-color="#4338CA"/></linearGradient>
                    <linearGradient id="g3d" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#7C2D12"/><stop offset="100%" stop-color="#C2410C"/></linearGradient>
                  </defs>
                  <rect x="6" y="6" width="418" height="294" rx="11" fill="#F8F9FC" filter="url(#s3sh)"/>
                  <rect x="6" y="6" width="418" height="30" rx="11" fill="#EAECF0"/>
                  <rect x="6" y="24" width="418" height="12" fill="#EAECF0"/>
                  <circle cx="22" cy="21" r="4.5" fill="#FF5F57"/><circle cx="36" cy="21" r="4.5" fill="#FFBD2E"/><circle cx="50" cy="21" r="4.5" fill="#27C93F"/>
                  <rect x="66" y="13" width="272" height="16" rx="8" fill="white" opacity="0.75"/>
                  <text x="202" y="24" text-anchor="middle" fill="#9CA3AF" font-size="8" font-family="Arial,sans-serif">warah.tg/annonces</text>
                  <rect x="14" y="40" width="286" height="22" rx="6" fill="white" stroke="#E5E7EB" stroke-width="0.8"/>
                  <text x="30" y="54" fill="#9CA3AF" font-size="8" font-family="Arial,sans-serif">Rechercher un bien à Lomé...</text>
                  <rect x="308" y="40" width="40" height="22" rx="5" fill="#EFF6FF" stroke="#BFDBFE" stroke-width="0.8"/>
                  <text x="328" y="54" text-anchor="middle" fill="#1D4ED8" font-size="7" font-family="Arial,sans-serif">Villa ×</text>
                  <rect x="354" y="40" width="58" height="22" rx="5" fill="#F0FDF4" stroke="#BBF7D0" stroke-width="0.8"/>
                  <text x="383" y="54" text-anchor="middle" fill="#15803D" font-size="7" font-family="Arial,sans-serif">Adewui ×</text>
                  <rect x="14" y="70" width="196" height="106" rx="8" fill="white" stroke="#E5E7EB" stroke-width="0.8"/>
                  <rect x="14" y="70" width="196" height="52" rx="8" fill="url(#g3a)"/>
                  <rect x="14" y="108" width="196" height="14" fill="url(#g3a)"/>
                  <path d="M98 82 L86 93 L86 105 L94 105 L94 97 L102 97 L102 105 L110 105 L110 93 Z" fill="rgba(255,255,255,0.2)" stroke="rgba(255,255,255,0.55)" stroke-width="1"/>
                  <path d="M82 94 L98 80 L114 94" fill="none" stroke="rgba(255,255,255,0.65)" stroke-width="1.5"/>
                  <rect x="20" y="75" width="36" height="12" rx="4" fill="white" opacity="0.92"/>
                  <text x="38" y="84" text-anchor="middle" fill="#0F4C81" font-size="6.5" font-weight="bold" font-family="Arial,sans-serif">Villa</text>
                  <text x="22" y="136" fill="#111827" font-size="8" font-weight="bold" font-family="Arial,sans-serif">Villa des Cocotiers</text>
                  <text x="22" y="147" fill="#9CA3AF" font-size="6.5" font-family="Arial,sans-serif">Adewui, Lomé</text>
                  <rect x="22" y="152" width="30" height="11" rx="3" fill="#F3F4F6"/><text x="37" y="160.5" text-anchor="middle" fill="#6B7280" font-size="6.5" font-family="Arial,sans-serif">5 pièces</text>
                  <text x="22" y="171" fill="#0F4C81" font-size="9" font-weight="bold" font-family="Arial,sans-serif">350 000 F<tspan fill="#9CA3AF" font-size="6.5" font-weight="normal">/mois</tspan></text>
                  <rect x="218" y="70" width="196" height="106" rx="8" fill="white" stroke="#E5E7EB" stroke-width="0.8"/>
                  <rect x="218" y="70" width="196" height="52" rx="8" fill="url(#g3b)"/>
                  <rect x="218" y="108" width="196" height="14" fill="url(#g3b)"/>
                  <path d="M316 83 L304 94 L304 106 L312 106 L312 98 L320 98 L320 106 L328 106 L328 94 Z" fill="rgba(255,255,255,0.2)" stroke="rgba(255,255,255,0.55)" stroke-width="1"/>
                  <path d="M300 95 L316 81 L332 95" fill="none" stroke="rgba(255,255,255,0.65)" stroke-width="1.5"/>
                  <rect x="224" y="75" width="48" height="12" rx="4" fill="white" opacity="0.92"/>
                  <text x="248" y="84" text-anchor="middle" fill="#065F46" font-size="6.5" font-weight="bold" font-family="Arial,sans-serif">Appartement</text>
                  <text x="226" y="136" fill="#111827" font-size="8" font-weight="bold" font-family="Arial,sans-serif">Appartement Bè</text>
                  <text x="226" y="147" fill="#9CA3AF" font-size="6.5" font-family="Arial,sans-serif">Bè, Lomé</text>
                  <rect x="226" y="152" width="30" height="11" rx="3" fill="#F3F4F6"/><text x="241" y="160.5" text-anchor="middle" fill="#6B7280" font-size="6.5" font-family="Arial,sans-serif">3 pièces</text>
                  <text x="226" y="171" fill="#0F4C81" font-size="9" font-weight="bold" font-family="Arial,sans-serif">150 000 F<tspan fill="#9CA3AF" font-size="6.5" font-weight="normal">/mois</tspan></text>
                  <rect x="14" y="184" width="196" height="106" rx="8" fill="white" stroke="#E5E7EB" stroke-width="0.8"/>
                  <rect x="14" y="184" width="196" height="52" rx="8" fill="url(#g3c)"/>
                  <rect x="14" y="222" width="196" height="14" fill="url(#g3c)"/>
                  <path d="M98 196 L86 207 L86 218 L94 218 L94 210 L102 210 L102 218 L110 218 L110 207 Z" fill="rgba(255,255,255,0.2)" stroke="rgba(255,255,255,0.55)" stroke-width="1"/>
                  <path d="M82 208 L98 194 L114 208" fill="none" stroke="rgba(255,255,255,0.65)" stroke-width="1.5"/>
                  <rect x="20" y="189" width="34" height="12" rx="4" fill="white" opacity="0.92"/>
                  <text x="37" y="198" text-anchor="middle" fill="#4338CA" font-size="6.5" font-weight="bold" font-family="Arial,sans-serif">Studio</text>
                  <text x="22" y="249" fill="#111827" font-size="8" font-weight="bold" font-family="Arial,sans-serif">Studio Adewui</text>
                  <text x="22" y="260" fill="#9CA3AF" font-size="6.5" font-family="Arial,sans-serif">Adewui, Lomé</text>
                  <text x="22" y="284" fill="#0F4C81" font-size="9" font-weight="bold" font-family="Arial,sans-serif">85 000 F<tspan fill="#9CA3AF" font-size="6.5" font-weight="normal">/mois</tspan></text>
                  <rect x="218" y="184" width="196" height="106" rx="8" fill="white" stroke="#E5E7EB" stroke-width="0.8"/>
                  <rect x="218" y="184" width="196" height="52" rx="8" fill="url(#g3d)"/>
                  <rect x="218" y="222" width="196" height="14" fill="url(#g3d)"/>
                  <path d="M316 196 L304 207 L304 218 L312 218 L312 210 L320 210 L320 218 L328 218 L328 207 Z" fill="rgba(255,255,255,0.2)" stroke="rgba(255,255,255,0.55)" stroke-width="1"/>
                  <path d="M300 208 L316 194 L332 208" fill="none" stroke="rgba(255,255,255,0.65)" stroke-width="1.5"/>
                  <rect x="224" y="189" width="34" height="12" rx="4" fill="white" opacity="0.92"/>
                  <text x="241" y="198" text-anchor="middle" fill="#C2410C" font-size="6.5" font-weight="bold" font-family="Arial,sans-serif">Studio</text>
                  <text x="226" y="249" fill="#111827" font-size="8" font-weight="bold" font-family="Arial,sans-serif">Studio Tokoin</text>
                  <text x="226" y="260" fill="#9CA3AF" font-size="6.5" font-family="Arial,sans-serif">Tokoin, Lomé</text>
                  <text x="226" y="284" fill="#0F4C81" font-size="9" font-weight="bold" font-family="Arial,sans-serif">75 000 F<tspan fill="#9CA3AF" font-size="6.5" font-weight="normal">/mois</tspan></text>
                </svg>
              }
            }
          </div>
        </div>
      }
    </div>
    <div class="hero-controls">
      <button class="h-arrow" (click)="prevSlide()" aria-label="Précédent">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M19 12H5M12 5l-7 7 7 7"/></svg>
      </button>
      <div class="h-dots">
        @for (s of slides; track s.badge; let i = $index) {
          <button class="dot" [class.dot-on]="currentSlide() === i" (click)="goToSlide(i)"></button>
        }
      </div>
      <button class="h-arrow" (click)="nextSlide()" aria-label="Suivant">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M5 12h14M12 5l7 7-7 7"/></svg>
      </button>
    </div>
    <div class="h-prog"><div class="h-prog-bar" [style.width.%]="((currentSlide()+1)/slides.length)*100"></div></div>
  </section>

  <!-- ── COMMENT ÇA FONCTIONNE ── -->
  <section class="howto-section" id="comment" #howtoSection [class.howto-on]="howtoVisible()">
    <div class="hw-glow hw-glow-a"></div>
    <div class="hw-glow hw-glow-b"></div>
    <div class="hw-glow hw-glow-c"></div>
    <div class="hw-dots"></div>
    <div class="sec-wrap">
      <div class="sec-head">
        <span class="sec-eye hw-eye">Simple &amp; rapide</span>
        <h2 class="sec-title hw-sec-title">Comment ça fonctionne ?</h2>
        <p class="sec-sub hw-sec-sub">Commencez à gérer vos biens en moins de 10 minutes</p>
      </div>
      <div class="hw-grid">
        @for (s of fonctionnement; track s.num; let i = $index; let last = $last) {
          <div class="hw-col" [style.--i]="i">
            <div class="hw-card">
              <span class="hw-bg-n">{{ s.num }}</span>
              <div class="hw-badge">{{ s.num }}</div>
              <div class="hw-icon" [style.animation-delay]="(i * 0.5) + 's'">
                @switch (i) {
                  @case (0) {
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  }
                  @case (1) {
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                  }
                  @case (2) {
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13.1a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2.23h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.18 6.18l1.94-1.94a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                  }
                  @case (3) {
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
                  }
                }
              </div>
              <h3 class="hw-card-title">{{ s.titre }}</h3>
              <p class="hw-card-desc">{{ s.desc }}</p>
              <div class="hw-tag">Étape {{ s.num }}</div>
            </div>
            @if (!last) {
              <div class="hw-arrow">
                <svg viewBox="0 0 56 24" fill="none">
                  <path d="M2 12 C14 2, 42 22, 54 12" stroke="#0F4C81" stroke-width="1.5" stroke-dasharray="5 4" stroke-linecap="round" opacity="0.45"/>
                  <polygon points="50,8 55,12 50,16" fill="#0F4C81" opacity="0.5"/>
                </svg>
              </div>
            }
          </div>
        }
      </div>
    </div>
  </section>

  <!-- ── POURQUOI WARAH ── -->
  <section class="why-section" #whySection [class.why-on]="whyVisible()">
    <div class="sec-wrap">
      <div class="sec-head">
        <span class="sec-eye">Nos avantages</span>
        <h2 class="sec-title">Pourquoi choisir WARAH ?</h2>
        <p class="sec-sub">Une solution pensée pour les propriétaires et gestionnaires togolais</p>
      </div>
      <div class="why-layout">

        <!-- ── Liste des fonctionnalités ── -->
        <div class="why-list">
          @for (a of avantages; track a.titre; let i = $index) {
            <button class="wi" [class.wi-on]="activeFeature() === i" (click)="selectFeature(i)" type="button">
              <div class="wi-icon">
                @switch (i) {
                  @case (0) { <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> }
                  @case (1) { <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg> }
                  @case (2) { <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><polyline points="9 15 11 17 15 13"/></svg> }
                  @case (3) { <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M22 17H2a3 3 0 0 0 3-3V9a7 7 0 0 1 14 0v5a3 3 0 0 0 3 3zm-8.27 4a2 2 0 0 1-3.46 0"/></svg> }
                  @case (4) { <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18" stroke-width="3"/></svg> }
                  @case (5) { <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> }
                  @case (6) { <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 11l19-9-9 19-2-8-8-2z"/></svg> }
                }
              </div>
              <div class="wi-body">
                <div class="wi-top">
                  <span class="wi-num">0{{ i + 1 }}</span>
                  <h3 class="wi-title">{{ a.titre }}</h3>
                </div>
                <p class="wi-desc">{{ a.desc }}</p>
              </div>
              <div class="wi-progress" [style.width.%]="activeFeature() === i ? 100 : 0"></div>
            </button>
          }
        </div>

        <!-- ── Panneau de prévisualisation ── -->
        <div class="why-preview">
          <div class="wp-pane">
            @switch (activeFeature()) {
              @case (0) {
                <div class="wp-c">
                  <p class="wp-label">Tableau de bord centralisé</p>
                  <div class="wp-kpis">
                    <div class="wp-kpi"><span class="wp-kpi-n">12</span><span class="wp-kpi-l">Biens</span></div>
                    <div class="wp-kpi"><span class="wp-kpi-n">9</span><span class="wp-kpi-l">Occupés</span></div>
                    <div class="wp-kpi"><span class="wp-kpi-n">75%</span><span class="wp-kpi-l">Taux occup.</span></div>
                  </div>
                  <div class="wp-table">
                    <div class="wp-th"><span>Bien</span><span>Localisation</span><span>Loyer</span><span>Statut</span></div>
                    <div class="wp-tr"><span>Villa Cocotiers</span><span>Adewui, Lomé</span><span>350 000 F</span><span class="wp-s wp-s-full">Occupé</span></div>
                    <div class="wp-tr"><span>Appart. Bè</span><span>Bè, Lomé</span><span>150 000 F</span><span class="wp-s wp-s-full">Occupé</span></div>
                    <div class="wp-tr"><span>Studio Agoè</span><span>Agoè, Lomé</span><span>85 000 F</span><span class="wp-s wp-s-empty">Vacant</span></div>
                  </div>
                </div>
              }
              @case (1) {
                <div class="wp-c">
                  <p class="wp-label">Suivi des paiements — Juillet 2026</p>
                  <div class="wp-bars">
                    @for (b of wpBars; track b.label) {
                      <div class="wp-bitem">
                        <div class="wp-bwrap"><div class="wp-bar" [class.wp-bar-hi]="b.hi" [style.height.%]="b.h"></div></div>
                        <span class="wp-blabel">{{ b.label }}</span>
                      </div>
                    }
                  </div>
                  <div class="wp-sum">
                    <div class="wp-sum-r"><span class="wp-sum-dot wp-dot-hi"></span><span>Collecté</span><strong>2 450 000 F</strong></div>
                    <div class="wp-sum-r"><span class="wp-sum-dot"></span><span>En attente</span><strong>450 000 F</strong></div>
                    <div class="wp-sum-r"><span class="wp-sum-dot wp-dot-lo"></span><span>Impayés</span><strong>150 000 F</strong></div>
                  </div>
                </div>
              }
              @case (2) {
                <div class="wp-c">
                  <p class="wp-label">Quittance générée automatiquement</p>
                  <div class="wp-doc">
                    <div class="wp-doc-hd"><strong>WARAH</strong><span>Quittance de loyer · Juil. 2026</span></div>
                    <div class="wp-doc-bd">
                      <div class="wp-doc-r"><span>Locataire</span><strong>Aminata Diallo</strong></div>
                      <div class="wp-doc-r"><span>Bien</span><strong>Villa des Cocotiers, Adewui</strong></div>
                      <div class="wp-doc-r"><span>Loyer</span><strong>320 000 F</strong></div>
                      <div class="wp-doc-r"><span>Charges</span><strong>30 000 F</strong></div>
                    </div>
                    <div class="wp-doc-total">350 000 FCFA</div>
                    <div class="wp-doc-ft">✓ Envoyée au locataire · ✓ Archivée automatiquement</div>
                  </div>
                </div>
              }
              @case (3) {
                <div class="wp-c">
                  <p class="wp-label">Centre de notifications</p>
                  <div class="wp-notifs">
                    <div class="wp-notif wp-notif-hi">
                      <svg class="wp-ni-ico" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 1a5 5 0 0 1 5 5c0 4.5-2 6-2 6H3s-2-1.5-2-6a5 5 0 0 1 5-5z"/><path d="M6.5 13.5a1.5 1.5 0 0 0 3 0"/></svg>
                      <div><p class="wp-ni-t">Loyer impayé — Fatou Kéita</p><p class="wp-ni-s">Échéance dépassée de 5 jours · Studio Agoè</p></div>
                    </div>
                    <div class="wp-notif wp-notif-md">
                      <svg class="wp-ni-ico" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 1a5 5 0 0 1 5 5c0 4.5-2 6-2 6H3s-2-1.5-2-6a5 5 0 0 1 5-5z"/><path d="M6.5 13.5a1.5 1.5 0 0 0 3 0"/></svg>
                      <div><p class="wp-ni-t">Rappel avant échéance — Ibrahim M.</p><p class="wp-ni-s">Loyer dû dans 3 jours · Appartement Bè</p></div>
                    </div>
                    <div class="wp-notif wp-notif-lo">
                      <svg class="wp-ni-ico" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2"><polyline points="2 8 6 12 14 4"/></svg>
                      <div><p class="wp-ni-t">Paiement confirmé — Kofi Agbenu</p><p class="wp-ni-s">85 000 F reçu · Studio Adewui</p></div>
                    </div>
                  </div>
                  <p class="wp-ft">Alertes email &amp; push · Configurables par bien et par locataire</p>
                </div>
              }
              @case (4) {
                <div class="wp-c wp-cc">
                  <p class="wp-label">Accessible sur tous vos appareils</p>
                  <div class="wp-devices">
                    <div class="wp-phone">
                      <div class="wpd-screen">
                        <div class="wpd-bar"></div>
                        <div class="wpd-line"></div>
                        <div class="wpd-line wpd-s"></div>
                      </div>
                      <div class="wp-phone-btn"></div>
                    </div>
                    <div class="wp-laptop">
                      <div class="wpd-screen">
                        <div class="wpd-bar"></div>
                        <div class="wpd-line"></div>
                        <div class="wpd-line"></div>
                        <div class="wpd-line wpd-s"></div>
                      </div>
                      <div class="wp-laptop-base"></div>
                    </div>
                  </div>
                  <div class="wp-chips">
                    <span class="wp-chip">✓ iPhone &amp; Android</span>
                    <span class="wp-chip">✓ Chrome / Safari</span>
                    <span class="wp-chip">✓ Tablette</span>
                    <span class="wp-chip">✓ Sans installation</span>
                  </div>
                </div>
              }
              @case (6) {
                <div class="wp-c">
                  <p class="wp-label">Annonces immobilières</p>
                  <div class="wp-search">
                    <svg viewBox="0 0 16 16" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="1.5" stroke-linecap="round"><circle cx="6.5" cy="6.5" r="4"/><path d="M11 11l3 3"/></svg>
                    <span>Rechercher un bien à Lomé…</span>
                  </div>
                  <div class="wp-ann-cards">
                    <div class="wp-ann-card">
                      <div class="wp-ann-top"><span class="wp-ann-type">Villa</span><span class="wp-ann-new">Nouveau</span></div>
                      <p class="wp-ann-name">Villa des Cocotiers</p>
                      <p class="wp-ann-loc">Adewui, Lomé · 5 pièces</p>
                      <div class="wp-ann-foot"><strong>350 000 F/mois</strong><span class="wp-ann-cand">4 candidatures</span></div>
                    </div>
                    <div class="wp-ann-card">
                      <div class="wp-ann-top"><span class="wp-ann-type">Studio</span></div>
                      <p class="wp-ann-name">Studio Adewui</p>
                      <p class="wp-ann-loc">Adewui, Lomé · 1 pièce</p>
                      <div class="wp-ann-foot"><strong>85 000 F/mois</strong><span class="wp-ann-cand">2 candidatures</span></div>
                    </div>
                  </div>
                  <p class="wp-ft">Vos annonces visibles par tous les locataires potentiels</p>
                </div>
              }
              @case (5) {
                <div class="wp-c wp-cc">
                  <p class="wp-label">Sécurité de vos données</p>
                  <div class="wp-shield-wrap">
                    <svg class="wp-shield-svg" viewBox="0 0 80 90" fill="none">
                      <path d="M40 5 L72 19 L72 50 C72 68 57 82 40 88 C23 82 8 68 8 50 L8 19 Z" fill="rgba(255,255,255,0.07)" stroke="rgba(255,255,255,0.25)" stroke-width="1.5"/>
                      <path d="M40 15 L66 26 L66 50 C66 65 54 77 40 83 C26 77 14 65 14 50 L14 26 Z" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.12)" stroke-width="1"/>
                      <polyline points="26,46 34,54 54,34" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </div>
                  <div class="wp-checks">
                    <div class="wp-ck">✓ Chiffrement AES-256</div>
                    <div class="wp-ck">✓ Sauvegardes quotidiennes</div>
                    <div class="wp-ck">✓ Authentification sécurisée</div>
                    <div class="wp-ck">✓ Données hébergées localement</div>
                  </div>
                </div>
              }
            }
          </div>
          <span class="wp-bg-n">0{{ activeFeature() + 1 }}</span>
        </div>

      </div>
    </div>
  </section>

  <!-- ── IMPACT EN CHIFFRES ── -->
  <section class="impact-section" #impactSection>
    <div class="sec-wrap">
      <div class="sec-head">
        <span class="sec-eye impact-eye">En chiffres</span>
        <h2 class="sec-title impact-title">L'impact WARAH au Togo</h2>
        <p class="sec-sub impact-sub">Des résultats concrets mesurés chaque mois sur notre plateforme</p>
      </div>
      <div class="impact-grid">
        <div class="impact-item">
          <span class="impact-n">{{ statAnnonces() }}<small>+</small></span>
          <span class="impact-l">Annonces publiées</span>
          <span class="impact-detail">Biens mis en location sur la plateforme</span>
        </div>
        <div class="impact-sep"></div>
        <div class="impact-item">
          <span class="impact-n">{{ statProprio() }}<small>+</small></span>
          <span class="impact-l">Propriétaires actifs</span>
          <span class="impact-detail">Font confiance à WARAH chaque mois</span>
        </div>
        <div class="impact-sep"></div>
        <div class="impact-item">
          <span class="impact-n">{{ statSatisfaction() }}<small>%</small></span>
          <span class="impact-l">Taux de satisfaction</span>
          <span class="impact-detail">Selon notre enquête utilisateurs 2026</span>
        </div>
        <div class="impact-sep"></div>
        <div class="impact-item">
          <span class="impact-n">{{ statVilles() }}</span>
          <span class="impact-l">Villes couvertes</span>
          <span class="impact-detail">Lomé, Kara, Sokodé, Atakpamé et plus</span>
        </div>
      </div>
    </div>
  </section>

  <!-- ── TÉMOIGNAGES ── -->
  <section class="temo-section" id="temoignages">
    <div class="sec-wrap">
      <div class="temo-layout">

        <!-- Gauche : image + titre -->
        <div class="temo-left">
          <img
            src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
            alt="Utilisatrice WARAH"
            class="temo-img">
          <div class="temo-left-ov"></div>
          <div class="temo-left-content">
            <div class="temo-left-icon">
              <svg viewBox="0 0 32 32" fill="none" stroke="#C9982E" stroke-width="2" stroke-linecap="round">
                <path d="M16 3l2.4 7.4H26l-6.2 4.5 2.4 7.4L16 18l-6.2 4.3 2.4-7.4L6 10.4h7.6z"/>
              </svg>
            </div>
            <h2 class="temo-left-title">Ils parlent<br>de WARAH</h2>
            <p class="temo-left-sub">Propriétaires, gestionnaires, locataires — ils ont transformé leur quotidien.</p>
          </div>
        </div>

        <!-- Droite : accordéon -->
        <div class="temo-right">
          @for (t of temoignages; track t.nom; let i = $index) {
            <div
              class="temo-item"
              [class.temo-open]="selectedTemo() === i"
              (click)="selectedTemo.set(selectedTemo() === i ? -1 : i)">
              <div class="temo-item-head">
                <div class="temo-item-left">
                  <div class="temo-av" [style.background]="t.couleur">{{ t.initiale }}</div>
                  <div class="temo-item-meta">
                    <span class="temo-nom">{{ t.nom }}</span>
                    <span class="temo-role">{{ t.role }} · {{ t.ville }}</span>
                  </div>
                </div>
                <div class="temo-item-right">
                  <div class="temo-stars-row">
                    @for (s of [1,2,3,4,5]; track s) {
                      <svg viewBox="0 0 12 12" fill="#C9982E" class="ts"><path d="M6 1l1.2 3.7H11L8.1 6.6l1.1 3.5L6 8.3l-3.2 1.8 1.1-3.5L1 4.7h3.8z"/></svg>
                    }
                  </div>
                  <span class="temo-toggle-btn">{{ selectedTemo() === i ? '−' : '+' }}</span>
                </div>
              </div>
              @if (selectedTemo() === i) {
                <div class="temo-item-body">
                  <p class="temo-texte">« {{ t.texte }} »</p>
                </div>
              }
            </div>
          }
        </div>

      </div>
    </div>
  </section>

  <!-- ── FAQ ── -->
  <section class="faq-section">
    <div class="faq-inner">

      <!-- En-tête centré -->
      <div class="faq-head">
        <div class="faq-head-badge">
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="8" cy="8" r="6.5"/><path d="M6 6.3a2 2 0 1 1 2.6 1.9c-.4.1-.6.5-.6.8v.5"/><circle cx="8" cy="11.5" r=".6" fill="currentColor" stroke="none"/></svg>
          Questions fréquentes
        </div>
        <h2 class="faq-title">Tout ce que vous voulez<br>savoir sur WARAH</h2>
        <p class="faq-sub">Des réponses claires sur notre plateforme de gestion immobilière</p>
      </div>

      <!-- Grille 2 colonnes d'accordéons -->
      <div class="faq-grid">
        <div class="faq-col">
          @for (f of faqs.slice(0,4); track f.q; let i = $index) {
            <div class="faq-item" [class.faq-open]="selectedFaq() === i" (click)="selectedFaq.set(selectedFaq() === i ? -1 : i)">
              <div class="faq-row">
                <span class="faq-num">0{{ i + 1 }}</span>
                <span class="faq-q">{{ f.q }}</span>
                <svg class="faq-chevron" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M5 8l5 5 5-5"/></svg>
              </div>
              @if (selectedFaq() === i) {
                <div class="faq-ans"><p>{{ f.r }}</p></div>
              }
            </div>
          }
        </div>
        <div class="faq-col">
          @for (f of faqs.slice(4); track f.q; let i = $index) {
            <div class="faq-item" [class.faq-open]="selectedFaq() === i + 4" (click)="selectedFaq.set(selectedFaq() === i + 4 ? -1 : i + 4)">
              <div class="faq-row">
                <span class="faq-num">0{{ i + 5 }}</span>
                <span class="faq-q">{{ f.q }}</span>
                <svg class="faq-chevron" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M5 8l5 5 5-5"/></svg>
              </div>
              @if (selectedFaq() === i + 4) {
                <div class="faq-ans"><p>{{ f.r }}</p></div>
              }
            </div>
          }
        </div>
      </div>

      <!-- Bas : contact -->
      <div class="faq-footer">
        <p>Vous ne trouvez pas la réponse ?</p>
        <a routerLink="/auth/register" class="faq-cta">Contactez-nous →</a>
      </div>

    </div>
  </section>

  <!-- ── ABONNEMENTS ── -->
  <section class="price-section">
    <div class="sec-wrap">
      <div class="sec-head">
        <span class="sec-eye">Tarifs transparents</span>
        <h2 class="sec-title">Choisissez votre formule</h2>
        <p class="sec-sub">Des offres adaptées à chaque propriétaire — du débutant au gestionnaire professionnel.</p>
      </div>

      <div class="price-grid">

        <!-- Starter -->
        <div class="price-card">
          <div class="price-top">
            <span class="price-label">Starter</span>
            <div class="price-amount"><span class="price-n">2 000</span><span class="price-unit"> FCFA</span></div>
            <p class="price-period">par mois · jusqu'à 5 propriétés</p>
          </div>
          <ul class="price-feats">
            <li class="feat-ok"><svg viewBox="0 0 16 16" fill="none" stroke="#0F4C81" stroke-width="2" stroke-linecap="round"><path d="M3 8l4 4 6-6"/></svg>Jusqu'à 5 propriétés</li>
            <li class="feat-ok"><svg viewBox="0 0 16 16" fill="none" stroke="#0F4C81" stroke-width="2" stroke-linecap="round"><path d="M3 8l4 4 6-6"/></svg>Collecte T-Money / Flooz</li>
            <li class="feat-ok"><svg viewBox="0 0 16 16" fill="none" stroke="#0F4C81" stroke-width="2" stroke-linecap="round"><path d="M3 8l4 4 6-6"/></svg>Quittances automatiques</li>
            <li class="feat-ok"><svg viewBox="0 0 16 16" fill="none" stroke="#0F4C81" stroke-width="2" stroke-linecap="round"><path d="M3 8l4 4 6-6"/></svg>Rappels &amp; alertes impayés</li>
            <li class="feat-ok"><svg viewBox="0 0 16 16" fill="none" stroke="#0F4C81" stroke-width="2" stroke-linecap="round"><path d="M3 8l4 4 6-6"/></svg>Tableau de bord basique</li>
            <li class="feat-no"><svg viewBox="0 0 16 16" fill="none" stroke="#D1D5DB" stroke-width="2" stroke-linecap="round"><path d="M4 4l8 8M12 4l-8 8"/></svg>Contrats de bail PDF</li>
            <li class="feat-no"><svg viewBox="0 0 16 16" fill="none" stroke="#D1D5DB" stroke-width="2" stroke-linecap="round"><path d="M4 4l8 8M12 4l-8 8"/></svg>Annonces biens vacants</li>
          </ul>
          <a routerLink="/auth/register" class="price-btn price-btn-ghost">Commencer avec Starter</a>
        </div>

        <!-- Pro (recommandé) -->
        <div class="price-card price-card-pro">
          <div class="price-badge-pop">
            <svg viewBox="0 0 14 14" fill="#C9982E"><path d="M7 1l1.6 3.2 3.5.5-2.5 2.5 1 3.5L7 9.2l-3.6 1.5 1-3.5L2 4.7l3.5-.5z"/></svg>
            Recommandé
          </div>
          <div class="price-top">
            <span class="price-label price-label-pro">Pro</span>
            <div class="price-amount"><span class="price-n">5 000</span><span class="price-unit"> FCFA</span></div>
            <p class="price-period">par mois · jusqu'à 15 propriétés</p>
          </div>
          <ul class="price-feats">
            <li class="feat-ok feat-ok-pro"><svg viewBox="0 0 16 16" fill="none" stroke="#C9982E" stroke-width="2" stroke-linecap="round"><path d="M3 8l4 4 6-6"/></svg>Jusqu'à 15 propriétés</li>
            <li class="feat-ok feat-ok-pro"><svg viewBox="0 0 16 16" fill="none" stroke="#C9982E" stroke-width="2" stroke-linecap="round"><path d="M3 8l4 4 6-6"/></svg>Tout ce qu'inclut Starter</li>
            <li class="feat-ok feat-ok-pro"><svg viewBox="0 0 16 16" fill="none" stroke="#C9982E" stroke-width="2" stroke-linecap="round"><path d="M3 8l4 4 6-6"/></svg>Contrats de bail PDF</li>
            <li class="feat-ok feat-ok-pro"><svg viewBox="0 0 16 16" fill="none" stroke="#C9982E" stroke-width="2" stroke-linecap="round"><path d="M3 8l4 4 6-6"/></svg>Historique exportable</li>
            <li class="feat-ok feat-ok-pro"><svg viewBox="0 0 16 16" fill="none" stroke="#C9982E" stroke-width="2" stroke-linecap="round"><path d="M3 8l4 4 6-6"/></svg>Annonces biens vacants</li>
            <li class="feat-ok feat-ok-pro"><svg viewBox="0 0 16 16" fill="none" stroke="#C9982E" stroke-width="2" stroke-linecap="round"><path d="M3 8l4 4 6-6"/></svg>Paiements mensuel / trim. / sem.</li>
          </ul>
          <a routerLink="/auth/register" class="price-btn price-btn-pro">Démarrer avec Pro</a>
        </div>

        <!-- Premium Gestionnaire -->
        <div class="price-card">
          <div class="price-top">
            <span class="price-label">Premium Gestionnaire</span>
            <div class="price-amount"><span class="price-n">10 000</span><span class="price-unit"> FCFA</span></div>
            <p class="price-period">par mois · propriétés illimitées</p>
          </div>
          <ul class="price-feats">
            <li class="feat-ok"><svg viewBox="0 0 16 16" fill="none" stroke="#0F4C81" stroke-width="2" stroke-linecap="round"><path d="M3 8l4 4 6-6"/></svg>Propriétés illimitées</li>
            <li class="feat-ok"><svg viewBox="0 0 16 16" fill="none" stroke="#0F4C81" stroke-width="2" stroke-linecap="round"><path d="M3 8l4 4 6-6"/></svg>Tout ce qu'inclut Pro</li>
            <li class="feat-ok"><svg viewBox="0 0 16 16" fill="none" stroke="#0F4C81" stroke-width="2" stroke-linecap="round"><path d="M3 8l4 4 6-6"/></svg>Espace gestionnaire pro</li>
            <li class="feat-ok"><svg viewBox="0 0 16 16" fill="none" stroke="#0F4C81" stroke-width="2" stroke-linecap="round"><path d="M3 8l4 4 6-6"/></svg>Portefeuille de mandats</li>
            <li class="feat-ok"><svg viewBox="0 0 16 16" fill="none" stroke="#0F4C81" stroke-width="2" stroke-linecap="round"><path d="M3 8l4 4 6-6"/></svg>Rapports mensuels auto</li>
            <li class="feat-ok"><svg viewBox="0 0 16 16" fill="none" stroke="#0F4C81" stroke-width="2" stroke-linecap="round"><path d="M3 8l4 4 6-6"/></svg>Profil vérifié &amp; support prioritaire</li>
          </ul>
          <a routerLink="/auth/register" class="price-btn price-btn-ghost">Démarrer Premium</a>
        </div>

      </div>

      <!-- Add-on Référencement -->
      <div class="price-addon">
        <div class="price-addon-left">
          <div class="price-addon-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 12h18M3 6h18M3 18h18"/><circle cx="19" cy="6" r="3" fill="#C9982E" stroke="none"/></svg>
          </div>
          <div>
            <span class="price-addon-label">Option · Référencement gestionnaire</span>
            <p class="price-addon-desc">Mise en avant dans l'annuaire WARAH pour les gestionnaires souhaitant maximiser leur visibilité auprès des propriétaires.</p>
          </div>
        </div>
        <div class="price-addon-right">
          <div class="price-addon-price">15 000 – 30 000 <span>FCFA/mois</span></div>
          <a routerLink="/auth/register" class="price-btn price-btn-addon">En savoir plus</a>
        </div>
      </div>

      <p class="price-note">Sans engagement · Résiliation à tout moment · Paiement sécurisé via T-Money &amp; Flooz</p>
    </div>
  </section>

  <!-- ── FOOTER ── -->
  <app-public-footer />

</div>
  `,
  styles: [`
    :host { display: block; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    ul { list-style: none; }
    a { text-decoration: none; }
    img { max-width: 100%; }
    .lp { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; color: #1a2744; background: #fff; overflow-x: hidden; }

    /* ── NAVBAR ── */
    .nav { position: fixed; top: 0; left: 0; right: 0; z-index: 200; transition: background .35s, box-shadow .35s; }
    .nav.nav-solid { background: #0A2650; box-shadow: 0 2px 24px rgba(0,0,0,0.35); }
    .nav-inner { max-width: 1200px; margin: 0 auto; padding: 0 24px; height: 70px; display: flex; align-items: center; gap: 32px; }
    .nav-logo { flex-shrink: 0; }
    .logo-img { height: 38px; width: auto; display: block; }
    .nav-links { display: flex; gap: 28px; flex: 1; }
    .nl { color: rgba(255,255,255,0.88); font-size: 14.5px; font-weight: 500; transition: color .2s; position: relative; }
    .nl::after { content: attr(data-text); display: block; height: 0; overflow: hidden; font-weight: 700; visibility: hidden; pointer-events: none; }
    .nl:hover { color: #C9982E; }
    .nav-cta { display: flex; align-items: center; gap: 12px; flex-shrink: 0; }
    .btn-ghost { color: rgba(255,255,255,0.88); font-size: 14px; font-weight: 500; padding: 8px 16px; border-radius: 8px; transition: background .2s; }
    .btn-ghost:hover { background: rgba(255,255,255,0.1); }
    .btn-nav-primary { background: #C9982E; color: #fff; font-size: 14px; font-weight: 700; padding: 9px 20px; border-radius: 8px; transition: background .2s; }
    .btn-nav-primary:hover { background: #b8881f; }
    .hamburger { display: none; flex-direction: column; gap: 5px; background: none; border: none; cursor: pointer; padding: 6px; }
    .hamburger span { display: block; width: 22px; height: 2px; background: #fff; border-radius: 2px; }
    .m-menu { background: #081E41; padding: 16px 24px 24px; display: flex; flex-direction: column; gap: 4px; border-top: 1px solid rgba(255,255,255,0.1); }
    .mm-link { color: rgba(255,255,255,0.85); font-size: 15px; padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.07); }
    .mm-sep { height: 12px; }
    .mm-cta { margin-top: 8px; background: #C9982E; color: #fff; text-align: center; padding: 13px; border-radius: 8px; font-weight: 700; }

    /* ── HERO ── */
    .hero { position: relative; height: 100vh; min-height: 600px; background: linear-gradient(135deg, #081E41 0%, #0F4C81 60%, #0A2650 100%); overflow: hidden; display: flex; flex-direction: column; }
    .hero-bg-deco { position: absolute; inset: 0; pointer-events: none; }
    .deco-circle { position: absolute; border-radius: 50%; border: 1px solid rgba(255,255,255,0.06); }
    .deco-c1 { width: 600px; height: 600px; top: -200px; right: -150px; }
    .deco-c2 { width: 400px; height: 400px; bottom: -100px; left: -100px; }
    .deco-line { position: absolute; background: linear-gradient(90deg, transparent, rgba(201,152,46,0.12), transparent); height: 1px; width: 100%; top: 45%; }
    .slides { position: relative; flex: 1; }
    .slide { position: absolute; inset: 0; display: flex; align-items: center; max-width: 1200px; padding: 100px 24px 80px; gap: 48px; opacity: 0; pointer-events: none; transition: opacity .7s cubic-bezier(.4,0,.2,1), transform .7s cubic-bezier(.4,0,.2,1); left: 50%; transform: translateX(calc(-50% + 40px)); }
    .slide.slide-on { opacity: 1; pointer-events: auto; transform: translateX(-50%); }
    .slide-text { flex: 1; max-width: 540px; }
    .s-badge { display: inline-block; background: rgba(201,152,46,0.2); color: #C9982E; border: 1px solid rgba(201,152,46,0.4); font-size: 12px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; padding: 5px 14px; border-radius: 20px; margin-bottom: 20px; }
    .s-title { font-size: clamp(28px, 4vw, 52px); font-weight: 800; line-height: 1.15; color: #fff; margin-bottom: 18px; text-wrap: balance; }
    .s-sub { font-size: 16px; line-height: 1.7; color: rgba(255,255,255,0.78); margin-bottom: 36px; max-width: 440px; }
    .s-cta { display: inline-flex; align-items: center; gap: 10px; background: #C9982E; color: #fff; font-weight: 700; font-size: 15px; padding: 14px 28px; border-radius: 10px; transition: background .2s, transform .2s; box-shadow: 0 4px 20px rgba(201,152,46,0.4); }
    .s-cta:hover { background: #b8881f; transform: translateY(-1px); }
    .s-arrow { width: 18px; height: 18px; }
    .slide-visual { flex: 0 0 340px; display: flex; align-items: center; justify-content: center; }
    .s-svg { width: 100%; max-width: 340px; height: auto; filter: drop-shadow(0 20px 60px rgba(0,0,0,0.3)); }
    .hero-controls { position: absolute; bottom: 50px; left: 50%; transform: translateX(-50%); display: flex; align-items: center; gap: 20px; z-index: 10; }
    .h-arrow { width: 44px; height: 44px; border-radius: 50%; background: rgba(255,255,255,0.12); border: 1px solid rgba(255,255,255,0.25); color: #fff; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: background .2s; }
    .h-arrow:hover { background: rgba(255,255,255,0.22); }
    .h-arrow svg { width: 18px; height: 18px; }
    .h-dots { display: flex; gap: 8px; }
    .dot { width: 8px; height: 8px; border-radius: 50%; background: rgba(255,255,255,0.35); border: none; cursor: pointer; transition: background .25s, width .25s; padding: 0; }
    .dot.dot-on { background: #C9982E; width: 24px; border-radius: 4px; }
    .h-prog { position: absolute; bottom: 0; left: 0; right: 0; height: 3px; background: rgba(255,255,255,0.12); }
    .h-prog-bar { height: 100%; background: #C9982E; transition: width .4s ease; }

    /* ── SECTION HEADERS (shared) ── */
    .sec-wrap { max-width: 1200px; margin: 0 auto; padding: 0 24px; }
    .sec-head { text-align: center; margin-bottom: 56px; }
    .sec-eye { display: inline-block; color: #C9982E; font-size: 12px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; margin-bottom: 12px; }
    .sec-title { font-size: clamp(24px, 3vw, 36px); font-weight: 800; color: #0A2650; margin-bottom: 12px; }
    .sec-sub { font-size: 15px; color: #6b7280; max-width: 500px; margin: 0 auto; line-height: 1.65; }

    /* ── COMMENT ÇA FONCTIONNE ── */
    .howto-section {
      background: #f4f7fb;
      padding: 100px 0;
      position: relative;
      overflow: hidden;
    }
    .hw-glow {
      position: absolute; border-radius: 50%; pointer-events: none;
    }
    .hw-glow-a {
      width: 600px; height: 600px;
      background: radial-gradient(circle, rgba(15,76,129,0.08) 0%, transparent 70%);
      top: -200px; left: -150px;
    }
    .hw-glow-b {
      width: 400px; height: 400px;
      background: radial-gradient(circle, rgba(15,76,129,0.06) 0%, transparent 70%);
      bottom: -100px; right: -100px;
    }
    .hw-glow-c { display: none; }
    .hw-dots {
      position: absolute; inset: 0; pointer-events: none;
      background-image: radial-gradient(rgba(15,76,129,0.08) 1px, transparent 1px);
      background-size: 28px 28px;
    }
    .hw-eye { color: #0F4C81; font-weight: 700; }
    .hw-sec-title { color: #0A2650; }
    .hw-sec-sub { color: #6b7280; }

    .hw-grid {
      display: flex;
      align-items: stretch;
      gap: 0;
    }
    .hw-col {
      flex: 1;
      min-width: 0;
      display: flex;
      align-items: center;
      opacity: 0;
      transform: translateY(48px) scale(0.93);
      transition:
        opacity 0.65s cubic-bezier(0.22,1,0.36,1) calc(var(--i, 0) * 0.13s),
        transform 0.65s cubic-bezier(0.34,1.56,0.64,1) calc(var(--i, 0) * 0.13s);
    }
    .howto-on .hw-col {
      opacity: 1;
      transform: translateY(0) scale(1);
    }

    .hw-card {
      flex: 1;
      min-width: 0;
      background: linear-gradient(145deg, #0A2650 0%, #0F4C81 100%);
      border-radius: 20px;
      padding: 32px 22px 28px;
      position: relative;
      overflow: hidden;
      cursor: default;
      box-shadow: 0 8px 32px rgba(15,76,129,0.22);
      transition: transform 0.4s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s ease;
    }
    .hw-card::after {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(135deg, rgba(255,255,255,0.08) 0%, transparent 55%);
      pointer-events: none;
    }
    .hw-card:hover {
      transform: translateY(-10px) scale(1.03);
      box-shadow: 0 28px 64px rgba(15,76,129,0.38), 0 0 0 2px rgba(255,255,255,0.18);
    }

    .hw-bg-n {
      position: absolute;
      font-size: 110px; font-weight: 900;
      color: rgba(255,255,255,0.05);
      right: -8px; bottom: -22px;
      line-height: 1; pointer-events: none; user-select: none;
    }

    .hw-badge {
      width: 50px; height: 50px;
      border-radius: 14px;
      background: rgba(255,255,255,0.95);
      color: #0F4C81;
      font-size: 17px; font-weight: 800;
      display: flex; align-items: center; justify-content: center;
      margin-bottom: 22px;
      box-shadow: 0 4px 18px rgba(0,0,0,0.2);
      position: relative; z-index: 1;
    }

    .hw-icon {
      color: rgba(255,255,255,0.8);
      margin-bottom: 16px;
      animation: hwFloat 3.5s ease-in-out infinite;
      position: relative; z-index: 1;
    }
    .hw-icon svg { width: 30px; height: 30px; }

    @keyframes hwFloat {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-7px); }
    }

    .hw-card-title {
      font-size: 16px; font-weight: 700;
      color: #fff; margin-bottom: 10px;
      position: relative; z-index: 1;
    }
    .hw-card-desc {
      font-size: 13px; color: rgba(255,255,255,0.65);
      line-height: 1.7; margin-bottom: 16px;
      position: relative; z-index: 1;
    }
    .hw-tag {
      display: inline-block;
      font-size: 10px; font-weight: 700; letter-spacing: .1em;
      text-transform: uppercase;
      color: rgba(255,255,255,0.5);
      border: 1px solid rgba(255,255,255,0.18);
      padding: 3px 10px; border-radius: 20px;
      position: relative; z-index: 1;
    }

    .hw-arrow {
      flex-shrink: 0; padding: 0 4px;
      display: flex; align-items: center;
    }
    .hw-arrow svg { width: 56px; height: 24px; display: block; }

    /* ── POURQUOI WARAH ── */
    .why-section { background: #f4f7fb; padding: 100px 0; opacity: 0; transform: translateY(28px); transition: opacity .7s ease, transform .7s ease; }
    .why-section.why-on { opacity: 1; transform: translateY(0); }

    .why-layout { display: grid; grid-template-columns: 1fr 1fr; gap: 36px; align-items: start; }

    /* Liste gauche */
    .why-list { display: flex; flex-direction: column; gap: 5px; }
    .wi {
      position: relative; overflow: hidden;
      display: flex; align-items: flex-start; gap: 13px;
      padding: 14px 16px; border-radius: 12px;
      border: 1.5px solid transparent;
      background: white; cursor: pointer; text-align: left; width: 100%;
      transition: background .22s, border-color .22s, box-shadow .22s;
    }
    .wi:not(.wi-on):hover { background: #EEF4FC; border-color: rgba(15,76,129,0.15); }
    .wi.wi-on { background: #0F4C81; border-color: #0F4C81; box-shadow: 0 6px 24px rgba(15,76,129,0.28); }

    .wi-icon {
      width: 38px; height: 38px; border-radius: 9px; flex-shrink: 0;
      background: rgba(15,76,129,0.09); color: #0F4C81;
      display: flex; align-items: center; justify-content: center;
      transition: background .2s, color .2s; margin-top: 1px;
    }
    .wi.wi-on .wi-icon { background: rgba(255,255,255,0.15); color: #fff; }
    .wi-icon svg { width: 17px; height: 17px; }

    .wi-body { flex: 1; min-width: 0; }
    .wi-top { display: flex; align-items: center; gap: 8px; margin-bottom: 4px; }
    .wi-num { font-size: 10px; font-weight: 700; color: #9CA3AF; letter-spacing: .08em; }
    .wi.wi-on .wi-num { color: rgba(255,255,255,0.45); }
    .wi-title { font-size: 14px; font-weight: 700; color: #0A2650; }
    .wi.wi-on .wi-title { color: #fff; }
    .wi-desc { font-size: 12px; color: #6B7280; line-height: 1.6; max-height: 0; overflow: hidden; transition: max-height .3s ease; }
    .wi.wi-on .wi-desc { max-height: 80px; color: rgba(255,255,255,0.65); }

    .wi-progress {
      position: absolute; bottom: 0; left: 0; height: 2px;
      background: rgba(255,255,255,0.5); width: 0;
      transition: width 3.5s linear;
    }

    /* Panneau droit */
    .why-preview {
      position: sticky; top: 20px;
      background: linear-gradient(145deg, #081E41 0%, #0F4C81 100%);
      border-radius: 22px; min-height: 380px; overflow: hidden;
      box-shadow: 0 20px 56px rgba(15,76,129,0.32);
    }
    .wp-pane { padding: 32px 28px; position: relative; z-index: 1; }
    .wp-bg-n {
      position: absolute; font-size: 200px; font-weight: 900;
      color: rgba(255,255,255,0.03); right: -20px; bottom: -50px;
      line-height: 1; pointer-events: none; user-select: none; z-index: 0;
    }
    .wp-timer-bar {
      position: absolute; bottom: 0; left: 0; height: 3px;
      background: rgba(255,255,255,0.35);
      animation: wpTimer 3.5s linear infinite;
    }
    @keyframes wpTimer { from { width: 0; } to { width: 100%; } }

    .wp-c { animation: wpIn .35s cubic-bezier(0.22,1,0.36,1); }
    .wp-cc { text-align: center; }
    @keyframes wpIn { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }

    .wp-label { font-size: 10.5px; font-weight: 700; color: rgba(255,255,255,0.42); letter-spacing: .1em; text-transform: uppercase; margin-bottom: 18px; }

    /* KPIs */
    .wp-kpis { display: flex; gap: 10px; margin-bottom: 18px; }
    .wp-kpi { flex: 1; background: rgba(255,255,255,0.08); border-radius: 10px; padding: 12px 10px; text-align: center; border: 1px solid rgba(255,255,255,0.07); }
    .wp-kpi-n { display: block; font-size: 24px; font-weight: 800; color: #fff; }
    .wp-kpi-l { display: block; font-size: 10px; color: rgba(255,255,255,0.45); margin-top: 3px; }

    /* Table */
    .wp-table { border-radius: 10px; overflow: hidden; font-size: 11.5px; }
    .wp-th { display: grid; grid-template-columns: 2fr 2fr 1.5fr 1fr; padding: 7px 10px; background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.38); font-weight: 700; letter-spacing: .04em; font-size: 10px; }
    .wp-tr { display: grid; grid-template-columns: 2fr 2fr 1.5fr 1fr; padding: 9px 10px; color: rgba(255,255,255,0.75); border-top: 1px solid rgba(255,255,255,0.06); align-items: center; }
    .wp-s { font-size: 10px; font-weight: 700; padding: 2px 7px; border-radius: 8px; text-align: center; }
    .wp-s-full { background: rgba(255,255,255,0.15); color: white; }
    .wp-s-empty { background: rgba(255,255,255,0.07); color: rgba(255,255,255,0.4); }

    /* Bars paiement */
    .wp-bars { display: flex; align-items: flex-end; gap: 7px; height: 96px; margin-bottom: 14px; }
    .wp-bitem { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 5px; height: 100%; }
    .wp-bwrap { flex: 1; width: 100%; display: flex; align-items: flex-end; }
    .wp-bar { width: 100%; background: rgba(255,255,255,0.15); border-radius: 4px 4px 0 0; transition: height .5s; }
    .wp-bar.wp-bar-hi { background: rgba(255,255,255,0.9); }
    .wp-blabel { font-size: 9.5px; color: rgba(255,255,255,0.38); }
    .wp-sum { display: flex; flex-direction: column; gap: 7px; }
    .wp-sum-r { display: flex; align-items: center; gap: 8px; font-size: 12px; color: rgba(255,255,255,0.6); }
    .wp-sum-r strong { margin-left: auto; color: white; font-size: 12.5px; }
    .wp-sum-dot { width: 8px; height: 8px; border-radius: 50%; background: rgba(255,255,255,0.25); flex-shrink: 0; }
    .wp-dot-hi { background: rgba(255,255,255,0.9); }
    .wp-dot-lo { background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.3); }

    /* Document */
    .wp-doc { background: rgba(255,255,255,0.07); border-radius: 12px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1); }
    .wp-doc-hd { background: rgba(255,255,255,0.1); padding: 10px 14px; display: flex; justify-content: space-between; align-items: center; }
    .wp-doc-hd strong { color: white; font-size: 13px; }
    .wp-doc-hd span { color: rgba(255,255,255,0.45); font-size: 10.5px; }
    .wp-doc-bd { padding: 12px 14px; display: flex; flex-direction: column; gap: 7px; }
    .wp-doc-r { display: flex; justify-content: space-between; font-size: 12px; }
    .wp-doc-r span { color: rgba(255,255,255,0.42); }
    .wp-doc-r strong { color: white; }
    .wp-doc-total { border-top: 1px solid rgba(255,255,255,0.1); text-align: center; font-size: 28px; font-weight: 800; color: white; padding: 14px 0 6px; margin: 0 14px; }
    .wp-doc-ft { text-align: center; font-size: 10px; color: rgba(255,255,255,0.32); padding: 6px 14px 12px; }

    /* Notifications */
    .wp-notifs { display: flex; flex-direction: column; gap: 8px; margin-bottom: 14px; }
    .wp-notif { display: flex; align-items: flex-start; gap: 10px; background: rgba(255,255,255,0.06); border-radius: 10px; padding: 11px 12px; border-left: 3px solid; }
    .wp-notif-hi { border-left-color: rgba(255,255,255,0.8); }
    .wp-notif-md { border-left-color: rgba(255,255,255,0.4); }
    .wp-notif-lo { border-left-color: rgba(255,255,255,0.2); }
    .wp-ni-ico { width: 16px; height: 16px; flex-shrink: 0; color: rgba(255,255,255,0.55); margin-top: 2px; }
    .wp-ni-t { font-size: 12.5px; font-weight: 600; color: white; margin-bottom: 2px; }
    .wp-ni-s { font-size: 10.5px; color: rgba(255,255,255,0.45); }
    .wp-ft { font-size: 10.5px; color: rgba(255,255,255,0.32); text-align: center; }

    /* Devices */
    .wp-devices { display: flex; align-items: flex-end; justify-content: center; gap: 24px; margin: 22px 0 20px; }
    .wp-phone { width: 54px; }
    .wp-phone .wpd-screen { width: 54px; height: 92px; border: 2px solid rgba(255,255,255,0.3); border-radius: 10px; padding: 8px 7px; background: rgba(255,255,255,0.05); }
    .wp-phone-btn { width: 16px; height: 4px; background: rgba(255,255,255,0.2); border-radius: 2px; margin: 4px auto 0; }
    .wp-laptop .wpd-screen { width: 124px; height: 82px; border: 2px solid rgba(255,255,255,0.3); border-radius: 6px 6px 0 0; padding: 8px; background: rgba(255,255,255,0.05); }
    .wp-laptop-base { height: 7px; background: rgba(255,255,255,0.2); border-radius: 0 0 4px 4px; width: 144px; }
    .wpd-bar { height: 8px; background: rgba(255,255,255,0.25); border-radius: 3px; margin-bottom: 6px; }
    .wpd-line { height: 5px; background: rgba(255,255,255,0.12); border-radius: 2px; margin-bottom: 4px; }
    .wpd-s { width: 60%; }
    .wp-chips { display: flex; flex-wrap: wrap; justify-content: center; gap: 6px; }
    .wp-chip { font-size: 11px; font-weight: 600; color: rgba(255,255,255,0.65); background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.14); padding: 5px 12px; border-radius: 20px; }

    /* Shield */
    .wp-shield-wrap { display: flex; justify-content: center; margin: 16px 0 20px; }
    .wp-shield-svg { width: 88px; height: 100px; }
    .wp-checks { display: flex; flex-direction: column; gap: 8px; align-items: center; }
    .wp-ck { font-size: 13px; color: rgba(255,255,255,0.72); font-weight: 500; }

    .wp-search { display: flex; align-items: center; gap: 8px; background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 9px 12px; font-size: 12px; color: rgba(255,255,255,0.35); margin-bottom: 14px; }
    .wp-search svg { width: 14px; height: 14px; flex-shrink: 0; }
    .wp-ann-cards { display: flex; flex-direction: column; gap: 8px; margin-bottom: 14px; }
    .wp-ann-card { background: rgba(255,255,255,0.07); border-radius: 10px; padding: 12px 14px; border: 1px solid rgba(255,255,255,0.08); }
    .wp-ann-top { display: flex; align-items: center; gap: 7px; margin-bottom: 6px; }
    .wp-ann-type { font-size: 10px; font-weight: 700; color: rgba(255,255,255,0.5); background: rgba(255,255,255,0.1); padding: 2px 8px; border-radius: 8px; }
    .wp-ann-new { font-size: 9.5px; font-weight: 700; color: white; background: rgba(255,255,255,0.2); padding: 2px 7px; border-radius: 8px; }
    .wp-ann-name { font-size: 13px; font-weight: 700; color: white; margin-bottom: 2px; }
    .wp-ann-loc { font-size: 11px; color: rgba(255,255,255,0.45); margin-bottom: 8px; }
    .wp-ann-foot { display: flex; justify-content: space-between; align-items: center; }
    .wp-ann-foot strong { font-size: 13px; color: white; }
    .wp-ann-cand { font-size: 10.5px; color: rgba(255,255,255,0.4); }

    /* ── IMPACT EN CHIFFRES ── */
    .impact-section { background: linear-gradient(135deg, #081E41 0%, #0F4C81 60%, #0A2650 100%); padding: 96px 0; }
    .impact-eye { color: rgba(201,152,46,0.9); }
    .impact-title { color: white; }
    .impact-sub { color: rgba(255,255,255,0.6); }
    .impact-grid { display: flex; align-items: center; justify-content: center; flex-wrap: wrap; }
    .impact-item { flex: 1; min-width: 160px; text-align: center; padding: 0 32px; }
    .impact-n { display: block; font-size: 56px; font-weight: 800; color: white; line-height: 1; margin-bottom: 12px; font-variant-numeric: tabular-nums; }
    .impact-n small { font-size: 36px; color: #C9982E; vertical-align: super; }
    .impact-l { display: block; font-size: 15px; font-weight: 700; color: rgba(255,255,255,0.92); margin-bottom: 6px; }
    .impact-detail { display: block; font-size: 12px; color: rgba(255,255,255,0.48); line-height: 1.5; }
    .impact-sep { width: 1px; height: 90px; background: rgba(255,255,255,0.15); flex-shrink: 0; }

    /* ── TÉMOIGNAGES ── */
    .temo-section { background: white; padding: 96px 0; }
    .temo-layout { display: grid; grid-template-columns: 360px 1fr; gap: 48px; align-items: start; }

    /* Gauche */
    .temo-left { position: relative; border-radius: 20px; overflow: hidden; min-height: 420px; }
    .temo-img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: center top; }
    .temo-left-ov { position: absolute; inset: 0; background: linear-gradient(to top, rgba(8,30,65,0.92) 0%, rgba(10,38,80,0.60) 50%, rgba(15,76,129,0.25) 100%); }
    .temo-left-content { position: relative; z-index: 2; padding: 32px 28px; display: flex; flex-direction: column; justify-content: flex-end; min-height: 420px; }
    .temo-left-icon { width: 48px; height: 48px; background: rgba(201,152,46,0.15); border: 1.5px solid rgba(201,152,46,0.4); border-radius: 12px; display: flex; align-items: center; justify-content: center; margin-bottom: 16px; }
    .temo-left-icon svg { width: 24px; height: 24px; }
    .temo-left-title { font-size: 34px; font-weight: 800; color: white; line-height: 1.2; margin-bottom: 12px; font-style: italic; }
    .temo-left-sub { font-size: 13.5px; color: rgba(255,255,255,0.72); line-height: 1.65; }

    /* Droite : accordéon */
    .temo-right { display: flex; flex-direction: column; gap: 0; border: 1px solid #E5E7EB; border-radius: 16px; overflow: hidden; }
    .temo-item { border-bottom: 1px solid #E5E7EB; cursor: pointer; transition: background .15s; }
    .temo-item:last-child { border-bottom: none; }
    .temo-item:hover { background: #FAFBFF; }
    .temo-item.temo-open { background: #F4F7FB; }
    .temo-item-head { display: flex; align-items: center; justify-content: space-between; padding: 18px 22px; gap: 12px; }
    .temo-item-left { display: flex; align-items: center; gap: 12px; flex: 1; min-width: 0; }
    .temo-av { width: 38px; height: 38px; border-radius: 9px; color: white; font-weight: 700; font-size: 15px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .temo-item-meta { display: flex; flex-direction: column; min-width: 0; }
    .temo-nom { font-size: 14px; font-weight: 700; color: #0A2650; }
    .temo-role { font-size: 11.5px; color: #9CA3AF; margin-top: 1px; }
    .temo-item-right { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }
    .temo-stars-row { display: flex; gap: 2px; }
    .ts { width: 13px; height: 13px; }
    .temo-toggle-btn { width: 28px; height: 28px; border-radius: 50%; background: white; border: 1.5px solid #E5E7EB; display: flex; align-items: center; justify-content: center; font-size: 18px; font-weight: 300; color: #0F4C81; line-height: 1; transition: background .15s, border-color .15s; flex-shrink: 0; }
    .temo-open .temo-toggle-btn { background: #0F4C81; border-color: #0F4C81; color: white; }
    .temo-item-body { padding: 0 22px 20px; }
    .temo-texte { font-size: 14px; color: #374151; line-height: 1.75; font-style: italic; border-left: 3px solid #C9982E; padding-left: 14px; }

    /* ── FAQ ── */
    .faq-section { background: linear-gradient(135deg, #081E41 0%, #0A2650 50%, #0F4C81 100%); padding: 96px 0; }
    .faq-inner { max-width: 1200px; margin: 0 auto; padding: 0 24px; }
    .faq-head { text-align: center; margin-bottom: 56px; }
    .faq-head-badge { display: inline-flex; align-items: center; gap: 7px; background: rgba(201,152,46,0.15); border: 1px solid rgba(201,152,46,0.35); color: #C9982E; font-size: 12px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; padding: 6px 14px; border-radius: 20px; margin-bottom: 18px; }
    .faq-head-badge svg { width: 13px; height: 13px; }
    .faq-title { font-size: clamp(26px, 3.5vw, 40px); font-weight: 800; color: white; line-height: 1.2; margin-bottom: 12px; text-wrap: balance; }
    .faq-sub { font-size: 15px; color: rgba(255,255,255,0.6); }
    .faq-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 48px; }
    .faq-col { display: flex; flex-direction: column; gap: 12px; }
    .faq-item { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; cursor: pointer; transition: background .2s, border-color .2s; overflow: hidden; }
    .faq-item:hover { background: rgba(255,255,255,0.08); border-color: rgba(255,255,255,0.18); }
    .faq-item.faq-open { background: rgba(255,255,255,0.1); border-color: rgba(201,152,46,0.5); }
    .faq-row { display: flex; align-items: center; gap: 14px; padding: 18px 20px; }
    .faq-num { font-size: 11px; font-weight: 800; color: #C9982E; letter-spacing: .06em; flex-shrink: 0; font-variant-numeric: tabular-nums; }
    .faq-q { font-size: 14px; font-weight: 600; color: white; flex: 1; line-height: 1.4; }
    .faq-chevron { width: 18px; height: 18px; flex-shrink: 0; color: rgba(255,255,255,0.5); transition: transform .25s ease; }
    .faq-open .faq-chevron { transform: rotate(180deg); color: #C9982E; }
    .faq-ans { padding: 0 20px 18px 48px; }
    .faq-ans p { font-size: 13.5px; color: rgba(255,255,255,0.72); line-height: 1.75; }
    .faq-footer { display: flex; align-items: center; justify-content: center; gap: 16px; padding-top: 8px; }
    .faq-footer p { font-size: 14px; color: rgba(255,255,255,0.6); }
    .faq-cta { background: #C9982E; color: white; font-size: 14px; font-weight: 700; padding: 10px 22px; border-radius: 8px; text-decoration: none; transition: background .2s; }
    .faq-cta:hover { background: #b8881f; }

    /* ── ANNONCES (conservé mais non utilisé) ── */
    .ann-section { background: #F8F9FC; padding: 96px 0; }
    .biens-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
    .bien-card { background: #fff; border-radius: 14px; overflow: hidden; box-shadow: 0 2px 16px rgba(0,0,0,0.07); transition: transform .2s, box-shadow .2s; display: block; color: inherit; }
    .bien-card:hover { transform: translateY(-4px); box-shadow: 0 8px 32px rgba(15,76,129,0.14); }
    .bien-img { position: relative; height: 200px; overflow: hidden; }
    .bien-photo { width: 100%; height: 100%; object-fit: cover; }
    .bien-placeholder { width: 100%; height: 100%; background: linear-gradient(135deg, #0A2650, #0F4C81); display: flex; align-items: center; justify-content: center; }
    .bien-placeholder svg { width: 60px; height: 50px; }
    .bien-badge-type { position: absolute; top: 12px; left: 12px; background: #0F4C81; color: #fff; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 6px; }
    .bien-body { padding: 16px 18px 18px; }
    .bien-loc { font-size: 16px; font-weight: 700; color: #0A2650; margin-bottom: 4px; }
    .bien-addr { font-size: 13px; color: #9ca3af; margin-bottom: 10px; }
    .bien-tags { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 14px; }
    .bien-tag { background: #f0f4f8; color: #4b5563; font-size: 12px; padding: 3px 9px; border-radius: 5px; }
    .bien-footer { display: flex; align-items: center; justify-content: space-between; }
    .bien-price { font-size: 16px; font-weight: 800; color: #0F4C81; }
    .bien-price small { font-size: 11px; font-weight: 500; color: #9ca3af; }
    .bien-link { font-size: 13px; color: #C9982E; font-weight: 600; }
    .sk-card { background: #fff; border-radius: 14px; overflow: hidden; box-shadow: 0 2px 16px rgba(0,0,0,0.07); }
    .sk-img { height: 200px; background: linear-gradient(90deg, #e5e7eb 25%, #f3f4f6 50%, #e5e7eb 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; }
    .sk-body { padding: 16px 18px 18px; }
    .sk-line { height: 12px; border-radius: 6px; margin-bottom: 10px; background: linear-gradient(90deg, #e5e7eb 25%, #f3f4f6 50%, #e5e7eb 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; }
    .sk-lg { width: 75%; } .sk-md { width: 55%; } .sk-sm { width: 40%; }
    @keyframes shimmer { to { background-position: -200% 0; } }
    .voir-plus { text-align: center; margin-top: 40px; }
    .btn-voir-plus { display: inline-block; border: 2px solid #0F4C81; color: #0F4C81; font-weight: 700; font-size: 14px; padding: 12px 28px; border-radius: 8px; transition: background .2s, color .2s; }
    .btn-voir-plus:hover { background: #0F4C81; color: #fff; }
    .ann-empty { text-align: center; padding: 48px 0; }
    .ann-empty h3 { font-size: 20px; font-weight: 700; color: #0A2650; margin-bottom: 10px; }
    .ann-empty p { font-size: 14px; color: #6b7280; margin-bottom: 24px; }
    .btn-outline-blue { display: inline-block; border: 2px solid #0F4C81; color: #0F4C81; font-weight: 700; font-size: 14px; padding: 11px 24px; border-radius: 8px; transition: background .2s, color .2s; }
    .btn-outline-blue:hover { background: #0F4C81; color: #fff; }

    /* ── ABONNEMENTS ── */
    .price-section { background: white; padding: 96px 0; }
    .price-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; margin-top: 48px; align-items: start; }
    .price-card { background: #F8FAFF; border: 1.5px solid #E5E7EB; border-radius: 20px; padding: 32px 28px; display: flex; flex-direction: column; position: relative; transition: box-shadow .2s; }
    .price-card:hover { box-shadow: 0 8px 32px rgba(15,76,129,0.1); }
    .price-card-pro { background: #0A2650; border-color: #C9982E; box-shadow: 0 16px 56px rgba(10,38,80,0.28); transform: translateY(-10px); }
    .price-badge-pop { position: absolute; top: -14px; left: 50%; transform: translateX(-50%); background: #C9982E; color: white; font-size: 11px; font-weight: 700; padding: 5px 14px; border-radius: 20px; white-space: nowrap; display: flex; align-items: center; gap: 5px; }
    .price-badge-pop svg { width: 11px; height: 11px; }
    .price-top { margin-bottom: 24px; }
    .price-label { font-size: 11px; font-weight: 800; letter-spacing: .1em; text-transform: uppercase; color: #9CA3AF; display: block; margin-bottom: 12px; }
    .price-label-pro { color: rgba(201,152,46,0.9); }
    .price-amount { display: flex; align-items: baseline; gap: 4px; margin-bottom: 6px; }
    .price-n { font-size: 40px; font-weight: 900; color: #0A2650; line-height: 1; font-variant-numeric: tabular-nums; }
    .price-card-pro .price-n { color: white; }
    .price-unit { font-size: 14px; color: #6B7280; font-weight: 600; }
    .price-card-pro .price-unit { color: rgba(255,255,255,0.6); }
    .price-period { font-size: 12px; color: #9CA3AF; }
    .price-card-pro .price-period { color: rgba(255,255,255,0.5); }
    .price-feats { list-style: none; padding: 0; margin: 0 0 28px; display: flex; flex-direction: column; gap: 11px; flex: 1; border-top: 1px solid #E5E7EB; padding-top: 20px; }
    .price-card-pro .price-feats { border-top-color: rgba(255,255,255,0.1); }
    .feat-ok, .feat-no { display: flex; align-items: center; gap: 10px; font-size: 13.5px; color: #374151; }
    .price-card-pro .feat-ok { color: rgba(255,255,255,0.9); }
    .feat-no { color: #9CA3AF; text-decoration: line-through; }
    .feat-ok svg, .feat-no svg { width: 16px; height: 16px; flex-shrink: 0; }
    .feat-ok-pro svg { color: #C9982E; }
    .price-btn { display: block; text-align: center; font-weight: 700; font-size: 14px; padding: 14px 20px; border-radius: 10px; text-decoration: none; transition: all .2s; margin-top: auto; }
    .price-btn-ghost { border: 2px solid #0F4C81; color: #0F4C81; }
    .price-btn-ghost:hover { background: #0F4C81; color: white; }
    .price-btn-pro { background: #C9982E; color: white; border: 2px solid #C9982E; }
    .price-btn-pro:hover { background: #b8881f; border-color: #b8881f; }
    .price-addon { margin-top: 24px; background: linear-gradient(135deg, #FFF8EC 0%, #FFFBF2 100%); border: 1.5px solid rgba(201,152,46,0.35); border-radius: 16px; padding: 24px 28px; display: flex; align-items: center; justify-content: space-between; gap: 24px; }
    .price-addon-left { display: flex; align-items: flex-start; gap: 16px; flex: 1; }
    .price-addon-icon { width: 44px; height: 44px; background: rgba(201,152,46,0.15); border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; color: #C9982E; }
    .price-addon-icon svg { width: 22px; height: 22px; }
    .price-addon-label { font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: .07em; color: #C9982E; display: block; margin-bottom: 5px; }
    .price-addon-desc { font-size: 13.5px; color: #6B7280; line-height: 1.6; }
    .price-addon-right { display: flex; flex-direction: column; align-items: flex-end; gap: 12px; flex-shrink: 0; }
    .price-addon-price { font-size: 18px; font-weight: 800; color: #0A2650; white-space: nowrap; }
    .price-addon-price span { font-size: 12px; font-weight: 500; color: #9CA3AF; }
    .price-btn-addon { border: 2px solid #C9982E; color: #C9982E; padding: 9px 18px; font-size: 13px; }
    .price-btn-addon:hover { background: #C9982E; color: white; }
    .price-note { text-align: center; font-size: 12.5px; color: #9CA3AF; margin-top: 32px; }

    /* ── RESPONSIVE ── */
    @media (max-width: 1024px) {
      .why-layout { grid-template-columns: 1fr; }
      .why-preview { position: static; }
      .biens-grid { grid-template-columns: repeat(2, 1fr); }
      .temo-layout { grid-template-columns: 1fr; }
      .temo-left { min-height: 260px; }
      .temo-left-content { min-height: 260px; }
      .faq-grid { grid-template-columns: 1fr; }
    }
    @media (max-width: 768px) {
      .nav-links, .nav-cta { display: none; }
      .hamburger { display: flex; }
      .slide { flex-direction: column; padding: 90px 24px 120px; text-align: center; gap: 28px; left: 0; transform: translateX(40px); }
      .slide.slide-on { transform: translateX(0); }
      .s-title { font-size: 26px; }
      .s-sub, .s-cta { margin: 0 auto; }
      .slide-visual { flex: 0 0 auto; }
      .s-svg { max-width: 260px; }
      .hero-controls { bottom: 30px; }
      .hw-grid { flex-direction: column; gap: 16px; }
      .hw-col { flex-direction: column; width: 100%; }
      .hw-arrow { transform: rotate(90deg); }
      .impact-grid { gap: 0; }
      .impact-item { min-width: 50%; padding: 20px 16px; }
      .impact-sep { display: none; }
      .impact-n { font-size: 42px; }
      .temo-layout { gap: 24px; }
      .biens-grid { grid-template-columns: 1fr; }
      .price-grid { grid-template-columns: 1fr; }
      .price-card-pro { transform: none; }
      .price-addon { flex-direction: column; align-items: flex-start; }
      .price-addon-right { align-items: flex-start; width: 100%; }
      .price-btn-addon { width: 100%; text-align: center; }
      .cta-or { flex-direction: row; padding: 20px 0; }
      .cta-or-line { flex: 1; height: 1px; width: auto; }
    }
    @media (max-width: 480px) {
      .sec-title { font-size: 22px; }
      .impact-n { font-size: 36px; }
      .price-card { padding: 28px 20px; }
    }
  `]
})
export class LandingComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('impactSection') impactRef!: ElementRef;
  @ViewChild('howtoSection')  howtoRef!: ElementRef;
  @ViewChild('whySection')    whyRef!: ElementRef;

  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private slideTimer?: ReturnType<typeof setInterval>;
  private statsObserver?: IntersectionObserver;
  private howtoObserver?: IntersectionObserver;
  private whyObserver?: IntersectionObserver;
  private featureTimer?: ReturnType<typeof setInterval>;
  private statsAnimated = false;

  howtoVisible   = signal(false);
  whyVisible     = signal(false);
  activeFeature  = signal(0);
  selectedTemo   = signal(0);
  selectedFaq    = signal(0);

  // ── Slider ──
  currentSlide = signal(0);
  navScrolled  = signal(false);
  menuOpen     = signal(false);

  // ── Annonces ──
  biens        = signal<Bien[]>([]);
  loadingBiens = signal(true);
  readonly skeletons = [1, 2, 3, 4, 5, 6];
  readonly TYPE_LABELS = PROPERTY_TYPE_LABELS;

  // ── Impact — compteurs animés ──
  statAnnonces      = signal(0);
  statProprio       = signal(0);
  statSatisfaction  = signal(0);
  statVilles        = signal(0);

  // ── Données statiques ──
  readonly slides: HeroSlide[] = [
    { badge: 'Gestion immobilière',   title: 'Gérez vos biens en toute simplicité',      subtitle: 'Suivez l\'occupation, les baux et l\'historique de chaque bien depuis une seule interface intuitive.', cta: 'Commencer gratuitement', link: '/auth/register' },
    { badge: 'Paiements des loyers',  title: 'Encaissez vos loyers sans effort',          subtitle: 'Suivez chaque paiement en temps réel. Alertes automatiques pour les impayés, rappels avant échéance.',  cta: 'Découvrir WARAH',        link: '/auth/register' },
    { badge: 'Génération de quittances', title: 'Quittances professionnelles en un clic', subtitle: 'Créez et envoyez des quittances de loyer signées directement à vos locataires, à tout moment.',          cta: 'Essayer gratuitement',   link: '/auth/register' },
    { badge: 'Annonces immobilières', title: 'Trouvez vos locataires rapidement',          subtitle: 'Publiez vos annonces et recevez des candidatures qualifiées depuis partout au Togo.',                    cta: 'Voir les annonces',      link: '/annonces'       },
  ];

  readonly fonctionnement = [
    { num: '01', titre: 'Créez votre compte',       desc: 'Inscription gratuite en 2 minutes. Renseignez vos informations et téléchargez votre CNI pour validation.' },
    { num: '02', titre: 'Ajoutez vos biens',        desc: 'Enregistrez vos propriétés avec photos, description et conditions de location. Biens disponibles immédiatement.' },
    { num: '03', titre: 'Invitez vos locataires',   desc: 'Envoyez une invitation par email ou SMS. Le locataire crée son compte et est associé à votre bail.' },
    { num: '04', titre: 'Gérez tout en temps réel', desc: 'Suivez les paiements, générez des quittances et recevez des alertes dès qu\'un loyer est en retard.' },
  ];

  readonly avantages = [
    { titre: 'Gestion centralisée',    desc: 'Tous vos biens, locataires et baux sur une seule plateforme. Fini les tableaux Excel et les papiers perdus.' },
    { titre: 'Suivi des paiements',    desc: 'Chaque loyer enregistré automatiquement. Alertes avant échéance et dès qu\'un retard est détecté.' },
    { titre: 'Quittances en un clic',  desc: 'Générées et envoyées au locataire automatiquement après chaque paiement confirmé.' },
    { titre: 'Alertes intelligentes',  desc: 'Notifications push et email pour les échéances, impayés et renouvellements de bail.' },
    { titre: 'Accès partout',          desc: 'Application web responsive. Gérez vos biens depuis votre téléphone, tablette ou ordinateur.' },
    { titre: 'Données sécurisées',     desc: 'Vos données chiffrées et sauvegardées. Conformité aux standards de sécurité en vigueur.' },
    { titre: 'Annonces intégrées',     desc: 'Publiez vos biens vacants en un clic et recevez des candidatures de locataires qualifiés directement sur la plateforme.' },
  ];

  readonly wpBars = [
    { label: 'Fév', h: 55, hi: false }, { label: 'Mar', h: 70, hi: false },
    { label: 'Avr', h: 62, hi: false }, { label: 'Mai', h: 85, hi: false },
    { label: 'Juin', h: 78, hi: false }, { label: 'Juil', h: 100, hi: true },
  ];

  readonly temoignages = [
    {
      nom: 'Kofi Assiamah', role: 'Propriétaire', ville: 'Lomé',
      initiale: 'K', couleur: '#0F4C81',
      texte: 'WARAH a transformé ma façon de gérer mes 5 biens. Les quittances automatiques et le suivi des paiements m\'ont fait économiser des heures chaque mois. Je recommande à tous les propriétaires.',
    },
    {
      nom: 'Adjoa Mensah', role: 'Gestionnaire immobilier', ville: 'Lomé',
      initiale: 'A', couleur: '#0A5940',
      texte: 'Je gère le portefeuille de plusieurs propriétaires. WARAH me donne une vue complète sur tous les baux, paiements et locataires en un seul endroit. Un gain de temps considérable.',
    },
    {
      nom: 'Ibrahim Touré', role: 'Propriétaire', ville: 'Kara',
      initiale: 'I', couleur: '#6D3AB0',
      texte: 'Même depuis Kara, je suis tout ce qui se passe à Lomé. Les alertes d\'impayés arrivent immédiatement sur mon téléphone. C\'est vraiment indispensable pour tout propriétaire sérieux.',
    },
    {
      nom: 'Afia Dossou', role: 'Locataire', ville: 'Lomé',
      initiale: 'A', couleur: '#B45309',
      texte: 'Grâce à WARAH j\'ai trouvé mon appartement en moins d\'une semaine. Le propriétaire était vérifié, le contrat de bail signé en ligne. Tout était transparent et rapide.',
    },
    {
      nom: 'Jean-Baptiste Kuma', role: 'Propriétaire', ville: 'Sokodé',
      initiale: 'J', couleur: '#0A2650',
      texte: 'Je possède 8 biens à Sokodé et Lomé. Avant WARAH, je perdais des journées entières à relancer les loyers. Maintenant tout est automatisé — je récupère du temps pour ma famille.',
    },
  ];

  readonly faqs = [
    {
      q: 'Comment fonctionne WARAH ?',
      r: 'WARAH est une plateforme de gestion immobilière tout-en-un. Vous créez un compte, ajoutez vos biens, invitez vos locataires et gérez tout depuis un tableau de bord unique : paiements, baux, quittances, alertes d\'impayés et annonces.',
    },
    {
      q: 'Est-ce gratuit de s\'inscrire ?',
      r: 'L\'inscription est entièrement gratuite. Vous pouvez commencer à gérer vos biens sans frais. Des formules premium sont disponibles pour les propriétaires avec un grand nombre de biens ou les gestionnaires professionnels.',
    },
    {
      q: 'Comment ajouter un bien immobilier ?',
      r: 'Depuis votre tableau de bord, cliquez sur "Mes biens" puis "+ Nouveau bien". Renseignez l\'adresse, le type (villa, appartement…), le loyer mensuel, les photos et les caractéristiques. Votre bien est disponible en quelques minutes.',
    },
    {
      q: 'Comment inviter un locataire sur la plateforme ?',
      r: 'Depuis la fiche d\'un bien, cliquez sur "Inviter un locataire". Renseignez son nom, téléphone et email — WARAH lui envoie automatiquement un lien d\'activation sécurisé pour créer son espace locataire.',
    },
    {
      q: 'Les paiements et données sont-ils sécurisés ?',
      r: 'Oui. Toutes les communications sont chiffrées (HTTPS). Les données personnelles sont stockées en conformité avec les normes de protection des données. WARAH ne stocke aucun numéro de carte bancaire.',
    },
    {
      q: 'Puis-je gérer plusieurs biens depuis un seul compte ?',
      r: 'Absolument. WARAH est conçu pour les propriétaires multi-biens et les gestionnaires de portefeuilles. Vous pouvez ajouter autant de biens que nécessaire, dans différentes villes du Togo, et tout visualiser depuis un seul tableau de bord.',
    },
    {
      q: 'Que se passe-t-il en cas d\'impayé de loyer ?',
      r: 'WARAH vous envoie une alerte dès qu\'un paiement est en retard. Vous pouvez envoyer une relance directement depuis la plateforme, suivre l\'historique des échanges et générer un récapitulatif d\'impayés pour vos démarches.',
    },
  ];

  constructor(private readonly http: HttpClient) {}

  ngOnInit(): void {
    if (this.isBrowser) {
      this.startSlider();
      window.addEventListener('scroll', this.onScroll);
    }
    this.loadBiens();
  }

  ngAfterViewInit(): void {
    if (!this.isBrowser) return;

    if (this.howtoRef) {
      this.howtoObserver = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) { this.howtoVisible.set(true); this.howtoObserver?.disconnect(); } },
        { threshold: 0.12 }
      );
      this.howtoObserver.observe(this.howtoRef.nativeElement);
    }

    if (this.whyRef) {
      this.whyObserver = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            this.whyVisible.set(true);
            this.whyObserver?.disconnect();
            this.startFeatureRotation();
          }
        },
        { threshold: 0.15 }
      );
      this.whyObserver.observe(this.whyRef.nativeElement);
    }

    if (this.impactRef) {
      this.statsObserver = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting && !this.statsAnimated) {
            this.statsAnimated = true;
            this.animateCounter(this.statAnnonces, 1200, 1600);
            this.animateCounter(this.statProprio, 500, 1400);
            this.animateCounter(this.statSatisfaction, 98, 1200);
            this.animateCounter(this.statVilles, 6, 900);
          }
        },
        { threshold: 0.35 }
      );
      this.statsObserver.observe(this.impactRef.nativeElement);
    }
  }

  ngOnDestroy(): void {
    if (this.slideTimer) clearInterval(this.slideTimer);
    if (this.isBrowser) window.removeEventListener('scroll', this.onScroll);
    this.statsObserver?.disconnect();
    this.howtoObserver?.disconnect();
    this.whyObserver?.disconnect();
    if (this.featureTimer) clearInterval(this.featureTimer);
  }

  private readonly onScroll = (): void => { this.navScrolled.set(window.scrollY > 60); };

  private startSlider(): void {
    this.slideTimer = setInterval(() => {
      this.currentSlide.update(i => (i + 1) % this.slides.length);
    }, 5000);
  }

  goToSlide(i: number): void {
    this.currentSlide.set(i);
    if (this.slideTimer) { clearInterval(this.slideTimer); this.startSlider(); }
  }

  nextSlide(): void { this.goToSlide((this.currentSlide() + 1) % this.slides.length); }
  prevSlide(): void { this.goToSlide((this.currentSlide() - 1 + this.slides.length) % this.slides.length); }

  private animateCounter(sig: WritableSignal<number>, target: number, duration: number): void {
    const steps = 50;
    const delay = duration / steps;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      sig.set(Math.round((target / steps) * Math.min(step, steps)));
      if (step >= steps) clearInterval(timer);
    }, delay);
  }

  private startFeatureRotation(): void {
    this.featureTimer = setInterval(() => {
      this.activeFeature.update(i => (i + 1) % this.avantages.length);
    }, 3500);
  }

  selectFeature(i: number): void {
    this.activeFeature.set(i);
    if (this.featureTimer) { clearInterval(this.featureTimer); this.startFeatureRotation(); }
  }

  scrollTo(id: string, e: Event): void {
    e.preventDefault();
    if (this.isBrowser) document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  }

  loadBiens(): void {
    this.http.get<{ data: Bien[] }>(`${environment.apiUrl}/properties`, {
      params: { status: 'VACANT', limit: '6' }
    }).pipe(catchError(() => of({ data: [] as Bien[] }))).subscribe(res => {
      this.biens.set(res?.data ?? []);
      this.loadingBiens.set(false);
    });
  }

  typeLabel(t: string): string { return this.TYPE_LABELS[t as keyof typeof PROPERTY_TYPE_LABELS] ?? t; }
  firstPhoto(b: Bien): string { return b.photos?.[0]?.url ?? ''; }
}
