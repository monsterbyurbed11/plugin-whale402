import { Action, HandlerCallback, IAgentRuntime, Memory, State } from '../types.js';

const DEFAULT_GATEWAY = 'https://whale402.acter.workers.dev';

export const profileWalletAction: Action = {
  name: 'PROFILE_WALLET_TRADER',
  similes: [
    'CHECK_TRADER_PNL',
    'WALLET_COPY_TRADE',
    'GRADE_WALLET',
    'WHALE_TRACK_RECORD',
    'EVALUATE_TRADER',
  ],
  description:
    'Analyzes wallet trading history, win rate %, realized PnL, 30d ROI, and assigns a CopyTradeGrade (A+ to F).',
  validate: async (_runtime: IAgentRuntime, message: Memory): Promise<boolean> => {
    const text = message.content?.text || '';
    return /0x[a-fA-F0-9]{40}/.test(text) || /[1-9A-HJ-NP-Za-km-z]{32,44}/.test(text);
  },
  handler: async (
    runtime: IAgentRuntime,
    message: Memory,
    _state?: State,
    _options?: any,
    callback?: HandlerCallback
  ): Promise<boolean> => {
    const text = message.content?.text || '';
    const evmMatch = text.match(/0x[a-fA-F0-9]{40}/);
    const solMatch = text.match(/[1-9A-HJ-NP-Za-km-z]{32,44}/);

    const address = evmMatch ? evmMatch[0] : solMatch ? solMatch[0] : '';
    if (!address) {
      if (callback) callback({ text: 'Please specify a wallet address to profile.' });
      return false;
    }

    const network = evmMatch ? 'base' : 'solana';
    const gateway = runtime?.getSetting?.('WHALE402_API_URL') || process.env.WHALE402_API_URL || DEFAULT_GATEWAY;
    const txHash = runtime?.getSetting?.('WHALE402_TX_HASH') || process.env.WHALE402_TX_HASH;

    const headers: Record<string, string> = { Accept: 'application/json' };
    if (txHash) headers['Authorization'] = `x402 ${txHash.trim()}`;

    try {
      const res = await fetch(
        `${gateway}/v1/wallet-profiler?network=${network}&walletAddress=${address}`,
        { headers, signal: AbortSignal.timeout(8000) }
      );
      const json: any = await res.json();

      if (!json.success || !json.data) {
        if (callback) callback({ text: `Could not profile wallet: ${json.error || 'Unknown error'}` });
        return false;
      }

      const d = json.data;
      const responseText = `📊 Whale402 Wallet Scorecard for ${address.slice(0, 8)}... (${d.network.toUpperCase()}):
• Copy-Trade Grade: ${d.copyTradeGrade} (Score: ${d.copyTradeScore}/100)
• Trader Tier: ${d.traderTier}
• Historical Win Rate: ${d.winRatePct}% (${d.profitableTrades} wins / ${d.totalTrades} trades)
• Realized PnL: $${d.realizedPnlUsd.toLocaleString()} (30-day ROI: ${d.roi30dPct}%)
• Average Hold Duration: ${d.avgHoldDurationHours} hours
• Key Flags: ${d.flags.join(', ')}`;

      if (callback) {
        callback({ text: responseText, content: { success: true, data: d } });
      }
      return true;
    } catch (e: any) {
      if (callback) callback({ text: `Wallet profiling error: ${e?.message || e}` });
      return false;
    }
  },
  examples: [
    [
      { user: '{{user1}}', content: { text: 'Profile this trader wallet: 0x8a8c238ed2b46908Ff6C6922a3870984f20f8913' } },
      { user: '{{agentName}}', content: { text: 'Analyzing historical win rate, PnL, and copy-trade grade.', action: 'PROFILE_WALLET_TRADER' } },
    ],
  ],
};
