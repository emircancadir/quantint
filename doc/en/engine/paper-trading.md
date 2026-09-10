---
title: "quantint MVP paper trading specification"
document_id: QNT-ENGINE-PAPER
version: 0.1.0
status: draft
language: en
source_of_truth: false
source_document: ../../tr/engine/paper-trading.md
last_updated: 2026-09-11
---

# quantint MVP paper trading specification

[Main document](../quantint-beyin.md) · [Turkish source of truth](../../tr/engine/paper-trading.md)

## 1. Purpose

Paper trading runs an approved, locked strategy on real market data arriving from that point forward, using entirely virtual capital. It uses no real money, sends no exchange orders, makes no investment decision, and offers no profit guarantee.

It uses the same deterministic `engine-core` rules as backtesting. The [backtest specification](./backtest.md) is the single detailed source for financial calculations and virtual execution; the paper engine cannot add assumptions.

The MVP has no exchange-account integration. The paper/data worker is a separate process capable of operating 24/7 while the Next.js page is closed.

## 2. Start acceptance gate

A paper run may start only when all conditions are met:

- The backtest completed successfully.
- There is no critical data or strategy error.
- The user approved and locked the strategy card.
- Commission, slippage, position size, and risk rules are defined.
- The user explicitly acknowledged that paper trading is not real trading.
- If the backtest has fewer than 30 completed trades, the `insufficient sample` warning was acknowledged separately.

The start screen summarizes the pair, timeframe, entry/exit, stop/take-profit, position, re-entry, 10,000 USDT virtual capital, costs, strategy version, and sample warnings.

The run starts only after the user presses **“Approve the strategy and start paper trading.”** AI cannot start it.

## 3. Virtual portfolio

- Every run starts flat with an independent `10,000` virtual USDT.
- At most one position may be open.
- Long-only; no short selling, leverage, borrowing, or negative cash.
- Paper position size may be `25%`, `50%`, or `100%`.
- Unused capital stays in USDT without interest.
- Starting balance cannot be changed; a different balance requires a new run.
- Every strategy/pair has a separate portfolio; shared-capital multi-pair portfolios are outside the MVP.

Commission, slippage, minimum-order, and quantity-rounding rules match the [backtest](./backtest.md).

## 4. Live data flow

The system receives completed one-hour bars and derives four-hour and daily bars from completed one-hour bars using UTC boundaries.

1. Live data arrives.
2. The system waits for bar close.
3. A short post-close validation is applied.
4. The bar is verified as complete and final.
5. Indicators are calculated.
6. The strategy is evaluated.
7. A virtual order is created if needed.

Open bars cannot be used. Missing data cannot be estimated, copied from the previous price, or forward-filled. If a bar cannot be validated within five minutes after expected close, the run pauses automatically. Data rules are in the [data policy](../data/data-policy.md).

## 5. Signal and virtual order

```text
Completed and validated bar
→ indicator
→ entry/exit check
→ virtual order
→ virtual fill under engine rules
→ commission and slippage
→ portfolio and trade record
```

- A normal signal is calculated at completed-bar close and executes no earlier than the next bar’s open.
- If entry and exit occur on the same candle, exit has priority.
- No new entry or pyramiding while a position is open.
- No exit and re-entry on the same candle.
- Stop-loss and take-profit use the completed bar’s OHLC; if both are reached, stop is assumed first.

## 6. Duplicate-processing safety and audit trail

Every decision records at least the strategy and immutable version, pair, timeframe, UTC time of the bar used, data version/snapshot, engine version, and a unique event ID. The signal, virtual order, fill, costs, and post-transaction portfolio state must be traceable.

Receiving the same bar or event again cannot create a second order or trade.

## 7. Persistent state, interruption, and restart

State is persisted after every bar, signal, order, and fill. On restart:

1. Locate the last successful bar.
2. Retrieve the missing range from a REST/backfill source.
3. Validate integrity.
4. Replay bars in UTC order.
5. Skip processed event IDs.
6. Label virtual trades that should have occurred during the interruption as `processed during replay`.
7. Do not continue unless all data is validated.

