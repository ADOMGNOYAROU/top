---
name: remember
description: Sauvegarde l'état de la session WARAH dans memory.md pour reprendre exactement où on s'est arrêté (/remember save), ou restaure le contexte au début d'une nouvelle session (/remember restore). Utiliser systématiquement en fin et début de chaque session.
---

L'IA n'a pas de mémoire d'une session à l'autre. Chaque nouvelle session démarre de zéro. Cette compétence corrige ce problème.

Exécutez-la à la fin d'une session pour sauvegarder. Exécutez-la au début d'une nouvelle session pour restaurer.

## Limite de sécurité

Ne jamais stocker de secrets (clés API, tokens, mots de passe, cookies, chaînes de connexion, secrets de webhooks). Si un détail est utile mais sensible, stocker un indicateur expurgé (`[REDACTED_API_KEY]`).

## Comment l'invoquer

```
/remember save     # fin de session
/remember restore  # début de session
```

Si invoqué sans précision — demander ce dont le développeur a besoin.

---

## Mode Sauvegarde (`/remember save`)

### Ce qu'il faut capturer

Passer en revue la conversation pour extraire uniquement ce dont un développeur aurait besoin pour poursuivre dans un contexte totalement neuf.

Capturer :

**Ce qui a été créé** — fichiers spécifiques créés ou modifiés, fonctionnalités terminées. Être précis (pas "création du module auth" — préférer "création de `src/modules/auth/auth.controller.ts`, `auth.service.ts`, `auth.module.ts`. Endpoints signup/login opérationnels.")

**Les décisions prises** — choix architecturaux dont dépend le travail futur, pas les détails d'implémentation.

**Les problèmes résolus** — tout problème qui a demandé du temps à résoudre.

**L'état actuel** — exactement où en sont les choses. Ce qui fonctionne, ce qui est partiel, ce qui est cassé.

**Ce qui vient ensuite** — la toute prochaine action à mener, assez précise pour démarrer immédiatement.

**Les questions en suspens** — tout élément non résolu.

### Ce qu'il ne faut pas capturer

- Les détails d'implémentation visibles dans le code
- Les décisions déjà documentées dans `contexte/`
- Tout ce qui peut être déduit en lisant la base de code
- Secrets ou valeurs de type identifiant

### Où sauvegarder

Écrire dans `apps/backend/memory.md` (à la racine du backend). Si ce fichier existe déjà, afficher un résumé et demander confirmation avant d'écraser.

### Format

```markdown
# Mémoire — [Nom de la fonctionnalité ou de la session]

Dernière mise à jour : [date et heure]

## Ce qui a été créé

[Fichiers spécifiques, composants, fonctionnalités terminés]

## Décisions prises

[Décisions architecturales dont dépend le travail futur]

## Problèmes résolus

[Problèmes résolus — pour éviter de les résoudre à nouveau]

## État actuel

[Ce qui fonctionne, ce qui est partiel, ce qui est cassé]

## La prochaine session commencera par

[La toute première chose à faire — spécifique et exploitable]

## Questions en suspens

[Tout élément non résolu]
```

Après avoir écrit le fichier, confirmer :

```
Mémoire sauvegardée dans apps/backend/memory.md.
Prochaine session : exécutez /remember restore pour reprendre ici.
```

---

## Mode Restauration (`/remember restore`)

### Étape 1 — Trouver la mémoire

Rechercher `apps/backend/memory.md`. S'il n'existe pas, le signaler au développeur.

### Étape 2 — Lire tout ce qui est disponible

Lire `memory.md` puis les fichiers de contexte WARAH : `apps/backend/AGENTS.md`, `apps/backend/contexte/progress-tracker.md`.

### Étape 3 — Confirmer ce qui a été restauré

```
Mémoire restaurée. Voici où nous en sommes :

**Dernière session :** [ce qui a été créé]
**État actuel :** [ce qui fonctionne en ce moment]
**Décisions en place :** [décisions clés actées]
**Étape suivante :** [par quoi commencer]

Est-ce correct ? Répondez oui pour continuer.
```

La session ne se poursuit qu'après confirmation explicite.

---

## La Règle

Chaque session se termine par `/remember save`.
Chaque session commence par `/remember restore`.
