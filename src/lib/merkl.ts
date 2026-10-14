import { formatUnits, type Address, type Hex } from 'viem'

/**
 * Couche d'accès à l'API Merkl v4.
 * Doc : https://developers.merkl.xyz/integrate-merkl/user-rewards
 *
 * Vocabulaire Merkl (important pour l'entretien) :
 * - amount  : montant CUMULÉ crédité dans la Merkle root actuelle (inclut ce qui a déjà été claim)
 * - claimed : montant CUMULÉ déjà retiré onchain
 * - pending : gagné mais pas encore dans une root (recalculé ~toutes les 2h), NON réclamable
 * - proofs  : preuve Merkle à passer telle quelle au contrat Distributor
 * => réclamable = amount - claimed
 */

export const MERKL_API = 'https://api.merkl.xyz/v4'

export interface MerklToken {
  address: Address
  chainId: number
  symbol: string
  name: string
  decimals: number
  icon?: string
  price?: number
  verified?: boolean
}

export interface MerklReward {
  token: MerklToken
  amount: string
  claimed: string
  pending: string
  proofs: Hex[]
}

export interface MerklChain {
  id: number
  name: string
  icon?: string
  liveCampaigns?: number
  endOfDisputePeriod?: number
}

export interface ChainRewards {
  chain: MerklChain
  rewards: MerklReward[]
}

export interface RewardStats {
  totalEarnedUSD: string
  pendingUSD: string
  claimableUSD: string
}

async function getJson<T>(url: string, signal?: AbortSignal): Promise<T> {
  const res = await fetch(url, { signal })
  if (!res.ok) throw new Error(`API Merkl : ${res.status} ${res.statusText}`)
  return res.json() as Promise<T>
}

/** Endpoint recommandé par Merkl pour construire un claim (léger, sans breakdowns). */
export function fetchRewardsSummary(
  user: Address,
  opts: { reloadChainId?: number; signal?: AbortSignal } = {},
): Promise<ChainRewards[]> {
  const qs = opts.reloadChainId ? `?reloadChainId=${opts.reloadChainId}` : ''
  return getJson(`${MERKL_API}/users/${user}/rewards/summary${qs}`, opts.signal)
}

export function fetchRewardStats(user: Address, signal?: AbortSignal): Promise<RewardStats> {
  return getJson(`${MERKL_API}/users/${user}/rewards/stats`, signal)
}

/* ------------------------------------------------------------------ */
/* Logique métier pure (testée unitairement)                           */
/* ------------------------------------------------------------------ */

export const claimable = (r: MerklReward): bigint => {
  const diff = BigInt(r.amount) - BigInt(r.claimed)
  return diff > 0n ? diff : 0n
}

export const toUnits = (raw: bigint | string, decimals: number): number =>
  Number(formatUnits(typeof raw === 'string' ? BigInt(raw) : raw, decimals))

export const toUsd = (raw: bigint | string, token: MerklToken): number =>
  toUnits(raw, token.decimals) * (token.price ?? 0)

export interface ChainView {
  chain: MerklChain
  rewards: MerklReward[]
  claimableUSD: number
  pendingUSD: number
  claimedUSD: number
  claimableCount: number
}

/**
 * Prépare les données d'affichage : USD par chain, tri par montant réclamable,
 * et on masque les chains où il ne reste rien (ni réclamable, ni pending).
 */
export function toChainViews(data: ChainRewards[], { hideEmpty = true } = {}): ChainView[] {
  return data
    .map((c) => {
      let claimableUSD = 0
      let pendingUSD = 0
      let claimedUSD = 0
      let claimableCount = 0
      for (const r of c.rewards) {
        const cl = claimable(r)
        if (cl > 0n) claimableCount++
        claimableUSD += toUsd(cl, r.token)
        pendingUSD += toUsd(r.pending, r.token)
        claimedUSD += toUsd(r.claimed, r.token)
      }
      return { chain: c.chain, rewards: c.rewards, claimableUSD, pendingUSD, claimedUSD, claimableCount }
    })
    .filter((v) => !hideEmpty || v.claimableCount > 0 || v.pendingUSD > 0)
    .sort((a, b) => b.claimableUSD - a.claimableUSD || b.pendingUSD - a.pendingUSD)
}

export interface ClaimArgs {
  users: Address[]
  tokens: Address[]
  amounts: bigint[]
  proofs: Hex[][]
}

/**
 * Construit les arguments de Distributor.claim() pour tous les tokens réclamables d'une chain.
 * Piège classique : on passe `amount` (CUMULÉ) et pas `amount - claimed`.
 * Le contrat garde lui-même la trace de ce qui a déjà été versé et ne paie que la différence.
 */
export function buildClaimArgs(user: Address, rewards: MerklReward[]): ClaimArgs {
  const args: ClaimArgs = { users: [], tokens: [], amounts: [], proofs: [] }
  for (const r of rewards) {
    if (claimable(r) === 0n || r.proofs.length === 0) continue
    args.users.push(user)
    args.tokens.push(r.token.address)
    args.amounts.push(BigInt(r.amount))
    args.proofs.push(r.proofs)
  }
  return args
}

export const formatUsd = (n: number): string =>
  n === 0
    ? '0 $'
    : n < 0.01
      ? '< 0,01 $'
      : `${new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n)} $`

export const formatAmount = (n: number): string =>
  n === 0 ? '0' : n < 0.0001 ? '< 0,0001' : new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 4 }).format(n)
