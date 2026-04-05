export const CONTRACTS = {
  tip: process.env.NEXT_PUBLIC_TIP_CONTRACT as `0x${string}`,
  subscription: process.env.NEXT_PUBLIC_SUBSCRIPTION_CONTRACT as `0x${string}`,
  gate: process.env.NEXT_PUBLIC_GATE_CONTRACT as `0x${string}`,
  usdc: process.env.NEXT_PUBLIC_USDC_ADDRESS as `0x${string}`,
};

export const TIP_ABI = [
  {
    type: "function",
    name: "tipETH",
    stateMutability: "payable",
    inputs: [
      { name: "creator", type: "address" },
      { name: "message", type: "string" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "tipERC20",
    stateMutability: "nonpayable",
    inputs: [
      { name: "creator", type: "address" },
      { name: "token", type: "address" },
      { name: "amount", type: "uint256" },
      { name: "message", type: "string" },
    ],
    outputs: [],
  },
] as const;

export const SUBSCRIPTION_ABI = [
  {
    type: "function",
    name: "subscribe",
    stateMutability: "nonpayable",
    inputs: [
      { name: "creator", type: "address" },
      { name: "planId", type: "uint256" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "cancel",
    stateMutability: "nonpayable",
    inputs: [{ name: "creator", type: "address" }],
    outputs: [],
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
] as const;

export const GATE_ABI = [
  {
    type: "function",
    name: "mintPass",
    stateMutability: "payable",
    inputs: [{ name: "passId", type: "uint256" }],
    outputs: [],
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

export const ERC20_ABI = [
  {
    type: "function",
    name: "approve",
    stateMutability: "nonpayable",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ type: "bool" }],
  },
  {
    type: "function",
    name: "allowance",
    stateMutability: "view",
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
    ],
    outputs: [{ type: "uint256" }],
  },
] as const;
