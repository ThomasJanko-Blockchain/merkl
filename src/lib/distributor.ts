import type { Address } from 'viem'

/**
 * Contrat Distributor de Merkl : stocke la Merkle root et paie les claims.
 * Même adresse sur la grande majorité des chains EVM.
 * Source : https://developers.merkl.xyz/resources/chains-and-contracts
 */
export const DEFAULT_DISTRIBUTOR: Address = '0x3Ef3D8bA38EBe18DB133cEc108f4D14CE00Dd9Ae'

/** Exceptions éventuelles (à compléter depuis la page Chains & Contracts). */
const DISTRIBUTOR_OVERRIDES: Record<number, Address> = {}

export const distributorFor = (chainId: number): Address => DISTRIBUTOR_OVERRIDES[chainId] ?? DEFAULT_DISTRIBUTOR

/** Extrait minimal de l'ABI : seulement ce dont l'app a besoin. */
export const distributorAbi = [
  {
    type: 'function',
    name: 'claim',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'users', type: 'address[]' },
      { name: 'tokens', type: 'address[]' },
      { name: 'amounts', type: 'uint256[]' },
      { name: 'proofs', type: 'bytes32[][]' },
    ],
    outputs: [],
  },
  {
    type: 'function',
    name: 'getMerkleRoot',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'bytes32' }],
  },
] as const
