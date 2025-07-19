# ERP/CRM System avec Vitrine Intégrée

## Description

Application ERP/CRM complète avec une vitrine statique intégrée, développée avec React, TypeScript, et Ant Design. Le système comprend une page d'accueil vitrine et un système de gestion complet pour les entreprises.

## Structure du Projet

```
src/
├── components/
│   ├── auth/
│   │   └── LoginPage.tsx          # Page de connexion
│   ├── pages/
│   │   ├── VitrinePage.tsx        # Page vitrine d'accueil
│   │   └── VitrinePage.css                # Styles de la vitrine
│   ├── routing/
│   │   ├── AppRouter.tsx          # Configuration des routes
│   │   └── ProtectedRoute.tsx     # Protection des routes
│   └── layout/
│       ├── AdminLayout.tsx        # Layout administrateur
│       └── ClientLayout.tsx       # Layout client
├── store/                         # Redux store et slices
└── theme/                         # Configuration thème Ant Design
```

## Routes Principales

- `/` - Page vitrine d'accueil (VitrinePage)
- `/login` - Page de connexion
- `/admin/*` - Interface administrateur (protégée)
- `/client/*` - Interface client (protégée)

## Navigation

### Depuis la Vitrine vers le CRM
- Le bouton "Se connecter" dans la vitrine redirige vers `/login`
- Après connexion, redirection automatique selon le rôle utilisateur

### Depuis le CRM vers la Vitrine
- Lien "Retour à l'accueil" disponible sur la page de connexion
- Redirection vers la page vitrine (`/`)

## Assets et Images

### Placement des Assets
- Logo temporaire : `public/cmt-logo-temp.png`
- Images externes : URLs Pexels et autres CDN
- Icônes : Font Awesome (inclus via CDN)

### Polices
- Google Fonts : Merriweather, Open Sans, Poppins
- Font Awesome pour les icônes

## Installation et Lancement

```bash
# Installation des dépendances
npm install

#Lancement en développement
npm run dev

# Build pour production
npm run build
```

## Fonctionnalités de la Vitrine

- **Design Responsive** : Adaptation mobile et desktop
- **Carousel Hero** : Diaporama automatique avec contrôles
- **Sections Services** : Présentation des services avec détails extensibles
- **Statistiques Animées** : Compteurs animés au scroll
- **Formulaire Contact** : Formulaire de contact fonctionnel
- **Navigation Fluide** : Scroll smooth entre sections

## Fonctionnalités CRM

- **Authentification** : Système de login avec rôles
- **Dashboard Admin** : Gestion complète des données
- **Dashboard Client** : Interface client simplifiée
- **Gestion** : Clients, factures, de devis, paiements
- **Messagerie** : Communication interne
- **Rapports** : Statistiques et analyses

## Identifiants de Démonstration

### Administrateur
- Email : `admin@erp.com`
- Mot de passe : `admin123`

### Client
- Email : `jean.dupont@email.com`
- Mot de passe : `client123`

## Technologies Utilisées

- **Frontend** : React 18, TypeScript
- **UI Framework** : Ant Design
- **Styling** : CSS personnalisé + Tailwind CSS
- **State Management** : Redux Toolkit
- **Routing** : React Router DOM
- **Icons** : Lucide React + Font Awesome
- **Build Tool** : Vite

## Personnalisation

### Modification du Logo
Remplacez `public/cmt-logo-temp.png` par votre logo final.

### Couleurs et Thème
Les variables CSS sont définies dans `VitrinePage.css` :
```css
:root {
  --color-accent: #4a6b6a;
  --color-sand: #d9c9ac;
  --color-bg-light: #f3f2ef;
  /* ... autres variables */
}
```

### Contenu de la Vitrine
Modifiez le contenu dans `VitrinePage.tsx` :
- Textes des sections
- Images et liens
- Informations de contact
- Services proposés

## Support et Maintenance

Le code est organisé de manière modulaire pour faciliter la maintenance :
- Composants réutilisables
-Séparation des préoccupations
- Types TypeScript stricts
- Documentation inline

Pour toute question ou personnalisation, référez-vous aux commentaires dans le code source.