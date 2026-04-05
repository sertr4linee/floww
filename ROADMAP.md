# Floww — Roadmap complète

> Toutes les tâches pour passer de zéro à la production sur Abstract mainnet.
> Chaque tâche est atomique et cochable. Durée estimée : 8–10 semaines solo.

---

## Phase 0 — Setup projet (Jour 1)

### Monorepo & outils

- [x] Créer le repo Git `floww`
- [x] Initialiser la structure monorepo :
  ```
  floww/
  ├── contracts/       # Foundry
  ├── backend/         # Bun + Hono
  ├── frontend/        # Next.js
  └── docs/
  ```
- [x] Configurer `.gitignore` (node_modules, .env, out/, cache/, broadcast/)
- [x] Créer les `.env.example` pour chaque package
- [x] Créer un wallet de dev (clé privée testnet uniquement)
- [x] Récupérer des ETH testnet Abstract via le faucet

---

## Phase 1 — Smart Contracts (Semaine 1–2)

### 1.1 Setup Foundry

- [x] `forge init contracts`
- [x] `forge install OpenZeppelin/openzeppelin-contracts`
- [x] Configurer `foundry.toml` (remappings, optimizer, solc 0.8.24)
- [x] Configurer le RPC Abstract testnet dans `foundry.toml`
- [x] Vérifier que `forge build` compile

### 1.2 FlowwTip.sol — Tips one-shot

- [x] Écrire le contrat `FlowwTip.sol`
  - [x] `tipETH(address creator, string message)` — tip en ETH natif
  - [x] `tipERC20(address creator, address token, uint256 amount, string message)` — tip en USDC
  - [x] Fee configurable (2.5% par défaut, max 10%)
  - [x] `setFeeBps()` + `setTreasury()` — onlyOwner
  - [x] Utiliser `SafeERC20.safeTransferFrom` (pas `transferFrom` brut)
  - [x] Event `Tipped(from, creator, token, amount, fee, message)`
- [x] Tests Forge (17 tests) :
  - [x] Tip ETH : montant correct reçu par le créateur et le treasury
  - [x] Tip ERC20 : idem avec mock USDC
  - [x] Fee calculation correcte (edge cases : petits montants, montants max)
  - [x] Revert si montant = 0
  - [x] Revert si fee > 10%
  - [x] Reentrancy protection
  - [x] Fuzz test sur les montants

### 1.3 FlowwSubscription.sol — Abonnements récurrents

- [x] Écrire le contrat `FlowwSubscription.sol`
  - [x] `createPlan(uint256 pricePerMonth)` — créateur crée un tier
  - [x] `subscribe(address creator, uint256 planId)` — fan s'abonne (charge USDC)
  - [x] `renew(address subscriber, address creator)` — renouvellement (callable par anyone)
  - [x] `cancel(address creator)` — fan annule
  - [x] `isActive(address subscriber, address creator)` — view
  - [x] Fee 5% sur chaque charge
  - [x] Utiliser `SafeERC20.safeTransferFrom`
- [x] Tests Forge (15 tests) :
  - [x] Créer un plan + vérifier storage
  - [x] Subscribe : premier paiement déduit, subscription active
  - [x] Renew : revert si pas encore dû, passe si dû
  - [x] Cancel : subscription inactive
  - [x] isActive : true avant expiration, false après
  - [x] Fuzz test sur les prix

### 1.4 FlowwGate.sol — NFT Passes (ERC-1155)

- [x] Écrire le contrat `FlowwGate.sol`
  - [x] `createPass(uint256 price, uint256 maxSupply, string uri)` — créateur crée un pass
  - [x] `mintPass(uint256 passId)` — fan mint (paye en ETH)
  - [x] `hasAccess(address user, uint256 passId)` — view
  - [x] `uri(uint256 passId)` — override pour metadata
  - [x] Fee 2.5% sur le mint
  - [x] Utiliser `.call{value}` au lieu de `.transfer()` (compatibilité smart wallets AGW)
- [x] Tests Forge (14 tests) :
  - [x] Créer un pass + vérifier metadata
  - [x] Mint : NFT reçu, ETH distribué (creator + treasury)
  - [x] Sold out : revert si maxSupply atteint
  - [x] hasAccess : true si balance > 0
  - [x] Revert si prix insuffisant

