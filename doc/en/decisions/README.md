---
title: "quantint decision records"
document_id: QNT-DECISIONS
version: 0.1.0
status: draft
language: en
source_of_truth: false
source_document: ../../tr/decisions/README.md
last_updated: 2026-09-11
---

# Decision records

This directory is for short, traceable records of approved decisions that materially change the product's direction or behavior. Detailed current rules live only once in the relevant specification; a decision record explains why the change was made and who approved it.

## Simple record format

Each decision is stored in a separate Markdown file with:

- Decision ID and title
- Date
- Status: `proposed`, `accepted`, `rejected`, or `superseded`
- Context and the problem being resolved
- Decision
- Rationale and evidence links, if any
- Affected specifications and code areas
- Explicit human approval
- A link to the previous record when superseding a decision

AI may prepare a decision proposal, but it cannot independently mark a decision as `accepted` when it affects product scope, financial calculations, data policy, architecture, security, or legal posture. Old records are not silently deleted; they remain linked to their replacement.

No separate decision record exists yet. The v0.1 foundation is recorded in the current specifications and the [changelog](../changelog.md).
