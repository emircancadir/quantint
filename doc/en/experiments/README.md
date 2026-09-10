---
title: "quantint experiment records"
document_id: QNT-EXPERIMENTS
version: 0.1.0
status: draft
language: en
source_of_truth: false
source_document: ../../tr/experiments/README.md
last_updated: 2026-09-11
---

# Experiment records

This directory stores evidence from data-source evaluations, engine verification work, strategy experiments, performance tests, and user research.

## Simple record format

Each experiment is stored in a separate Markdown file with at least:

- Experiment ID, name, and date
- Goal or hypothesis
- Strategy, engine, and data versions used
- Method and controlled conditions
- Location of raw results
- Result summary, limitations, and observed errors
- Status: `planned`, `running`, `completed`, `invalid`, or `archived`
- A link to the related decision record when a decision is proposed

AI may directly record evidence-backed experiment output. Raw results are not altered afterward. AI cannot independently declare an experiment `validated`, a strategy `guaranteed to be profitable`, or a feature `ready for live use`; such conclusions require explicit team approval.

There are no experiment records yet.