### 1.5 Déploiement testnet

- [x] Écrire `script/Deploy.s.sol` (deploy les 3 contrats + set treasury)
- [x] Deploy sur Abstract testnet
- [x] Vérifier les contrats sur Abscan (testnet)
- [x] Sauvegarder les adresses déployées dans `contracts/deployments/testnet.json`
- [x] Tester manuellement via `cast` : tip ETH, tip USDC, create plan, subscribe, mint pass
- [x] Exporter les ABIs (`forge inspect FlowwTip abi > abis/FlowwTip.json`)

---

## Phase 2 — Backend (Semaine 3–4)

### 2.1 Setup projet

- [x] `mkdir backend && cd backend && bun init`
- [x] Installer les deps :
  ```
  bun add hono drizzle-orm postgres viem dotenv
  bun add -d drizzle-kit typescript @types/node
  ```
- [x] Configurer `tsconfig.json` (strict, paths)
- [x] Créer `src/index.ts` — entry point Hono
- [x] Configurer le `.env` (DATABASE_URL, RPC_URL, contract addresses)
- [x] Vérifier que `bun run src/index.ts` démarre le serveur

### 2.2 Base de données — Schema Drizzle

- [x] Créer `src/db/schema.ts` :
  - [x] Table `creators` (id/wallet, username, displayName, bio, avatarIpfsHash, createdAt)
  - [x] Table `posts` (id, creatorId, title, contentIpfsHash, isExclusive, requiredPlanId, requiredPassId, publishedAt)
  - [x] Table `tips` (id/txHash, fromAddress, creatorAddress, token, amount, fee, message, blockTimestamp)
  - [x] Table `subscriptions` (id, subscriberAddress, creatorAddress, planId, nextBillingDate, active)
  - [x] Table `passes_minted` (id/txHash, passId, buyerAddress, blockTimestamp)
- [x] Créer `src/db/index.ts` — connection pool
- [x] Configurer `drizzle.config.ts`
- [x] Provisionner une DB PostgreSQL (Docker Compose local)
- [x] `bunx drizzle-kit push` — appliquer le schema
- [x] Vérifier les tables créées

### 2.3 Auth — Vérification signature wallet

- [x] Créer `src/middleware/auth.ts`
  - [x] Le frontend envoie un header `Authorization: Signature <sig>` + `X-Message: <message>`
  - [x] Le backend vérifie avec `viem.recoverMessageAddress()` → extrait l'adresse wallet
  - [x] Injecte `c.set("walletAddress", address)` dans le contexte Hono
- [ ] Tester auth avec un script end-to-end

### 2.4 API REST — Routes

- [x] `GET /api/creators/:username` — profil créateur (public)
- [x] `POST /api/creators/me` — créer/update profil (auth required)
- [x] `GET /api/creators/:username/posts` — liste des posts
  - [x] Posts publics : retournés à tout le monde
  - [x] Posts exclusifs : retourner `{ locked: true }` si pas d'accès
- [x] `GET /api/posts/:id` — détail post (vérifie accès onchain)
- [x] `POST /api/posts` — créer un post (auth required)
  - [x] Champ `isExclusive`, `requiredPlanId` ou `requiredPassId`
- [x] `GET /api/dashboard/stats` — revenus totaux, nb tips, nb abonnés (auth required)
- [x] `GET /api/dashboard/tips` — liste tips reçus, paginée (auth required)
- [x] `GET /api/dashboard/subscribers` — liste abonnés actifs (auth required)

### 2.5 Vérification accès onchain

- [x] Créer `src/services/gate.ts`
  - [x] `checkAccess(userAddress, creatorAddress, passId?, planId?)` → bool
  - [x] Appel `readContract` sur FlowwGate.hasAccess() ou FlowwSubscription.isActive()
- [x] Créer `src/lib/viem.ts` — client public Abstract
- [x] Cache in-memory : cacher le résultat 60s pour éviter les appels RPC répétés

### 2.6 Upload IPFS

- [x] Créer `src/services/ipfs.ts`
  - [x] `uploadFile(file)` → retourne le CID
  - [x] `uploadJSON(metadata)` → retourne le CID (pour les metadata NFT)
