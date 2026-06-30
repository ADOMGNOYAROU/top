# Référence des variables d'environnement — DINAWA

Liste exhaustive de toutes les variables d'environnement utilisées dans le projet,
organisée par couche de déploiement.

---

## Table des matières

1. [Backend — `.env` local / Railway](#1-backend--env-local--railway)
2. [Frontend — Variables Vercel (`NG_APP_*`)](#2-frontend--variables-vercel-ng_app_)
3. [GitHub Actions — Secrets et Variables](#3-github-actions--secrets-et-variables)
4. [Comment générer les secrets](#4-comment-générer-les-secrets)

---

## 1. Backend — `.env` local / Railway

Ces variables sont définies dans `apps/backend/.env` en développement et dans
Railway → Service → Variables en production.

La validation au démarrage (via `class-validator`) crashe immédiatement si une variable
obligatoire manque ou a une valeur invalide.

### Application

| Variable | Obligatoire | Valeur en prod | Description |
|---|---|---|---|
| `NODE_ENV` | ✅ | `production` | Environnement d'exécution. Contrôle Swagger, logs, Sentry |
| `PORT` | ✅ | Injecté par Railway | Port d'écoute du serveur HTTP |

### Base de données — Supabase PostgreSQL

| Variable | Obligatoire | Description |
|---|---|---|
| `DATABASE_URL` | ✅ | URL PostgreSQL avec transaction pooler (port 6543). Format : `postgresql://postgres.[ref]:[mdp]@aws-0-[region].pooler.supabase.com:6543/postgres` |

### Supabase

| Variable | Obligatoire | Où trouver | Description |
|---|---|---|---|
| `SUPABASE_URL` | ✅ | Settings → API → Project URL | URL du projet Supabase |
| `SUPABASE_ANON_KEY` | ✅ | Settings → API → anon public | Clé publique (safe côté client) |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Settings → API → service_role | Clé privée — JAMAIS exposée côté frontend |
| `SUPABASE_JWT_SECRET` | ✅ | Settings → Auth → JWT Secret | Secret de vérification des JWT Supabase |

### Resend (emails)

| Variable | Obligatoire | Description |
|---|---|---|
| `RESEND_API_KEY` | ✅ | Clé API Resend (préfixe `re_`) |
| `RESEND_FROM_EMAIL` | ✅ | Adresse expéditrice (domaine vérifié dans Resend requis) |
| `RESEND_FROM_NAME` | ➖ | Nom affiché. Défaut : `DINAWA` |

### Web Push — VAPID

| Variable | Obligatoire | Comment générer | Description |
|---|---|---|---|
| `VAPID_PUBLIC_KEY` | ✅ | `npx web-push generate-vapid-keys` | Clé publique VAPID (partagée avec le frontend) |
| `VAPID_PRIVATE_KEY` | ✅ | Idem | Clé privée VAPID — JAMAIS exposée |
| `VAPID_SUBJECT` | ✅ | — | Contact pour les serveurs push. Format : `mailto:contact@dinawa.tg` |

### Cashpay / Semoa (mobile money)

Ces variables sont optionnelles tant que le compte marchand n'est pas créé.
Sans elles, les endpoints de paiement retournent `503 Service Unavailable`.

| Variable | Obligatoire | Description |
|---|---|---|
| `CASHPAY_API_URL` | ➖ | URL de base de l'API Cashpay fournie par Semoa |
| `CASHPAY_API_KEY` | ➖ | Clé d'authentification API Cashpay |
| `CASHPAY_WEBHOOK_SECRET` | ➖ | Secret HMAC pour valider la signature des webhooks entrants |

### Sentry (monitoring)

| Variable | Obligatoire | Description |
|---|---|---|
| `SENTRY_DSN` | ➖ | DSN du projet `dinawa-backend` dans Sentry. Si absent, Sentry est désactivé (comportement normal en dev) |

### CORS

| Variable | Obligatoire | Description |
|---|---|---|
| `ALLOWED_ORIGINS` | ➖ | Origines autorisées séparées par des virgules. Défaut : `http://localhost:4200` |

---

## 2. Frontend — Variables Vercel (`NG_APP_*`)

Ces variables sont injectées **au moment de la compilation** par `@angular/build:application`.
Elles doivent être configurées dans Vercel → Project → Settings → Environment Variables.

> **Note** : Pour Angular, les variables d'environnement ne sont pas injectées à l'exécution
> comme dans Next.js. Elles sont embarquées dans le bundle JavaScript lors du build.
> Un redéploiement est nécessaire pour changer leur valeur.

| Variable Vercel | Fichier Angular | Description |
|---|---|---|
| `NG_APP_API_URL` | `environment.prod.ts` → `apiUrl` | URL complète de l'API backend Railway avec `/api`. Ex : `https://dinawa-api.up.railway.app/api` |
| `NG_APP_SENTRY_DSN` | `environment.prod.ts` → `sentryDsn` | DSN du projet `dinawa-frontend` Sentry. Laisser vide pour désactiver |
| `NG_APP_VAPID_PUBLIC_KEY` | `environment.prod.ts` → `vapidPublicKey` | Clé publique VAPID (même valeur que `VAPID_PUBLIC_KEY` Railway) |

---

## 3. GitHub Actions — Secrets et Variables

À configurer dans GitHub → Repository → Settings → Secrets and variables → Actions.

### Secrets (chiffrés)

| Secret | Description | Comment obtenir |
|---|---|---|
| `RAILWAY_TOKEN` | Token de service Railway pour le déploiement CLI | Railway → Settings → Tokens → Create Token |

### Variables (non chiffrées)

| Variable | Description | Exemple |
|---|---|---|
| `RAILWAY_SERVICE_NAME` | Nom du service dans le projet Railway | `dinawa-backend` |

---

## 4. Comment générer les secrets

### Clés VAPID

```bash
# Nécessite web-push installé globalement ou via npx
npx web-push generate-vapid-keys

# Sortie :
# Public Key: BI0...
# Private Key: ...
```

Stocker `Public Key` dans `VAPID_PUBLIC_KEY` (Railway) et `NG_APP_VAPID_PUBLIC_KEY` (Vercel).
Stocker `Private Key` dans `VAPID_PRIVATE_KEY` (Railway uniquement).

### Secret HMAC Cashpay

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

À configurer dans `CASHPAY_WEBHOOK_SECRET` (Railway).
Communiquer ce secret à Semoa pour qu'ils signent leurs webhooks avec.

### JWT Secret Supabase

Disponible directement dans le dashboard Supabase → Settings → Auth → JWT Secret.
Ne pas générer soi-même, utiliser la valeur fournie par Supabase.

---

## Récapitulatif — Où configurer quoi

| Service | Variables à configurer |
|---|---|
| **`.env` local** (dev) | Toutes les variables backend (copier `.env.example`) |
| **Railway** | `NODE_ENV`, `DATABASE_URL`, `SUPABASE_*`, `RESEND_*`, `VAPID_*`, `CASHPAY_*`, `SENTRY_DSN`, `ALLOWED_ORIGINS` |
| **Vercel** | `NG_APP_API_URL`, `NG_APP_SENTRY_DSN`, `NG_APP_VAPID_PUBLIC_KEY` |
| **GitHub Secrets** | `RAILWAY_TOKEN` |
| **GitHub Variables** | `RAILWAY_SERVICE_NAME` |
