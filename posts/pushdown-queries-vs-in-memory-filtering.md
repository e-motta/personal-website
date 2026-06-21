---
title: "5x Faster, 160x Leaner: Benchmarking Pushdown Queries vs In-Memory Filtering"
date: "2026-06-01"
---

<img src="/images/posts/pushdown-queries-vs-in-memory-filtering/01.png" width="612"/>

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

| Scenario | In-memory | Pushdown |
| :-- | --: | --: |
| Full load (all rows) | 1,025 ms<br />119 MB | 4,752 ms<br />470 MB |
| Page, no sort | 1,019 ms<br />119 MB | 199 ms<br />0.7 MB |
| Page with sort | 1,279 ms<br />180 MB | 198 ms<br />0.7 MB |
| Filter: range + page | 1,131 ms<br />237 MB | 222 ms<br />0.7 MB |
| Filter: enum + page | 1,083 ms<br />141 MB | 186 ms<br />0.7 MB |
| Filter: text + page | 1,413 ms<br />178 MB | 176 ms<br />0.7 MB |
| All filters + page | 1,301 ms<br />237 MB | 222 ms<br />0.7 MB |
| Narrow range + page | 1,139 ms<br />237 MB | 195 ms<br />0.7 MB |
| Narrow range + sort + page | 1,647 ms<br />237 MB | 200 ms<br />0.7 MB |
| Wide range + page | 1,132 ms<br />231 MB | 178 ms<br />0.7 MB |
| Wide range + sort + page | 1,494 ms<br />231 MB | 217 ms<br />0.7 MB |
| Enum filter + sort + page | 1,194 ms<br />141 MB | 208 ms<br />0.7 MB |
| All filters + sort + page | 1,389 ms<br />237 MB | 228 ms<br />0.7 MB |
| Enum filter, deep page | 1,110 ms<br />141 MB | 171 ms<br />0.7 MB |
| Enum + sort + deep page | 1,235 ms<br />141 MB | 228 ms<br />0.7 MB |

<small>Each cell shows mean latency, then peak memory on the line below.</small>

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
