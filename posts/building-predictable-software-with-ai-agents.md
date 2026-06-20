---
title: "Building Predictable Software with AI Agents"
date: "2026-06-20"
---

<img src="https://chatgpt.com/backend-api/estuary/public_content/enc/eyJpZCI6Im1fNmEzNWE4M2VlZjcwODE5MTk0YTFmNzc5NDRmYzczNDY6ZmlsZV8wMDAwMDAwMDVlMjg3MjBlOWNkNWU3MjI3MzQ1YjA2ZCIsInRzIjoiMjA2MjMiLCJwIjoicHlpIiwiY2lkIjoiMSIsInNpZyI6Ijg2ZWUxZjg1NTM3ZGQwYzliNzZmMTExYzMwZDhjMWU2OGRmMjQxY2E2ZjA2MmIyYzljZGNhMTFlYTA3MTFmMmQiLCJ2IjoiMCIsImdpem1vX2lkIjpudWxsLCJjcyI6bnVsbCwiY2RuIjpudWxsLCJmbiI6bnVsbCwiY2QiOm51bGwsImNwIjpudWxsLCJtYSI6bnVsbH0=" width="612"/>

AI coding agents have made it possible to scaffold applications, explore unfamiliar codebases, and ship features faster than ever. But speed without structure creates a different kind of debt: each session reinvents the architecture, conventions drift, and business rules end up scattered across routes and templates.

