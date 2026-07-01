# WARAH — Plateforme de gestion locative

WARAH permet aux propriétaires immobiliers togolais (résidant au Togo ou à l'étranger) de gérer leurs
locations en temps réel : encaissement des loyers via mobile money (T-Money et Flooz), génération de
quittances officielles, tableau de bord analytique et gestion des mandats.

**Périmètre V1 :** Togo uniquement · Devise FCFA · Langue française · UTC+0 (Africa/Lomé)

---

## Structure du monorepo

```
warah/
├── apps/
│   ├── backend/          NestJS 10 — déployé sur Railway
│   └── frontend/         Angular 20 — déployé sur Vercel
├── .github/
│   └── workflows/        CI (ci.yml) + CD backend (cd-backend.yml)
├── docs/
│   ├── DEPLOYMENT.md     Procédure de premier déploiement
│   ├── ROLLBACK.md       Procédure de rollback
│   ├── ENV.md            Référence de toutes les variables d'environnement
│   └── ARCHITECTURE.md   Vue d'ensemble de l'architecture
├── .husky/               Pre-commit hooks (lint-staged + commitlint)
├── package.json          Racine npm workspaces
└── CONTRIBUTING.md       Conventions de contribution
```

---

## Prérequis

- **Node.js** `22.12.0` (utilise `.nvmrc` — `nvm use` suffit)
- **npm** `>=10.0.0`
- Accès aux services : Supabase, Railway, Vercel, Resend

---

## Installation

```bash
# Installer toutes les dépendances des workspaces
npm install

# Activer les git hooks
npm run prepare
```

---

## Commandes principales

| Commande                 | Description                          |
| ------------------------ | ------------------------------------ |
| `npm run dev:backend`    | Démarre le backend en watch mode     |
| `npm run dev:frontend`   | Démarre le frontend en dev mode      |
| `npm run build`          | Build toutes les apps                |
| `npm run test`           | Lance tous les tests                 |
| `npm run lint`           | Lint tout le monorepo                |
| `npm run typecheck`      | Vérification TypeScript stricte      |
| `npm run build:backend`  | Build le backend uniquement          |
| `npm run build:frontend` | Build le frontend en mode production |

---

## Premier déploiement

Voir [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) pour la procédure complète pas-à-pas.

## Variables d'environnement

Voir [`docs/ENV.md`](docs/ENV.md) pour la liste exhaustive avec descriptions et procédures de génération.

## Architecture

Voir [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

## Contribution

Voir [`CONTRIBUTING.md`](CONTRIBUTING.md) pour les conventions de commit, nommage des branches et processus de PR.

---

## Rôles utilisateurs

| Rôle      | Description                                                                     |
| --------- | ------------------------------------------------------------------------------- |
| `OWNER`   | Propriétaire de biens immobiliers                                               |
| `TENANT`  | Locataire                                                                       |
| `MANAGER` | Gestionnaire immobilier professionnel (peut être mandataire et/ou propriétaire) |
| `ADMIN`   | Administrateur de la plateforme                                                 |
