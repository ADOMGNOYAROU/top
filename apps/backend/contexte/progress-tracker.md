# Progress Tracker — WARAH

Update this file after every completed feature. Any AI agent reading this should immediately know what is done, what is in progress, and what is next.

---

## Current Status

**Phase :** Phase 1 — Fondations. **Terminée** (unités 01 à 06).

**Aperçus visuels des 11 templates email** générés en PNG (Chrome headless) et conservés dans `contexte/email-previews/` — utile pour validation design avec le client.

**Last completed :** Unité 06 Préférences de notifications et infrastructure push web (2026-07-01) — `WebPushService` (`src/modules/push/web-push.service.ts` : `subscribe`, `unsubscribe`, `sendToUser` avec timeout 10s + retry `p-retry` 3 tentatives sur les échecs transitoires, suppression immédiate sans retry sur 410/404 via `AbortError`), endpoints `GET /api/push/vapid-public-key`, `POST /api/push/subscribe`, `POST /api/push/unsubscribe`. `NotifyService.notifyUser()` (`src/modules/notify/notify.service.ts`) — point d'entrée unique, bascule push/email selon `notificationConsent` + abonnements actifs, pièce jointe force l'email. Vocabulaire d'événements identique aux 9 templates email non-auth de l'Unité 04 (`NotificationEvent` = `EmailTemplate` moins les 2 templates d'auth). Testé de bout en bout avec une vraie notification reçue dans un navigateur réel (page jetable supprimée après validation).

**Revue post-implémentation (`/review`)** a trouvé et corrigé 4 problèmes avant clôture : échec silencieux de `notifyUser()` quand l'utilisateur n'a ni email ni push actif (loggue maintenant un warning), bug multi-appareils dans `unsubscribe()` (repassait `notificationConsent` à `DECLINED` même si d'autres abonnements restaient actifs — corrigé via transaction avec vérification du compte restant), absence de timeout/retry sur l'envoi push (ajoutés, alignés sur `EmailService`), `findMany` sans `take` explicite (ajouté), et `@Public()` non justifié retiré de `GET /vapid-public-key`.

**Décision de marque :** le nom du produit passe de DINAWA à **WARAH** (« La gestion locative intelligente ») — logo fourni par le client (2026-07-01). Renommage complet appliqué à tout le dépôt le même jour : contenu visible (templates email, `RESEND_FROM_NAME`), noms de package (`@warah/backend`, `@warah/frontend`), projet Angular (`warah-frontend`), utilisateur système Docker, service de logs, tous les fichiers de contexte/doc. Le nom du dossier racine du projet sur le disque (`DINAWA`) et le nom du projet Supabase n'ont volontairement pas été touchés (changement structurel risqué / hors périmètre fichiers) — à faire séparément si souhaité.

**Problème trouvé, non bloquant :** `warah.tg` n'est pas un domaine vérifié sur le compte Resend utilisé (seul `lbscallcenter.com`, un autre projet du même compte, l'est). `RESEND_FROM_EMAIL` reste sur `noreply@warah.tg` dans `.env` mais les envois échoueront tant que ce domaine n'est pas ajouté et vérifié sur resend.com/domains. Le pipeline a été validé de bout en bout avec `lbscallcenter.com` (test uniquement, jamais utilisé en dehors de ce test).

**Next :** **Phase 2 — Comptes utilisateurs**, unité **07 Vérification automatique de la carte d'identité togolaise** (Tesseract.js). **Bloquant partiel** : le pattern exact du numéro de CNI et les marqueurs OCR attendent toujours un exemple réel de CNI togolaise fourni par le client (voir Questions en suspens) — on peut coder le pipeline avec des placeholders documentés, ou sauter à l'unité 08/09 en attendant.

---

## Progress

### Phase 1 — Fondations

- [x] 01 Setup projet NestJS, Prisma et Supabase — 2026-07-01 — `src/main.ts`, `src/app.module.ts`, `src/config/env.validation.ts`, `src/config/logger.config.ts`, `src/prisma/prisma.service.ts`, `src/prisma/prisma.module.ts`, `src/modules/health/health.controller.ts`, `src/modules/health/health.module.ts`, `prisma/schema.prisma`, `Dockerfile`, `railway.json`, `.env.example`, `eslint.config.mjs`, `.prettierrc`
- [x] 02 Schéma Prisma initial — 2026-07-01 — `prisma/schema.prisma` (21 modèles, 19 énums), `prisma/migrations/20260701104000_init_schema/`, `prisma/migrations/20260701104113_partial_unique_active_constraints/`. Migrations appliquées sur Supabase réel. `SUPABASE_JWT_SECRET` rendu optionnel dans `env.validation.ts` (validation JWT via `auth.getUser()`, pas de vérification locale HS256). Fix générique : les variables optionnelles vides dans `.env` sont normalisées en `undefined` avant validation (évitait un crash sur `CASHPAY_API_URL=`).
- [x] 03 Authentification Supabase et rôles — 2026-07-01 — `src/common/guards/supabase-auth.guard.ts`, `src/common/guards/roles.guard.ts`, `src/common/decorators/{public,roles,current-user}.decorator.ts`, `src/common/permissions/property-access.ts`, `src/common/types/{authenticated-user.type,express.d}.ts`, `src/modules/supabase/{supabase-admin.service,supabase.module}.ts`, `src/modules/auth/{auth.controller,auth.service,auth.module}.ts`. `@supabase/supabase-js` ajouté aux dépendances.
- [x] 04 Service emails transactionnels (Resend) — 2026-07-01 — `src/modules/email/email.service.ts`, `src/modules/email/email.module.ts`, `src/modules/email/templates/*` (layout + 11 templates + registry). Testé sur Resend réel (`delivered`). Domaine `warah.tg` non encore vérifié sur Resend — voir Questions en suspens.
- [x] 05 Service de stockage (Supabase Storage) — 2026-07-01 — `src/modules/storage/storage.service.ts`, `src/modules/storage/storage.module.ts`, `src/common/constants.ts`. Testé de bout en bout sur Supabase réel.
- [x] 06 Préférences de notifications et infrastructure push web — 2026-07-01 — `src/modules/push/{web-push.service,push.controller,push.module}.ts`, `src/modules/push/dto/{subscribe-push,unsubscribe-push}.dto.ts`, `src/modules/notify/{notify.service,notify.module,notification-events}.ts`. Testé en navigateur réel (notification reçue). Revue post-implémentation : 4 corrections appliquées (échec silencieux, bug multi-appareils, timeout/retry push, `take` manquant).

### Phase 2 — Comptes utilisateurs

- [ ] 07 Vérification automatique de la carte d'identité togolaise
- [ ] 08 Inscription propriétaire
- [ ] 09 Inscription locataire et gestionnaire
- [ ] 10 Sécurité d'accès et gestion du profil
- [ ] 11 Blocage automatique des comptes inactifs

### Phase 3 — Patrimoine immobilier

- [ ] 12 CRUD biens immobiliers
- [ ] 13 Photos et documents du bien
- [ ] 14 Locataires
- [ ] 15 Baux simplifiés (V1)

### Phase 4 — Paiements

- [ ] 16 Modèle de paiements et générateur d'échéances
- [ ] 17 Intégration Cashpay — initialisation de paiement
- [ ] 18 Webhook Cashpay — confirmation et idempotence
- [ ] 19 Saisie manuelle par le propriétaire ou le gestionnaire
- [ ] 20 Déclaration de paiement par le locataire
- [ ] 21 Génération de quittance PDF à la volée
- [ ] 22 Envoi automatique de quittance
- [ ] 23 Historique et export des paiements

### Phase 5 — Rappels et alertes automatiques

- [ ] 24 Cron rappels d'échéance adaptés à la fréquence
- [ ] 25 Cron alertes d'impayés adaptés à la fréquence

### Phase 6 — Tableaux de bord propriétaire et locataire

- [ ] 26 Tableau de bord propriétaire
- [ ] 27 Tableau de bord locataire

### Phase 7 — Annonces de biens vacants

- [ ] 28 Publication d'annonces et page publique
- [ ] 29 Formulaire de contact candidat locataire
- [ ] 30 Modération et suspension automatique

### Phase 8 — Gestionnaires immobiliers

- [ ] 31 Mandats et espace gestionnaire
- [ ] 32 Tableau de bord gestionnaire
- [ ] 33 Rapports mensuels automatiques
- [ ] 34 Profil public et avis

### Phase 9 — Abonnements

- [ ] 35 Forfaits et quotas
- [ ] 36 Prélèvement mensuel et politique de lancement

### Phase 10 — Administration

- [ ] 37 Supervision plateforme
- [ ] 38 Tableau de bord administrateur
- [ ] 39 Gestion des litiges et signalements

### Phase 11 — Sécurité, conformité et observabilité

- [ ] 40 Journalisation, rate limiting et headers de sécurité
- [ ] 41 Sauvegardes, export RGPD et conformité

---

## Decisions Made During Build

### Stack et infrastructure

- **Backend en NestJS 10+ avec TypeScript strict**, hébergement Railway, base de données PostgreSQL via Supabase. Prisma comme ORM (et non TypeORM). Frontend Angular 20 (hors périmètre de ce dépôt, géré séparément).
- **Cron Railway horaire global** retenu plutôt qu'une file de jobs (BullMQ + Redis) ou un service externe (Trigger.dev) — le cron tourne à fréquence fixe et la base de données décide qui doit recevoir quoi. Approche simple, robuste, sans dépendance supplémentaire. Décision prise après évaluation : un rappel de loyer n'a pas besoin d'être précis à la minute, donc cette approche suffit pour la V1.
- **Cashpay (Semoa) confirmé comme agrégateur de paiement** pour T-Money et Flooz. Plan B mental gardé (PayGate Global ou CinetPay) si la documentation Cashpay reste inaccessible ou leur support trop lent à l'intégration.

### Authentification et identité

- **Supabase Auth utilisé pour toute la gestion des comptes** — pas de bcrypt côté NestJS, pas de table `password` locale. Le `SupabaseAuthGuard` valide le JWT à chaque requête authentifiée et synchronise l'`User` côté Prisma.
- **Connexion par email + mot de passe directe**, ouverture immédiate d'une session pleine sans étape supplémentaire — pas de 2FA à la connexion. L'OTP par email à 6 chiffres ne sert que pour le « mot de passe oublié » (expiration 10 minutes, usage unique, toute nouvelle demande invalide les codes précédents).
- **Vérification automatique de la CNI togolaise via Tesseract.js** (OCR). Aucune validation manuelle, aucune file d'attente humaine — décision automatique `VERIFIED` ou `REJECTED` en moins de 10 secondes, avec basculement en mode asynchrone au-delà. L'utilisateur peut re-soumettre immédiatement en cas de rejet.
- **CNI obligatoire pour propriétaire et gestionnaire, optionnelle pour locataire**. Tant que le statut n'est pas `VERIFIED`, le propriétaire/gestionnaire peut se connecter mais reste en accès restreint (lecture seule).

### Rôles et droits

- **Quatre rôles fixes** : `OWNER`, `TENANT`, `MANAGER`, `ADMIN`. Le rôle `MANAGER` inclut tous les droits du rôle `OWNER` sur ses propres biens, plus la capacité d'être mandataire des biens d'autres propriétaires via le modèle `Mandate`.
- **Helper `canActOnProperty()` retenu comme autorité unique** pour décider qui peut agir sur un bien — jamais une vérification inline `if (property.ownerId === user.id)` dans un service. Cette fonction renvoie en temps réel `{ canRead, canMutate, isOwner, isMandatedManager }` selon le contexte rôle × mandat actif.
- **Transfert des droits via mandat** : quand un `Mandate` est `ACTIVE` sur un bien, le gestionnaire mandataire récupère tous les droits opérationnels (création de bail, saisie de paiement, confirmation/rejet de déclarations locataire, publication d'annonces). Le propriétaire passe en lecture seule sur ce bien et reçoit le rapport mensuel. À la révocation, le propriétaire récupère immédiatement tous les droits.

### Domaine métier — biens, locataires, baux

- **Relation locataire ↔ bien strictement 1-1** au sens d'un `Lease` `ACTIVE` à la fois pour un `TenantProfile`. La création d'un nouveau bail pour un locataire déjà actif ailleurs est rejetée — sauf si le bien précédent est passé en `VACANT`. L'historique complet du locataire (anciens baux, paiements passés) est intégralement conservé lors du changement de bien.
- **Bail V1 simplifié** : `endDate` optionnelle, les autres champs (`monthlyRent`, `monthlyCharges`, `paymentFrequency`, `startDate`, `securityDeposit`) sont obligatoires. Si pas d'`endDate`, le calendrier d'échéances est généré sur 12 mois roulants et prolongé automatiquement.
- **Le gestionnaire mandaté peut créer un bail** au même titre que le propriétaire — la décision passe systématiquement par `canActOnProperty()`.

### Paiements

- **Trois sources de paiement** strictement distinctes : `CASHPAY_API` (initié par le locataire via T-Money/Flooz, confirmé par webhook), `MANUAL_OWNER` (saisi par propriétaire/gestionnaire, direct en `PAID`), `TENANT_DECLARATION` (déclaré par le locataire, passe par `PENDING_CONFIRMATION` puis confirmé ou rejeté par propriétaire/gestionnaire).
- **Idempotence stricte du webhook Cashpay** via la contrainte unique `transactionId` côté DB — jamais une vérification applicative seule. Signature HMAC vérifiée avant tout traitement.
- **Règle d'or paiements** : un paiement avec `source = CASHPAY_API` ne peut **jamais** être re-confirmé ni rejeté manuellement. Les endpoints de confirmation manuelle rejettent toute action sur ces paiements. Le webhook est la source de vérité unique.
- **Quittances PDF générées à la volée**, jamais stockées en base ni en bucket. Toutes les données nécessaires sont déjà en Prisma. PDFKit + streaming HTTP direct. Même règle pour les rapports mensuels du gestionnaire et les factures d'abonnement.

### Notifications

- **`NotifyService.notifyUser()` comme point d'entrée unique** pour toute notification métier. Push web si `notificationConsent === ACCEPTED` et abonnement actif, sinon email — jamais les deux canaux pour le même événement.
- **Exception stricte pour les emails d'authentification** (confirmation d'inscription, OTP de réinitialisation) : appel direct à `EmailService.sendEmail()`, jamais via `NotifyService`. Ces emails doivent fonctionner même sans abonnement push.
- **Pièce jointe PDF (quittance, rapport)** force le canal email même si push est disponible — un push ne porte pas de PDF.
- **Web Push via VAPID** avec la lib `web-push`. Suppression automatique des `PushSubscription` qui retournent `410 Gone` ou `404` — jamais de retry sur subscription morte.

### Cycle de vie des comptes

- **Blocage automatique des comptes inactifs** : après 60 jours sans bien enregistré pour un propriétaire (ou sans bien propre ni mandat actif pour un gestionnaire), le compte passe à `accountStatus = SUSPENDED_INACTIVITY`. Rappels via `notifyUser()` à J-30, J-7 et J-1 avant la date butoir.
- **Déblocage automatique et immédiat** dès qu'un bien est créé ou qu'un mandat est accepté — `accountStatus` repasse à `ACTIVE`, notification de bienvenue envoyée.
- **Compte bloqué = lecture seule** : l'utilisateur peut se connecter mais tous les endpoints de mutation renvoient `403 ACCOUNT_SUSPENDED` avec un message explicite.

### Abonnements

- **Trois forfaits** : Starter (2 000 FCFA, 5 biens gérés) / Pro (5 000 FCFA, 15 biens gérés) / Premium (10 000 FCFA, biens illimités).
- **Définition « bien géré »** issue du glossaire du cahier des charges : un bien est compté s'il a un locataire actif OU une annonce active OU un statut `RENOVATION` avec bail en préparation. Les biens simplement enregistrés ne comptent pas.
- **Pour un gestionnaire**, le quota porte sur ses biens propres uniquement — les biens sous mandat entrent dans le quota du propriétaire mandant, pas dans le sien.
- **Période bêta de 3 mois gratuits** pour tout propriétaire inscrit en phase de lancement (flag `betaUntil`). Réduction de 50 % sur Starter pendant les 3 premiers mois payants (champ `promoDiscount`).

### Stockage et données

- **Cinq buckets Supabase Storage uniquement** : `property-photos`, `property-documents`, `id-documents`, `manager-documents`, `payment-proofs`. Aucun bucket pour les quittances, rapports ou factures (générés à la volée).
- **Toutes les URLs servies au client sont signées** avec expiration 15 minutes max — jamais d'URL publique permanente.
- **Compression d'images obligatoire via sharp** (max 1920px, qualité 80, format WebP) à l'upload — sauf pour les CNI dans `id-documents` qui conservent leur qualité pour l'OCR.

### Résilience et production (cf. code-standards.md section Résilience)

- **Timeouts explicites sur tous les appels sortants** (10s par défaut, 3s pour le webhook handler). Pas de retry sur les appels non idempotents (init paiement Cashpay). Retry avec backoff exponentiel borné (1s/4s/16s, 3 tentatives max) sur les appels idempotents (envoi email, push, PDF).
- **Graceful shutdown** via `app.enableShutdownHooks()` pour gérer le `SIGTERM` Railway proprement, fermeture des connexions Prisma via `OnModuleDestroy`.
- **Health checks séparés** : `/health/live` (le process tourne, sans dépendance) et `/health/ready` (Prisma + Supabase répondent).
- **Verrouillage Postgres** (`pg_try_advisory_lock`) sur les jobs cron dont la duplication est dangereuse : rapports mensuels, prélèvements abonnement, blocage d'inactivité.
- **Monitoring Sentry obligatoire en production** avec filtrage des 4xx attendues dans `beforeSend`.
- **Pagination Prisma obligatoire** sur tout `findMany`, plafond dur de 100 par page.
- **UTC partout en base** (`@db.Timestamptz`), conversion en heure de Lomé (`Africa/Lome`) uniquement à l'affichage.

### Tests et déploiement

- **Tests d'intégration obligatoires** sur 7 flows critiques : webhook Cashpay (signature + idempotence), déclaration locataire → confirmation, auth Supabase, mandats, calcul des échéances, blocage 2 mois, helper `canActOnProperty()`. Couverture cible 70 % sur les services métier, 100 % sur `canActOnProperty()` et webhook Cashpay.
- **Migrations Prisma rétrocompatibles** obligatoires — jamais `DROP COLUMN` ou `RENAME COLUMN` dans la même release qu'un changement de code. Toujours en deux temps.
- **Validation des variables d'environnement au démarrage** via `class-validator` dans `src/config/env.validation.ts` — crash immédiat si une variable manque, avec message clair.

---

## Open Questions

Questions techniques en suspens, à résoudre avant l'implémentation des étapes concernées.

- **Pattern exact du numéro de CNI togolaise** — en attente d'un exemple de CNI fourni par le client. Le `CNI_NUMBER_PATTERN` dans `IdentityVerificationService` est actuellement un placeholder (`/[A-Z0-9]{8,12}/`), à figer après réception. **Bloquant pour l'étape 07.**
- **Liste exhaustive des marqueurs Tesseract** à détecter sur la CNI togolaise — actuellement deux marqueurs hypothétiques (`RÉPUBLIQUE TOGOLAISE`, `CARTE NATIONALE D'IDENTITÉ`). À compléter ou ajuster après réception de l'exemple officiel. **Bloquant pour l'étape 07.**
- **Documentation API Cashpay** — leur documentation publique est limitée. Demander au support Cashpay les spécifications exactes : endpoints, format des requêtes d'initialisation, format des webhooks (champs, signature HMAC, headers), codes d'erreur. **Bloquant pour les étapes 17 et 18.**
- **~~Templates email~~** — résolu 2026-07-01 : le client n'avait pas de maquettes prêtes, Claude a conçu les 11 templates avec le logo/palette WARAH fournis. Le client peut encore demander des ajustements de design plus tard.
- **Maquette du PDF de quittance fournie par le client** — template à recevoir avant l'implémentation du `ReceiptPdfService`. **Bloquant pour l'étape 21.** (Peut suivre le même traitement que les emails — Claude propose si le client n'a rien de prêt.)
- **Maquette du PDF de rapport mensuel gestionnaire** — à recevoir avant l'étape 33. (Idem.)
- **~~Nom définitif du produit~~** — résolu 2026-07-01 : la marque est **WARAH**, pas DINAWA (logo reçu). Renommage complet du dépôt effectué le même jour (voir Décision de marque ci-dessus) — reste seulement le dossier racine sur le disque et le nom du projet Supabase.
- **`warah.tg` non vérifié sur Resend** — seul `lbscallcenter.com` (autre projet) est vérifié sur ce compte Resend. `RESEND_FROM_EMAIL=noreply@warah.tg` dans `.env` échouera tant que le domaine n'est pas ajouté + vérifié sur resend.com/domains. **Bloquant pour tout envoi email réel en dehors des tests.**
- **Nom du dossier racine et projet Supabase toujours "DINAWA"** — non renommés (changement structurel risqué en session active / hors périmètre "fichiers du projet"). À faire manuellement si souhaité : renommer le dossier Windows cassera les processus en cours et l'ouverture VS Code actuelle ; renommer le projet Supabase se fait depuis son dashboard.
- **`SENTRY_DSN` fourni semble incomplet** — format reçu sans protocole ni ID de projet final (`https://<clé>@<host>` au lieu de `https://<clé>@<host>/<project_id>`). Le SDK Sentry logge `Invalid Sentry Dsn` au démarrage et désactive silencieusement la capture d'erreurs — l'app démarre normalement. À vérifier dans Sentry → Settings → Client Keys (DSN) avant la mise en prod.

---

## Notes

Notes techniques et points de vigilance à retenir au démarrage.

- **Aucun code n'a encore été écrit.** Le repository sera initialisé à l'étape 01 avec NestJS 10+, TypeScript strict, ESLint, Prettier. Suivre les patterns définis dans `code-standards.md` dès le premier commit.
- **Cohérence du glossaire à figer** — le cahier des charges contient deux mentions divergentes des quotas Starter (5 biens dans le tableau comparatif, 2 biens dans le glossaire). Décision retenue : 5 biens Starter / 15 biens Pro / illimité Premium, valeurs consolidées dans `SUBSCRIPTION_TIERS` (cf. code-standards.md). Le glossaire du cahier des charges sera corrigé à la prochaine révision.
- **Le rôle MANAGER est en réalité un super-OWNER** — il peut posséder ses propres biens (avec tous les droits d'un OWNER dessus) ET être mandataire des biens d'autres propriétaires. Bien tester les deux casquettes dans les tests d'intégration de l'étape 31.
- **Le Togo est en UTC+0 sans DST** (`Africa/Lome`). Les expressions cron en UTC reflètent donc directement l'heure de Lomé. Toujours rester explicite pour éviter les confusions futures si la plateforme s'étend hors UEMOA.
- **Cashpay reste un risque d'intégration** — leur documentation n'est pas publique. Prévoir 2 à 3 jours de marge à l'étape 17. Si blocage prolongé, basculer sur PayGate Global ou CinetPay comme plan B.
- **Tesseract.js est CPU-bound** — l'OCR de la CNI peut prendre 5 à 10 secondes selon la qualité de l'image et la charge du serveur. L'endpoint doit basculer en mode asynchrone si dépassement (étape 07).
- **Aucune commission sur les loyers** — la promesse fondatrice de WARAH est que 100 % du loyer va au propriétaire. Le code n'a donc aucune logique de prélèvement sur les paiements de loyer. Les seuls flux financiers entrants pour la plateforme sont les abonnements mensuels (étapes 35 et 36).
- **Frontend Angular 20** géré dans un dépôt séparé — le backend NestJS n'expose qu'une API REST documentée via Swagger (`/api/docs` en dev). Aucune logique de rendu côté NestJS.
- **Mettre à jour ce fichier après chaque unité terminée** — cocher la case, ajouter la date et un résumé court des fichiers créés ou modifiés. Sans cette discipline, la reprise après une pause perd tout son contexte.
