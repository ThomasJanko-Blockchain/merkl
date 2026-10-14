import { useState } from 'react'
import type { Address, Hash } from 'viem'
import { useChainId, useConfig, useSwitchChain, useWriteContract } from 'wagmi'
import { waitForTransactionReceipt } from 'wagmi/actions'
import { distributorAbi, distributorFor } from '../lib/distributor'
import { buildClaimArgs, type MerklReward } from '../lib/merkl'
import { isSupportedChain } from '../wagmi'

export type ClaimStatus =
  | { step: 'idle' }
  | { step: 'switching' }
  | { step: 'signing' }
  | { step: 'confirming'; hash: Hash }
  | { step: 'done'; hash: Hash }
  | { step: 'error'; message: string }

/**
 * Flow complet d'un claim :
 * 1. bascule le wallet sur la bonne chain si besoin
 * 2. signe Distributor.claim(users, tokens, amounts, proofs)
 * 3. attend la confirmation onchain
 * 4. demande à l'API de relire l'état (reloadChainId)
 */
export function useClaim(onClaimed: (chainId: number) => Promise<void>) {
  const config = useConfig()
  const currentChainId = useChainId()
  const { switchChainAsync } = useSwitchChain()
  const { writeContractAsync } = useWriteContract()
  const [status, setStatus] = useState<Record<number, ClaimStatus>>({})

  const set = (chainId: number, s: ClaimStatus) => setStatus((prev) => ({ ...prev, [chainId]: s }))

  async function claim(user: Address, chainId: number, rewards: MerklReward[]) {
    const args = buildClaimArgs(user, rewards)
    if (args.tokens.length === 0) return
    if (!isSupportedChain(chainId)) {
      return set(chainId, { step: 'error', message: "Chain non configurée dans l'app" })
    }

    try {
      if (currentChainId !== chainId) {
        set(chainId, { step: 'switching' })
        await switchChainAsync({ chainId })
      }

      set(chainId, { step: 'signing' })
      const hash = await writeContractAsync({
        chainId,
        address: distributorFor(chainId),
        abi: distributorAbi,
        functionName: 'claim',
        args: [args.users, args.tokens, args.amounts, args.proofs],
      })

      set(chainId, { step: 'confirming', hash })
      const receipt = await waitForTransactionReceipt(config, { hash, chainId })
      if (receipt.status !== 'success') throw new Error('Transaction annulée onchain (revert)')

      set(chainId, { step: 'done', hash })
      await onClaimed(chainId)
    } catch (err) {
      set(chainId, { step: 'error', message: readableError(err) })
    }
  }

  return { claim, status }
}

function readableError(err: unknown): string {
  const msg = err instanceof Error ? ((err as { shortMessage?: string }).shortMessage ?? err.message) : String(err)
  if (/user rejected|denied/i.test(msg)) return 'Signature refusée dans le wallet'
  if (/InvalidProof/i.test(msg)) return 'Preuve invalide : une nouvelle root a été publiée, rechargez la page'
  return msg.length > 140 ? `${msg.slice(0, 140)}…` : msg
}
