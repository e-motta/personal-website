---
title: "Object Storage as a data contract between services"
date: "2026-05-23"
---

<img src="/images/posts/object-storage-as-a-contract/01.png" alt="Object Storage as a data contract between services" width="612"/>

Object storage is often introduced simply as a cheap place to put files. But in many data systems, it quietly becomes something much more important: the actual contract between your services.

Imagine a typical architecture: an API starts a batch job that processes data and writes Parquet files, another service reads a JSON summary to serve a dashboard, and a user downloads a CSV export. None of those components talk directly to each other, but they all agree on one thing: where the artifacts live and what they mean.

That agreement is a data contract.

In this post, I will explore why object storage ends up filling this role, how to design paths as APIs, the problems this approach inevitably presents, and what mature systems evolve to use instead.

## Why not put everything in the database?

Relational databases are excellent for business state. They are the right place for users, permissions, process records, statuses, configuration, audit logs, and relationships.

They are not always the right place for large analytical outputs. A batch job running on Spark might produce millions of rows, multiple versions of a dataset, intermediate artifacts, compact summaries, and downloadable exports. Storing all of that in application tables can make the database heavy, expensive, and awkward to evolve.

Object storage handles this shape much better. Large files are cheap to store, and artifacts can be cleanly versioned by path. Batch jobs can write directly to the bucket without having to bottleneck through an API. Conversely, a lightweight app can read compact summaries directly instead of querying and aggregating raw outputs on the fly.

The database still matters, of course. It points to the artifacts, records their status, and explains their business meaning. But the heavy lifting of data transfer happens in the bucket.

## Paths are part of the API

The moment two services agree on a path convention, that convention becomes an API.

For example, consider a structure like this:

```text
{account_id}/{input_version}/summaries/{category}.json
{account_id}/{input_version}/datasets/events.parquet
{account_id}/{input_version}/exports/report.csv
```

These paths carry distinct meaning. The account identifies the business context, the input version identifies the analytical snapshot, and the subfolder explains the artifact type.

This makes systems easier to reason about. Given an account and a version, any service can know exactly where to check for inputs, outputs, summaries, and exports. The danger, however, is that path conventions often live only in code. If object storage is part of your system contract, you need to document it with the same rigor as a REST API.

## Version the inputs and choose the right artifacts

Without input versions, data processing becomes harder to explain. Imagine a user asks why a number changed. If the pipeline always reads a "latest" pointer, the answer is murky. Did the code change? Did the source data change? Did a dependency update?

Versioned prefixes make the question answerable. A job can explicitly state that it read input version `2026-05-01`, wrote outputs under that same version, and the summary the user saw came from that exact snapshot. It gives the system a stable spine.

Alongside versioning, you must use the right artifact for the consumer. One output format rarely serves every need. Parquet is great for downstream computation, JSON is convenient for APIs and frontend screens, and CSV is useful for human workflows.

A mature object-storage contract usually contains multiple layers: raw datasets for processing, derived datasets for calculations, and summary JSONs for product APIs. The trick is to keep the contract clear regarding which files are internal, which are stable, and which are user-facing.

## The problems object storage contracts present

While using object storage as a handoff point is highly practical, it introduces significant challenges as the system scales.

First, there is the risk of **partial writes**. Unlike a relational database transaction that either commits or rolls back, a distributed job might fail halfway through writing to a prefix. This leaves a folder that looks complete but is actually corrupted or missing data.

Second, **schema evolution is blind**. If a team changes the structure of a JSON summary or drops a column from a Parquet file, the object storage layer does not care. It happily accepts the new file, silently breaking the downstream consumers who relied on the implicit contract.

Finally, **discoverability and cleanup** become massive headaches. "Latest" pointers can make results hard to reproduce. Cleanup policies might aggressively delete data that another asynchronous service still expects to find. Over time, undocumented files accumulate and become accidental, forgotten dependencies.

## What mature systems evolve to use

Because of these inherent problems, organizations eventually outgrow raw object storage paths as their primary data contract.

Mature systems evolve to use **Data Catalogs and Table Formats**. Instead of relying on implicit folder structures, teams adopt open table formats like Apache Iceberg. This abstracts the physical file paths away, providing ACID transactions, time travel, and schema evolution directly on top of the data lake. A downstream service queries the catalog for the dataset, and the catalog ensures they get a consistent, transactionally safe read, eliminating the "partial write" problem.

They also implement **Formal Data Contracts and Schema Registries**. Rather than hoping the JSON or Parquet file has the right fields, the schema is explicitly defined and enforced in a registry. CI/CD pipelines validate that changes to a producer's output won't break downstream consumers before the code is even merged.

Lastly, orchestration tools take over the dependency management. Instead of a service waking up and blindly checking if a file exists, an orchestrator explicitly triggers downstream services only when the upstream contract is successfully fulfilled and logged.

## Final words

Object storage is not just a file cabinet. In data-heavy systems, it frequently acts as the boundary between teams, services, and execution models.

Treating paths, formats, and versions as explicit contracts is a great starting point. It keeps APIs lean, allows batch jobs to scale, and delivers fast results. But as your architecture grows, be prepared to recognize the limits of file-path agreements. Transitioning to table formats, schema registries, and formal data contracts is the natural evolution to ensure your data remains reliable, discoverable, and safe.
