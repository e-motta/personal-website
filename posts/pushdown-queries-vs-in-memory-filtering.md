---
title: "5x Faster, 160x Leaner: Benchmarking Pushdown Queries vs In-Memory Filtering"
date: "2026-06-01"
---

<img src="https://chatgpt.com/backend-api/estuary/public_content/enc/eyJpZCI6Im1fNmExZDY5ODEzMDZjODE5MThmNDhjZGYyYzdhNWVmMDY6ZmlsZV8wMDAwMDAwMDE5NjA3MjBlYWNlYTVkMTVlYTMzZTdlMCIsInRzIjoiMjA2MDUiLCJwIjoicHlpIiwiY2lkIjoiMSIsInNpZyI6ImE4OWJiZTg1Y2I4MzhkMjBlOTVjOWEyZWExMzQ3ZjhiMThlOWRhZTQzZDU0NWI2ODAzMTAwMGM3OTE1ZDE4MmUiLCJ2IjoiMCIsImdpem1vX2lkIjpudWxsLCJjcyI6bnVsbCwiY2RuIjpudWxsLCJmbiI6bnVsbCwiY2QiOm51bGwsImNwIjpudWxsLCJtYSI6bnVsbH0=" width="612"/>

When I was recently tasked with scaling an existing read-heavy service, the architecture I encountered was straightforward: it stored Parquet files in a fast in-memory cache, loaded the entire file into the application on each request, and used standard dataframe tooling to filter, sort, and paginate. Working with smaller datasets, this approach made complete sense. The code was simple, latency was predictable, and operational complexity remained low.

However, as file sizes grew and row counts reached the hundreds of thousands, this architecture became a bottleneck. Endpoints that used to respond instantly started taking over a second. Memory consumption per request climbed into the hundreds of megabytes. Under concurrent load, this pattern doesn't just impact individual requests; it places severe memory pressure on the entire node.

To quantify the problem and evaluate alternatives, I ran a controlled benchmark comparing the existing implementation against a new approach using the exact same 15 query shapes. I compared **in-memory filtering** (loading the full Parquet file, then processing in the application) against **pushdown queries** (sending predicates, sort, and limit directly to a query engine reading from object storage).

The dataset consisted of 357,814 rows and 21 columns (~2 MB Parquet). Each scenario was measured ten times in-cluster after a warmup iteration to ensure the means and tail latencies reflected steady-state behavior.

## What I measured and why it matters

**Mean latency (ms)** approximates the typical API caller experience. If a UI loads a table with filters and a sort applied, the mean latency on those scenarios acts as a direct stand-in for user interaction times.

**p95 latency (ms)** highlights tail behavior under load. Averages hide outliers. For capacity planning and investigating performance degradation, the p95 often matters more than the mean. An architecture that wins on average but spikes on the tail introduces production risk.

**Peak RSS memory (MB)** measures the maximum memory the process held during a request. This metric dictates container memory limits, horizontal scaling triggers, and out-of-memory (OOM) risks. It directly determines how many concurrent requests a single pod can safely handle.

Finally, the **scenario shape** dictates the workload. A plain first page without filters is the baseline. Combined filters stress the CPU and memory post-load, sorting adds computational overhead, and deep pagination checks if performance collapses on large result offsets. I also tested **full load** behavior (reading every row) as a control for export or analytics-heavy access patterns.

## The benchmark results

The table below shows the mean latency and mean peak memory per scenario.

<img src="https://chatgpt.com/backend-api/estuary/public_content/enc/eyJpZCI6Im1fNmExZDZhZTUzOTg4ODE5MTgyZmU1M2JhMmMxZDVlMzI6ZmlsZV8wMDAwMDAwMDExZTg3MjBlODhhNWE5MjNlNjdmODk5MyIsInRzIjoiMjA2MDUiLCJwIjoicHlpIiwiY2lkIjoiMSIsInNpZyI6ImIzZmEwZWE5NmQ3NDIyOWRhYmEwMTQzZDk4OTdkNDNmYmJlNDlmYjE2ODI0NTAxNWY5Njg0MmY0MzU2OWQwOWYiLCJ2IjoiMCIsImdpem1vX2lkIjpudWxsLCJjcyI6bnVsbCwiY2RuIjpudWxsLCJmbiI6bnVsbCwiY2QiOm51bGwsImNwIjpudWxsLCJtYSI6bnVsbH0=" width="612"/>

Performance remained consistent across typical API workloads, including pagination, filtering, sorting, and deep paging. Pushdown queries completed in approximately 170–230 ms, whereas the existing in-memory filtering implementation ranged from 1.0 to 1.6 seconds. Memory efficiency improved even more dramatically: peak memory usage stayed near 0.7 MB for pushdown execution, compared to 119–237 MB for in-memory processing. Across 15 production-like query shapes, this translated to roughly 5x lower latency and 160x lower memory consumption.

Tail latency followed a similar distribution. For a simple page request without sorting, the p95 was 1,077 ms in-memory versus 255 ms using pushdown. For requests combining all filters plus pagination, the p95 was 1,349 ms versus 269 ms.

## The architectural cost of in-memory filtering

The in-memory path is highly predictable: every request materializes the dataset in process memory before applying application-level logic. While easy to reason about during initial development, the structural cost is high.

Filtering and sorting cannot bypass the initial data load, establishing a hard latency floor based on I/O and decoding time. Similarly, the memory footprint has a floor tied to the size of the working set, which spikes when filters copy data or sorts reorder large dataframes.

Pushdown queries shift this computational burden earlier in the stack. By applying `WHERE`, `ORDER BY`, and `LIMIT` clauses at the query engine level while reading Parquet from object storage, the application only receives the finalized page. You trade minor setup complexity for drastically smaller per-request working sets.

## The exception: Full-table scans

Benchmarks are entirely context-dependent. On a full dataset load, in-memory filtering significantly outperformed pushdown queries, taking ~1.0 s at ~119 MB compared to ~4.8 s at ~470 MB.

If a system's primary workload involves exporting or scanning entire tables, optimizing exclusively for paginated reads will degrade performance. Architectural choices must align with traffic shape: pushdown engines for interactive, slice-oriented retrieval, and dedicated bulk-read paths (or caching strategies) for full-table extracts.

## Takeaways

The existing in-memory filtering wasn't inherently flawed; it simply broke down when dataset volume outpaced the original assumptions of the pattern.

If your read path is dominated by requests for filtered, sorted pages, shifting computation down to the query layer yields massive latency and memory improvements with zero impact on the user experience. Conversely, if your traffic consists mostly of full-table exports, benchmark that specific workload independently. Technical architecture decisions should be driven by hard evidence derived from real traffic patterns, not historical habit.
