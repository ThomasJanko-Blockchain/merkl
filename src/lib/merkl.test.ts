import { describe, expect, it } from 'vitest'
import { buildClaimArgs, claimable, toChainViews, toUsd } from './merkl'
import { summaryFixture } from './__fixtures__/summary'

const USER = '0x4F2BF7469Bc38d1aE779b1F4affC588f35E60973' as const
const [polygon, base, arbitrum] = summaryFixture
const [morpho, usdc] = base!.rewards

describe('claimable', () => {
  it('vaut amount - claimed', () => {
    expect(claimable(morpho!)).toBe(100n * 10n ** 18n)
  })

  it('vaut 0 quand tout a été claim', () => {
    expect(claimable(polygon!.rewards[0]!)).toBe(0n)
  })

  it("n'inclut jamais le pending", () => {
    expect(claimable(arbitrum!.rewards[0]!)).toBe(0n)
  })
})

describe('toUsd', () => {
  it('respecte les décimales du token (18 vs 6)', () => {
    expect(toUsd(claimable(morpho!), morpho!.token)).toBe(200)
    expect(toUsd(claimable(usdc!), usdc!.token)).toBe(12.5)
  })
})

describe('toChainViews', () => {
  const views = toChainViews(summaryFixture)

  it('masque les chains entièrement claim', () => {
    expect(views.map((v) => v.chain.id)).not.toContain(137)
  })

  it('garde les chains avec seulement du pending', () => {
    const arb = views.find((v) => v.chain.id === 42161)
    expect(arb?.claimableUSD).toBe(0)
    expect(arb?.pendingUSD).toBe(10)
  })

  it('trie par montant réclamable décroissant', () => {
    expect(views[0]!.chain.id).toBe(8453)
    expect(views[0]!.claimableUSD).toBe(212.5)
    expect(views[0]!.claimableCount).toBe(2)
  })
})

describe('buildClaimArgs', () => {
  it('passe le montant CUMULÉ (amount), pas amount - claimed', () => {
    const args = buildClaimArgs(USER, base!.rewards)
    expect(args.amounts[0]).toBe(150n * 10n ** 18n)
  })

  it('aligne users / tokens / amounts / proofs', () => {
    const args = buildClaimArgs(USER, base!.rewards)
    expect(args.users).toEqual([USER, USER])
    expect(args.tokens).toEqual([morpho!.token.address, usdc!.token.address])
    expect(args.proofs).toHaveLength(2)
  })

  it('ignore les tokens sans rien à réclamer ou sans preuve', () => {
    expect(buildClaimArgs(USER, polygon!.rewards).tokens).toHaveLength(0)
    expect(buildClaimArgs(USER, arbitrum!.rewards).tokens).toHaveLength(0)
  })
})
