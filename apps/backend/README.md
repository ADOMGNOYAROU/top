# WARAH — Backend (NestJS)

Backend de la plateforme WARAH, déployé sur **Railway**.

## Stack

- NestJS 10 + TypeScript strict
- Prisma + PostgreSQL (Supabase)
- Supabase Auth (pas de bcrypt NestJS)
- Pino pour les logs structurés
- @nestjs/terminus pour les health checks

## Démarrage local

### 1. Variables d'environnement

```bash
cp .env.example .env
# Remplir les valeurs dans .env (voir docs/ENV.md)
```

### 2. Installer les dépendances (depuis la racine du monorepo)

```bash
# Depuis la racine
npm install
```

### 3. Générer le client Prisma

```bash
npm run prisma:generate --workspace=apps/backend
```

### 4. Appliquer les migrations

```bash
# Développement (crée + applique)
cd apps/backend && npx prisma migrate dev

# Production / staging (applique uniquement)
npm run prisma:migrate:deploy --workspace=apps/backend
```

### 5. Démarrer en watch mode

```bash
npm run dev:backend
```

L'API est disponible sur `http://localhost:3000`.
Swagger est disponible sur `http://localhost:3000/api/docs` (dev uniquement).

## Health checks

| Endpoint            | Usage                             | Dépendances       |
| ------------------- | --------------------------------- | ----------------- |
| `GET /health/live`  | Liveness — Railway poll continu   | Aucune            |
| `GET /health/ready` | Readiness — Railway avant routage | Prisma/PostgreSQL |

## Scripts

| Script                          | Description                              |
| ------------------------------- | ---------------------------------------- |
| `npm run dev`                   | Watch mode                               |
| `npm run build`                 | Compilation TypeScript                   |
| `npm run start:prod`            | Démarrage production (sans migrations)   |
| `npm run test`                  | Tests unitaires                          |
| `npm run test:e2e`              | Tests end-to-end                         |
| `npm run lint`                  | ESLint                                   |
| `npm run typecheck`             | Vérification TypeScript sans compilation |
| `npm run prisma:generate`       | Génération du client Prisma              |
| `npm run prisma:migrate:deploy` | Application des migrations en production |

## Premier déploiement Railway

Voir [`docs/DEPLOYMENT.md`](../../docs/DEPLOYMENT.md) pour la procédure complète.

## Notes importantes

- Les **PDFs** (quittances, rapports) sont générés **à la volée** et jamais stockés
- Le webhook Cashpay (`POST /api/webhooks/cashpay`) est exclu du rate limiting via `@SkipThrottle()`
- Les migrations Prisma s'exécutent au démarrage du conteneur via `npx prisma migrate deploy`
- Le logger Pino **rédige** automatiquement les mots de passe, tokens et numéros sensibles
