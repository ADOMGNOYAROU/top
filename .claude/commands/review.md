---
name: review
description: Après avoir développé une fonctionnalité WARAH, vérifie qu'elle correspond au plan, respecte l'architecture NestJS du projet et les standards de code, et est prête pour la production. Signale les problèmes avec leur sévérité sans corriger — le développeur décide.
---

Le développement n'est pas terminé lorsque le code s'exécute. Il est terminé lorsque le code est correct.

## Ce que cette compétence ne fait pas

Elle ne corrige rien. Elle signale ce qu'elle trouve et laisse le développeur décider de ce qui est important et de la marche à suivre.

## Étape 1 — Comprendre ce qui aurait dû être construit

Avant d'analyser quoi que ce soit, établissez la référence.

Lisez dans cet ordre :

- Le plan d'implémentation provenant de `/architect`, s'il en existe un.
- La description de la fonctionnalité ou la tâche qui a été assignée.
- Les fichiers de contexte pertinents — `contexte/architecture.md`, `contexte/code-standards.md`.

## Étape 2 — Analyser sur trois niveaux

### Niveau 1 — Est-ce conforme au plan ?

Comparez ce qui a été construit avec ce qui était prévu.

Vérifiez :

- Chaque élément de la description — tout y est-il ?
- Les décisions prises lors de la planification — se reflètent-elles dans le code ?
- Le périmètre — rien de non demandé ajouté ?

### Niveau 2 — Est-ce que cela respecte le système ?

Vérifiez les invariants WARAH (depuis `contexte/architecture.md`) :

- **Limites architecturales** — aucune logique métier dans les controllers, Prisma uniquement dans services et cron, `canActOnProperty()` comme autorité unique
- **Normes de code** — conventions NestJS, TypeScript strict, gestion d'erreurs typée (`NotFoundException`, `ForbiddenException`, etc.), jamais `throw new Error()`
- **Patterns existants** — utilisation des patterns définis dans `contexte/code-standards.md` et `contexte/library-docs.md`

### Niveau 3 — Est-ce prêt pour la production ?

Vérifiez :

- La gestion des erreurs — les exceptions HTTP typées sont-elles levées ?
- `take` explicite sur tout `findMany` (plafond 100) — aucun N+1
- Toutes dates en UTC (`@db.Timestamptz`)
- Timeout sur les appels sortants, retry borné sur les idempotents
- `SupabaseAuthGuard` sur tous les endpoints (sauf `@Public()` explicite)

## Étape 3 — Communiquer les résultats

```
## Analyse — [Nom de la fonctionnalité]

### Niveau 1 — Alignement avec le plan
[CONFORME / PROBLÈMES DÉTECTÉS]

### Niveau 2 — Intégrité du système
[CONFORME / PROBLÈMES DÉTECTÉS]

### Niveau 3 — Prêt pour la production
[CONFORME / PROBLÈMES DÉTECTÉS]

### Résumé
[X] problèmes trouvés sur [Y] niveaux.
```

## Guide de sévérité

**Critique** — à corriger avant de continuer

- Violations des invariants architecturaux WARAH
- Absence de gestion des erreurs → échecs silencieux
- Fonctionnalité prévue totalement manquante

**Important** — à corriger rapidement

- Violations des normes de code qui vont se propager
- Cas limites qu'un utilisateur réel est susceptible de rencontrer

**Mineur** — à corriger dès que possible

- Incohérences de nommage sans impact comportemental

## Étape 4 — Laisser le développeur décider

Après avoir présenté le rapport, arrêtez-vous. Ne commencez pas à corriger. Attendez que le développeur demande une correction spécifique ou confirme que tout est résolu.
