# 🐋 plugin-whale402 (ElizaOS Plugin)

Autonomous **Smart Money Whale Radar**, **Dev Cabal / Sybil Cluster Audits**, and **Wallet Copy-Trade Profiler** for **ElizaOS** agents on **Base, Solana, and Ethereum**.

Equip your ElizaOS agents with real-time on-chain alpha to detect what profitable whale wallets (>70% win-rate) are accumulating and flag coordinated dev cabal bundles before executing trades.

---

## ⚡ Quick Start

### 1. Install Plugin
```bash
npm install plugin-whale402
# or
elizaos plugins install plugin-whale402
```

### 2. Enable in your Character File (`character.json`)
```json
{
  "name": "DegenWhaleAgent",
  "plugins": ["plugin-whale402"],
  "settings": {
    "secrets": {
      "WHALE402_TX_HASH": "0x_OPTIONAL_PREPAID_BASE_USDC_TX_HASH"
    }
  }
}
```

*(Note: First 3 queries every day are 100% free with zero configuration required!)*

---

## 🛠️ Actions & Capabilities

| Action | Similes | Description |
| :--- | :--- | :--- |
| `CHECK_TOKEN_WHALES` | `CHECK_WHALE_ACTIVITY`, `TOKEN_SMART_MONEY`, `INSPECT_HOLDERS` | Analyzes top holders, Smart Money net inflow ($), whale dominance %, and computes `WhaleAccumulationScore` (0-100). |
| `AUDIT_CABAL_RISK` | `CHECK_DEV_CABAL`, `VERIFY_SYBIL_BUNDLE`, `CHECK_RUG_PULL_RISK` | Deep graph audit on top holders detecting shared gas funding roots, Sybil bundling, and coordinated dev dump risks. |
| `PROFILE_WALLET_TRADER` | `CHECK_TRADER_PNL`, `WALLET_COPY_TRADE`, `GRADE_WALLET` | Evaluates wallet win rate %, realized PnL, 30d ROI, and assigns a `CopyTradeGrade` (`A+` to `F`). |

---

## 🧠 Dynamic Provider: `SMART_MONEY_RADAR`

Automatically supplies real-time high-conviction accumulation alpha to the agent’s prompt memory before it answers trading or token discovery questions:

```text
[WHALE402 SMART MONEY RADAR - HIGH CONVICTION ACCUMULATION]:
1. HIGHER (BASE): Accumulation Score 84/100, Signal: STRONG_ACCUMULATION, Smart Money Inflow: $42,180
2. DEGEN (BASE): Accumulation Score 79/100, Signal: MODERATE_ACCUMULATION, Smart Money Inflow: $28,900
...
```

---

## 📄 License
MIT © 2026 monsterbyurbed11
