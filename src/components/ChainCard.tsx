import type { Address } from 'viem'
import type { ClaimStatus } from '../hooks/useClaim'
import { claimable, formatAmount, formatUsd, toUnits, toUsd, type ChainView } from '../lib/merkl'
import { explorerTxUrl, isSupportedChain } from '../wagmi'
import { Icon } from './Icon'

interface Props {
  view: ChainView
  /** Wallet connecté ET identique à l'adresse affichée : seul cas où on peut claim. */
  canClaimFor?: Address
  status?: ClaimStatus
  onClaim: () => void
}

const STATUS_LABEL: Partial<Record<ClaimStatus['step'], string>> = {
  switching: 'Changement de réseau…',
  signing: 'Signature dans le wallet…',
  confirming: 'Confirmation onchain…',
}

export function ChainCard({ view, canClaimFor, status, onClaim }: Props) {
  const { chain, rewards, claimableUSD, pendingUSD, claimableCount } = view
  const busy = status && ['switching', 'signing', 'confirming'].includes(status.step)
  const supported = isSupportedChain(chain.id)
  const visible = rewards.filter((r) => claimable(r) > 0n || BigInt(r.pending) > 0n)

  return (
    <article className="rounded-xl border border-line bg-panel">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line p-4">
        <div className="flex items-center gap-3">
          <Icon src={chain.icon} size={28} />
          <div>
            <p className="font-medium">{chain.name}</p>
            <p className="text-xs text-mute">
              {claimableCount} token{claimableCount > 1 ? 's' : ''} à réclamer
              {pendingUSD > 0 && ` · ${formatUsd(pendingUSD)} en attente`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <p className="text-lg font-semibold tabular-nums text-good">{formatUsd(claimableUSD)}</p>
          <ClaimButton
            disabled={!canClaimFor || claimableCount === 0 || !!busy}
            supported={supported}
            chainId={chain.id}
            label={busy ? STATUS_LABEL[status!.step] : 'Claim'}
            hint={
              !canClaimFor
                ? "Connectez le wallet de cette adresse pour claim"
                : claimableCount === 0
                  ? 'Rien à réclamer pour le moment'
                  : undefined
            }
            onClick={onClaim}
          />
        </div>
      </div>

      <ul className="divide-y divide-line">
        {visible.map((r) => {
          const cl = claimable(r)
          return (
            <li key={r.token.address} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
              <div className="flex min-w-0 items-center gap-2.5">
                <Icon src={r.token.icon} />
                <span className="truncate font-medium">{r.token.symbol}</span>
              </div>
              <div className="text-right tabular-nums">
                <p>
                  {formatAmount(toUnits(cl, r.token.decimals))}{' '}
                  <span className="text-mute">({formatUsd(toUsd(cl, r.token))})</span>
                </p>
                {BigInt(r.pending) > 0n && (
                  <p className="text-xs text-mute">+ {formatAmount(toUnits(r.pending, r.token.decimals))} en attente</p>
                )}
              </div>
            </li>
          )
        })}
      </ul>

      {status?.step === 'done' && (
        <p className="border-t border-line px-4 py-2.5 text-xs text-good">
          Claim confirmé.{' '}
          <TxLink chainId={chain.id} hash={status.hash} />
        </p>
      )}
      {status?.step === 'confirming' && (
        <p className="border-t border-line px-4 py-2.5 text-xs text-mute">
          Transaction envoyée. <TxLink chainId={chain.id} hash={status.hash} />
        </p>
      )}
      {status?.step === 'error' && <p className="border-t border-line px-4 py-2.5 text-xs text-red-400">{status.message}</p>}
    </article>
  )
}

function ClaimButton(props: {
  disabled: boolean
  supported: boolean
  chainId: number
  label?: string
  hint?: string
  onClick: () => void
}) {
  if (!props.supported) {
    return (
      <a
        href="https://app.merkl.xyz/"
        target="_blank"
        rel="noreferrer"
        className="rounded-lg border border-line px-4 py-2 text-sm text-mute transition hover:text-white"
      >
        Claim sur Merkl ↗
      </a>
    )
  }
  return (
    <button
      onClick={props.onClick}
      disabled={props.disabled}
      title={props.hint}
      className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
    >
      {props.label}
    </button>
  )
}

function TxLink({ chainId, hash }: { chainId: number; hash: string }) {
  const url = explorerTxUrl(chainId, hash)
  return url ? (
    <a href={url} target="_blank" rel="noreferrer" className="underline underline-offset-2">
      Voir la transaction ↗
    </a>
  ) : null
}
