---
title: "Scaling data systems: Where things start to break"
date: "2026-05-10"
---

<img src="https://chatgpt.com/backend-api/estuary/public_content/enc/eyJpZCI6Im1fNmEwMGIzZTNiMDgwODE5MWI2ZTQwNWY4ZjQyOWU2ZjM6ZmlsZV8wMDAwMDAwMGQzM2M3MWZiODg4ZWI1YTc3ZDE4ZjdkMSIsInRzIjoiMjA1ODMiLCJwIjoicHlpIiwiY2lkIjoiMSIsInNpZyI6ImUxMGVkMzJhZDk0ZTM4NWZiYmVhN2NhMjkzMTc2YmI1M2UzMzk0ZmI4NzViMzY3MjkzMzMyMGRkMWQ0MzUzNGEiLCJ2IjoiMCIsImdpem1vX2lkIjpudWxsLCJjcyI6bnVsbCwiY2RuIjpudWxsLCJmbiI6bnVsbCwiY2QiOm51bGwsImNwIjpudWxsLCJtYSI6bnVsbH0=" alt="Where scalable systems break" width="612"/>

In a previous post, I described an architecture that processes millions of
records per hour using Python, Kafka, PySpark, and Kubernetes.

The system scales well.

But scalability is rarely the first thing that breaks.

In practice, large-scale data systems usually fail in much quieter ways.

Not because Spark cannot process the data.
Not because Kubernetes cannot launch more executors.

But because distributed systems accumulate complexity in places that are
hard to see early on:

- joins
- schemas
- storage contracts
- asynchronous workflows
- cross-service assumptions

At scale, correctness becomes harder than computation.

## Distributed joins fail silently

One of the most dangerous parts of large data pipelines is the join layer.

Small inconsistencies create disproportionately large problems:

- non-unique keys causing row explosion
- mismatched types (`string` vs `float`)
- implicit casts creating invalid matches
- missing upstream constraints

The difficult part is that most of these failures are technically valid operations.
The pipeline completes, but the outputs are wrong.

In distributed systems, silent corruption is usually worse than hard failure.

## Schema drift becomes inevitable

Schemas rarely stay stable for long.

As systems evolve, pipelines start consuming:

- datasets from different teams
- historical snapshots
- partially migrated formats
- externally generated files

Over time, fields gain new meanings, optional columns appear, naming conventions diverge, and identical identifiers stop representing the same thing.

The result is that pipelines gradually accumulate normalization layers, conditional transformations, and compatibility logic.

Eventually, maintaining consistency becomes harder than processing the data itself.

## Object storage becomes a shared API

In architectures where analytical artifacts live in object storage, path structure becomes part of the system contract.

Layouts like:

`{entity_id}/{data_version}/...`

start as implementation details.

Later, multiple services begin depending on them:

- orchestration APIs
- Spark jobs
- validation services
- export pipelines
- downstream consumers

At that point, storage is no longer just storage.

It becomes a distributed interface without type safety, version negotiation, or schema enforcement.

Changing a filename can break production systems just as easily as changing an API response.

## Asynchronous systems hide inconsistent state

Asynchronous workflows improve scalability, but they also make failures harder to reason about.

A job may complete successfully while:

- the callback fails
- the status update times out
- the retry mechanism duplicates events
- downstream consumers process stale state

Now the orchestration layer disagrees with the compute layer. The data is correct, but the system state is not.

These are difficult failures because individual components still appear healthy when viewed in isolation.

## Most distributed failures are coordination failures

As systems grow, problems increasingly happen between services rather than inside them.

Typical examples:

- one pipeline assumes data is immutable while another rewrites it
- one service publishes artifacts before another finishes validation
- two teams interpret the same field differently
- retries create timing-dependent behavior

At that point, architecture becomes as much about contracts and operational discipline as it is about infrastructure.

## What actually matters at scale

Performance is important, but most modern tooling already scales well enough for many workloads.

What matters more is whether the system remains:

- correct
- reproducible
- observable

That requires treating distributed boundaries as first-class interfaces.

The real APIs are often not Python functions or HTTP endpoints.

They are:

- Kafka messages
- object storage layouts
- dataset schemas
- callback semantics
- versioning conventions

If those contracts drift, the system becomes fragile regardless of compute capacity.

## Observability becomes part of the architecture

At scale, debugging without observability is almost impossible.

You need to know:

- which job executed
- which data snapshot was used
- which artifacts were generated
- which transformations ran
- where failures occurred
- which version produced a given output

Without that visibility, distributed systems become extremely difficult to reason about once multiple pipelines and services interact simultaneously.

## Final thoughts

Processing millions of records per hour with Python is no longer unusual.

Modern infrastructure makes distributed computation relatively accessible.

The harder problem is building systems that remain understandable as they evolve.

Systems that can tolerate schema drift.
Systems that can recover from partial failure.
Systems where contracts remain explicit across teams and services.

The compute layer is usually not the bottleneck.

The interfaces between components are where large-scale systems actually start to break.
