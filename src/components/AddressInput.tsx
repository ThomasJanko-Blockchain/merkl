import { useState } from 'react'
import { isAddress, type Address } from 'viem'

/** Une adresse publique active sur Merkl (exemple de la doc officielle). */
const DEMO_ADDRESS = '0x4F2BF7469Bc38d1aE779b1F4affC588f35E60973' as Address

export function AddressInput({ onSubmit }: { onSubmit: (a: Address) => void }) {
  const [value, setValue] = useState('')
  const [error, setError] = useState<string>()

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const v = value.trim()
    if (!isAddress(v)) return setError('Adresse invalide (format 0x… sur 42 caractères)')
    setError(undefined)
    onSubmit(v)
  }

  return (
    <form onSubmit={submit} className="w-full max-w-xl">
      <div className="flex gap-2">
        <input
          value={value}
          onChange={(e) => {
            setValue(e.target.value)
            setError(undefined)
          }}
          placeholder="0x… n'importe quelle adresse"
          spellCheck={false}
          className="min-w-0 flex-1 rounded-lg border border-line bg-panel px-3 py-2.5 font-mono text-sm outline-none placeholder:text-mute/60 focus:border-accent"
        />
        <button className="rounded-lg border border-line px-4 text-sm transition hover:border-mute">Voir</button>
      </div>
      {error ? (
        <p className="mt-2 text-xs text-red-400">{error}</p>
      ) : (
        <button
          type="button"
          onClick={() => onSubmit(DEMO_ADDRESS)}
          className="mt-2 text-xs text-mute underline-offset-2 hover:text-white hover:underline"
        >
          Essayer avec une adresse de démo
        </button>
      )}
    </form>
  )
}
