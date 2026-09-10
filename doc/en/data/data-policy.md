---
title: "quantint data policy"
document_id: QNT-DATA-POLICY
version: 0.1.0
status: draft
language: en
source_of_truth: false
source_document: ../../tr/data/data-policy.md
last_updated: 2026-09-11
---

# quantint data policy

[Main document](../quantint-beyin.md) · [Turkish source of truth](../../tr/data/data-policy.md)

## 1. Purpose and immutable principles

This document defines source selection, quality control, bar construction, missing-data behavior, storage, and versioning for backtest and paper-trading market data.

1. Data accuracy, sufficient historical depth, and written usage rights are non-negotiable.
2. An incomplete bar cannot be used in strategy calculations.
3. Missing data cannot be hidden with a previous price, forward-fill, or estimation.
4. Every result is tied to a data-snapshot version.
5. The same data, strategy, and engine must produce the same result.
6. AI cannot silently change the data provider or policy.

> A source that is technically free but has unclear commercial-use rights may be used only for internal development; it cannot be the permanent data source for the externally available MVP.

## 2. Current provider status

Binance is a candidate, not the finalized provider. Binance or another source may be accepted only after written evidence verifies commercial use, storage, caching/normalization, chart display, backtest/paper results and snapshots; access from Türkiye; costs; and limits.

Technical access to a public API alone is not usage permission. The Binance legal product/API environment to evaluate has not yet been selected.

## 3. Provider acceptance criteria

| Criterion | Mandatory MVP expectation |
|---|---|
| Historical depth | At least three years of one-hour OHLCV; under the original acceptance wording, for all eight selected pairs. Four-hour and daily bars must be derivable. |
| Data integrity | At least `99.9%` completed bars; no duplicates, malformed OHLC, or unexplained long gaps. |
| Freshness | A closed bar is available within five minutes; open/closed status is explicit. |
| Interruption handling | Automatic reconnection and backfill; paper pauses on delay and gaps are not silently filled. |
| API capacity | At least eight pairs can be monitored without hitting limits; batch queries and preferably WebSocket are available. |
| Cost | Data costs `USD 0` throughout the MVP; no unexpected usage/overage fees. |
| Commercial use | Rights to store, chart, and produce backtest and paper results are explicit. |
| Data storage | Permission exists for caching, normalization, and reproducibility snapshots. |
| Paper/testnet | Not mandatory; testnet/demo is strongly preferred for future live integration. |
| Access from Türkiye | No VPN required; account/API access from Türkiye is not blocked, and regional usage terms are clear. |
| Technical sustainability | Official docs, stable symbol IDs, announced API changes, and machine-readable trading rules exist. |

A source cannot become the permanent MVP source until every mandatory criterion is met.

## 4. Fixed `UNIVERSE_V1`

The MVP performs no dynamic liquidity calculation at runtime. The initial universe is:

1. BTC/USDT
2. ETH/USDT
3. BNB/USDT
4. SOL/USDT
5. XRP/USDT
6. DOGE/USDT
7. ADA/USDT
8. TRX/USDT
9. AVAX/USDT
10. LINK/USDT
11. DOT/USDT
12. BCH/USDT
13. LTC/USDT
14. UNI/USDT
15. NEAR/USDT

The list does not update itself from daily/periodic volume rankings and is not represented as a verified “all-time cumulative volume ranking.” It is a practical fixed MVP catalog of liquid assets with user interest. Every result carries the universe version.

Each strategy uses one pair. Copies for other pairs are separate tests and paper runs.

## 5. Universe versioning

`UNIVERSE_V1` cannot change silently. Adding/removing/replacing a pair requires rationale and data evidence, quality and usage-right checks, impact analysis, and explicit human approval; the result is a new version such as `UNIVERSE_V2`. Old results remain tied to the old universe.

Today’s list is not applied retroactively. An asset cannot trade before listing or during a period without data; another symbol’s history cannot be silently merged. A delisted pair triggers the automatic-stop condition for an active paper run.

