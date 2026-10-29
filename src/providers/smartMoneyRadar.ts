import { IAgentRuntime, Memory, Provider, State } from '../types.js';

const DEFAULT_GATEWAY = 'https://whale402.acter.workers.dev';

export const smartMoneyRadarProvider: Provider = {
  name: 'SMART_MONEY_RADAR',
  get: async (runtime: IAgentRuntime, _message: Memory, _state?: State): Promise<string | null> => {
    const gateway = runtime?.getSetting?.('WHALE402_API_URL') || process.env.WHALE402_API_URL || DEFAULT_GATEWAY;
    const txHash = runtime?.getSetting?.('WHALE402_TX_HASH') || process.env.WHALE402_TX_HASH;

    const headers: Record<string, string> = { Accept: 'application/json' };
    if (txHash) headers['Authorization'] = `x402 ${txHash.trim()}`;

    try {
      const res = await fetch(`${gateway}/v1/smart-money-radar?limit=5`, {
        headers,
        signal: AbortSignal.timeout(5000),
      });

      if (!res.ok) return null;

      const data: any = await res.json();
      if (!data.success || !Array.isArray(data.data) || data.data.length === 0) {
        return null;
      }

      const summaries = data.data.map(
        (item: any, i: number) =>
          `${i + 1}. ${item.symbol} (${item.network.toUpperCase()}): Accumulation Score ${item.whaleAccumulationScore}/100, Signal: ${item.signal}, Smart Money Inflow: $${item.netSmartMoneyFlowUsd.toLocaleString()}`
      );

      return `[WHALE402 SMART MONEY RADAR - HIGH CONVICTION ACCUMULATION]:\n${summaries.join('\n')}\n(Use CHECK_TOKEN_WHALES or AUDIT_CABAL_RISK for deep analysis before executing trades).`;
    } catch {
      return null;
    }
  },
};
