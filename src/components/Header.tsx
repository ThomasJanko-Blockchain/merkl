import { useConnect, useConnection, useConnectors, useDisconnect } from 'wagmi'
import { shortAddress } from '../lib/format'

export function Header() {
  const { address, isConnected } = useConnection()
  const connectors = useConnectors()
  const { connect, isPending } = useConnect()
  const { disconnect } = useDisconnect()
  const injectedConnector = connectors[0]

  return (
    <header className="flex items-center justify-between gap-4 border-b border-line px-5 py-4 sm:px-8">
      <div className="flex items-center gap-3">
        <div className="grid h-8 w-8 place-items-center rounded-lg bg-accent font-mono text-sm font-semibold text-white">
          M
        </div>
        <div>
          <p className="text-sm font-semibold leading-tight">Rewards Hub</p>
          <p className="text-xs text-mute">Propulsé par l'API Merkl</p>
        </div>
      </div>

      {isConnected && address ? (
        <button
          onClick={() => disconnect()}
          className="rounded-lg border border-line px-3 py-2 font-mono text-xs text-mute transition hover:border-mute hover:text-white"
          title="Déconnecter"
        >
          {shortAddress(address)}
        </button>
      ) : (
        <button
          disabled={!injectedConnector || isPending}
          onClick={() => injectedConnector && connect({ connector: injectedConnector })}
          className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition hover:brightness-110 disabled:opacity-50"
        >
          {isPending ? 'Connexion…' : 'Connecter un wallet'}
        </button>
      )}
    </header>
  )
}
