---
title: "quantint MVP strategy language"
document_id: QNT-ENGINE-STRATEGY
version: 0.1.0
status: draft
language: en
source_of_truth: false
source_document: ../../tr/engine/strategy-language.md
last_updated: 2026-09-11
---

# quantint MVP strategy language

[Main document](../quantint-beyin.md) · [Turkish source of truth](../../tr/engine/strategy-language.md)

## 1. Purpose

This document defines the boundaries of strategies available in the MVP and how the engine interprets them. The language is controlled, limited, and deterministic; it does not execute arbitrary code. AI and the visual builder use the same language and accept only rules explicitly supported here.

An unsupported request cannot be silently converted into a similar-looking rule.

## 2. Core strategy model

Every strategy:

1. Is tied to one pair and one timeframe.
2. Contains one entry-condition group.
3. Contains one normal exit-condition group.
4. May contain one fixed stop-loss.
5. May contain one fixed take-profit.
6. May contain one time-based exit.
7. Contains a position size.
8. Contains a re-entry rule.
9. Can open long positions only.

One strategy card cannot represent multiple pairs or a shared-capital portfolio. A copy made for another pair is a separate version and simulation. Pairs are defined in the [data policy](../data/data-policy.md).

## 3. Timeframes and signal timing

| Timeframe | Definition |
|---|---|
| `1h` | Completed one-hour candles |
| `4h` | Completed four-hour candles |
| `1d` | Completed daily candles |

Minute-level, second-level, scalping, and weekly strategies are outside the MVP.

Strategy conditions are calculated only on completed candles. A normal signal on candle `t` may use only `t` and earlier completed candles and can be executed no earlier than the open of `t+1`. Open candles and temporary intrabar indicator values cannot be used. Stop-loss and take-profit evaluation using OHLC is the defined exception to this normal flow.

## 4. Supported indicators

| Indicator | Parameter range | Permitted use |
|---|---:|---|
| Closing price | — | Comparison with a fixed price, SMA, or EMA |
| SMA | 2–200 periods | Close/SMA or two-SMA comparison |
| EMA | 2–200 periods | Close/EMA or two-EMA comparison |
| RSI | 2–100 periods | Comparison with a fixed threshold from 1 to 99 |
| MACD | Fast: 2–50, Slow: 3–200, Signal: 2–50 | MACD–signal crossover or zero-line comparison |

For MACD, `fast < slow` is mandatory. An indicator cannot produce a value or signal before sufficient history exists. Warm-up is defined in the [backtest document](./backtest.md).

Bollinger Bands, ATR, ADX, Stochastic, Ichimoku, volume indicators, custom user formulas, and indicators not explicitly listed here are unsupported in the MVP. Direct SMA-to-EMA comparison is also not considered supported because this version does not define it explicitly.

## 5. State comparisons

| Meaning | Representation |
|---|---|
| Above | `A > B` |
| Below | `A < B` |
| Greater than or equal to | `A >= B` |
| Less than or equal to | `A <= B` |

A state condition is true or false on the relevant completed candle. Permitted examples:

- The closing price is above EMA(50).
- EMA(20) is above EMA(50).
- RSI(14) is below 30.
- The MACD line is above zero.
- The closing price is above 60,000 USDT.

## 6. Crossover events

Upward crossover:

```text
A[t] > B[t] AND A[t-1] <= B[t-1]
```

Downward crossover:

```text
A[t] < B[t] AND A[t-1] >= B[t-1]
```

`t` and `t-1` are consecutive completed candles. “Crosses” means a state change between completed candles, not an intrabar touch, and produces one event.

Permitted examples:

- EMA(20) crosses above EMA(50).
- RSI(14) crosses below 30.
- The MACD line crosses above the signal line.
- The closing price crosses below EMA(50).

## 7. Entry and exit condition groups

Entry and normal-exit groups may each contain at most three conditions. One group uses only one connector:

```text
A AND B AND C
```

or:

```text
A OR B OR C
```

Nested logic such as `(A AND B) OR (C AND D)` or `A AND (B OR C)` is unsupported. AI asks the user to simplify and cannot silently change the logic.

## 8. Position behavior

- Long-only; no short selling or leverage.
- At most one open position.
- No new entry or pyramiding while a position is open.
- A normal exit closes the full position; there are no partial exits.
- Unused capital remains in USDT.
- The user sets position size; calculation and cash control are defined in the [backtest document](./backtest.md).

