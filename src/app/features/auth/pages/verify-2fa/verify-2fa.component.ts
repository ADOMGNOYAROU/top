import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { LokAlerteComponent } from '../../../../shared/components/lok-alerte/lok-alerte.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-verify-2fa',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LokAlerteComponent],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-blue-900 to-blue-800 flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl shadow-xl max-w-md w-full p-8">

        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold mb-2" style="color:#0F4C81">WARAH</h1>
          <p class="text-gray-600">Réinitialisation du mot de passe</p>
        </div>

        @if (errorMessage) {
          <lok-alerte type="error" [message]="errorMessage"></lok-alerte>
        }
        @if (successMessage) {
          <lok-alerte type="success" [message]="successMessage"></lok-alerte>
        }

        <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p class="text-sm text-blue-800 font-medium">Code de vérification envoyé</p>
          <p class="text-sm text-blue-600 mt-1">
            Un code à 6 chiffres a été envoyé à <strong>{{ email }}</strong>.
            Il expire dans 15 minutes.
          </p>
        </div>

        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-5">

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Code de vérification</label>
            <input type="text" formControlName="code"
              class="w-full border border-gray-300 rounded-lg px-4 py-3 text-center text-2xl tracking-widest outline-none focus:border-blue-500 transition-colors"
              placeholder="000000" maxlength="6" (input)="chiffresOnly($event)">
            @if (form.get('code')?.touched && form.get('code')?.errors?.['required']) {
              <p class="text-red-500 text-xs mt-1">Le code est requis</p>
            }
            @if (form.get('code')?.touched && form.get('code')?.errors?.['pattern']) {
              <p class="text-red-500 text-xs mt-1">Le code doit contenir 6 chiffres</p>
            }
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Nouveau mot de passe</label>
            <input type="password" formControlName="newPassword"
              class="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-blue-500 transition-colors"
              placeholder="Minimum 8 caractères">
            @if (form.get('newPassword')?.touched && form.get('newPassword')?.errors?.['minlength']) {
              <p class="text-red-500 text-xs mt-1">Minimum 8 caractères</p>
            }
          </div>

          <div class="text-center text-sm">
            @if (peutRenvoyer) {
              <button type="button" (click)="renvoyer()"
                class="font-semibold hover:underline" style="color:#0F4C81">
                Renvoyer le code
              </button>
            } @else {
              <p class="text-gray-500">Renvoyer dans <strong>{{ countdown }}s</strong></p>
            }
          </div>

          <button type="submit" [disabled]="form.invalid || chargement"
            class="w-full py-3 rounded-lg text-white font-semibold transition-colors"
            [style.background]="form.invalid || chargement ? '#93a5b8' : '#0F4C81'">
            @if (chargement) { Vérification… } @else { Confirmer }
          </button>
        </form>

        <p class="text-center text-sm text-gray-500 mt-6">
          <button type="button" (click)="annuler()" class="hover:text-gray-800 transition-colors">
            Annuler et retourner à la connexion
          </button>
        </p>
      </div>
    </div>
  `,
})
export class Verify2FAComponent implements OnInit, OnDestroy {
  form: FormGroup;
  chargement = false;
  errorMessage = '';
  successMessage = '';
  email = '';
  countdown = 60;
  peutRenvoyer = false;
  private timer: any;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute,
  ) {
    this.form = this.fb.group({
      code:        ['', [Validators.required, Validators.pattern(/^[0-9]{6}$/)]],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
    });
  }

  ngOnInit(): void {
    this.email = this.route.snapshot.queryParamMap.get('email')
              ?? localStorage.getItem('warah_reset_email')
              ?? '';

    if (!this.email) {
      this.errorMessage = 'Email introuvable — veuillez recommencer depuis "Mot de passe oublié".';
      setTimeout(() => this.router.navigate(['/auth/forgot-password']), 3000);
    } else {
      localStorage.setItem('warah_reset_email', this.email);
      this.demarrerCompteur();
    }
  }

  chiffresOnly(event: Event): void {
    const input = event.target as HTMLInputElement;
    const val = input.value.replace(/[^0-9]/g, '');
    input.value = val;
    this.form.patchValue({ code: val });
  }

  demarrerCompteur(): void {
    this.peutRenvoyer = false;
    this.countdown = 60;
    clearInterval(this.timer);
    this.timer = setInterval(() => {
      this.countdown--;
      if (this.countdown <= 0) {
        this.peutRenvoyer = true;
        clearInterval(this.timer);
      }
    }, 1000);
  }

  renvoyer(): void {
    this.chargement = true;
    this.errorMessage = '';
    this.auth.requestPasswordReset(this.email).subscribe({
      next: () => {
        this.chargement = false;
        this.successMessage = 'Nouveau code envoyé !';
        setTimeout(() => (this.successMessage = ''), 3000);
        this.demarrerCompteur();
      },
      error: (err: any) => {
        this.chargement = false;
        this.errorMessage = err.error?.message || "Erreur lors de l'envoi du code";
      },
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.chargement = true;
    this.errorMessage = '';

    const { code, newPassword } = this.form.value;
    this.auth.confirmPasswordReset(this.email, code, newPassword).subscribe({
      next: () => {
        this.chargement = false;
        localStorage.removeItem('warah_reset_email');
        this.successMessage = 'Mot de passe réinitialisé ! Redirection…';
        setTimeout(() => this.router.navigate(['/auth/login']), 2000);
      },
      error: (err: any) => {
        this.chargement = false;
        this.errorMessage = err.error?.message || 'Code invalide ou expiré';
      },
    });
  }

  annuler(): void {
    localStorage.removeItem('warah_reset_email');
    clearInterval(this.timer);
    this.router.navigate(['/auth/login']);
  }

  ngOnDestroy(): void {
    clearInterval(this.timer);
  }
}
