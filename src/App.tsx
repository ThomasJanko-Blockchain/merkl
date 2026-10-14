import { useState } from 'react'
import type { Address } from 'viem'
import { isAddressEqual } from 'viem'
import { useConnection } from 'wagmi'
import { AddressInput } from './components/AddressInput'
import { ChainCard } from './components/ChainCard'
import { Header } from './components/Header'
import { StatsBar } from './components/StatsBar'
import { useClaim } from './hooks/useClaim'
import { useReloadAfterClaim, useRewards } from './hooks/useRewards'
import { shortAddress } from './lib/format'

export default function App() {
  const { address: wallet } = useConnection()
  const [watched, setWatched] = useState<Address>()

  // L'adresse affichée : celle saisie à la main, sinon le wallet connecté.
  const user = watched ?? wallet
  const isOwnWallet = !!wallet && !!user && isAddressEqual(wallet, user)

  const { summary, stats } = useRewards(user)
  const reload = useReloadAfterClaim(user)
  const { claim, status } = useClaim(reload)

  return (
    <div className="min-h-screen">
      <Header />

      <main className="mx-auto max-w-3xl px-5 py-10 sm:px-8">
        <section className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight">Toutes vos récompenses Merkl, au même endroit</h1>
          <p className="mt-2 max-w-xl text-mute">
            Connectez votre wallet pour réclamer vos rewards sur chaque chain, ou consultez n'importe quelle adresse en
            lecture seule.
          </p>
          <div className="mt-5">
            <AddressInput onSubmit={setWatched} />
          </div>
        </section>

        {!user ? (
          <EmptyState />
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between text-sm">
              <p className="text-mute">
                Adresse affichée : <span className="font-mono text-white">{shortAddress(user)}</span>
                {!isOwnWallet && <span className="ml-2 rounded bg-line px-1.5 py-0.5 text-xs">lecture seule</span>}
              </p>
              {watched && wallet && !isOwnWallet && (
                <button onClick={() => setWatched(undefined)} className="text-xs text-mute hover:text-white">
                  Revenir à mon wallet
                </button>
              )}
            </div>

            <StatsBar stats={stats.data} loading={stats.isLoading} />

            {summary.isLoading && <SkeletonList />}
            {summary.isError && (
              <p className="rounded-xl border border-red-900/60 bg-red-950/30 p-4 text-sm text-red-300">
                {summary.error.message}
              </p>
            )}
            {summary.data?.length === 0 && (
              <p className="rounded-xl border border-line bg-panel p-6 text-center text-sm text-mute">
                Aucune récompense en cours pour cette adresse.
              </p>
            )}

            <div className="space-y-4">
              {summary.data?.map((view) => (
                <ChainCard
                  key={view.chain.id}
                  view={view}
                  canClaimFor={isOwnWallet ? user : undefined}
                  status={status[view.chain.id]}
                  onClaim={() => claim(user, view.chain.id, view.rewards)}
                />
              ))}
            </div>

            <p className="pt-4 text-center text-xs text-mute">
              Les montants « en attente » sont recalculés toutes les ~2h et deviennent réclamables à la publication de la
              prochaine Merkle root (~toutes les 8h).
            </p>
          </div>
        )}
      </main>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="rounded-xl border border-dashed border-line p-10 text-center text-sm text-mute">
      Connectez un wallet ou saisissez une adresse pour afficher ses récompenses.
    </div>
  )
}

function SkeletonList() {
  return (
    <div className="space-y-4">
      {[0, 1].map((i) => (
        <div key={i} className="h-36 animate-pulse rounded-xl border border-line bg-panel" />
      ))}
    </div>
  )
}