- [x] Route `POST /api/upload` — upload fichier, retourne le hash IPFS (auth required)

### 2.7 Indexer onchain

- [x] Créer `src/services/indexer.ts`
  - [x] `startIndexer()` — lancé au démarrage du serveur
  - [x] Watch event `Tipped` sur FlowwTip → insert dans table `tips`
  - [x] Watch event `Subscribed` sur FlowwSubscription → insert dans table `subscriptions`
  - [x] Watch event `Renewed` → update `nextBillingDate`
  - [x] Watch event `Cancelled` → set `active = false`
  - [x] Watch event `PassMinted` sur FlowwGate → insert dans table `passes_minted`
- [x] Mécanisme de backfill au démarrage :
  - [x] Stocker le dernier block indexé dans la DB (table `indexer_state`)
  - [x] Au redémarrage, récupérer les events depuis le dernier block indexé
- [ ] Gestion d'erreur et reconnexion automatique

### 2.8 Tests & deploy

- [ ] Tests API avec `bun test` (au minimum : CRUD créateurs, accès gated)
- [x] Dockeriser le backend (`Dockerfile` Bun)
- [x] Docker Compose (PostgreSQL + backend) fonctionnel en dev
- [x] Vérifier que l'indexer tourne et capte les events testnet

---

## Phase 3 — Frontend Next.js (Semaine 5–6)

### 3.1 Setup projet

- [x] `npx create-next-app@latest frontend --typescript --tailwind --app`
- [x] Installer les deps :
  ```
  npm install @abstract-foundation/agw-react wagmi viem @tanstack/react-query zustand
  ```
- [x] Configurer `lib/wagmi.ts` (config Wagmi + AGW connector + `ssr: true`)
- [x] Créer `providers.tsx` (WagmiProvider + QueryClientProvider, `"use client"`)
- [x] Brancher les providers dans `app/layout.tsx`
- [x] Configurer les variables d'env : `NEXT_PUBLIC_USDC_ADDRESS`, `NEXT_PUBLIC_TIP_CONTRACT`, etc.
- [x] Créer `lib/contracts.ts` — ABIs + adresses des contrats
- [x] Vérifier que `npm run dev` démarre sans erreur

### 3.2 Landing page

- [x] `app/page.tsx` — page d'accueil
  - [x] Hero : titre + tagline + CTA "Create your page"
  - [x] Section : comment ça marche (3 étapes)
  - [x] Section : avantages vs Patreon/Ko-fi (fees, vitesse, pas de censure)
  - [x] Footer avec liens
- [x] Design responsive (mobile-first)
- [x] Metadata SEO (title, description, OG image)

### 3.3 Page créateur (SSR)

- [x] `app/[username]/page.tsx` — Server Component
  - [x] Fetch profil créateur depuis l'API backend
  - [x] `generateMetadata()` — titre, description, OpenGraph image
  - [x] Afficher : avatar, displayName, bio
  - [x] Afficher la liste des posts (publics en clair, exclusifs avec cadenas)
- [x] `app/[username]/loading.tsx` — skeleton loader
- [x] `app/[username]/not-found.tsx` — 404 créateur inexistant

### 3.4 Composants wallet (Client Components)

- [x] `components/ConnectButton.tsx` — bouton login AGW (email/Google)
  - [x] Affiche l'adresse tronquée si connecté
  - [x] Bouton déconnexion
- [x] `components/TipButton.tsx` — bouton + modal de tip
  - [x] Choix montant (preset $1, $5, $10, custom)
  - [x] Choix token (ETH ou USDC)
  - [x] Champ message optionnel
  - [x] Appel `useTip()` hook
  - [x] État : pending → confirming → success
  - [ ] Approve USDC si premier tip ERC20
- [x] `components/SubscribeButton.tsx` — abonnement
  - [ ] Affiche les tiers disponibles (fetch depuis le contrat ou API)
  - [x] Sélection tier → appel `useSubscribe()` hook
  - [ ] Approve USDC → subscribe en une transaction
  - [x] État : pending → confirming → success
- [ ] `components/PassCard.tsx` — mint un NFT pass
  - [ ] Affiche prix, supply restante, description
  - [ ] Bouton mint → appel contrat FlowwGate.mintPass()

### 3.5 Hooks blockchain

