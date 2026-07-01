---
name: recover
description: Quand quelque chose tourne mal pendant le build WARAH, diagnostique le type de défaillance avant de décider comment réagir — correction ciblée, réinitialisation complète ou refonte totale. Ne jamais patcher indéfiniment sans avoir d'abord identifié le bon mode de défaillance.
---

Tous les problèmes ne sont pas des bugs. Et tous les bugs ne nécessitent pas un débogage.

## Étape 1 — Décrire ce qui a échoué

Demander au développeur :

```
Décrivez ce qui ne va pas. Soyez précis :
- Qu'est-ce qui était censé se passer ?
- Que s'est-il passé à la place ?
- Combien de fois avez-vous déjà essayé de corriger cela ?
```

Le nombre de tentatives est crucial — il indique si c'est un problème récent ou une session qui a déraillé.

## Étape 2 — Identifier le mode de défaillance

### Mode 1 — Un élément spécifique est cassé

**Signes :** problème isolé, reste du projet fonctionnel, 1re ou 2e tentative, message d'erreur clair.

**Réponse :** Correction ciblée → Étape 3A.

### Mode 2 — La session a déraillé

**Signes :** multiples tentatives ont aggravé les choses, code devenu un sac de nœuds, problème d'origine plus clair.

**Réponse :** Réinitialisation complète → Étape 3B.

### Mode 3 — Les fondations sont erronées

**Signes :** le code s'exécute mais comportement fondamentalement incorrect, mauvaise compréhension d'une API ou d'un pattern architectural, corriger des éléments isolés ne servira à rien.

**Réponse :** Refonte totale → Étape 3C.

Annoncer le mode identifié avant de continuer.

---

## Étape 3A — Correction ciblée (Mode 1)

Lire le code concerné — uniquement ce qui est directement lié au problème.

Identifier la cause racine avant de suggérer un correctif :

```
Cause racine : [explication spécifique]
C'est différent du symptôme car : [explication]
Correctif : [ce qui doit changer et pourquoi]
```

Attendre que le développeur confirme avant d'effectuer des modifications.

Si le correctif ne fonctionne pas — arrêter. Re-diagnostiquer depuis le début. Si deux diagnostics successifs sont faux, réévaluer : c'est peut-être le Mode 2 ou 3.

---

## Étape 3B — Réinitialisation complète (Mode 2)

```
Cette session est allée trop loin dans la mauvaise direction
pour être sauvée par des patchs.
```

Avant de clore, extraire ce qui a de la valeur :

```markdown
## Note de réinitialisation — [Nom de la fonctionnalité]

### Ce que nous construisions

[Description]

### Ce qui a mal tourné

[Résumé honnête]

### Ce qu'il faut éviter la prochaine fois

[Approches qui n'ont pas fonctionné]

### Point de départ pour la prochaine session

[Ce qu'il faut garder / jeter]
```

Instructions :

```
1. Enregistrez cette note de réinitialisation.
2. Fermez cette session.
3. Ouvrez une nouvelle session.
4. Commencez par /remember restore.
5. Abordez à nouveau [fonctionnalité] avec la note comme contexte.
Ne continuez pas dans cette session.
```

---

## Étape 3C — Refonte totale (Mode 3)

Nommer la fausse hypothèse :

```
Le problème de fond n'est pas un bug — c'est une fausse hypothèse :

Hypothèse de départ : [ce qui a été supposé]
Réalité : [ce qui est réellement vrai]

L'implémentation actuelle ne peut pas être corrigée par des patchs.
```

Proposer la bonne approche et attendre confirmation avant tout code.

---

## Le Principe

La pire chose à faire lorsque quelque chose est cassé, c'est de continuer à faire exactement la même chose, mais plus vite.

Diagnostiquez d'abord. Réagissez correctement.
