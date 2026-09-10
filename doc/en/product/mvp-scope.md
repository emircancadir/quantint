---
title: "quantint MVP scope"
document_id: QNT-PRODUCT-MVP
version: 0.1.0
status: draft
language: en
source_of_truth: false
source_document: ../../tr/product/mvp-scope.md
last_updated: 2026-09-11
---

# quantint MVP scope

[Main document](../quantint-beyin.md) · [Turkish source of truth](../../tr/product/mvp-scope.md)

## 1. Purpose

The quantint MVP enables users to turn an investment idea into a clear, executable algorithmic strategy without writing code, test it on historical data, and monitor it in a virtual portfolio using real market data that arrives afterward.

> Describe your idea or build it visually → clarify the rules → review the strategy card → explicitly approve it → run a backtest → run it in a virtual environment → monitor the results

The final outcome is not merely a demo made of working screens. Accounts, strategy creation, validation, backtesting, paper trading, monitoring, error visibility, and reproducibility must work together.

## 2. Product positioning

quantint is a financial technology product. It helps users turn their own ideas into systematic rules and research their behavior.

- It does not guarantee profit.
- It does not present historical or virtual performance as a guarantee of future performance.
- It does not trade on behalf of investors in the MVP.
- It does not connect to exchange accounts, real balances, or real portfolios in the MVP.
- Exact user-facing legal text requires separate approval.

## 3. Target user and market

The first target is a mid-level retail investor who understands basic investment concepts and indicators such as RSI, moving averages, and buy/sell signals but cannot code. Fully professional quants and high-frequency traders are not the target.

The initial focus is Türkiye. The product will be designed for potential global use and future expansion to markets such as BIST, Nasdaq, or FX; these expansions are not MVP commitments.

### MVP market scope

- Crypto assets are the priority.
- Pairs are quoted in USDT.
- A fixed, versioned `UNIVERSE_V1` is used.
- Each strategy is tied to one pair.
- Supported timeframes are `1h`, `4h`, and `1d`.
- Only long positions and return to USDT cash are supported.

Pair and data details are defined in the [data policy](../data/data-policy.md).

### Outside the MVP

- Minute-level, second-level, scalping, and high-frequency strategies,
- Weekly timeframe,
- Short selling, leverage, and borrowing,
- Shared-capital multi-pair portfolios,
- BIST, Nasdaq, and FX,
- Real money, exchange-account connection, and real-order submission.

## 4. User account and core records

A user must be able to:

- Create an account and sign in,
- View draft and approved strategy versions,
- Reopen backtest results,
- Monitor paper runs and virtual transactions,
- Pause or stop a strategy,
- Copy a strategy,
- Create a new version by making a change.

The product must also include user management, strategy records, basic educational content, an administration screen, visible data/system errors, and an audit trail sufficient to reproduce results. Detailed administration permissions have not yet been decided.

## 5. Strategy-creation paths

### 5.1 AI-assisted creation

The user does not need to write a technical format. For example:

> In BTC, buy when the 20 EMA crosses above the 50 EMA; exit when RSI becomes too high.

The system does not execute this message directly. It first:

1. Summarizes its understanding in plain language.
2. Identifies only missing or ambiguous rules that would change the result.
3. Uses selectable buttons where possible and asks only two or three questions at a time.
4. Updates the strategy card live from the answers.
5. Does not convert an unsupported request into an approximate rule.

AI may produce only `needs_clarification`, `strategy_draft`, or `unsupported`.

### 5.2 Visual and manual creation

Without AI, a user:

1. Selects the pair and timeframe.
2. Adds entry and exit conditions as rows.
3. Selects indicators, operators, and parameters.
4. Configures supported stop-loss, take-profit, time-exit, and re-entry settings.
5. Sets position size.
6. Reviews and approves the strategy card.

The manual path must remain fully operational when the AI quota is exhausted or the service is unavailable.

### 5.3 Ready-made templates

Users must be able to start from a ready-made template and edit its rules. The number and content of templates have not yet been decided. Every template uses the same validation and versioning process as the other paths.

### 5.4 Shared strategy contract

AI, the manual builder, and templates produce the same standard `Strategy JSON`. All use the same schema, scope, parameter, and logic validation; engine preflight; and human approval. The exact contract is bounded by the [strategy language](../engine/strategy-language.md).

## 6. AI layer

### Role and authority boundary

