---
title: "quantint documentation changelog"
document_id: QNT-CHANGELOG
version: 0.1.0
status: draft
language: en
source_of_truth: false
source_document: ../tr/changelog.md
last_updated: 2026-09-11
---

# Changelog

[Main document](quantint-beyin.md) · [Turkish source of truth](../tr/changelog.md)

## 2026-09-11 — v0.1.0 draft

**Change ID:** `QNT-CHANGE-0001`

**Source:** Product-requirements discussion with the team

**Status:** Initial draft awaiting review

Created content:

- Turkish source-of-truth and synchronized English-copy structure,
- Living root specification and controlled AI-update protocol,
- Product purpose, target user, scope, user flow, and completion criteria,
- Responsibility boundary between Next.js and the separate Python/FastAPI engine,
- AI-assisted and visual non-AI strategy-creation flows,
- Controlled MVP strategy language,
- Deterministic backtest, cost, validation, and performance-measurement rules,
- Paper trading, interruption, replay, pause, and notification rules,
- Data-provider acceptance criteria and fixed `UNIVERSE_V1`,
- Simple protocols for decision and experiment records.

This version contains no product-code, engine, installation, deployment, commit, or push changes. Items under `Decision pending` are not approved implementation behavior.

Conflicts intentionally kept visible:

- The earlier eight-pair provider-acceptance requirement versus the 15-pair `UNIVERSE_V1`,
- User-selected position percentages in backtesting versus the `25%/50%/100%` choices in paper trading,
- Editable cost fields on the strategy card versus fixed backtest commission/slippage standards,
- How the total 30-trade and unseen-test 10-trade thresholds jointly affect the paper-start gate.

Moving the initial draft to `accepted` requires team review and explicit human approval.
