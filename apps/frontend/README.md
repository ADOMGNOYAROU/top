# DINAWA — Frontend (Angular 20)

SPA Angular de la plateforme DINAWA, déployée sur **Vercel**.

## Stack

- Angular 20 + TypeScript strict
- Composants standalone (pas de NgModule)
- Communication avec le backend via API REST (`HttpClient`)
- Sentry pour le monitoring d'erreurs frontend

## Démarrage local

### 1. Variables d'environnement

Les variables sont injectées à la **compilation** via les préfixes `NG_APP_*`.
En développement local, les valeurs de `src/environments/environment.ts` sont utilisées directement.

### 2. Installer les dépendances (depuis la racine du monorepo)

```bash
npm install
```

### 3. Démarrer le serveur de développement

```bash
npm run dev:frontend
```

L'application est disponible sur `http://localhost:4200`.

## Scripts

| Script | Description |
|---|---|
| `npm run start` | Dev server (port 4200) |
| `npm run build` | Build développement |
| `npm run build:prod` | Build production optimisé |
| `npm run test` | Tests unitaires (Karma) |
| `npm run lint` | ESLint (TypeScript + templates Angular) |
| `npm run typecheck` | Vérification TypeScript sans build |

## Variables d'environnement Vercel

À configurer dans Vercel → Project → Settings → Environment Variables :

| Variable Vercel | Description | Exemple |
|---|---|---|
| `NG_APP_API_URL` | URL de l'API backend Railway | `https://dinawa-api.up.railway.app/api` |
| `NG_APP_SENTRY_DSN` | DSN du projet Sentry frontend | `https://xxx@sentry.io/yyy` |
| `NG_APP_VAPID_PUBLIC_KEY` | Clé publique VAPID pour les notifications push | `BI0...` |

Ces variables sont automatiquement reconnues par `@angular/build:application` et injectées dans le bundle.

## Premier déploiement Vercel

Voir [`docs/DEPLOYMENT.md`](../../docs/DEPLOYMENT.md) pour la procédure complète.

## Headers de sécurité

Configurés dans [`vercel.json`](vercel.json) :

- **Content-Security-Policy** adapté à la SPA (connect-src Railway + Supabase)
- **Cache-Control** : `no-cache` sur `index.html`, `immutable` sur les assets JS/CSS
- **HSTS**, **X-Frame-Options: DENY**, **X-Content-Type-Options**, **Referrer-Policy**

## Notes

- Toute route non trouvée renvoie vers `index.html` (SPA routing via `vercel.json` rewrites)
- Sentry est désactivé si `NG_APP_SENTRY_DSN` est vide
