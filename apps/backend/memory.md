# Mémoire — Backend WARAH (Phase 3 en cours, unité 13 terminée)

Dernière mise à jour : 2026-07-07

## Historique condensé (avant cette session)

Phase 1 (unités 01-06) terminée le 2026-07-01/02, renommage DINAWA→WARAH, frontend Angular intégré par le développeur. Débogage Railway : build passait mais le healthcheck échouait (timeout 60s) — cause suspectée : variables d'environnement applicatives absentes côté Railway. **Apparemment résolu depuis** (le dernier commit sur `dev` avant cette session, `dc138f5 fix(infra): restructure dockerfile, node 22 et openssl`, semble avoir clos le sujet), mais pas revérifié explicitement pendant cette session — à confirmer avant tout nouveau déploiement Railway.

## Ce qui a été créé (cette session)

**Phase 2 — Comptes utilisateurs, terminée (unités 07 à 11) :**

- Unité 07 : `src/modules/identity/` — OCR CNI togolaise (Tesseract.js, 4 rotations), recto+verso, MRZ (checksum ICAO, signal secondaire uniquement)
- Unité 08 : `POST /auth/signup/owner` — création compte + profil + vérification CNI en une transaction logique
- Unité 09 : `src/common/utils/invitation-token.ts` (HMAC signé), `POST /auth/invite/tenant`, `POST /auth/signup/tenant`, `POST /auth/signup/manager`
- Unité 10 : verrouillage 5 échecs/15 min (`AuthService.login()`), reset mot de passe par OTP, `src/modules/profile/` (photo compressée, anonymisation), `src/modules/storage/image-processor.ts` (`compressPhoto()`)
- Unité 11 : `src/modules/account/` (`AccountActivationService`, `GET /account/status`), `src/modules/scheduling/` (`InactivityTask`, cron `0 7 * * *`), `src/common/utils/advisory-lock.ts`

**Phase 3 — Patrimoine immobilier, en cours (unités 12-13 terminées) :**

- Unité 12 : `src/modules/properties/` — CRUD complet, pagination offset-based (premier précédent du projet), règles de transition de statut
- Unité 13 : extension du même module — photos (compression WebP, plafond 10) et documents (jamais compressés, plafond 20) d'un bien, tous deux avec URLs signées

**Autre :** `apps/backend/contexte/postman-testing-guide.md` créé — guide de test manuel avec données fictives togolaises et scénarios par endpoint pour les 26 endpoints construits à date.

156 tests unitaires backend passent (12 suites), typecheck/lint/build propres.

## Décisions prises

- **`AccountActivationService.reactivateIfEligible(userId)`** (unité 11) est LA fonction qui décide si un compte suspendu pour inactivité peut redevenir `ACTIVE`. Doit être appelée par toute future action qui « débloque » un compte — déjà câblée dans `PropertiesService.create()` (unité 12), **reste à câbler dans `MandatesService.accept()`** (unité 31, pas construite).
- **`@AllowWhileSuspended()`** (`src/common/decorators/`) — exception explicite au blocage `403 ACCOUNT_SUSPENDED` de `SupabaseAuthGuard`, réservée aux actions dont le but est de débloquer le compte. Sans ça, un compte suspendu ne peut jamais se débloquer lui-même (le guard rejette la mutation avant que le service ait la main). Appliqué à `POST /properties` ; **à appliquer aussi à l'acceptation de mandat** (unité 31).
- **`propertyVisibilityWhere(user)`** (`src/common/permissions/property-access.ts`) — co-localisée avec `canActOnProperty()`, dérive le filtre Prisma d'une liste depuis la même règle de visibilité (`ownerId` ou mandat actif). Toujours utiliser cette fonction plutôt que de réécrire l'`OR` à la main dans un futur endpoint de liste.
- **Pagination offset-based** (`page`/`limit`, plafond 100, enveloppe `{ data, page, limit, total }`) — précédent posé à l'unité 12, à réutiliser pour tout futur endpoint de liste (locataires, baux, paiements...).
- **Statuts `Property`** : `OCCUPIED` est injoignable via l'API tant que le module Baux (unité 15) n'existe pas (uniquement dérivable d'un futur bail) ; `ARCHIVED` est terminal, atteignable uniquement via `DELETE` (jamais `PATCH`).
- **Plafonds cumulatifs** (photos/documents d'un bien) : comptés sur les lignes déjà en base, rejet total si dépassement — jamais d'acceptation partielle silencieuse. Même philosophie à réutiliser pour tout futur plafond métier.

## Problèmes résolus

- **Verrou mortel compte suspendu** : un compte `SUSPENDED_INACTIVITY` ne pouvait jamais se débloquer lui-même (`POST /properties` bloqué par le guard avant même d'atteindre le service) → `@AllowWhileSuspended()`.
- **Duplication de logique d'autorisation** : `PropertiesService.findAll()` réimplémentait la règle de `canActOnProperty()` à la main → extraction de `propertyVisibilityWhere()`.
- **Gap `@MaxLength()`** sur les champs texte des DTOs `Property` (documenté dans `code-standards.md`, jamais appliqué depuis l'étape 08) → corrigé sur `CreatePropertyDto`/`UpdatePropertyDto` uniquement, pas de sweep rétroactif sur les DTOs plus anciens.
- **Faux positif encodage** : des caractères accentués (`Bè`, `Lomé`) apparaissaient corrompus (`B�`) dans les réponses `curl` du terminal Windows — vérifié directement en base via Prisma : stockage UTF-8 correct, pur artefact d'affichage terminal. Ne pas re-diagnostiquer ça si ça revient.
- **Pièges opérationnels Windows/Git Bash notés pour la suite** : `sharp`/`curl` exigent des chemins Windows cohérents (`C:/...` à l'intérieur de Node, chemins avec backslashes entre guillemets pour `curl -F`) — les chemins `/c/...` de Git Bash échouent silencieusement ou de façon trompeuse pour ces deux outils.

## État actuel

- Backend : Phase 1 et 2 terminées, Phase 3 en cours (unités 12-13 faites, 14-15 restantes).
- Tout testé en conditions réelles contre la vraie base Supabase à chaque unité (comptes/biens/fichiers jetables, nettoyés après chaque validation) — jamais seulement les tests unitaires.
- `progress-tracker.md` à jour jusqu'à l'unité 13 inclus.
- Frontend Angular (intégré par le développeur, hors périmètre de mon travail) : lancé et compilé avec succès en local pendant cette session (`ng serve`, port 4200) pour exploration, aucune modification apportée.

## La prochaine session commencera par

`/remember restore` puis `/architect unité 14` (Locataires) — voir `contexte/build-plan.md`. Points à garder en tête dès l'architecture de l'unité 14 : la contrainte « un seul `Lease` `ACTIVE` par locataire » et l'historique locataire (paiements/baux passés conservés) sont déjà décrits au build-plan ; vérifier si `TenantProfile` (schéma existant depuis l'étape 02) a besoin d'un champ ou d'une migration avant de commencer.

## Questions en suspens

- Domaine `warah.tg` toujours pas vérifié sur Resend — emails de prod bloqués (hérité, toujours vrai).
- Statut réel du healthcheck Railway — probablement résolu mais pas reconfirmé cette session.
- Dépendance `AccountActivationService`/`@AllowWhileSuspended()` à câbler à l'unité 31 (mandats) — ne pas oublier en y arrivant.
- Nom du dossier racine du disque et projet Supabase toujours « DINAWA » — pas renommés (hérité, hors périmètre sauf demande explicite).
