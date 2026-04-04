# Floww — Patreon/Ko-fi killer onchain
> Plateforme de monétisation créateur sur Abstract Chain (L2 Ethereum ZK-rollup)

---

## Table des matières

1. [Vision & Contexte](#1-vision--contexte)
2. [Analyse de marché](#2-analyse-de-marché)
3. [Fonctionnalités](#3-fonctionnalités)
4. [Architecture technique](#4-architecture-technique)
5. [Smart contracts](#5-smart-contracts)
6. [Backend](#6-backend)
7. [Frontend](#7-frontend)
8. [Business model](#8-business-model)
9. [Plan de développement](#9-plan-de-développement)
10. [Monétisation Abstract](#10-monétisation-abstract)
11. [Risques](#11-risques)
12. [Ressources & liens utiles](#12-ressources--liens-utiles)

---

## 1. Vision & Contexte

### Le problème

Les plateformes de monétisation créateur centralisées (Patreon, Ko-fi, Buy Me a Coffee) souffrent de trois problèmes structurels :

- **Fees élevées** : Patreon prend 8–12%, Ko-fi 5–15% sur chaque transaction
- **Paiements internationaux bloqués** : Stripe refuse certains pays, délais de virement de 5–7 jours
- **Censure et coupures** : des créateurs se font couper sans préavis (contenu politique, adulte, crypto...)

### La solution : Floww

Floww est une plateforme de monétisation créateur construite sur **Abstract Chain** (L2 Ethereum ZK-rollup). Elle permet à n'importe quel créateur de contenu de recevoir des tips, des abonnements récurrents et de vendre du contenu exclusif via des NFT passes — le tout en 2 clics, sans que les fans aient besoin de savoir qu'ils utilisent la blockchain.

### Pourquoi Abstract et pas une autre chain ?

Abstract est un L2 Ethereum ZK-rollup créé par Igloo Inc. (Pudgy Penguins) avec trois avantages critiques pour ce use case :

1. **Abstract Global Wallet (AGW)** : login via email ou Google, pas de seed phrase, wallet créé automatiquement → zéro friction pour les fans
2. **Paymasters** : les transactions peuvent être gasless pour l'utilisateur final → l'app paie les gas fees
3. **Panoramic Governance** : les développeurs d'apps reçoivent des builder rewards mensuels basés sur le volume de transactions générées

---

## 2. Analyse de marché

### Concurrents existants

| Plateforme | Chain | Fee | Points faibles |
|---|---|---|---|
| Ko-fi | Web2 (Stripe) | 5–15% | Paiements internationaux bloqués, coupures |
| Patreon | Web2 | 8–12% | Idem + lenteur des virements |
| Tippikl | Avalanche / Base | N/A | Pas sur Abstract, limité aux tips X |
| tip.md | Multi-chain | N/A | Très basique, pas d'abonnements |
| Tipcoin | Twitter natif | N/A | Token spéculatif, pas de contenu gated |

### Gap identifié

**Aucune plateforme ne propose sur Abstract** :
- Abonnements récurrents onchain (USDC pull payments)
- Contenu exclusif NFT-gated
- Tips cross-plateforme (pas limité aux streamers Abstract)
- Dashboard analytics créateur
- Widget embed pour sites externes

### Taille de marché

- Ko-fi : 700k+ créateurs actifs
- Patreon : 8M+ créateurs, $3.5B GMV/an
- Cible initiale : les 50k+ créateurs crypto-natifs déjà sur Abstract Portal

---

## 3. Fonctionnalités

### MVP (Semaine 1–8)

#### Pour les créateurs

- **Page publique** : URL personnalisée `floww.xyz/username`
- **Tips one-shot** : les fans envoient n'importe quel montant en ETH ou USDC
- **Abonnements** : tiers mensuels configurables ($3 / $10 / $30)
- **Posts exclusifs** : contenu texte/image/vidéo réservé aux abonnés
- **NFT passes** : ERC-1155 mint pour accéder à des tiers à vie
- **Dashboard** : revenus, nombre d'abonnés, analytics de base
- **Widget embed** : bouton "Support me on Floww" pour sites externes

#### Pour les fans

- **Login magique** : email ou Google via AGW, pas de wallet requis
- **Transactions gasless** : le Paymaster couvre les gas fees
- **Historique** : toutes les transactions visibles onchain
- **NFT passes** : revendables sur Magic Eden (Abstract)

### V2 (Mois 4–6)

- Analytics avancées (revenus par tier, churn, LTV)
- Notifications email (nouveau tip, renouvellement, nouvel abonné)
- Goals / objectifs publics (ex: "500€ = nouvel épisode")
- Intégration Abstract Live (tips pendant les streams)
- Plan Pro créateur ($9/mois) pour les analytics avancées

---

## 4. Architecture technique

```
┌─────────────────────────────────────────────────────┐
│          Frontend (Next.js App Router + AGW SDK)     │
│   Creator page (SSR) · Fan dashboard · Embed widget  │
└──────────────────────┬──────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────┐
│              Abstract Chain (ZK L2)                  │
│   AGW · Gasless via Paymaster · Low fees             │
└──────────────────────┬──────────────────────────────┘
                       │
       ┌───────────────┼───────────────┐
       │               │               │
┌──────▼──────┐ ┌──────▼──────┐ ┌─────▼──────┐
│ FlowwTip    │ │ FlowwSub    │ │ FlowwGate  │
│ .sol        │ │ scription   │ │ .sol       │
│ Tips        │ │ .sol        │ │ ERC-1155   │
│ one-shot    │ │ USDC pull   │ │ NFT passes │
└──────┬──────┘ └──────┬──────┘ └─────┬──────┘
       └───────────────┼───────────────┘
                       │
┌──────────────────────▼──────────────────────────────┐
│              Backend (Bun + Hono)                    │
│   Onchain indexer · Content API · Notif service      │
└──────┬────────────────┬────────────────┬────────────┘
       │                │                │
┌──────▼──────┐ ┌───────▼──────┐ ┌──────▼──────┐
│ PostgreSQL  │ │ IPFS/Arweave │ │    Redis    │
│ Profils,    │ │ Contenu      │ │ Sessions,   │
│ analytics   │ │ créateurs    │ │ cache accès │
└─────────────┘ └──────────────┘ └─────────────┘
```

---

## 5. Smart contracts

### Stack

- **Langage** : Solidity ^0.8.24
- **Framework** : Foundry (forge, cast, anvil)
- **Tests** : Forge tests + fuzzing
- **Déploiement** : Abstract testnet d'abord, puis mainnet

### FlowwTip.sol

Contrat pour les tips one-shot ETH et USDC.

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract FlowwTip is Ownable, ReentrancyGuard {
    address public treasury;
    uint256 public feeBps = 250; // 2.5%

    event Tipped(
        address indexed from,
        address indexed creator,
        address token,
        uint256 amount,
        uint256 fee,
        string message
    );

    constructor(address _treasury) Ownable(msg.sender) {
        treasury = _treasury;
    }

    /// @notice Tip un créateur en ETH
    function tipETH(
        address payable creator,
        string calldata message
    ) external payable nonReentrant {
        require(msg.value > 0, "Amount must be > 0");
        uint256 fee = (msg.value * feeBps) / 10000;
        uint256 net = msg.value - fee;

        (bool sentCreator, ) = creator.call{value: net}("");
        require(sentCreator, "Transfer to creator failed");

        (bool sentTreasury, ) = payable(treasury).call{value: fee}("");
        require(sentTreasury, "Transfer to treasury failed");

        emit Tipped(msg.sender, creator, address(0), msg.value, fee, message);
    }

    /// @notice Tip un créateur en USDC (ou autre ERC-20)
    function tipERC20(
        address creator,
        address token,
        uint256 amount,
        string calldata message
    ) external nonReentrant {
        require(amount > 0, "Amount must be > 0");
        uint256 fee = (amount * feeBps) / 10000;
        uint256 net = amount - fee;

        IERC20(token).transferFrom(msg.sender, creator, net);
        IERC20(token).transferFrom(msg.sender, treasury, fee);

        emit Tipped(msg.sender, creator, token, amount, fee, message);
    }

    function setFeeBps(uint256 _feeBps) external onlyOwner {
        require(_feeBps <= 1000, "Max 10%");
        feeBps = _feeBps;
    }

    function setTreasury(address _treasury) external onlyOwner {
        treasury = _treasury;
    }
}
```

### FlowwSubscription.sol

Contrat pour les abonnements récurrents (pull payment USDC).

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract FlowwSubscription is Ownable {
    address public treasury;
    address public usdc;
    uint256 public feeBps = 500; // 5%

    struct Plan {
        uint256 pricePerMonth; // en USDC (6 décimales)
        bool active;
    }

    struct Subscription {
        uint256 planId;
        uint256 nextBillingDate;
        bool active;
    }

    // creatorAddress => planId => Plan
    mapping(address => mapping(uint256 => Plan)) public plans;
    // creatorAddress => planId => nextPlanId counter
    mapping(address => uint256) public planCounter;
    // subscriberAddress => creatorAddress => Subscription
    mapping(address => mapping(address => Subscription)) public subscriptions;

    event PlanCreated(address indexed creator, uint256 planId, uint256 price);
    event Subscribed(address indexed subscriber, address indexed creator, uint256 planId);
    event Renewed(address indexed subscriber, address indexed creator, uint256 amount);
    event Cancelled(address indexed subscriber, address indexed creator);

    constructor(address _usdc, address _treasury) Ownable(msg.sender) {
        usdc = _usdc;
        treasury = _treasury;
    }

    function createPlan(uint256 pricePerMonth) external returns (uint256) {
        uint256 planId = planCounter[msg.sender]++;
        plans[msg.sender][planId] = Plan(pricePerMonth, true);
        emit PlanCreated(msg.sender, planId, pricePerMonth);
        return planId;
    }

    function subscribe(address creator, uint256 planId) external {
        Plan memory plan = plans[creator][planId];
        require(plan.active, "Plan not active");

        _charge(msg.sender, creator, plan.pricePerMonth);

        subscriptions[msg.sender][creator] = Subscription(
            planId,
            block.timestamp + 30 days,
            true
        );

        emit Subscribed(msg.sender, creator, planId);
    }

    function renew(address subscriber, address creator) external {
        Subscription storage sub = subscriptions[subscriber][creator];
        require(sub.active, "No active subscription");
        require(block.timestamp >= sub.nextBillingDate, "Not due yet");

        Plan memory plan = plans[creator][sub.planId];
        _charge(subscriber, creator, plan.pricePerMonth);
        sub.nextBillingDate += 30 days;

        emit Renewed(subscriber, creator, plan.pricePerMonth);
    }

    function cancel(address creator) external {
        subscriptions[msg.sender][creator].active = false;
        emit Cancelled(msg.sender, creator);
    }

    function _charge(address subscriber, address creator, uint256 amount) internal {
        uint256 fee = (amount * feeBps) / 10000;
        uint256 net = amount - fee;
        IERC20(usdc).transferFrom(subscriber, creator, net);
        IERC20(usdc).transferFrom(subscriber, treasury, fee);
    }

    function isActive(address subscriber, address creator) external view returns (bool) {
        Subscription memory sub = subscriptions[subscriber][creator];
        return sub.active && block.timestamp < sub.nextBillingDate;
    }
}
```

### FlowwGate.sol

ERC-1155 pour les NFT passes (accès à vie à un tier).

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract FlowwGate is ERC1155, Ownable {
    address public treasury;
    uint256 public feeBps = 250;

    struct Pass {
        address creator;
        uint256 price;  // en ETH
        uint256 maxSupply;
        uint256 minted;
        string uri;
        bool active;
    }

    mapping(uint256 => Pass) public passes;
    uint256 public passCounter;

    event PassCreated(uint256 indexed passId, address creator, uint256 price);
    event PassMinted(uint256 indexed passId, address buyer);

    constructor(address _treasury) ERC1155("") Ownable(msg.sender) {
        treasury = _treasury;
    }

    function createPass(
        uint256 price,
        uint256 maxSupply,
        string calldata _uri
    ) external returns (uint256) {
        uint256 passId = passCounter++;
        passes[passId] = Pass(
            msg.sender, price, maxSupply, 0, _uri, true
        );
        emit PassCreated(passId, msg.sender, price);
        return passId;
    }

    function mintPass(uint256 passId) external payable {
        Pass storage pass = passes[passId];
        require(pass.active, "Pass not active");
        require(msg.value >= pass.price, "Insufficient payment");
        require(pass.minted < pass.maxSupply, "Sold out");

        uint256 fee = (msg.value * feeBps) / 10000;
        uint256 net = msg.value - fee;

        payable(pass.creator).transfer(net);
        payable(treasury).transfer(fee);

        pass.minted++;
        _mint(msg.sender, passId, 1, "");
        emit PassMinted(passId, msg.sender);
    }

    function uri(uint256 passId) public view override returns (string memory) {
        return passes[passId].uri;
    }

    function hasAccess(address user, uint256 passId) external view returns (bool) {
        return balanceOf(user, passId) > 0;
    }
}
```

### Déploiement

```bash
# Setup
forge init floww-contracts
cd floww-contracts

# Installer les dépendances
forge install OpenZeppelin/openzeppelin-contracts

# Tests
forge test -vvv

# Deploy sur Abstract testnet
forge script script/Deploy.s.sol \
  --rpc-url https://api.testnet.abs.xyz \
  --broadcast \
  --private-key $PRIVATE_KEY

# Verify
forge verify-contract $CONTRACT_ADDRESS FlowwTip \
  --chain-id 11124 \
  --etherscan-api-key $ABSCAN_KEY
```

---

## 6. Backend

### Stack

- **Runtime** : Bun
- **Framework** : Hono (léger, TypeScript natif)
- **ORM** : Drizzle ORM + PostgreSQL
- **Cache** : Redis (Upstash)
- **Storage** : IPFS via Pinata SDK
- **Indexer** : Viem event watching + webhooks
- **Déploiement** : Railway ou Fly.io

### Structure du projet

```
floww-backend/
├── src/
│   ├── index.ts              # Entry point Hono
│   ├── routes/
│   │   ├── creators.ts       # CRUD profils créateurs
│   │   ├── content.ts        # Posts exclusifs
│   │   ├── subscriptions.ts  # Statut abonnements
│   │   └── analytics.ts      # Dashboard data
│   ├── services/
│   │   ├── indexer.ts        # Écoute events onchain
│   │   ├── gate.ts           # Vérif accès NFT
│   │   ├── ipfs.ts           # Upload Pinata
│   │   └── notifications.ts  # Email via Resend
│   ├── db/
│   │   ├── schema.ts         # Drizzle schema
│   │   └── index.ts          # DB connection
│   └── lib/
│       └── viem.ts           # Client Abstract
├── drizzle.config.ts
├── package.json
└── .env
```

### Schema DB principal

```typescript
// src/db/schema.ts
import { pgTable, text, integer, timestamp, boolean, numeric } from "drizzle-orm/pg-core";

export const creators = pgTable("creators", {
  id: text("id").primaryKey(), // wallet address
  username: text("username").unique().notNull(),
  displayName: text("display_name"),
  bio: text("bio"),
  avatarIpfsHash: text("avatar_ipfs_hash"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const posts = pgTable("posts", {
  id: text("id").primaryKey(),
  creatorId: text("creator_id").references(() => creators.id),
  title: text("title").notNull(),
  contentIpfsHash: text("content_ipfs_hash").notNull(),
  isExclusive: boolean("is_exclusive").default(false),
  requiredPlanId: integer("required_plan_id"),
  requiredPassId: integer("required_pass_id"),
  publishedAt: timestamp("published_at").defaultNow(),
});

export const tips = pgTable("tips", {
  id: text("id").primaryKey(), // tx hash
  fromAddress: text("from_address").notNull(),
  creatorAddress: text("creator_address").notNull(),
  token: text("token"), // null = ETH
  amount: numeric("amount").notNull(),
  fee: numeric("fee").notNull(),
  message: text("message"),
  blockTimestamp: timestamp("block_timestamp").notNull(),
});

export const subscriptions = pgTable("subscriptions", {
  id: text("id").primaryKey(),
  subscriberAddress: text("subscriber_address").notNull(),
  creatorAddress: text("creator_address").notNull(),
  planId: integer("plan_id").notNull(),
  nextBillingDate: timestamp("next_billing_date").notNull(),
  active: boolean("active").default(true),
});
```

### Indexer onchain

```typescript
// src/services/indexer.ts
import { createPublicClient, http, parseAbiItem } from "viem";
import { db } from "../db";
import { tips } from "../db/schema";

const client = createPublicClient({
  transport: http("https://api.mainnet.abs.xyz"),
});

const TIP_CONTRACT = "0x..." as `0x${string}`;

export async function startIndexer() {
  // Watch les events Tipped en temps réel
  client.watchEvent({
    address: TIP_CONTRACT,
    event: parseAbiItem(
      "event Tipped(address indexed from, address indexed creator, address token, uint256 amount, uint256 fee, string message)"
    ),
    onLogs: async (logs) => {
      for (const log of logs) {
        const { from, creator, token, amount, fee, message } = log.args;
        await db.insert(tips).values({
          id: log.transactionHash!,
          fromAddress: from!,
          creatorAddress: creator!,
          token: token === "0x0000000000000000000000000000000000000000" ? null : token,
          amount: amount!.toString(),
          fee: fee!.toString(),
          message: message ?? "",
          blockTimestamp: new Date(),
        }).onConflictDoNothing();
      }
    },
  });
}
```

### Vérification accès gated

```typescript
// src/services/gate.ts
import { createPublicClient, http } from "viem";

const GATE_CONTRACT_ABI = [
  {
    name: "hasAccess",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "user", type: "address" },
      { name: "passId", type: "uint256" },
    ],
    outputs: [{ type: "bool" }],
  },
  {
    name: "isActive",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "subscriber", type: "address" },
      { name: "creator", type: "address" },
    ],
    outputs: [{ type: "bool" }],
  },
] as const;

export async function checkAccess(
  userAddress: string,
  creatorAddress: string,
  postPassId?: number,
  postPlanId?: number
): Promise<boolean> {
  if (!postPassId && !postPlanId) return true;

  const client = createPublicClient({
    transport: http("https://api.mainnet.abs.xyz"),
  });

  if (postPassId !== undefined) {
    return client.readContract({
      address: process.env.GATE_CONTRACT as `0x${string}`,
      abi: GATE_CONTRACT_ABI,
      functionName: "hasAccess",
      args: [userAddress as `0x${string}`, BigInt(postPassId)],
    });
  }

  return client.readContract({
    address: process.env.SUB_CONTRACT as `0x${string}`,
    abi: GATE_CONTRACT_ABI,
    functionName: "isActive",
    args: [userAddress as `0x${string}`, creatorAddress as `0x${string}`],
  });
}
```

---

## 7. Frontend

### Stack

- **Framework** : Next.js 15 (App Router) + React 19
- **Wallet** : `@abstract-money/agw-react` + Wagmi v2
- **Styling** : Tailwind CSS v4
- **State** : Zustand + TanStack Query (via Wagmi)
- **Upload** : Pinata SDK (côté client pour les médias)
- **Déploiement** : Vercel

### Pourquoi Next.js ?

- **SEO** : les pages créateurs (`/username`) sont SSR → indexables par Google, preview cards Twitter/X et OpenGraph
- **Routing** : App Router file-based (`app/[username]/page.tsx`) naturel pour les pages créateurs
- **Performance** : Server Components pour le contenu statique, Client Components pour les interactions wallet
- **Deploy** : Vercel zero-config, edge functions pour les API routes légères

### Structure du projet

```
floww-frontend/
├── app/
│   ├── layout.tsx              # Root layout + providers
│   ├── page.tsx                # Landing page
│   ├── [username]/
│   │   ├── page.tsx            # Page publique créateur (SSR)
│   │   └── loading.tsx         # Skeleton loader
│   ├── dashboard/
│   │   ├── page.tsx            # Dashboard créateur
│   │   └── layout.tsx          # Dashboard layout (auth guard)
│   └── fan/
│       └── page.tsx            # Espace fan (abonnements)
├── components/
│   ├── TipButton.tsx           # Bouton tip + modal ("use client")
│   ├── SubscribeButton.tsx     # Abonnement tier ("use client")
│   ├── PostCard.tsx            # Post (gated ou public)
│   ├── PassCard.tsx            # NFT pass à minter ("use client")
│   └── EmbedWidget.tsx         # Version iframe
├── hooks/
│   ├── useTip.ts               # Hook tip ETH/USDC
│   ├── useSubscribe.ts         # Hook abonnement
│   └── useAccess.ts            # Vérif accès contenu
├── lib/
│   ├── wagmi.ts                # Config Abstract + AGW
│   └── contracts.ts            # ABIs + addresses
├── providers.tsx               # WagmiProvider + QueryClientProvider ("use client")
└── next.config.ts
```

### Config AGW

```typescript
// lib/wagmi.ts
import { createConfig, http } from "wagmi";
import { abstract } from "wagmi/chains";
import { abstractWalletConnector } from "@abstract-money/agw-react/connectors";

export const config = createConfig({
  chains: [abstract],
  connectors: [
    abstractWalletConnector(), // Login email/Google/passkey
  ],
  transports: {
    [abstract.id]: http("https://api.mainnet.abs.xyz"),
  },
  ssr: true, // Active le support SSR pour Next.js
});
```

### Providers (Client Component)

```typescript
// providers.tsx
"use client";

import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { config } from "@/lib/wagmi";
import { useState } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}
```

### Page créateur (SSR + SEO)

```typescript
// app/[username]/page.tsx
import { Metadata } from "next";
import { TipButton } from "@/components/TipButton";
import { SubscribeButton } from "@/components/SubscribeButton";
import { PostCard } from "@/components/PostCard";

// Metadata dynamique pour SEO + OG cards
export async function generateMetadata({ params }: { params: { username: string } }): Promise<Metadata> {
  const creator = await fetch(`${process.env.API_URL}/creators/${params.username}`).then(r => r.json());
  return {
    title: `${creator.displayName} — Floww`,
    description: creator.bio,
    openGraph: {
      title: `Support ${creator.displayName} on Floww`,
      description: creator.bio,
      images: [creator.avatarUrl],
    },
  };
}

export default async function CreatorPage({ params }: { params: { username: string } }) {
  const creator = await fetch(`${process.env.API_URL}/creators/${params.username}`).then(r => r.json());
  const posts = await fetch(`${process.env.API_URL}/creators/${params.username}/posts`).then(r => r.json());

  return (
    <main>
      <h1>{creator.displayName}</h1>
      <p>{creator.bio}</p>
      {/* Client Components pour les interactions wallet */}
      <TipButton creatorAddress={creator.id} />
      <SubscribeButton creatorAddress={creator.id} />
      {posts.map((post: any) => (
        <PostCard key={post.id} post={post} />
      ))}
    </main>
  );
}
```

### Hook tip

```typescript
// hooks/useTip.ts
"use client";

import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseEther, parseUnits } from "viem";
import { TIP_CONTRACT_ADDRESS, TIP_ABI } from "@/lib/contracts";

const USDC_ADDRESS = process.env.NEXT_PUBLIC_USDC_ADDRESS as `0x${string}`;

export function useTip() {
  const { writeContractAsync, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const tipETH = async (creatorAddress: string, amountEth: string, message: string) => {
    return writeContractAsync({
      address: TIP_CONTRACT_ADDRESS,
      abi: TIP_ABI,
      functionName: "tipETH",
      args: [creatorAddress as `0x${string}`, message],
      value: parseEther(amountEth),
    });
  };

  const tipUSDC = async (creatorAddress: string, amountUSDC: string, message: string) => {
    return writeContractAsync({
      address: TIP_CONTRACT_ADDRESS,
      abi: TIP_ABI,
      functionName: "tipERC20",
      args: [
        creatorAddress as `0x${string}`,
        USDC_ADDRESS,
        parseUnits(amountUSDC, 6),
        message,
      ],
    });
  };

  return { tipETH, tipUSDC, isPending, isConfirming, isSuccess };
}
```

### Widget embed

Le widget est un simple script JS à inclure dans n'importe quel site :

```html
<!-- Dans la bio du créateur, son blog, etc. -->
<div id="floww-widget" data-creator="0x123...abc"></div>
<script src="https://floww.xyz/embed.js" async></script>
```

Le script injecte une iframe légère avec le bouton de tip préconfiguré.

---

## 8. Business model

### Fees

| Type | Fee Floww | Concurrent |
|---|---|---|
| Tips one-shot | 2.5% | Ko-fi 5–15% |
| Abonnements | 5% | Patreon 8–12% |
| NFT passes | 2.5% sur mint | OpenSea 2.5% |

### Projections de revenus

| Phase | Délai | Créateurs | GMV/mois | Revenue/mois |
|---|---|---|---|---|
| MVP live | M3 | 50 | $20k | ~$600 |
| Traction | M6 | 500 | $200k | ~$6k |
| Scale | M12 | 5 000 | $2M | ~$60k |

### Sources de revenus (par priorité)

1. **Fees transactions** (tips + abonnements + NFT mints) — principal
2. **Builder rewards Abstract** (Panoramic Governance) — bonus mensuel en ETH selon volume
3. **Plan Pro créateur** ($9/mois) — analytics avancées, domaine custom, priorité support
4. **Fee sur NFT passes** (0.001 ETH de minting fee fixe) — futur

### Avantage vs centralisé

- Fees 2–4x moins élevées
- Paiements instantanés dans 180+ pays (pas de Stripe requis)
- Pas de risque de censure ou de coupure de compte
- Creator ownership : les abonnés sont des wallets onchain, transférables

---

## 9. Plan de développement

### Semaine 1–2 : Smart contracts

- [ ] Setup Foundry + Abstract testnet
- [ ] `FlowwTip.sol` avec tests Forge
- [ ] `FlowwSubscription.sol` avec tests Forge
- [ ] `FlowwGate.sol` (ERC-1155) avec tests Forge
- [ ] `FlowwTreasury.sol` (multisig owner)
- [ ] Script de déploiement automatisé
- [ ] Deploy sur Abstract testnet

**Deliverable** : 3 contrats déployés et vérifiés sur Abstract testnet

### Semaine 3–4 : Frontend creator page

- [ ] Setup Next.js 15 (App Router) + Tailwind + AGW SDK
- [ ] Page créateur publique SSR (`/[username]`) avec SEO + OG cards
- [ ] Composant `TipButton` (ETH + USDC)
- [ ] Modal de tip avec AGW login intégré
- [ ] Composant `SubscribeButton` (tier selection)
- [ ] Gasless via Paymaster Abstract
- [ ] Dashboard créateur v0 (revenus, transactions)
- [ ] Deploy Vercel

**Deliverable** : Un fan peut tipper et s'abonner à un créateur

### Semaine 5–6 : Backend + contenu gated

- [ ] Setup Bun + Hono + Drizzle + PostgreSQL
- [ ] API CRUD profils créateurs
- [ ] Indexer events onchain (Tipped, Subscribed, PassMinted)
- [ ] API posts avec vérification accès (NFT gate + subscription check)
- [ ] Upload contenu IPFS via Pinata
- [ ] Dashboard analytics API

**Deliverable** : Un créateur peut publier du contenu exclusif réservé aux abonnés

### Semaine 7–8 : Distribution + mainnet

- [ ] Widget embed JS (iframe)
- [ ] Page d'onboarding créateur (3 étapes)
- [ ] Notifications email (Resend) pour nouveaux tips
- [ ] Audit rapide des contrats (ou peer review)
- [ ] Deploy mainnet Abstract
- [ ] Submit sur Abstract Portal (abs.xyz/discover)
- [ ] Postuler au Builder-in-Residence Program

**Deliverable** : Floww live sur Abstract mainnet, listé sur le portail officiel

### Semaine 9+ : Growth

- [ ] Démarcher 20 créateurs manuellement (DMs Twitter/X)
- [ ] Intégration Abstract Live (tips pendant streams)
- [ ] V2 features (goals, analytics avancées, domaine custom)
- [ ] Plan Pro créateur ($9/mois)

---

## 10. Monétisation Abstract

### Builder Rewards (Panoramic Governance)

Abstract redistribue une partie des frais de séquençage aux développeurs d'apps dont les utilisateurs sont actifs. Les rewards sont distribués **mensuellement** selon le volume de transactions générées par l'app.

**Comment maximiser** :
- Maximiser le volume de transactions (chaque tip = 1 tx, chaque renouvellement d'abo = 1 tx)
- Maintenir un Active Participation Threshold (APT) élevé (transactions régulières > sporadiques)
- Lister l'app sur le portail Abstract pour la découvrabilité

### Builder-in-Residence Program

Programme d'incubation d'Abstract offrant :
- Accès direct à l'équipe dev relations d'Abstract
- Potentiel financement/grant
- Visibilité sur le portail officiel
- Mentors go-to-market

**Comment postuler** : `abs.xyz/builder-incubator`

### Abstract Live Integration

Abstract Live est la plateforme de streaming native d'Abstract. Les streamers peuvent déjà recevoir des tips. En intégrant Floww avec Abstract Live :
- Afficher le bouton Floww directement dans l'interface de stream
- Tips pendant les streams comptent pour les builder rewards Floww
- Distribution organique via les 800k+ users du portail

---

## 11. Risques

### Techniques

| Risque | Probabilité | Mitigation |
|---|---|---|
| Bug dans les smart contracts | Moyen | Tests Foundry exhaustifs, audit peer review avant mainnet |
| Abstract subit une panne | Faible | L2 basé sur Ethereum, haute disponibilité |
| IPFS content unavailability | Moyen | Pinning redondant (Pinata + Arweave backup) |

### Business

| Risque | Probabilité | Mitigation |
|---|---|---|
| Adoption lente des créateurs | Élevé | Onboarding manuel des 20 premiers créateurs, incentives early adopters |
| Abstract ne décolle pas | Moyen | Architecture EVM-compatible → migration possible vers Base/OP en < 2 semaines |
| Concurrent copie l'idée | Moyen | First-mover advantage + intégration native Abstract Live |
| Regulatory (classification USDC) | Faible | USDC est un stablecoin réglementé, pas un security |

### Mitigation principale

L'architecture EVM-compatible garantit que si Abstract ne décolle pas, les contrats peuvent être redéployés sur n'importe quel autre L2 en quelques heures.

---

## 12. Ressources & liens utiles

### Documentation Abstract

- Docs générales : https://docs.abs.xyz
- AGW SDK : https://docs.abs.xyz/abstract-global-wallet/overview
- Paymaster : https://docs.abs.xyz/how-abstract-works/native-account-abstraction/paymasters
- Builder Incubator : https://www.abs.xyz/builder-incubator
- Portal (listing) : https://abs.xyz/discover
- Abstract Live : https://portal.abs.xyz/stream
- RPC mainnet : `https://api.mainnet.abs.xyz`
- RPC testnet : `https://api.testnet.abs.xyz`
- Chain ID mainnet : `2741`
- Chain ID testnet : `11124`

### Abstract SDK

```bash
# Next.js + AGW React SDK
npx create-next-app@latest floww-frontend --typescript --tailwind --app
npm install @abstract-money/agw-react

# Wagmi chain config
npm install viem wagmi @tanstack/react-query
# Abstract chains sont dans wagmi/chains depuis wagmi v2.9+
```

### Outils de dev

- Foundry : https://book.getfoundry.sh
- Viem : https://viem.sh
- Wagmi : https://wagmi.sh
- Drizzle ORM : https://orm.drizzle.team
- Hono : https://hono.dev
- Pinata IPFS : https://pinata.cloud
- Resend (emails) : https://resend.com
- Railway (deploy) : https://railway.app

### Contrats à étudier / forker

- OpenZeppelin ERC-1155 : https://github.com/OpenZeppelin/openzeppelin-contracts
- Superfluid (streams de paiement) : https://github.com/superfluid-finance/protocol-monorepo

### Compétiteurs à surveiller

- https://ko-fi.com
- https://tippikl.com
- https://tip.md
- https://www.patreon.com

---

*Document créé le 2026-04-04. Mis à jour à chaque sprint.*