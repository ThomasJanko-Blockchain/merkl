import { formatUsd, type RewardStats } from '../lib/merkl'

export function StatsBar({ stats, loading }: { stats?: RewardStats; loading: boolean }) {
  const items = [
    { label: 'Réclamable maintenant', value: stats?.claimableUSD, accent: true },
    { label: 'En attente (prochaine root)', value: stats?.pendingUSD },
    { label: 'Total gagné', value: stats?.totalEarnedUSD },
  ]
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {items.map((it) => (
        <div key={it.label} className="rounded-xl border border-line bg-panel p-4">
          <p className="text-xs text-mute">{it.label}</p>
          <p className={`mt-1 text-2xl font-semibold tabular-nums ${it.accent ? 'text-good' : ''}`}>
            {loading ? <span className="inline-block h-7 w-24 animate-pulse rounded bg-line" /> : formatUsd(Number(it.value ?? 0))}
          </p>
        </div>
      ))}
    </div>
  )
}
