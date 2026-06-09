# GEMINI.md — Dëkkal · Guide complet pour un modèle IA

> Ce fichier est destiné à un futur modèle IA (Claude, Gemini, GPT…) pour reprendre le développement de cette application sans perdre de contexte.

---

## 1. Ce que fait l'application

**Dëkkal** (« surveiller » en wolof) est une application web de gestion commerciale pour les **commerçants et PME sénégalais**. Elle couvre tout le cycle de vente et d'achat :

- Gérer les clients, fournisseurs et le stock
- Créer et suivre les factures (brouillon → envoyée → payée)
- Émettre des bons de commande fournisseurs
- Visualiser les ventes et les analytiques
- Télécharger les factures en PDF

L'interface est entièrement en **français**, les montants sont en **FCFA**, et les paiements supportés sont Orange Money, Wave et virement bancaire.

---

## 2. Technologies utilisées

| Technologie | Version | Rôle |
|---|---|---|
| **Next.js** | 16.2.7 (App Router + Turbopack) | Framework React fullstack |
| **React** | 19.2.4 | UI |
| **TypeScript** | ^5 | Typage statique |
| **Tailwind CSS** | v4 | Styles utilitaires |
| **Lucide React** | ^0.395.0 | Icônes |
| **React Hook Form** | ^7.52.0 | Formulaires |
| **Zod** | ^3.23.8 | Validation de schémas |
| **date-fns** | ^3.6.0 | Manipulation de dates |
| **clsx + tailwind-merge** | latest | Fusion de classes CSS conditionnelles |
| **Recharts** | ^2.12.7 | Graphiques (installé, non encore utilisé) |
| **Sonner** | ^1.5.0 | Toasts (installé, non encore utilisé) |

**Commandes clés :**
```bash
npm run dev      # Démarre le serveur de développement (port 3000)
npm run build    # Build de production
npm run lint     # ESLint
```

---

## 3. Structure des fichiers

```
src/
├── app/
│   ├── layout.tsx                          # Layout racine (html, body)
│   ├── page.tsx                            # Redirect vers /dashboard
│   └── (dashboard)/                        # Groupe de routes avec sidebar+header
│       ├── layout.tsx                      # Layout dashboard (sidebar + header + main)
│       ├── dashboard/page.tsx              # Tableau de bord (KPIs, graphique, alertes)
│       ├── factures/
│       │   ├── page.tsx                    # Liste des factures
│       │   ├── nouvelle/page.tsx           # Formulaire de création
│       │   └── [id]/page.tsx              # Détail + prévisualisation PDF
│       ├── clients/page.tsx                # Liste + CRUD clients (modal)
│       ├── stock/page.tsx                  # Inventaire + CRUD produits (modal)
│       ├── fournisseurs/page.tsx           # Liste + CRUD fournisseurs (modal)
│       ├── achats/page.tsx                 # Bons de commande (modal create/view/receive)
│       ├── analytiques/page.tsx            # KPIs analytiques (placeholder charts)
│       ├── parametres/page.tsx             # Paramètres boutique (formulaire statique)
│       └── ventes/
│           ├── transactions/page.tsx       # Historique des encaissements
│           └── rapports/page.tsx           # Rapports mensuels + graphique CSS
│
├── components/
│   ├── layout/
│   │   ├── sidebar.tsx                    # Navigation latérale avec état actif
│   │   ├── header.tsx                     # Barre supérieure (recherche, logo, profil)
│   │   └── logo.tsx                       # Logo SVG Dëkkal
│   ├── dashboard/
│   │   ├── stat-card.tsx                  # Carte KPI réutilisable
│   │   ├── sales-chart.tsx                # Graphique évolution des ventes
│   │   ├── stock-alerts.tsx               # Widget alertes stock faible
│   │   └── recent-invoices.tsx            # Widget dernières factures
│   ├── factures/
│   │   ├── invoice-table.tsx              # Tableau factures + dropdown statut inline
│   │   ├── invoice-form.tsx               # Formulaire création facture multi-lignes
│   │   └── invoice-preview.tsx            # Prévisualisation PDF de facture
│   └── clients/
│       ├── client-table.tsx               # Tableau clients
│       └── client-form.tsx                # Formulaire ajout/édition client
│
├── data/
│   └── mock.ts                            # Toutes les données fictives (voir section 6)
│
├── lib/
│   ├── utils.ts                           # formatCFA(), formatDate(), cn()
│   └── types.ts                           # Types TypeScript partagés
│
└── app/globals.css                        # Variables CSS, Tailwind, print, date picker
```