I recently built a personal finance and portfolio tracker using FastAPI and HTMX ([Github Repo](https://github.com/e-motta/portfolio-manager-v2)). I had been using Google Sheets for this purpose for a while, but I wanted to replace it with something easier to use and integrate with other services. I definitely wanted to leverage AI for development speed, but I didn't want an LLM telling me what stocks I needed to buy (call me old-fashioned, but I don't trust them quite that much yet).

Early on I decided to treat specifications as a contract. These specs weren't going to be optional documentation; they were going to be the living foundation that the AI agents implemented against.

In this post, I want to share how I used spec-driven development to build this app. I'll break down what that workflow looks like in practice, where I believe AI truly belongs versus where explicit computation should remain, and how that split played out in a real-world Open Finance integration.

## Specs Are the Contract

Spec-driven development doesn't mean writing a 50-page requirements document upfront. It means deciding on behavior, architecture, and constraints _before_ writing code—and keeping those artifacts alive as the product evolves.

For this project, general specifications lived in an `AGENTS.md` file, which I created alongside the initial project scaffold. It explicitly defined:

- **Layering constraints:** Thin routes, with business logic strictly in services.
- **Framework conventions:** Specific rules for FastAPI and HTMX patterns.
- **Domain invariants:** Fixed rules the system must never break.
- **An explicit "do-not" list.**

When my assumptions changed (for example, when I replaced a local-only MVP authentication with Google OAuth) the spec was updated right alongside the code. AI agents execute across distinct sessions; without a living document, every new session essentially starts from scratch.

Feature work generally followed three tiers, depending on the complexity of what I wanted to implement:

1. **Trivial changes:** If it fit the existing general spec seamlessly and wans't complex, it could be implemented directly with a simple prompt.
2. **Cross-cutting concerns:** For these I detailed a short design memo first to align on the approach.
3. **Large features:** Things like new integrations or multi-module refactors received an explicit, detailed plan. Often, I'd have an explore subagent inventory the codebase first, ensuring the plan referenced what actually existed instead of what the model guessed.

Tests and linters formed the executable layer of this spec. The domain rules had matching, automated tests. Fixtures replaced live APIs in CI. A feature simply wasn't considered done until the suite passed.

With this setup, the development loop was straightforward: write or update the spec, implement against it, verify with tests, and refine based on feedback.

## Where AI Belongs, and Where It Doesn't

This distinction matters heavily, especially for financial software. AI is excellent at development tasks: exploring a codebase, drafting execution plans, scaffolding modules, writing test boilerplates, and orchestrating refactors across multiple files. But deterministic code is far superior at runtime, when the exact same input must produce the exact same output every single time.

Moreover, if you already know the strict rules for categorizing a bank transaction, mapping a payment account, or detecting duplicates, there is zero reason to burn tokens re-deriving them on every sync. Those rules belong in strictly typed services, tested against static fixtures, not floating in a prompt.

Specs tell the agent what to build. Tests and services ensure production behavior stays predictable. This maps directly to the principles I wrote about in [Why determinism still matters in the age of AI](https://www.eduardomotta.dev/posts/determinism-still-matters): AI assists the workflow, but explicit computation owns the result.

## A Practical Example: Cumbuca Open Finance

<img src="https://cdn-images-1.medium.com/v2/resize:fit:1600/1*jIWPeot1cdE2piZsaujGgA.png" width="612"/>

I recently came across [Cumbuca's Model Context Protocol (MCP) server](https://mcp.cumbuca.com/mcp), which exposes the [Brazilian Open Finance environment](https://www.bcb.gov.br/en/financialstability/open_finance) through a standard tool interface. I wasn't going to put an LLM in my app to talk to my bank, but I figured I could still use the MCP as a programmatic data source, replacing CSV downloads and manual entry with a one-click sync. That made it a **sizeable feature**: OAuth, an external protocol, four import paths, and mapping into existing finance and portfolio models. Too big for a one-liner prompt.

The workflow started where every large feature starts: grounding the spec in reality. An explore subagent inventoried my finance models, routes, and import patterns so the plan would reference what already existed, not what the model assumed was there.

From that, we wrote a feature spec in four parts.

- **Discovery** came first: list every MCP tool, call them against a live account, save raw responses as JSON fixtures. No integration code until real tool names and response shapes were on disk.
- **Connection** defined a separate OAuth flow from app login—dynamic client registration, PKCE, per-user refresh tokens, disconnect with token revocation.
- **Sync** named four import paths (credit card charges, account debits, account credits, investment balances) and gave each the same UX contract: preview, row selection, duplicate detection, confirm. It also pinned down the mapping rules: vendor-to-category suggestions, payment-account keywords, per-row debit classification (expense, transfer, or investment), statement-month offsets, and which investment types to skip.
- **Verification** stated that mapping logic would be tested against the fixtures, with no live bank in CI.

Only then did the agent implement, following the spec phase by phase. Discovery produced the fixtures. Connection became `cumbuca_oauth.py`. The MCP transport layer became `cumbuca_mcp.py`. Sync and mapping rules became `cumbuca_sync.py`, the preview routes, and `test_cumbuca_sync.py`. Each file mapped to a section of the spec; each section had a done criterion before moving on.

The runtime is plain Python calling MCP tools programmatically. The spec-driven part is everything that happened before and around that: discovery to avoid guessed APIs, explicit contracts so four import paths didn't diverge, fixtures and tests so the rules stayed fixed as the agent iterated.

## Final words

The hardest part of building with AI agents is not getting them to write code, it is keeping the codebase coherent across sessions, and ensuring that they deliver what you want. Spec-driven development solves that by giving every session the same starting point: a living project spec, right-sized feature plans, and tests that say when something is actually done.

What worked for me was treating specs as artifacts that evolve, not documents you write once and forget. `AGENTS.md` changed when auth changed. The Cumbuca integration got a full plan before a single file was created. Trivial fixes skipped the ceremony; large features did not. Explore subagents grounded those plans in real code so the spec described the system as it was, not as the model wished it were.

If you are starting a project with AI agents, invest in the spec first. Decide your layering, your conventions, and your do-nots before the scaffold grows teeth. When a feature is too big for a one-liner prompt, write the spec—discovery steps, contracts, mapping rules, verification criteria—and let the agent implement against it. The loop is simple: spec, implement, test, refine, update the spec. The agents get faster; the system stays yours.
