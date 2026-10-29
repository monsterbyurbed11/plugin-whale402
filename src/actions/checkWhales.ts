import { Action, HandlerCallback, IAgentRuntime, Memory, State } from '../types.js';

const DEFAULT_GATEWAY = 'https://whale402.acter.workers.dev';

export const checkWhalesAction: Action = {
  name: 'CHECK_TOKEN_WHALES',
  similes: [
    'CHECK_WHALE_ACTIVITY',
    'TOKEN_SMART_MONEY',
    'INSPECT_HOLDERS',
    'WHALE_INFLOW',
    'ANALYZE_TOKEN_ACCUMULATION',
  ],
  description:
    'Inspects top holders, Smart Money net inflow ($), whale dominance %, and computes WhaleAccumulationScore (0-100) for a token.',
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

    const tokenAddress = evmMatch ? evmMatch[0] : solMatch ? solMatch[0] : '';
    if (!tokenAddress) {
      if (callback) callback({ text: 'Please specify a token contract address to analyze.' });
      return false;
    }

    const network = evmMatch ? (text.toLowerCase().includes('solana') ? 'solana' : 'base') : 'solana';
    const gateway = runtime?.getSetting?.('WHALE402_API_URL') || process.env.WHALE402_API_URL || DEFAULT_GATEWAY;
    const txHash = runtime?.getSetting?.('WHALE402_TX_HASH') || process.env.WHALE402_TX_HASH;

    const headers: Record<string, string> = { Accept: 'application/json' };
    if (txHash) headers['Authorization'] = `x402 ${txHash.trim()}`;

    try {
      const res = await fetch(
        `${gateway}/v1/token-whales?network=${network}&tokenAddress=${tokenAddress}`,
        { headers, signal: AbortSignal.timeout(8000) }
      );
      const json: any = await res.json();

      if (!json.success || !json.data) {
        if (callback) callback({ text: `Could not analyze token: ${json.error || 'Unknown error'}` });
        return false;
      }

      const d = json.data;
      const topHoldersStr = (d.topHolders || [])
        .slice(0, 3)
        .map((h: any, i: number) => `   #${i + 1} ${h.address.slice(0, 6)}...${h.address.slice(-4)} | Tier: ${h.tier} | WinRate: ${h.historicalWinRatePct}% | PnL: $${h.realizedPnlUsd.toLocaleString()}`)
        .join('\n');

      const responseText = `🐋 Whale402 Intelligence Report for ${d.symbol} (${d.name}) on ${d.network.toUpperCase()}:
• Whale Accumulation Score: ${d.whaleAccumulationScore}/100 [${d.signal}]
• Smart Money Net Inflow (24h): $${d.smartMoneyNetInflow24hUsd.toLocaleString()}
• Whale Dominance: ${d.whaleDominancePct}% across ${d.totalWhalesTracking} tracked whales
• Smart Money Activity: ${d.smartMoneyBuys24h} Buys vs ${d.smartMoneySells24h} Sells
• Top Holders Preview:
${topHoldersStr}`;

      if (callback) {
        callback({ text: responseText, content: { success: true, data: d } });
      }
      return true;
    } catch (e: any) {
      if (callback) callback({ text: `Whale402 API error: ${e?.message || e}` });
      return false;
    }
  },
  examples: [
    [
      { user: '{{user1}}', content: { text: 'Check whale activity on 0x0578d8a44db98b23bf096a382e016e29a5ce0ffe' } },
      { user: '{{agentName}}', content: { text: "I'll analyze smart money net inflow and whale concentration on that token.", action: 'CHECK_TOKEN_WHALES' } },
    ],
  ],
};