AI converts natural language into a strategy draft, asks about ambiguity, reports unsupported features, and explains final rules in one plain-language paragraph. AI:

- Is not the authority for financial calculations,
- Cannot add hidden assumptions,
- Cannot run arbitrary Python, SQL, or other executable code,
- Cannot select parameters and optimize profit for the user,
- Cannot start a backtest, paper run, or live order,
- Cannot replace human approval.

### Provider and operation

- Only OpenAI is used in the MVP.
- Calls are server-side; the API key is not sent to the browser.
- The Responses API and JSON Schema-based Structured Outputs are used.
- Structured Outputs is not final proof of safety; the deterministic validator remains authoritative.
- A provider-independent adapter is retained; second providers such as Anthropic or Google are outside the MVP.
- The model name is not hard-coded and may be changed through administration settings.

Official references:

- [OpenAI Responses API](https://developers.openai.com/api/reference/cli/resources/responses/methods/create)
- [Structured Outputs](https://developers.openai.com/api/docs/guides/structured-outputs)
- [OpenAI API data controls](https://developers.openai.com/api/docs/guides/your-data)

### Cost and usage controls

quantint covers AI costs in the MVP; users are not asked for an API key. The product must use a monthly per-user message quota, a target of 8–10 conversation turns per strategy, and user/IP rate limits. Exact quotas and a single turn limit require a later decision. The manual builder stays available after the quota is reached. User-provided API keys are outside the MVP.

Only the current strategy state and necessary context, not long conversation history, should be sent.

### Information that may be sent to the model

- The user’s strategy-related message,
- Language and regional preference,
- Selected pair and timeframe,
- Current strategy draft,
- Supported-rule catalog,
- Answers to clarification questions,
- At the user’s choice, summary metrics and warnings produced by the engine.

### Information that must not be sent

- Raw OHLCV or large market-data files,
- Name, email, phone, and payment information,
- Exchange API keys, access tokens, or wallet addresses,
- Real balances, portfolios, and trading history,
- Unnecessary logs and conversation history not required for the task.

Sensitive information is masked before a request. The user is told what is transferred to the provider. API requests use `store: false`; this disables storage of Responses application state but is not, by itself, a Zero Data Retention guarantee. Under the OpenAI policy verified on 2026-09-11, API data is not used for model training unless the customer explicitly opts in, while standard abuse-monitoring logs may be retained for up to 30 days. Zero Data Retention is considered only if eligibility and provider approval exist. These facts must be rechecked against current official sources before release.

### Validation pipeline

Before an AI draft can run, it passes:

1. Schema validation,
2. Supported-scope validation,
3. Parameter limits,
4. Logic and conflict checks,
5. Lookahead safety,
6. Security checks for arbitrary code/external calls/short/leverage/live orders,
7. Engine preflight on a small dataset,
8. Human approval on the strategy card.

Unknown fields are rejected.

## 7. Strategy card

During conversation or manual editing, a live card displays at least:

- Strategy name, pair, and timeframe,
- Entry and exit rules,
- Optional stop-loss, take-profit, and time exit,
- Position size and re-entry behavior,
- Signal and execution timing,
- Direction, commission, and slippage,
- Backtest period.

The user may change each field through conversation or by selecting the field. The card visibly reports a missing exit, contradiction, unsupported logic, out-of-range parameter, infeasible position, insufficient data/warm-up, and blocking data or engine errors.

At the final stage, AI explains the strategy to be executed in one plain-language paragraph.

## 8. Approval and versioning

The backtest runs only after the user explicitly selects **“Approve the rules and start the backtest.”**

- The strategy card and `Strategy JSON` are versioned and locked together.
- The approved version is immutable.
- Every later change requires a new version and new user approval.
- The data, engine, costs, and date settings used are recorded.
- An active paper strategy cannot be edited in place; it requires a new version and new paper run.

## 9. Backtest and results experience

The backtest date range is selectable; insufficient duration or trade count produces a visible warning. Net results include costs, show buy-and-hold for the same asset, and are reproducible from the same versions.

Results are separated into:

1. Development period,
2. Unseen test period,
3. Full period.

The user first sees development results; unseen test results are revealed after final approval and lock. Changing a parameter after viewing the test creates a new `re-optimized` version and increments the attempted-version count. A strategy that performs well in development but deteriorates materially in test receives a `possible overfitting` warning.

The top section contains only:

1. Net total return,
2. Difference from buy-and-hold,
3. Maximum drawdown,
4. Sharpe,
5. Completed trade count,
6. Exposure.

Other metrics appear under `Detailed performance`. The unseen test period is the primary assessment. Exact mathematics is in the [backtest specification](../engine/backtest.md).

## 10. Paper trading and dashboard

A paper run cannot start without a completed backtest, locked strategy, defined cost/risk rules, and user acknowledgement that it is not real trading. Fewer than 30 backtest trades require an additional `insufficient sample` acknowledgement. The run starts only through **“Approve the strategy and start paper trading.”**

The dashboard combines at least:

- Drafts and approved strategy versions,
- Running/completed backtests,
- Active, paused, and stopped paper runs,
- Virtual balance, open position, and trades,
- Net performance and cost impact,
- Last processed bar and data/engine health warnings.

The paper worker must operate 24/7 while the web page is closed. If data is delayed or cannot be validated, it creates no estimated trade; it pauses and explains why. Details are in the [paper trading specification](../engine/paper-trading.md).

## 11. Error visibility and reproducibility

Missing/delayed data, an incomplete bar, insufficient indicator history, invalid strategy, missing execution bar, worker failure, AI outage/exhausted quota, and version mismatch are shown clearly. The system cannot estimate a missing price, substitute another bar, hide a gap, or run unvalidated AI output.

Every result is associated with the user, immutable strategy version and JSON, engine version, data snapshot/stream version, pair, timeframe, UTC range, cost settings, job ID, timestamp, and error status. The same strategy, engine, and data must produce the same result.

## 12. Educational content

The MVP explains strategy rules versus signals, completed candles, commission and slippage, backtest versus paper trading, maximum drawdown, overfitting, insufficient samples, and why past performance does not guarantee future results. Format and publication process remain undecided.

## 13. Technical architecture boundary

```text
Next.js application
User interface, session, strategy card, and result screens
        ↓ HTTPS API
Python / FastAPI
AI validation, strategy management, and engine API
        ↓
Backtest worker + Paper/data worker
        ↓
PostgreSQL + Redis + Parquet + S3-compatible object storage
```

### Next.js

- User registration and sessions,
- AI chat and manual builder,
- Strategy card,
- Backtest initiation and results UI,
- Paper start/stop and monitoring,
- Notification and status screens.

Indicators, portfolio accounting, and backtest calculations do not live in Next.js.

### Python/FastAPI and workers

- Convert AI output to `Strategy JSON` and validate it,
- Indicator and engine calculations,
- Backtest execution,
- Commission, slippage, and virtual fills,
- Paper portfolio accounting and live-bar processing,
- Strategy, engine, and data version records.

The calculation layer uses Polars/NumPy. PostgreSQL stores application records; Redis provides the job queue and locks; Parquet stores historical price data; and S3-compatible object storage holds long-lived files.

A backtest request returns a job ID; the worker writes results to persistent storage. Progress is delivered with SSE and, when needed, polling. API and worker processes run separately with Docker. The paper/data worker cannot run in a short-lived serverless function. The RQ-versus-Dramatiq choice and hosting providers remain undecided.

## 14. MVP completion criteria

The MVP is complete only when this full flow is tested and reliable:

- A user creates an account and signs in.
- AI, the manual builder, or a template creates a strategy within the same supported scope.
- Unsupported or missing rules are visibly rejected or clarified.
- The card is editable and explicit approval creates an immutable version.
- Backtesting produces deterministic results including costs.
- Development, unseen test, and full-period results are separated; benchmark and sample warnings are visible.
- An eligible strategy starts in paper mode and processes completed bars while the page is closed.
- The user monitors virtual positions, trades, balances, performance, and errors.
- A strategy can be stopped, copied, and branched into a new version.
- Results are reproducible from strategy, engine, and data versions.
- Basic educational content and the administration screen are available.
- Automated tests protect critical product and financial rules.
- No real money is used and no profit is guaranteed.

## 15. Decisions pending

- Permanent data provider and Binance usage rights.
- Numeric AI quotas.
- Number and content of ready-made templates.
- Detailed administration-screen actions and permissions.
- Exact educational-content format and publication process.
- User-record retention and deletion policy.
- Country-specific legal text and release conditions.

Until decided, neither the implementation nor AI may turn an assumption into a permanent product rule.
