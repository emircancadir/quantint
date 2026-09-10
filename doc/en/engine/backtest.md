---
title: "quantint MVP backtest standard"
document_id: QNT-ENGINE-BACKTEST
version: 0.1.0
status: draft
language: en
source_of_truth: false
source_document: ../../tr/engine/backtest.md
last_updated: 2026-09-11
---

# quantint MVP backtest standard

[Main document](../quantint-beyin.md) · [Turkish source of truth](../../tr/engine/backtest.md)

## 1. Purpose

This document defines the execution, cost, data, validation, and performance-calculation rules of the backtest engine. The engine must be deterministic, prevent lookahead, account for costs, avoid optimistic price assumptions, show data errors, and reproduce the same result from the same inputs.

## 2. Simulation unit

Every backtest:

- Uses one strategy version, pair, and timeframe.
- Starts with an independent virtual portfolio of `10,000 USDT`.
- Is long-only; there is no short selling, leverage, or borrowing.
- Holds at most one open position.
- Holds unused cash in USDT with no interest.

The same strategy may be batch-tested on multiple pairs, but every pair uses a separate 10,000 USDT portfolio, accounting ledger, and result. Capital is not shared and results are not combined as one portfolio. Shared-capital multi-pair portfolios are outside the MVP.

## 3. Candle and event timing

```text
Candle t completes
→ indicators use only t and earlier data
→ an entry or exit signal occurs
→ a normal order executes no earlier than the open of t+1
```

The engine cannot use incomplete candles, temporary intrabar indicator values, or future values. It cannot execute the signal at the close of the same candle.

If `t+1` is missing or unavailable, no trade is made, no other/last-known price is substituted, and the backtest returns a data error. Such a result cannot be shown as successful or validated.

## 4. Position and conflict rules

- No new entry while a position is open; no pyramiding.
- A normal exit closes the full position; no partial exits.
- Negative cash is never allowed.
- If entry and exit occur on the same completed candle, exit has priority.
- If a position is open, it closes fully with no same-candle re-entry.
- If flat, no entry occurs on that candle.
- A new entry may occur only after a valid new signal on a subsequent completed candle.

## 5. Commission and slippage

| Cost | MVP rule |
|---|---:|
| Buy commission | `0.10%` of transaction value |
| Sell commission | `0.10%` of transaction value |
| Buy slippage | `+0.10%` on the opening price |
| Sell slippage | `−0.10%` on the opening price or valid exit reference price |

Normal trades:

```text
Buy price  = next candle open × 1.001
Sell price = next candle open × 0.999
Commission = executed transaction value × 0.001
```

Commission applies separately to every buy and sell.

## 6. Position size and cash control

Position size is the user-selected percentage of total portfolio value at execution time.

- If total cost including commission exceeds cash, quantity is reduced.
- Quantity is rounded down to the market lot step.
- The remainder stays in cash.
- Minimum order is `max(10 USDT, the market minimum from the data source)`.
- A trade below the minimum does not execute.

The selectable percentage range and step have not yet been decided.

## 7. Stop-loss, take-profit, and exit priority

Fixed stop-loss and take-profit levels are calculated from the executed buy price. If both are reached within the same candle, the engine conservatively assumes that the stop-loss occurred first.

If a candle gaps open below the stop, the worse open—not the stop level—is the raw reference; sell-side slippage and commission apply separately.

If multiple exit reasons occur together:

1. Stop-loss
2. Take-profit
3. Normal exit condition
4. Time-based exit

Risk limits are in the [strategy-language document](./strategy-language.md).

## 8. Open position at test end

An open position at test end is treated as closed at the final valid closing price after sell-side slippage and commission. Final net portfolio value is calculated after this forced close. The gross run includes the same event under its no-cost rule.

## 9. Date range and minimum test

The default period is the three years preceding the final completed bar. The user may change start and end dates. All dates use UTC; the end cannot be in the future, include an incomplete candle, or extend beyond the final validated completed bar.

| Timeframe | Minimum period | Minimum completed bars |
|---|---:|---:|
| 1 hour | 12 months | 5,000 |
| 4 hours | 18 months | 2,000 |
| Daily | 3 years | 750 |

