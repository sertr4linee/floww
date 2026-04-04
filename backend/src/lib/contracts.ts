export const TIP_ADDRESS = process.env.TIP_CONTRACT as `0x${string}`;
export const SUBSCRIPTION_ADDRESS = process.env.SUBSCRIPTION_CONTRACT as `0x${string}`;
export const GATE_ADDRESS = process.env.GATE_CONTRACT as `0x${string}`;

export const TIP_ABI = [
  {
    type: "event",
    name: "Tipped",
    inputs: [
      { name: "from", type: "address", indexed: true },
      { name: "creator", type: "address", indexed: true },
      { name: "token", type: "address", indexed: false },
      { name: "amount", type: "uint256", indexed: false },
      { name: "fee", type: "uint256", indexed: false },
      { name: "message", type: "string", indexed: false },
    ],
  },
] as const;

export const SUBSCRIPTION_ABI = [
  {
    type: "event",
    name: "Subscribed",
    inputs: [
      { name: "subscriber", type: "address", indexed: true },
      { name: "creator", type: "address", indexed: true },
      { name: "planId", type: "uint256", indexed: false },
    ],
  },
  {
    type: "event",
    name: "Renewed",
    inputs: [
      { name: "subscriber", type: "address", indexed: true },
      { name: "creator", type: "address", indexed: true },
      { name: "amount", type: "uint256", indexed: false },
    ],
  },
  {
    type: "event",
    name: "Cancelled",
    inputs: [
      { name: "subscriber", type: "address", indexed: true },
      { name: "creator", type: "address", indexed: true },
    ],
  },
  {
    type: "function",
    name: "isActive",
    stateMutability: "view",
    inputs: [
      { name: "subscriber", type: "address" },
      { name: "creator", type: "address" },
    ],
    outputs: [{ type: "bool" }],
  },
  {
    type: "function",
    name: "renew",
    stateMutability: "nonpayable",
    inputs: [
      { name: "subscriber", type: "address" },
      { name: "creator", type: "address" },
    ],
    outputs: [],
  },
] as const;

export const GATE_ABI = [
  {
    type: "event",
    name: "PassMinted",
    inputs: [
      { name: "passId", type: "uint256", indexed: true },
      { name: "buyer", type: "address", indexed: true },
    ],
  },
  {
    type: "function",
    name: "hasAccess",
    stateMutability: "view",
    inputs: [
      { name: "user", type: "address" },
      { name: "passId", type: "uint256" },
    ],
    outputs: [{ type: "bool" }],
  },
] as const;