- [x] `hooks/useTip.ts` — tip ETH ou USDC via FlowwTip
- [x] `hooks/useSubscribe.ts` — subscribe via FlowwSubscription
- [ ] `hooks/useMintPass.ts` — mint via FlowwGate
- [ ] `hooks/useAccess.ts` — vérifier si le user a accès (appel API ou readContract)
- [x] `hooks/useApproveUSDC.ts` — approve le contrat à dépenser les USDC du user

### 3.6 Post exclusif — affichage gated

- [x] `components/PostCard.tsx`
  - [x] Si public → afficher le contenu
  - [x] Si exclusif + pas accès → cadenas + CTA "Subscribe to unlock"
  - [ ] Si exclusif + accès → fetch le contenu IPFS et afficher
- [ ] Supporter texte, images, vidéos embed

### 3.7 Dashboard créateur

- [x] `app/dashboard/page.tsx` — Client Component (auth required)
  - [x] Guard : rediriger si pas connecté
- [x] `app/dashboard/layout.tsx` — force-dynamic
- [x] Vue "Overview" :
  - [x] Revenus totaux (ETH + USDC)
  - [x] Nombre d'abonnés actifs
  - [x] Nombre de tips ce mois
  - [ ] Graphique revenus (30 derniers jours)
- [ ] Vue "Posts" :
  - [ ] Liste des posts publiés
  - [ ] Bouton "New post" → formulaire création
  - [ ] Formulaire : titre, contenu, toggle exclusif, sélection tier/pass requis
  - [ ] Upload média via Pinata
- [ ] Vue "Settings" :
  - [ ] Éditer profil (displayName, bio, avatar)
  - [ ] Gérer les plans d'abonnement (créer, activer/désactiver)
  - [ ] Gérer les NFT passes (créer, voir supply)

### 3.8 Gasless (Paymaster)

- [ ] Intégrer le Paymaster Abstract pour que les fans ne paient pas les gas fees
- [ ] Configurer dans la config Wagmi ou au niveau du connector AGW
- [ ] Tester : un nouveau user peut tipper sans avoir d'ETH pour le gas

### 3.9 Deploy

- [x] Configurer `next.config.ts` (webpack fallbacks, extensionAlias)
- [ ] Déployer sur Vercel
- [ ] Configurer le domaine `floww.xyz` (ou temporaire Vercel)
- [ ] Vérifier le SSR des pages créateurs
- [ ] Vérifier les OG cards (Twitter Card Validator, Facebook Debugger)

---

## Phase 4 — Intégration & polish (Semaine 7)

### 4.1 Widget embed

- [x] Créer `public/embed.js` — script injectable
  - [x] Lit `data-floww-creator` sur le div
  - [x] Injecte une iframe pointant vers `/embed/[creatorAddress]`
- [x] Créer `app/embed/[address]/page.tsx` — version minimale (bouton tip uniquement)
- [ ] Tester l'embed sur une page HTML externe

### 4.2 Onboarding créateur

- [x] `app/onboarding/page.tsx` — flow en 3 étapes :
  - [x] Étape 1 : Connexion wallet (AGW)
  - [x] Étape 2 : Choisir un username + remplir profil (displayName, bio, avatar)
  - [x] Étape 3 : Redirection vers page créateur + dashboard
- [x] Redirection vers le dashboard après onboarding

### 4.3 Notifications email

- [x] `bun add resend` (backend)
- [x] Créer `src/services/notifications.ts`
  - [x] Template : nouveau tip reçu
  - [x] Template : nouvel abonné
  - [x] Template : abonnement renouvelé
- [x] Champ `email` optionnel déjà dans la table `creators`
- [x] Envoyer les notifs à chaque event indexé (si email renseigné)

### 4.4 Job de renouvellement

- [x] Créer `src/jobs/renewal.ts`
  - [x] Cron toutes les heures : cherche les abos avec `nextBillingDate < now` et `active = true`
  - [x] Appelle `FlowwSubscription.renew()` pour chaque abo dû via keeper wallet
  - [x] Simulate avant d'exécuter pour éviter les revert
