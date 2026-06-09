# Dëkkal - Design System & UI Rules

Ce fichier définit les règles strictes d'UI/UX à suivre pour tous les nouveaux composants et pages créés pour l'application Dëkkal. Toute nouvelle intégration doit respecter ces standards pour garantir la cohérence visuelle.

## 1. Couleurs et Identité (Thème Velto & Sénégal)
- **Primary (Vert/Teal)** : `bg-primary` (#0D9488) pour les boutons d'action principale, barres de progression, etc.
- **Dark Primary (Vert Foncé)** : `bg-[#0D5C4A]` pour les boutons "Créer" de la sidebar et les éléments Premium.
- **Sénégal Identity** : Vert (`#00853F`) et Jaune (`#FDEF42`) réservés au logo ou aux éléments d'identité de la marque.
- **Backgrounds** : `bg-surface` (Blanc pur) pour les cartes/blocs, `bg-background-subtle` (#F9FAFB) pour le fond de page global ou le fond des lignes de tableau au survol.
- **Textes** : 
  - Titres et valeurs importantes : `text-text-primary` (#111827).
  - Sous-titres et labels : `text-text-secondary` (#6B7280).
  - Textes muets/désactivés : `text-text-muted` (#9CA3AF).
- **Bordures** : `border-border` (#E5E7EB) par défaut. `border-primary/50` pour les éléments mis en évidence.

## 2. Bordures et Arrondis
- **Grandes Cartes / Blocs de contenu** : `rounded-xl`.
- **Boutons, Inputs, Petites Cartes** : `rounded-lg`.
- **Badges, Tags de statut, Avatars** : `rounded-full`.
- **Ombres** : `shadow-sm` par défaut pour toutes les cartes et éléments surélevés.

## 3. Typographie et Alignements
- Les titres de pages doivent être : `text-2xl sm:text-3xl font-bold tracking-tight text-text-primary`.
- Les valeurs clés (chiffres d'affaires, stocks) : `text-xl xl:text-2xl font-bold tracking-tight text-text-primary` (sans `truncate` pour éviter de cacher des chiffres, utiliser un `min-w-0` et laisser à la ligne au besoin).
- Les titres de sections/cartes : `text-lg font-bold`.

## 4. Micro-Animations et Interactivité (Crucial)
Tous les éléments interactifs doivent avoir des micro-animations fluides.
- **Cartes stat/cliquables** : `transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-primary/30`.
- **Boutons standard** : `transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 active:scale-95 active:translate-y-0`.
- **Boutons Icône (ex: Actions '...')** : `hover:scale-110 active:scale-95` avec un léger changement de couleur de fond `hover:bg-primary/10 hover:text-primary`.
- **Liens "Voir tous"** : Utiliser un groupe et faire glisser une flèche : `group-hover:translate-x-1`.
- **Lignes de tableau** : `hover:bg-background-subtle/50 transition-colors`. Les boutons d'action à l'intérieur peuvent utiliser `opacity-0 group-hover:opacity-100` pour n'apparaître qu'au survol.

## 5. Responsivité (Mobile First)
- **Grilles** : Toujours penser à la réorganisation. Exemple pour 4 cartes : `grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6` (Utiliser `xl` et non `lg` pour éviter l'écrasement des textes sur les écrans moyens).
- **Tableaux** : Toujours les englober dans un `<div className="overflow-x-auto">`.
- **Textes longs** : Utiliser `<div className="min-w-0">` sur le conteneur flex parent, et `truncate` sur l'enfant texte pour éviter que les flexbox ne débordent de l'écran. Ne pas utiliser `truncate` sur les montants financiers.
- **Menu** : Les éléments de la sidebar doivent être masqués sur mobile (`lg:hidden`) et gérés via un overlay/backdrop (`fixed inset-0 bg-black/50 z-50`).

> **Règle d'Or de Dëkkal** : Ne jamais utiliser les couleurs standard (red, blue, green simples). Toujours utiliser les variables définies (`danger`, `success`, `primary`) et appliquer les animations de survol systématiquement.
