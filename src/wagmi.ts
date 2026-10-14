import { createConfig, http, injected } from 'wagmi'
import {
  arbitrum,
  avalanche,
  base,
  bsc,
  gnosis,
  linea,
  mainnet,
  optimism,
  polygon,
  scroll,
  sonic,
  unichain,
  worldchain,
} from 'wagmi/chains'

/**
 * Chains sur lesquelles l'app sait signer un claim.
 * Les autres chains renvoyées par l'API restent affichées, avec un lien vers app.merkl.xyz.
 */
export const supportedChains = [
  mainnet,
  base,
  arbitrum,
  optimism,
  polygon,
  bsc,
  gnosis,
  linea,
  sonic,
  unichain,
  worldchain,
  avalanche,
  scroll,
] as const

export const config = createConfig({
  chains: supportedChains,
  connectors: [injected()],
  transports: Object.fromEntries(supportedChains.map((c) => [c.id, http()])) as Record<
    (typeof supportedChains)[number]['id'],
    ReturnType<typeof http>
  >,
})

export type SupportedChainId = (typeof supportedChains)[number]['id']

export const isSupportedChain = (id: number): id is SupportedChainId => supportedChains.some((c) => c.id === id)

export const explorerTxUrl = (chainId: number, hash: string) => {
  const chain = supportedChains.find((c) => c.id === chainId)
  return chain?.blockExplorers?.default.url ? `${chain.blockExplorers.default.url}/tx/${hash}` : undefined
}

declare module 'wagmi' {
  interface Register {
    config: typeof config
  }
}