A validated test must satisfy both conditions in its row. A shorter test may run but is labeled `Research only — insufficient data` and cannot be accepted as a validated strategy.

## 10. Indicator warm-up

```text
Warm-up bars = max(200, longest indicator period × 3)
```

Example: with EMA(100) as the longest indicator, `max(200, 100 × 3) = 300` bars are required.

Warm-up bars prepare indicators only; they are excluded from performance, trades, benchmark, and the `70%/30%` split. If history is insufficient, dates are not silently shifted and data is not filled; an error is shown.

## 11. Data integrity

- Completed-bar ratio must be at least `99.9%`.
- Duplicate records, malformed OHLC, and forward-fill are not accepted.
- An asset cannot trade before its listing date.
- Today’s asset list is not applied retroactively.
- Four-hour and daily bars use only completed one-hour bars.
- An unexplained gap longer than two bars rejects the test.
- A one- or two-bar gap also cannot be hidden or artificially filled; if it is the execution candle, it causes a data error.
- Every result is tied to a data-snapshot version.

Details are in the [data policy](../data/data-policy.md).

## 12. Lookahead and data-leakage controls

1. A signal on `t` uses only `t` and past data.
2. A normal trade executes no earlier than the open of `t+1`.
3. Incomplete candles are not used.
4. Warm-up is excluded from performance.
5. Development and test are chronological; data is not shuffled.
6. Test data is hidden from the user and AI until the strategy is locked.
7. Parameters are not automatically selected from test data.
8. The current asset list is not retroactively applied.
9. There is no pre-listing trading.
10. Missing bars are not hidden through forward-fill.
11. Higher timeframes use completed one-hour bars only.
12. Every result records strategy, engine, and data-snapshot versions.

## 13. Development and unseen-test split

```text
First 70% → development period
Final 30% → unseen test period
```

Data is not randomly shuffled. Results are displayed separately for development, unseen test, and full period. The user sees development first; unseen test is not revealed to the user or AI before final approval and lock and is emphasized as the primary decision section.

If a parameter changes after the test is viewed, the old test is no longer unseen. The new version is labeled `re-optimized`, the attempted-version count increases, and a new backtest is required. A strategy that does well in development but deteriorates materially in test receives a `possible overfitting` warning. Walk-forward testing is not mandatory in the MVP.

It has not yet been decided whether initial card approval and the final post-development test lock are one approval or two.

## 14. Minimum trade count

A completed trade is a round trip that begins when a position opens and ends when it closes fully.

| Completed trades | Reliability label |
|---:|---|
| 0–9 | Invalid result |
| 10–29 | Statistically highly insufficient |
| 30–99 | Preliminary assessment |
| 100 or more | More meaningful sample |

Minimum acceptance is 30 completed trades across the full assessment and at least 10 in the unseen test. Paper trading may still start below the threshold only after explicit `insufficient sample` acknowledgement.

## 15. Buy-and-hold benchmark

The benchmark:

- Uses the same pair, starting capital, start date, and end date.
- Buys with `100%` of capital on the first test bar.
- Applies the same commission and slippage.
- Converts to USDT at period end and applies sale costs.

Net return, maximum drawdown, volatility, and Sharpe differences are shown. Lower return alone is not failure; lower risk or drawdown remains visible.

The exact raw execution prices on the first and final benchmark bars have not yet been decided.

## 16. Calculation basis

- Starting portfolio: `10,000 USDT`.
- Primary result: net performance after commission and slippage.
- Gross result explains cost impact only.
- Any end-of-test position is closed with net costs.
- Calculations use full precision; UI percentages and ratios show two decimals.
- Annualization uses `365 days`.
- Risk metrics use simple returns from equity sampled daily at `00:00 UTC`.

```text
Daily return[d] = Equity[d] / Equity[d-1] - 1
```

## 17. Return metrics

### Gross total return

The same signals and trades run without commission/slippage. It cannot be the primary result.

### Net total return

```text
(Final net portfolio / Starting portfolio) - 1
```

### Cost impact

```text
Gross total return - Net total return
```

### CAGR

```text
(Final portfolio / Initial portfolio)^(365 / test days) - 1
```

For tests shorter than one year, CAGR is hidden or labeled `Insufficient period`.

### Buy-and-hold return and difference

