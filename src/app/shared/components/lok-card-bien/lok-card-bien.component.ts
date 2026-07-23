import { Component, Input, Output, EventEmitter } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { Bien, PROPERTY_TYPE_LABELS } from '../../../core/models/bien.model';
import { LokBadgeStatutComponent } from '../lok-badge-statut/lok-badge-statut.component';

@Component({
  selector: 'lok-card-bien',
  standalone: true,
  imports: [LokBadgeStatutComponent, DecimalPipe],
  template: `
    <div
      class="bg-white rounded-2xl overflow-hidden cursor-pointer group transition-all hover:-translate-y-1"
      style="box-shadow:0 2px 16px rgba(10,38,80,.07)"
      (click)="onCardClick.emit(bien.id)"
    >
      <!-- Photo / placeholder -->
      <div class="relative overflow-hidden" style="height:192px">
        @if (bien.photos?.length > 0 && bien.photos[0]?.url && !imgError) {
          <img
            [src]="bien.photos[0].url"
            [alt]="bien.neighborhood"
            class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
            (error)="onImgError()"
          />
          <div class="absolute inset-0 pointer-events-none"
               style="background:linear-gradient(to top,rgba(0,0,0,.5) 0%,transparent 55%)"></div>
          <div class="absolute bottom-3 left-3">
            <span class="text-white text-sm font-extrabold drop-shadow">
              {{ bien.monthlyRent | number }} FCFA
              <span class="text-xs font-medium opacity-70">/mois</span>
            </span>
          </div>
        } @else {
          <div class="w-full h-full flex flex-col items-center justify-center"
               style="background:linear-gradient(135deg,#EEF4FF 0%,#dbeafe 100%)">
            <div class="w-10 h-10 rounded-xl flex items-center justify-center mb-1.5"
                 style="background:rgba(15,76,129,.1)">
              <svg class="w-5 h-5" fill="none" stroke="#0F4C81" stroke-width="1.5" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round"
                      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
              </svg>
            </div>
            <p class="text-xs font-medium" style="color:#0F4C81;opacity:.4">Aucune photo</p>
          </div>
        }
        <!-- Badges toujours visibles -->
        <div class="absolute top-3 left-3">
          <span class="px-2 py-0.5 rounded-md text-xs font-bold"
                style="background:rgba(255,255,255,.9);color:#0A2650">{{ typeLabel }}</span>
        </div>
        <div class="absolute top-3 right-3">
          <lok-badge-statut [statut]="bien.status"></lok-badge-statut>
        </div>
      </div>

      <!-- Infos -->
      <div class="p-4 flex flex-col gap-2">
        <h3 class="text-sm font-extrabold text-gray-900 truncate">{{ bien.neighborhood }}</h3>

        <p class="text-xs text-gray-400 flex items-center gap-1 min-w-0">
          <svg width="12" height="12" style="min-width:12px;min-height:12px" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
            <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
          </svg>
          <span class="truncate">
            {{ bien.city }}{{ bien.surfaceArea ? ' · ' + bien.surfaceArea + ' m²' : '' }}{{ bien.roomsCount ? ' · ' + bien.roomsCount + ' p.' : '' }}
          </span>
        </p>

        <p class="text-xs text-gray-500" style="display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;min-height:2.4em">
          {{ description }}
        </p>

        @if (!bien.photos?.length || imgError || !bien.photos[0]?.url) {
          <div class="px-3 py-2 rounded-xl" style="background:#F0F4FA">
            <span class="text-sm font-extrabold" style="color:#0F4C81">
              {{ bien.monthlyRent | number }} FCFA
              <span class="text-xs font-normal text-gray-400">/mois</span>
            </span>
          </div>
        }

        @if (showActions) {
          <div class="flex gap-2 mt-1" (click)="$event.stopPropagation()">
            <button type="button"
              class="flex-1 py-2 rounded-xl text-xs font-bold transition-all"
              style="background:#F0F4FA;color:#6b7280"
              (click)="onEdit.emit(bien.id)">Modifier</button>
            <button type="button"
              class="flex-1 py-2 rounded-xl text-xs font-bold transition-all"
              style="background:#0F4C81;color:#fff"
              (click)="onView.emit(bien.id)">Voir</button>
          </div>
        }
      </div>
    </div>
  `,
})
export class LokCardBienComponent {
  @Input({ required: true }) bien!: Bien;
  @Input() showActions = true;
  @Output() onCardClick = new EventEmitter<string>();
  @Output() onEdit = new EventEmitter<string>();
  @Output() onView = new EventEmitter<string>();

  imgError = false;

  onImgError(): void {
    this.imgError = true;
  }

  get typeLabel(): string {
    return PROPERTY_TYPE_LABELS[this.bien.type] ?? this.bien.type;
  }

  get description(): string {
    const trimmed = (this.bien.description ?? '').trim();
    return trimmed.length >= 10 ? trimmed : 'Aucune description';
  }
}

/*
 * Exemple d'utilisation :
 * 
 * <lok-card-bien 
 *   [bien]="bien" 
 *   [showActions]="true"
 *   (onCardClick)="navigateToBien($event)"
 *   (onEdit)="editBien($event)"
 *   (onView)="viewBien($event)"
 * ></lok-card-bien>
 * 
 * Sans actions :
 * <lok-card-bien [bien]="bien" [showActions]="false"></lok-card-bien>
 */