## 6. Source-bar standard

The primary unit is one-hour OHLCV. Every bar contains at least a stable symbol ID, start/end time, open/high/low/close/volume, open/completed status, source, and data/snapshot ID. All times normalize to UTC.

Only completed and validated bars are used for indicators, signals, backtests, paper trading, and benchmarks.

## 7. Four-hour and daily construction

Higher timeframes are built deterministically only from completed one-hour bars and use UTC boundaries. If a source bar is missing, the higher bar is not complete. Open or missing bars, estimates, previous values, and silent price/volume completion cannot be used. The same snapshot produces the same higher-timeframe bars.

## 8. Data-integrity checks

At least the following are checked:

- Duplicate timestamp/bar,
- Missing bar and open/completed distinction,
- Malformed OHLC or unexplained price/volume,
- Chronology and expected-interval mismatch,
- Symbol-identifier change,
- Traceability from source to normalized record.

Completed-bar ratio is at least `99.9%`. An unexplained gap longer than two bars rejects a backtest. Shorter gaps also are not filled; if an execution price cannot be determined, a data error is returned and no other bar is used.

## 9. Live-data delay

A closed bar must be received and validated within five minutes of expected close. Otherwise paper pauses automatically, creates no new signal/entry, shows the problem, attempts reconnection/backfill, and processes bars chronologically. Normal operation does not resume until the gap is resolved.

## 10. Interruption and backfill

The source must provide reconnection, last-successful-bar detection, missing-range queries, batch historical data, chronological processing, and duplicate detection.

Backfill source/version is recorded, passes the same checks as normal data, and cannot create a second transaction from an already processed event. Paper does not resume if the period cannot be fully validated. Interruption and replay history are not deleted.

Whether primary and backfill data may come from different providers remains undecided.

## 11. Listing, symbol, and market rules

The provider supplies stable/traceable symbol IDs, listing/delisting information, machine-readable minimum order and lot step, and official API-change notices.

Symbol changes, token conversions, renaming, or market migration cannot be silently applied to history. Minimum order and lot step use the rule valid at execution time; the source of historical rule versions remains undecided.

## 12. Storage and reproducibility

quantint must have written rights to cache history, normalize it, store it as Parquet, retain snapshots, display charts, produce backtest/paper results, and store long-lived files in S3-compatible storage.

Every result is tied to at least data source/snapshot, normalization or bar-construction version, `UNIVERSE`, strategy, and engine versions. A snapshot change does not overwrite an old result; a rerun creates a new result.

## 13. Error visibility

Where applicable, user and administration screens show the last validated bar, delay, missing range, backfill state, validation error, affected pair/timeframe, paused paper runs, snapshot version, and source-unavailable duration. Gaps, provider changes, and corrections cannot be hidden.

## 14. Provider change

A provider change is critical and cannot be made by AI/automation. All new-source criteria and written rights are verified, old/new bars are compared, result impact is shown, human approval is obtained, and a new data/snapshot version is recorded in the changelog and decision record. Old results are not silently overwritten with new data.

## 15. Outside the MVP

- Minute-level, second-level, tick, or order-book data,
- Scalping and high-frequency data,
- Real user exchange-account, balance, or trading history,
- A dynamic universe that applies today’s liquidity list to the past,
- External use of data with unclear commercial rights,
- Filling missing prices by estimation.

## 16. Decisions pending

1. Permanent MVP provider and the Binance environment to evaluate.
2. Which eight pairs belong to the acceptance test and whether three-year depth applies to eight pairs or all 15 in `UNIVERSE_V1`.
3. Whether live and historical/backfill providers must match, whether a backup exists, and whether automatic failover is allowed.
4. The document/legal review required to accept commercial-use rights.
5. Source of historical minimum-order and lot-step rules.
6. Merge policy for symbol changes, token conversions, forks, and redenominations.
7. Physical Parquet layout and partitioning.
8. S3-compatible storage provider and data/snapshot retention periods.

AI or the application cannot fill these matters by assumption.