## 9. Fixed stop-loss

A strategy may have at most one fixed stop-loss.

- It is calculated from the executed buy price.
- It may be `0.5%`–`30%` below the entry price.
- It closes the full position.
- Sell-side commission and slippage apply.

If a candle opens below the stop, the worse open—not the stop price—is the reference; commission and slippage apply separately.

## 10. Fixed take-profit

A strategy may have at most one fixed take-profit.

- It is calculated from the executed buy price.
- It may be `0.5%`–`100%` above the entry price.
- It closes the full position.
- Sell-side commission and slippage apply.

If stop-loss and take-profit are both reached within one candle, the intrabar order is unknown and the engine conservatively assumes the stop occurred first.

## 11. Trailing stop

Trailing stops are unsupported in the MVP. They cannot be added until highest-price tracking, intrabar ordering, and gap behavior are defined.

## 12. Time-based exit

A strategy may include one optional time exit. The holding period is `1–500` completed candles. After it completes, the position closes at the next candle’s open.

Under “hold for 10 candles,” the position remains open for 10 full candles and closes at the open of the 11th.

## 13. Re-entry

The user chooses:

1. Do not re-enter.
2. Re-enter on a new signal.
3. Re-enter after both a new signal and a waiting period.

The wait is `0–100` candles, default `1` candle.

- Exit and re-entry cannot occur on the same candle.
- An entry condition merely remaining true is not a new signal.
- It must first become false and then occur again.
- A new entry must rely on a new completed-candle signal.

## 14. Conflict priority

When multiple exit reasons occur together:

1. Stop-loss
2. Take-profit
3. Normal exit condition
4. Time-based exit

If entry and exit conditions occur on the same completed candle, exit has priority. An open position closes fully with no same-candle re-entry. If flat, no new position opens on that candle. A new entry may occur only after a valid new signal on a subsequent completed candle.

## 15. Unsupported requests

- Percentage price-change rules,
- Candlestick patterns,
- Unmeasured expressions such as “if it rises quickly,”
- Nested `AND`/`OR` or more than three conditions per group,
- Minute/second strategies or scalping,
- Short selling, leverage, pyramiding, or trailing stops,
- Volume indicators or custom formulas,
- Arbitrary Python, JavaScript, SQL, or other executable code,
- External network calls,
- Multiple pairs or shared capital in one strategy,
- Live-order instructions.

The system marks the request `unsupported` or asks for simplification; it does not approximate it.

## 16. AI, manual builder, and validation

AI and manual strategies share the same `Strategy JSON`, validator, engine, versioning, and approval rules. AI may produce only `needs_clarification`, `strategy_draft`, or `unsupported`.

Before execution, a draft passes:

1. **Schema:** Required fields, types, and allowed values; unknown fields are rejected.
2. **Scope:** Pair, timeframe, indicator, operator, and risk rules.
3. **Parameters:** All numeric ranges.
4. **Logic:** Contradictory, impossible, permanently true, or identical entry/exit structures are rejected.
5. **Time safety:** Lookahead and open-candle use are blocked.
6. **Security:** Arbitrary code, SQL, external calls, short selling, leverage, and live orders are rejected.
7. **Engine preflight:** A small dataset is checked for `NaN`, insufficient warm-up, missing data, and calculation errors.
8. **Human approval:** Rules, costs, and risks are shown on the strategy card.

Without explicit user approval, the strategy cannot execute or become a locked version.

## 17. Versioning and immutability

An approved strategy is stored as an immutable version and cannot be changed by AI or the system during execution. Every later edit requires a new version and new user approval.

Every backtest and paper result is tied to strategy, engine, and data-snapshot versions. The same three versions must produce the same result.

## 18. Decisions pending

1. Exact `Strategy JSON` fields and complete JSON Schema.
2. Exact initialization and calculation methods for SMA, EMA, RSI, and MACD, including the EMA seed and RSI variant.
3. Numeric data type and intermediate rounding for indicators.
4. Minimum, maximum, and step for user-selected position size.
5. Exact fill when a candle gaps open above take-profit.
6. Event order if stop or take-profit is reached in the entry candle.
7. Whether the exit candle counts toward the re-entry waiting period.
8. Whether initial card approval and the final development/test lock are one or two approvals.

AI cannot complete these matters by assumption.
