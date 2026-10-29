import { Action, HandlerCallback, IAgentRuntime, Memory, State } from '../types.js';

const DEFAULT_GATEWAY = 'https://whale402.acter.workers.dev';

export const auditCabalAction: Action = {
  name: 'AUDIT_CABAL_RISK',
  similes: [
    'CHECK_DEV_CABAL',
    'VERIFY_SYBIL_BUNDLE',
    'AUDIT_TOKEN_CLUSTERS',
    'CHECK_RUG_PULL_RISK',
    'CHECK_INSIDER_BUNDLING',
  ],
  description:
    'Audits top token holders for shared gas funding sources, Sybil bundling, and dev cabal distribution.',
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
      if (callback) callback({ text: 'Please provide a token address to audit for insider bundling.' });
      return false;
    }

    const network = evmMatch ? 'base' : 'solana';
    const gateway = runtime?.getSetting?.('WHALE402_API_URL') || process.env.WHALE402_API_URL || DEFAULT_GATEWAY;
    const txHash = runtime?.getSetting?.('WHALE402_TX_HASH') || process.env.WHALE402_TX_HASH;

    const headers: Record<string, string> = { Accept: 'application/json' };
    if (txHash) headers['Authorization'] = `x402 ${txHash.trim()}`;

    try {
      const res = await fetch(
        `${gateway}/v1/insider-cluster?network=${network}&tokenAddress=${tokenAddress}`,
        { headers, signal: AbortSignal.timeout(8000) }
      );
      const json: any = await res.json();

      if (!json.success || !json.data) {
        if (callback) callback({ text: `Could not audit token: ${json.error || 'Unknown error'}` });
        return false;
      }

      const d = json.data;
      const responseText = `🛡️ Whale402 Insider Cabal Audit for ${tokenAddress} on ${d.network.toUpperCase()}:
• Risk Level: ${d.clusterRisk}
• Cabal / Bundling Score: ${d.cabalScore}/100
• Bundled Supply: ${d.bundledSupplyPct}%
• Coordinated Insiders Detected: ${d.totalInsidersDetected}
• Verdict: ${d.verdict}`;

      if (callback) {
        callback({ text: responseText, content: { success: true, data: d } });
      }
      return true;
    } catch (e: any) {
      if (callback) callback({ text: `Cabal audit error: ${e?.message || e}` });
      return false;
    }
  },
  examples: [
    [
      { user: '{{user1}}', content: { text: 'Audit cabal bundling on 0x0578d8a44db98b23bf096a382e016e29a5ce0ffe' } },
      { user: '{{agentName}}', content: { text: 'Scanning top token holders for shared funding sources and dev bundling.', action: 'AUDIT_CABAL_RISK' } },
    ],
  ],
};
