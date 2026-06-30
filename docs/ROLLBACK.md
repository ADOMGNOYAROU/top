# Procédure de rollback — DINAWA

---

## Table des matières

1. [Rollback Railway (backend)](#1-rollback-railway-backend)
2. [Rollback Vercel (frontend)](#2-rollback-vercel-frontend)
3. [Règles pour les migrations Prisma](#3-règles-pour-les-migrations-prisma)
4. [Matrice de décision](#4-matrice-de-décision)

---

## 1. Rollback Railway (backend)

### Via le Dashboard Railway (recommandé)

1. Aller dans Railway Dashboard → Projet → Service
2. Cliquer sur l'onglet **Deployments**
3. Identifier le dernier déploiement stable (statut `SUCCESS` avant l'incident)
4. Cliquer sur les 3 points `···` → **Redeploy**
5. Confirmer — Railway redéploie l'image Docker associée à ce déploiement
6. Surveiller le health check `/health/ready` jusqu'à ce qu'il réponde `200 OK`

### Via la Railway CLI

```bash
# Lister les déploiements récents
railway deployments --service dinawa-backend

# Rollback vers un déploiement spécifique
railway rollback --deployment <DEPLOYMENT_ID> --service dinawa-backend
```

### Délai de rollback estimé

- Redéploiement d'une image existante (déjà buildée) : **~2 minutes**
- Railway exécute `npx prisma migrate deploy` au démarrage même en rollback

> **Important** : Si le rollback nécessite une rétrogradation du schéma DB (migration inverse), voir section 3.

---

## 2. Rollback Vercel (frontend)

### Via le Dashboard Vercel

1. Aller dans Vercel Dashboard → Projet → **Deployments**
2. Trouver le déploiement stable avant l'incident
3. Cliquer sur le déploiement → **Promote to Production**
4. Vercel redirige immédiatement le trafic vers ce build (CDN propagation < 30s)

> Le rollback Vercel est **instantané** — pas de rebuild, le build précédent est déjà distribué sur le CDN.

### Via la CLI Vercel

```bash
# Lister les déploiements
vercel ls --prod

# Promouvoir un déploiement
vercel promote <DEPLOYMENT_URL>
```

---

## 3. Règles pour les migrations Prisma

Ces règles sont **non négociables** pour permettre les rollbacks sans incident.

### ✅ Migrations autorisées (rétrocompatibles)

Ces opérations peuvent être déployées et rollbackées librement :

- Ajouter une nouvelle table
- Ajouter une colonne **nullable** à une table existante
- Ajouter une colonne avec une valeur DEFAULT en base
- Ajouter un index
- Renommer une table (avec alias/vue pour la rétrocompat)
- Ajouter une contrainte CHECK sur des données existantes valides

### ❌ Migrations risquées (nécessitent une stratégie)

Ces opérations ne permettent pas un rollback simple :

| Opération | Risque | Stratégie recommandée |
|---|---|---|
| Supprimer une colonne | Perte de données | 3 étapes : déprécier → déployer → supprimer |
| Renommer une colonne | Casse l'ancien code | Ajouter la nouvelle colonne, migrer les données, supprimer l'ancienne en 3 déploiements |
| Ajouter une contrainte NOT NULL | Bloque les insertions de l'ancien code | Ajouter nullable d'abord, remplir les valeurs, ajouter NOT NULL ensuite |
| Modifier un type de colonne | Risque de perte de données | Migration en plusieurs étapes |

### Stratégie en 3 déploiements pour les changements destructifs

Pour toute migration non rétrocompatible, suivre ce processus :

**Déploiement 1** — Préparer
```sql
-- Ajouter la nouvelle colonne (nullable ou avec DEFAULT)
ALTER TABLE users ADD COLUMN phone_normalized VARCHAR(20);
```

**Déploiement 2** — Migrer
```sql
-- Remplir la nouvelle colonne depuis l'ancienne
UPDATE users SET phone_normalized = normalize_phone(phone) WHERE phone IS NOT NULL;
-- Ajouter la contrainte NOT NULL uniquement quand toutes les lignes sont remplies
ALTER TABLE users ALTER COLUMN phone_normalized SET NOT NULL;
```

**Déploiement 3** — Nettoyer
```sql
-- Supprimer l'ancienne colonne une fois que le code ne l'utilise plus
ALTER TABLE users DROP COLUMN phone;
```

### Migration d'urgence vers le bas (rollback schéma)

Si un rollback requiert l'annulation d'une migration :

```bash
# ⚠️ UNIQUEMENT en cas d'urgence et sur accord explicite
# Créer une migration manuelle qui annule les changements
cd apps/backend
npx prisma migrate dev --name rollback_migration_xxx

# Ou résoudre manuellement via psql et marquer la migration comme appliquée
npx prisma migrate resolve --rolled-back <migration_name>
```

> **Règle absolue** : Ne jamais utiliser `prisma migrate reset` en production (supprime toutes les données).

---

## 4. Matrice de décision

| Scénario | Action Backend | Action Frontend | Rollback DB ? |
|---|---|---|---|
| Bug UI / CSS | Aucune | Rollback Vercel | Non |
| Bug API non critique | Rollback Railway | Aucune | Non |
| Bug API + migration additive | Rollback Railway | Aucune | Non (migration additive est sûre) |
| Bug API + migration destructive | Rollback Railway | Aucune | Oui — migration inverse manuelle |
| Panne totale | Rollback Railway + Vercel | — | Selon la migration |
| Panne DB Supabase | Contacter Supabase support | — | — |
