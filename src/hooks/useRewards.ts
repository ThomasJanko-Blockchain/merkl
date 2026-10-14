import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'
import type { Address } from 'viem'
import { fetchRewardStats, fetchRewardsSummary, toChainViews } from '../lib/merkl'

export function useRewards(user: Address | undefined) {
  const summary = useQuery({
    queryKey: ['merkl', 'summary', user],
    queryFn: ({ signal }) => fetchRewardsSummary(user!, { signal }),
    enabled: !!user,
    select: (data) => toChainViews(data),
    staleTime: 60_000,
  })

  const stats = useQuery({
    queryKey: ['merkl', 'stats', user],
    queryFn: ({ signal }) => fetchRewardStats(user!, signal),
    enabled: !!user,
    staleTime: 60_000,
  })

  return { summary, stats }
}

/**
 * Après un claim, l'API met jusqu'à ~5 min à indexer la transaction.
 * reloadChainId force une relecture de l'état onchain pour cette chain (à n'utiliser qu'après un claim).
 */
export function useReloadAfterClaim(user: Address | undefined) {
  const qc = useQueryClient()
  return useCallback(
    async (chainId: number) => {
      if (!user) return
      const fresh = await fetchRewardsSummary(user, { reloadChainId: chainId })
      qc.setQueryData(['merkl', 'summary', user], fresh)
      await qc.invalidateQueries({ queryKey: ['merkl', 'stats', user] })
    },
    [qc, user],
  )
}