The benchmark’s net return with the same costs.

```text
Buy-and-hold difference = Strategy net return - Buy-and-hold net return
```

## 18. Maximum drawdown

Net equity on every bar is used.

```text
Peak[t] = highest Equity through t
Drawdown[t] = Equity[t] / Peak[t] - 1
Maximum Drawdown = lowest Drawdown[t]
```

Peak, trough, and recovery dates are shown.

## 19. Annualized volatility

The sample standard deviation of daily simple returns is used.

```text
Volatility = SampleStd(daily returns) × √365
```

## 20. Sharpe

The MVP annual risk-free rate assumption is `0%` and is stated on screen. No external interest-rate data is retrieved.

```text
Daily risk-free return = (1 + annual risk-free return)^(1/365) - 1

Sharpe =
Mean(daily return - daily risk-free return)
÷ SampleStd(daily return)
× √365
```

If standard deviation is zero, display `N/A`.

## 21. Sortino

The minimum acceptable return is `0%`.

```text
Downside deviation = √Mean(min(daily return, 0)²)

Sortino = Mean daily return ÷ Downside deviation × √365
```

If there are no negative-return days, display `N/A`, not infinity.

## 22. Trade metrics

| Metric | Calculation |
|---|---|
| Completed trade count | Closed round trips |
| Win rate | Net profitable trades / all closed trades |
| Average trade return | Arithmetic mean of net trade returns |
| Average trade profit | Mean of positive net trade returns |
| Average trade loss | Mean of negative net trade returns |
| Profit factor | Total net profit / absolute total net loss |
| Expectancy | Win rate × average profit + loss rate × average loss |
| Average holding period | Average candles and time held |
| Exposure | Bars with open position / total testable bars |
| Turnover | Total buy-sell value / average portfolio value |
| Total commission | Total virtual commissions in USDT |
| Estimated slippage cost | USDT difference between fills with and without slippage |

```text
Net trade return = Net trade profit / capital used at entry
```

Commission and slippage are included in net trade profit. Break-even trades are neither wins nor losses but count as completed trades. With no losing trades, profit factor is `N/A — no losing trades`, not infinity.

## 23. Results screen

The top section contains only:

1. Net total return
2. Buy-and-hold difference
3. Maximum drawdown
4. Sharpe
5. Completed trade count
6. Exposure

Other metrics appear under `Detailed performance`. Every metric is calculated separately for development, unseen test, and full period; unseen test is the primary assessment. Gross performance cannot be more prominent than net.

## 24. Reproducibility

Every result is associated with at least strategy, engine, data snapshot, and universe versions; pair, timeframe, date range, warm-up, commission, slippage, position size, and the market trading rules used.

The same versions, date range, costs, and market rules must produce the same result. If engine or data changes, an old result is not silently recalculated; a new result is created.

## 25. Error visibility

Missing data/warm-up, malformed OHLC, duplicate bars, unexplained gaps, missing execution candle, invalid lot/minimum order, invalid indicator, `NaN`, incomplete-candle use, and missing version information cannot be hidden. A run with errors cannot be shown as successful or validated.

## 26. Decisions pending

1. Whether initial strategy approval and the post-development test lock are one or two approvals.
2. Which side receives the extra bar in a non-integer `70%/30%` split.
3. The price used to value open-position equity on each bar.
4. Whether the `00:00 UTC` daily sample is an exact bar close or the latest completed value.
5. Raw execution prices for the first/final buy-and-hold bars.
6. Whether section benchmarks restart at 10,000 USDT or use one continuous series.
7. Whether the gross run keeps net quantities or recalculates them with cost-free capital.
8. Sampling frequency for average portfolio value in turnover.
9. Whether the forced test-end close counts as a completed trade.
10. Display of an unrecovered maximum drawdown.
11. Numeric thresholds for `possible overfitting`.
12. Numeric data type and intermediate rounding policy.
13. Exact fill for a gap above take-profit.
14. Exact event order if stop/take-profit is reached in the entry candle.
15. Raw execution price for an ordinary, non-gap stop-loss or take-profit touch.
16. Whether commission and slippage fields on the strategy card are user-editable values or fixed MVP standards.

AI or the application cannot fill these details by assumption.