Estimated prices, silent skipping, replacing a missing bar with another price, or jumping to the present without checking signals are prohibited.

## 8. Minimum forward test

| Timeframe | Minimum duration |
|---|---:|
| 1 hour | 30 days |
| 4 hours | 60 days |
| Daily | 180 days |

At least 10 completed round trips are also required. If the duration is met without 10 trades, the run is not failed; it remains in `insufficient trades` and may continue. After the minimum, it runs until the user stops it or an automatic stop occurs.

## 9. Notifications

In-app, and optionally email, notifications are sent when:

- The run starts.
- An entry/exit signal occurs.
- A virtual order fills.
- Stop-loss or take-profit triggers.
- A data interruption pauses the run.
- Data is completed and the run resumes.
- A risk limit stops the run.
- A weekly performance summary is ready.
- The minimum paper duration completes.

Every notification must contain the signal time, completed bar used, execution price, commission, position, and new virtual balance. No notification is sent for every bar without an important event.

## 10. Automatic pause

Pause automatically when:

- A bar is delayed more than five minutes.
- Data validation fails.
- The connection is lost and backfill cannot complete the gap.
- Portfolio and trade records do not match.
- The same event is detected as processed more than once.

No new entry is made while paused. The run cannot continue until data and system state are fully validated.

## 11. Automatic stop

Stop automatically when:

- The virtual portfolio falls `25%` from its initial 10,000 USDT.
- The pair is delisted.
- A critical engine error occurs for three consecutive bar periods.
- The data source is unavailable for more than 24 hours.

The reason and last validated system state are shown to the user.

## 12. User pause and stop

**Pause:** No new entries; the open position is retained and its stop-loss, take-profit, and normal exits continue. All intervening bars are validated before resuming.

**Stop:** The open position is closed virtually at the next valid price, commission/slippage applies, and the run ends. The reason and final portfolio are recorded.

## 13. Strategy versioning

The active paper strategy version is immutable. An edit does not alter the current run; it requires a new version, revalidation, user approval, and a new paper run. Old runs/results are not deleted or merged. AI cannot silently change a strategy.

## 14. Technical consistency with backtesting

Finalized paper-period data is rerun with the same locked strategy and engine. Signals, order count/direction/sequence, cost application, and portfolio accounting are expected to match `100%`.

When they differ, show the affected bar; data, engine, and strategy versions; interruption/restart and replay information; and the reason. Do not silently correct or overwrite historical results.

## 15. Performance comparison

Compare the initial backtest’s unseen-test section with the paper period on net return, maximum drawdown, volatility, Sharpe, trade frequency, win rate, average trade return, exposure, commission, and slippage.

Lower paper performance is not automatic failure. The purpose is to assess behavior on new data, shared rules across both engine paths, interruptions, and reproducibility.

## 16. Visible-error principle

Data, engine, portfolio, and record errors cannot be hidden. A critical error carries a clear message, affected time range, pause/stop state, and replay/recovery record. Missing data, estimated prices, silent skipping, and silent rule changes are not allowed.

## 17. Outside the MVP

- Real money, exchange connection, or real orders,
- Short selling, leverage, and borrowing,
- Shared-capital multi-pair portfolios,
- Minute-level, second-level, scalping, or high-frequency trading,
- Trailing stops,
- Paper runs automatically started or changed by AI.

## 18. Decisions pending

1. Exact length of the “short validation period” within the five-minute maximum.
2. Exact fill definition of “next valid price” for a user `Stop`.
3. Whether an open position closes or freezes on an automatic stop.
4. How paper’s `25%/50%/100%` choices align with the user-defined percentage in backtesting.
5. In-app/email notification provider.
6. Day, time, and timezone of the weekly summary.
7. Primary/backup data source and paper-hosting provider.
8. How mandatory transaction fields are represented in state notifications that contain no trade or signal.
9. How the paper-start warning applies when total trades are at least 30 but the unseen-test section has fewer than 10 trades.
10. Whether starting capital may be changed when creating a new paper run and, if so, its permitted limits; until decided, the standard value is 10,000 virtual USDT.

AI or the application cannot fill these details by assumption.
