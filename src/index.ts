import { Plugin } from './types.js';
import { checkWhalesAction } from './actions/checkWhales.js';
import { auditCabalAction } from './actions/auditCabal.js';
import { profileWalletAction } from './actions/profileWallet.js';
import { smartMoneyRadarProvider } from './providers/smartMoneyRadar.js';

export * from './types.js';
export * from './actions/checkWhales.js';
export * from './actions/auditCabal.js';
export * from './actions/profileWallet.js';
export * from './providers/smartMoneyRadar.js';

export const whale402Plugin: Plugin = {
  name: 'plugin-whale402',
  description:
    'ElizaOS plugin for Smart Money whale tracking, Dev Cabal / Sybil cluster audits, and wallet copy-trade profiler on Base, Solana, and Ethereum.',
  actions: [checkWhalesAction, auditCabalAction, profileWalletAction],
  providers: [smartMoneyRadarProvider],
  evaluators: [],
  services: [],
};

export default whale402Plugin;