- [ ] Configurer le wallet keeper avec des fonds ETH testnet
- [x] Gérer les échecs (USDC insuffisant → marquer l'abo comme `failed`)

### 4.5 QA & fix

- [ ] Test end-to-end : créer un profil → publier un post gated → un fan s'abonne → accède au post
- [ ] Test tip ETH + USDC depuis un nouveau compte (gasless)
- [ ] Test mint NFT pass → accès au contenu
- [ ] Test widget embed sur un site externe
- [ ] Vérifier mobile (responsive)
- [ ] Fix les bugs trouvés

---

## Phase 5 — Mainnet & launch (Semaine 8)

### 5.1 Audit smart contracts

- [ ] Relire chaque contrat ligne par ligne
- [ ] Vérifier : reentrancy, overflow, access control, edge cases
- [ ] Confirmer `SafeERC20` partout (pas de `transferFrom` brut)
- [ ] Confirmer `.call{value}` partout (pas de `.transfer()`)
- [ ] Peer review (ou audit pro si budget)
- [ ] Fixer les findings

### 5.2 Deploy mainnet

- [ ] Créer un wallet de déploiement mainnet (séparé du testnet)
- [ ] Configurer le treasury wallet (idéalement multisig Safe)
- [ ] Deploy FlowwTip sur Abstract mainnet
- [ ] Deploy FlowwSubscription sur Abstract mainnet
- [ ] Deploy FlowwGate sur Abstract mainnet
- [ ] Vérifier les 3 contrats sur Abscan mainnet
- [ ] Sauvegarder les adresses dans `contracts/deployments/mainnet.json`

### 5.3 Basculer l'app en mainnet

- [ ] Mettre à jour les adresses de contrats dans le `.env` du frontend
- [ ] Mettre à jour le RPC + adresses dans le `.env` du backend
- [ ] Mettre à jour l'indexer pour pointer sur les contrats mainnet
- [ ] Redéployer le backend (Railway/Fly.io)
- [ ] Redéployer le frontend (Vercel)
- [ ] Test smoke : tip réel de $1 en USDC

### 5.4 Distribution

- [ ] Soumettre Floww sur Abstract Portal (abs.xyz/discover)
- [ ] Postuler au Builder-in-Residence Program (abs.xyz/builder-incubator)
- [ ] Créer un compte Twitter/X @floww_xyz
- [ ] Rédiger le thread de lancement
- [ ] Préparer 2–3 pages créateurs de démo (avec du contenu)

---

## Phase 6 — Growth (Semaine 9+)

### 6.1 Acquisition créateurs

- [ ] Identifier 50 créateurs crypto-natifs sur Abstract Portal
- [ ] DM les 20 plus actifs (Twitter/X, Discord)
- [ ] Proposer de setup leur page gratuitement
- [ ] Créer un guide "Getting started on Floww" (page ou blog post)

### 6.2 V2 — Features additionnelles

- [ ] Analytics avancées (revenus par tier, churn rate, LTV)
- [ ] Goals publics ("500€ = nouvel épisode" — barre de progression onchain)
- [ ] Intégration Abstract Live (bouton Floww dans l'interface de stream)
- [ ] Domaine custom (`moncreateur.com` → page Floww)
- [ ] Plan Pro créateur ($9/mois) — analytics avancées + priorité support
- [ ] Notifications push (web push API)
- [ ] Multi-langue (EN/FR minimum)

### 6.3 Infra & scaling

- [ ] Monitoring (Sentry pour les erreurs, Grafana pour les métriques)
- [ ] Rate limiting sur l'API
- [ ] CDN pour les assets IPFS (cache Cloudflare)
- [ ] Backup DB automatique
- [ ] CI/CD : tests automatiques + deploy on push

---

## Récapitulatif

| Phase | Durée | Deliverable |
|---|---|---|
| 0 — Setup | 1 jour | Monorepo, wallet dev, faucet |
| 1 — Contracts | 2 semaines | 3 contrats déployés + vérifiés sur testnet |
| 2 — Backend | 2 semaines | API REST + indexer + DB, déployé staging |
| 3 — Frontend | 2 semaines | App Next.js fonctionnelle, déployée Vercel |
| 4 — Intégration | 1 semaine | Widget, onboarding, notifs, QA |
| 5 — Mainnet | 1 semaine | Live sur Abstract mainnet + soumis au Portal |
| 6 — Growth | Continu | Acquisition créateurs + V2 features |