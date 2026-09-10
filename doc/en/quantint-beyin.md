---
title: "quantint brain"
document_id: QNT-BRAIN
version: 0.1.0
status: draft
language: en
source_of_truth: false
source_document: ../tr/quantint-beyin.md
last_updated: 2026-09-11
---

# quantint brain

> The main project entry point and living product/work specification for humans and AI systems.

[Turkish source of truth](../tr/quantint-beyin.md)

## Purpose of this document

`quantint-beyin.md` enables team members and AI models such as Claude, ChatGPT, or others to understand the project from the same context. It defines the current project summary, non-negotiable boundaries, document map, and specification-update protocol. Detailed rules live only once in linked documents.

This is not an installation guide. It does not, by itself, authorize any command, backtest, paper trade, or live trade.

## What is quantint?

quantint is a financial technology product that enables retail investors who cannot code but understand basic investment concepts and indicators such as RSI, moving averages, or buy/sell signals to create algorithmic strategies.

A user may create a strategy:

- By speaking with AI in everyday language,
- By starting from a ready-made template,
- Through the visual strategy builder without AI.

Core product flow:

> Describe your idea or build it visually → clarify the rules → approve the strategy → test it on historical data → run it in a virtual environment → monitor the results

The first MVP is not merely an interface demo. The full flow must be reliable, tested, reproducible, and ready to be opened to real users.

## Non-negotiable MVP boundaries

The following rules cannot change without explicit human approval:

- No real-money trading.
- No connection to the user’s exchange account and no real orders.
- Paper trading uses real market data with virtual balances and virtual transactions.
- Crypto and USDT pairs are the priority.
- Only long positions and return to USDT cash are supported; there is no short selling or leverage.
- Each strategy is tied to one pair and uses an independent virtual portfolio.
- AI is not an investment-decision engine; it helps translate natural language into limited, executable strategy rules.
- The visual strategy builder must work fully without AI.
- AI cannot directly start a backtest, paper run, or any future live trade.
- A strategy version cannot be locked or executed without explicit user approval.
- quantint does not guarantee that any strategy will be profitable.
- Backtest or paper results cannot be presented as a guarantee of future performance.
- A deterministic engine performs financial calculations; AI cannot define or silently change them.

## Current project state

- A working Next.js web application, user/session infrastructure, content areas, and administration features exist.
- The existing web price ticker is display-only; it is not historical data, a backtest engine, or a paper engine.
- The backtest and paper-trading engine has not yet been developed.
- The existing Next.js application will be preserved rather than rewritten.
- The engine will connect as a separate Python/FastAPI service.
- Backtesting and paper trading will use the same `engine-core` package.
- The browser will not connect directly to market-data providers or the AI API.
- Long-running work will use API and worker processes rather than waiting inside a web request.
- The target structure uses PostgreSQL, Redis, Parquet, and an S3-compatible object store.
- The MVP will run API, backtest worker, and paper/data worker processes from one Python codebase; unnecessary microservice fragmentation will be avoided.

These points define the current direction; products or providers not yet selected are not final decisions.

## Document map

- [MVP scope](product/mvp-scope.md): Product purpose, user flow, AI and manual creation, screens, technical boundaries, and completion criteria.
- [Strategy language](engine/strategy-language.md): Supported indicators, operators, conditions, risk rules, and validation boundaries.
- [Backtest](engine/backtest.md): Execution rules, costs, data split, metrics, and reproducibility.
- [Paper trading](engine/paper-trading.md): Virtual portfolio, live-data processing, pause, recovery, and error behavior.
- [Data policy](data/data-policy.md): Provider acceptance criteria, quality standards, pair universe, and snapshot rules.
- [Decision records](decisions/README.md): Rationale and approval history for critical decisions.
- [Experiment records](experiments/README.md): Experiment plans, evidence, and locations of raw results.
- [Changelog](changelog.md): Chronological record of meaningful documentation changes.

## Language and source-of-truth rule

- Turkish documents under `doc/tr/` are the single source of truth.
- Documents under `doc/en/` are meaning-preserving English copies.
- English documents cannot introduce a requirement, decision, or interpretation absent from the Turkish source.
- An approved change is applied to the Turkish and English documents and both changelogs in the same change.
- Both languages use the same change ID, date, status, and decision meaning.
- If the versions conflict, Turkish prevails and the mismatch is reported visibly.
- A change is incomplete until both languages are synchronized.
- Documents use standard Markdown and relative links; they do not require Obsidian, GitHub, or a particular AI product.

## Living specification and controlled updates

This document system is a strong project memory. AI may record low-risk, evidence-backed information, but it cannot silently change product scope or financial rules.

### Information AI may record directly

When the meaning of existing decisions does not change:

- Spelling, formatting, and broken-link fixes,
- Verified dates, sources, links, and version information,
- Facts explicitly provided by the team that do not conflict with current rules,
- Raw experiment results and run metadata,
- Observations that do not assign a decision or validation status,
- Changelog and English-translation synchronization for an approved change.

The source, date, and reason must be preserved.

### Changes requiring explicit human approval

AI may only propose changes involving:

- Expansion or reduction of MVP/product scope,
- Financial calculations and order-execution rules,
- Commission, slippage, capital, position, and risk rules,
- Supported markets, pairs, timeframes, indicators, or strategy language,
- Data providers and data-acceptance policy,
- Material architecture changes,
- Security, privacy, legal, or regulatory rules,
- Roadmap and live-trading scope,
- Deletion of historical information,
- Marking an experiment `validated`, a feature release-ready, or a strategy reliable.

An explicit instruction approves only the named change; its scope cannot be broadened.

### Statuses

Use: `idea`, `proposed`, `accepted`, `experimenting`, `validated`, `rejected`, `superseded`, `archived`.

AI may record raw output but cannot assign `validated` without human approval.

### Critical-change workflow

1. Read the current source document and linked decisions.
2. Identify conflicts with the new information.
3. Show the old and proposed new text.
4. State effects on product, engine, data, security, and user experience.
5. Prepare a change ID, date, rationale, source, and affected documents.
6. Wait for explicit human approval.
7. After approval, update the Turkish source, English copy, and changelog together.
8. Do not delete the old decision; preserve it as `superseded` or `archived` when appropriate.

### Conflict and uncertainty behavior

- If uncertain, AI proposes instead of editing.
- Conflicts among documents, code, tests, experiments, or conversation are not hidden.
- AI cannot resolve a conflict using its preferred interpretation.
- Missing information is marked `Decision pending`, not inferred.
- A detailed rule lives in one authoritative document; other documents link to it.
- AI without file access does not claim to have edited files; it supplies an applicable patch or proposal.
- AI with file access may edit within approved scope but cannot commit, push, or merge without an explicit request.

## Team

- Emircan — primary focus: engine development.
- Alp — primary focus: engine development.
- Berke — primary focus: frontend and backend development.

These are not rigid responsibility boundaries. Responsibilities may expand, and new members may join.

## Decisions pending

- Permanent market-data provider and verification of Binance commercial-use rights.
- RQ or Dramatiq for the Redis job queue.
- S3-compatible object-storage and deployment providers.
- Numeric AI usage quotas.
- Detailed administration-screen permissions and actions.
- Shared collaboration and synchronization method after moving to Obsidian.
- Country-specific legal text and release conditions.

Until resolved, neither a human nor AI may document an independent choice as an accepted project decision.
