# Mémoire — Unité 01 Setup NestJS, Prisma et Supabase

Dernière mise à jour : 2026-07-01

## Ce qui a été créé

Scaffolding NestJS complet dans `apps/backend/` — la majorité des fichiers existait déjà, corrections et fichiers manquants ajoutés :

- `prisma/schema.prisma` — ajout `directUrl = env("DIRECT_URL")` pour pgBouncer Supabase
- `src/config/env.validation.ts` — ajout `DIRECT_URL!: string`, fix `!` sur toutes les props requises (strict TS)
- `src/prisma/prisma.service.ts` — fix bracket notation `['$connect']` / `['$disconnect']` (noPropertyAccessFromIndexSignature)
- `src/modules/health/health.controller.ts` — fix bracket notation `['$queryRaw']`
- `.env.example` — ajout `DIRECT_URL` avec explication pgBouncer vs connexion directe
- `eslint.config.mjs` — ESLint 9 flat config avec typescript-eslint (créé)
- `.prettierrc` — config Prettier (créé)
- `contexte/progress-tracker.md` — unité 01 cochée

Fichiers déjà en place (non modifiés) : `src/main.ts`, `src/app.module.ts`, `src/config/logger.config.ts`, `src/modules/health/health.module.ts`, `src/prisma/prisma.module.ts`, `Dockerfile`, `railway.json`, `nest-cli.json`, `tsconfig.json`, `package.json`

## Décisions prises

- `DATABASE_URL` (port 6543 pgBouncer) + `DIRECT_URL` (port 5432 direct) — deux variables séparées dans schema.prisma et env.validation.ts
- Dockerfile multi-stage avec `CMD ["sh", "-c", "cd apps/backend && npx prisma migrate deploy && node dist/main"]`
- `app.setGlobalPrefix('api', { exclude: ['health/live', 'health/ready'] })` — health checks sans préfixe pour Railway
- Build depuis la racine du monorepo (`Dockerfile` référencé dans `railway.json` avec path `apps/backend/Dockerfile`)

## Problèmes résolus

- 14 erreurs TypeScript : `TS2564` (propriétés sans initializer → ajout `!`) et `TS4111` (accès Prisma via index signature → bracket notation)
- `npm install` depuis la racine échoue à cause d'un conflit frontend (`@sentry/angular` vs Angular 20) — pas bloquant pour le backend, `node_modules` déjà installés

## État actuel

- Build NestJS : **0 erreur**, `npm run build` passe
- TypeScript strict : **0 erreur**, `tsc --noEmit` passe
- `node_modules` présents (installés précédemment)
- Pas encore déployé sur Railway (requiert les vraies variables d'environnement Supabase)
- Schéma Prisma : modèle `User` minimal placeholder uniquement

## La prochaine session commencera par

`/remember restore` puis attaquer l'**Unité 02 — Schéma Prisma initial** : écrire le schéma complet avec tous les modèles (`User`, `OwnerProfile`, `TenantProfile`, `ManagerProfile`, `AdminProfile`, `Property`, `Lease`, `Payment`, etc.), toutes les énumérations, contraintes et index définis dans `contexte/build-plan.md` unité 02.

## Questions en suspens

- Conflit `@sentry/angular` vs Angular 20 dans le workspace frontend — à résoudre côté frontend quand on travaillera dessus
- Variables d'environnement réelles Supabase + Railway à configurer manuellement dans le dashboard Railway avant le premier déploiement
