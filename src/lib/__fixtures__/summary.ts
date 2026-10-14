import type { ChainRewards } from '../merkl'

/**
 * Réponse au format exact de GET /v4/users/{address}/rewards/summary
 * (structure relevée sur l'API réelle, montants ajustés pour couvrir les cas de test).
 */
export const summaryFixture: ChainRewards[] = [
  {
    chain: { id: 137, name: 'Polygon', liveCampaigns: 11 },
    rewards: [
      {
        // Tout a déjà été claim -> rien à réclamer
        token: {
          address: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270',
          chainId: 137,
          symbol: 'WPOL',
          name: 'Wrapped Polygon Ecosystem Token',
          decimals: 18,
          price: 0.1,
        },
        amount: '7509629265870596190499',
        claimed: '7509629265870596190499',
        pending: '0',
        proofs: ['0x51bb04893baf5db988cdee9f2fd751229c8143d9d06f0d16bdcaf3edc13d3c8a'],
      },
    ],
  },
  {
    chain: { id: 8453, name: 'Base', liveCampaigns: 42 },
    rewards: [
      {
        // 150 MORPHO cumulés, 50 déjà claim -> 100 réclamables
        token: {
          address: '0xBAa5CC21fd487B8Fcc2F632f3F4E8D37262a0842',
          chainId: 8453,
          symbol: 'MORPHO',
          name: 'Morpho Token',
          decimals: 18,
          price: 2,
        },
        amount: '150000000000000000000',
        claimed: '50000000000000000000',
        pending: '5000000000000000000',
        proofs: [
          '0x416a420675882f6c1bdc96fcb0e08ec921e8028fe15c67fa6c07ffd50373caaa',
          '0xae737342d2bd758dd06659128c88caa93fd1066a9bb1629b399588abcc86283a',
        ],
      },
      {
        // USDC (6 décimales) : 12,5 USDC réclamables
        token: {
          address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
          chainId: 8453,
          symbol: 'USDC',
          name: 'USD Coin',
          decimals: 6,
          price: 1,
        },
        amount: '12500000',
        claimed: '0',
        pending: '0',
        proofs: ['0x8a505ef73d85c3c28a63d6a6e70dbbc67df90d6dd27d39d1dcbdce62f1a97883'],
      },
    ],
  },
  {
    chain: { id: 42161, name: 'Arbitrum', liveCampaigns: 20 },
    rewards: [
      {
        // Seulement du pending : visible mais pas encore réclamable
        token: {
          address: '0x912CE59144191C1204E64559FE8253a0e49E6548',
          chainId: 42161,
          symbol: 'ARB',
          name: 'Arbitrum',
          decimals: 18,
          price: 0.5,
        },
        amount: '0',
        claimed: '0',
        pending: '20000000000000000000',
        proofs: [],
      },
    ],
  },
]