---

## 4. Fonctionnalités implémentées

### Tableau de bord (`/dashboard`)
- 4 cartes KPI : Valeur Stock, Ventes du Mois, Montant Facturé, En Attente
- Graphique évolution des ventes sur 6 mois (CSS bars)
- Alertes stock faible (produits sous le seuil)
- Widget dernières factures avec statut coloré
- Filtre période (Ce mois-ci / sélecteur)

### Factures (`/factures`)
- Tableau avec filtres par statut (onglets : Toutes, Payées, Envoyées, Impayées, Brouillons)
- Recherche par numéro ou nom client
- **Dropdown de changement de statut inline** : cliquer sur le badge statut ouvre un menu avec 4 options (Brouillon, Envoyée, Payée, Impayée) — mise à jour immédiate en local state
- Bouton œil → page de détail
- Bouton télécharger → navigue vers `/factures/[id]?pdf=1` qui déclenche `window.print()`

### Création de facture (`/factures/nouvelle`)
- Sélection client, dates d'émission et d'échéance
- Ajout de lignes avec sélecteur de produit (stock affiché), quantité, prix unitaire, remise
- Prix auto-rempli à la sélection du produit
- Calcul automatique sous-total, TVA 18%, total TTC
- **Bouton principal "Enregistrer"** → sauvegarde comme brouillon
- **Bouton secondaire "Valider & Envoyer"** → vérifie le stock puis envoie
- Erreurs affichées dans une bannière rouge (pas d'`alert()`)

### Détail facture (`/factures/[id]`)
- Prévisualisation complète au format A4
- Paramètres `use(params)` pour Next.js 15+ async params
- `?pdf=1` déclenche `window.print()` après 500ms
- CSS `@media print` masque sidebar, header et boutons d'action

### Clients (`/clients`)
- Tableau des clients avec recherche
- Modal "Ajouter" / "Modifier" / "Supprimer"
- Formulaire : nom, téléphone, email, adresse, notes

### Stock (`/stock`)
- Tableau inventaire avec catégorie, unité, quantité, seuil d'alerte, prix achat/vente
- Modal CRUD complet (add / edit / delete)
- Prix saisie en FCFA, stockés en centimes (×100) en state
- Indicateur visuel si quantité ≤ seuil d'alerte (orange)

### Fournisseurs (`/fournisseurs`)
- Tableau avec actions modifier/supprimer (visibles au hover)
- Modal CRUD : nom, téléphone, email, adresse, notes

### Achats / Bons de commande (`/achats`)
- Tableau des bons avec statuts : En attente, Partielle, Reçue
- Modal "Nouveau bon" : fournisseur, dates, montant, notes
- Modal "Voir détail" : affichage des informations du bon
- Modal "Réceptionner" : choix Réception partielle / complète → met à jour le statut

### Analytiques (`/analytiques`)
- KPIs : CA total, nouveaux clients, commandes, marge
- Section graphiques (placeholder pour future intégration Recharts)

### Transactions (`/ventes/transactions`)
- Liste des factures payées présentées comme transactions
- Résumé : total encaissé, transactions du mois, moyenne par transaction

### Rapports (`/ventes/rapports`)
- Graphique mensuel CSS (barres proportionnelles)
- KPIs : CA encaissé, meilleur mois, factures payées
- Liste de rapports téléchargeables (données mockées)

### Navigation (Sidebar)
- Liens actifs détectés via `pathname.startsWith(href)` — fonctionne sur les sous-pages
- Sections "Achats" et "Ventes" pliables/dépliables
- Auto-expansion de la section active à la navigation (via `useEffect`)
- Bouton **"Upgrade plan"** → ouvre une modale de tarification :
  - Starter : 5 900 FCFA/mois
  - Pro (recommandé) : 19 900 FCFA/mois — 1er mois offert
  - Business : Sur devis (bouton "Nous contacter")

---

## 5. Décisions de design

### Système de couleurs
```css
--primary:        #0D9488   /* teal principal */
--primary-dark:   #0D5C4A   /* teal foncé (boutons, sidebar header) */
--primary-light:  #14B8A6   /* teal clair (hover) */
--success:        #10B981   /* vert émeraude */
--warning:        #F59E0B   /* orange */
--danger:         #EF4444   /* rouge */
--info:           #3B82F6   /* bleu */
```
Fond blanc, texte `#111827`, bordures `#E5E7EB`, surfaces légèrement grises `#F9FAFB`.

### Montants en centimes
**Toutes les valeurs monétaires dans `mock.ts` sont en centimes (FCFA × 100).**
- Raison : éviter les flottants dans les calculs
- Affichage : toujours via `formatCFA(amount)` qui divise par 100
- Saisie dans les formulaires : l'utilisateur entre en FCFA, le code multiplie par 100 pour stocker

### Statuts de facture
```
brouillon → envoyee → payee
                   → impayee
```
Le statut est modifiable à tout moment depuis le tableau via le dropdown inline.

### Paramètres async Next.js 15+
Dans `app/(dashboard)/factures/[id]/page.tsx`, les params sont un `Promise` :
```tsx
export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params); // React.use() pour unwrap
}
```

### Règle ESLint critique
`react-hooks/static-components` : ne jamais définir un composant React **à l'intérieur** du corps d'un autre composant (render function). Toujours hisser les composants au niveau du module.

### Caractères spéciaux dans JSX
Ne **jamais** utiliser de guillemets courbes (`'` `'`) dans le code — le parser Turbopack les rejette. Si l'éditeur les insère automatiquement, utiliser Python pour les remplacer :
```bash
python3 -c "
path = 'src/...'
with open(path, 'r', encoding='utf-8') as f: c = f.read()
c = c.replace('‘', \"'\").replace('’', \"'\")
with open(path, 'w', encoding='utf-8') as f: f.write(c)
"
```

### Print / PDF
La génération PDF fonctionne via `window.print()` + `@media print` dans `globals.css` qui masque tout sauf `[data-invoice-preview]`. Pas de bibliothèque PDF externe.

### Icône calendrier des inputs date
```css
input[type="date"]::-webkit-calendar-picker-indicator {
  filter: invert(44%) sepia(97%) saturate(400%) hue-rotate(142deg) brightness(88%);
}
```
La popup du calendrier natif ne peut pas être stylisée en CSS — seule l'icône est modifiable.

---

## 6. Données mock (`src/data/mock.ts`)

Toutes les données sont fictives et stockées dans ce fichier. Il n'y a **pas de base de données** ni d'API. Les modifications faites via les modales sont en **state local React** (non persistantes au rechargement).

| Export | Contenu |
|---|---|
| `mockStats` | KPIs dashboard (valeurs en centimes) |
| `mockCategories` | 5 catégories de produits |
| `mockProducts` | 15 produits avec prix achat/vente en centimes |
| `mockClients` | 8 clients sénégalais avec coordonnées |
| `mockSuppliers` | 5 fournisseurs avec notes |
| `mockInvoices` | 7 factures avec statuts variés |
| `mockPurchaseOrders` | 4 bons de commande |
| `mockSalesChartData` | 6 mois de données de ventes |
| `mockStockAlerts` | Produits filtrés sous le seuil d'alerte |
| `mockRecentInvoices` | 5 premières factures (pour le dashboard) |
| `mockSettings` | Paramètres de la boutique |

---

## 7. Instructions pour un futur modèle IA

### Avant de commencer
1. Lire ce fichier en entier
2. Lire `src/data/mock.ts` pour comprendre les structures de données
3. Lire `src/app/globals.css` pour les variables CSS et les contraintes de style

### Conventions à respecter
- **Toujours** utiliser `formatCFA(amount)` pour afficher un montant (jamais de division manuelle)
- **Toujours** stocker les prix en centimes dans le state (multiplier par 100 à la saisie)
- **Ne jamais** définir un composant React à l'intérieur d'un autre composant (ESLint le bloque)
- **Ne jamais** utiliser `alert()` — afficher les erreurs dans le JSX avec une bannière
- **Ne jamais** coller de guillemets courbes (`'` `'`) dans du code TypeScript/JSX
- Utiliser `&apos;` pour les apostrophes dans le texte JSX (ex: `d&apos;émission`)
- Pour les apostrophes dans les strings JS à l'intérieur de `{}`, les guillemets droits `'` sont OK

### Ajouter une nouvelle page
1. Créer `src/app/(dashboard)/ma-page/page.tsx`
2. Ajouter l'entrée dans la sidebar (`src/components/layout/sidebar.tsx`) dans `navItems` ou une section pliable
3. Utiliser le pattern de layout existant : `<div className="space-y-6">` avec un `<h1>` et sous-titre

### Ajouter un CRUD complet (modal)
Pattern standard utilisé partout (`stock`, `fournisseurs`, `clients`) :
```tsx
const [items, setItems] = useState([...mockData]);
const [modalMode, setModalMode] = useState<null | 'add' | 'edit' | 'delete'>(null);
const [selected, setSelected] = useState<Item | null>(null);
const [form, setForm] = useState<FormState>(emptyForm);

// Ouvrir modal
const openAdd = () => { setForm(emptyForm); setModalMode('add'); };
const openEdit = (item) => { setSelected(item); setForm(toForm(item)); setModalMode('edit'); };
const openDelete = (item) => { setSelected(item); setModalMode('delete'); };

// Actions
const handleAdd = () => { setItems(prev => [...prev, newItem]); setModalMode(null); };
const handleEdit = () => { setItems(prev => prev.map(i => i.id === selected.id ? updated : i)); setModalMode(null); };
const handleDelete = () => { setItems(prev => prev.filter(i => i.id !== selected!.id)); setModalMode(null); };
```

### Connecter une vraie base de données
Quand le backend sera ajouté :
1. Remplacer les imports depuis `@/data/mock` par des appels API (`fetch`, `SWR`, ou `React Query`)
2. Les `useState` initialisés avec les mock deviendront des états chargés depuis l'API
3. Les fonctions `handleAdd/Edit/Delete` feront des `POST/PUT/DELETE` au lieu de `setItems`
4. Sonner (`sonner`) est déjà installé pour les toasts de confirmation — l'activer dans `layout.tsx` avec `<Toaster />`

### Intégrer les vrais graphiques
Recharts est installé. Remplacer les graphiques CSS actuels par :
```tsx
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
<ResponsiveContainer width="100%" height={300}>
  <BarChart data={mockSalesChartData}>
    <Bar dataKey="total" fill="#0D9488" radius={[4,4,0,0]} />
    <XAxis dataKey="name" />
    <YAxis />
    <Tooltip formatter={(v) => formatCFA(v * 100)} />
  </BarChart>
</ResponsiveContainer>
```

### Générer de vrais PDFs
`window.print()` fonctionne mais produit un PDF basique. Pour des PDFs professionnels, intégrer `@react-pdf/renderer` ou `puppeteer` côté serveur en Route Handler (`app/api/factures/[id]/pdf/route.ts`).

### Débogage courant
- **500 au chargement** : vérifier les guillemets courbes dans le fichier modifié récemment
- **404 sur `/factures/[id]`** : s'assurer que `use(params)` est utilisé (pas `params.id` directement)
- **Composant réinitialisé à chaque frappe** : un composant est probablement défini à l'intérieur d'un autre — le hisser au niveau module
- **Prix incorrects** : vérifier que la valeur est bien divisée/multipliée par 100 aux bons endroits
