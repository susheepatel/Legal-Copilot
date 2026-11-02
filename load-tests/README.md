# Legal Copilot — Baseline & Load Testing Guide

Enterprise-grade performance benchmarking and load testing suite for **Legal Copilot**.

---

## 🎯 What is Baseline / Load Testing?

**Baseline & Load Testing** evaluates the system under an expected, realistic volume of concurrent users (e.g. 100 advocates simultaneously querying dockets, checking limitation periods, and accessing the chamber).

- **100 Concurrent Virtual Users (VUs):** 100 independent worker threads actively and continuously making requests.
- **Continuous 1-Minute Duration (60s):** The load is sustained over 60 seconds without pauses.
- **High Throughput:** Tens of thousands of requests are processed across the API surface.

---

## 📊 Key Performance Metrics Explained

### 1. Requests Per Second (RPS) / Throughput
- **Definition:** The rate of incoming and completed requests the server successfully handles every second.
- **Example:** `120 req/sec` means the API processes 120 requests every second.
- **Higher is Better:** Indicates high server concurrency and low overhead.

### 2. Response Time (Latency)
- **Min (Fastest):** The quickest response observed (e.g., cached health check or microtask).
- **Average:** The mean experience across all 100 concurrent advocates.
- **Median (p50):** 50% of all requests completed faster than this time.
- **95th Percentile (p95):** 95% of requests completed faster than this time. Essential metric for tail-latency stability.
- **99th Percentile (p99):** 99% of requests completed faster than this threshold.
- **Max (Slowest):** The slowest single request during the entire test under peak load.

---

## 🚀 Execution Commands

From the workspace root or `load-tests/`:

```bash
# Standard 100 VUs for 60 Seconds baseline test
node load-tests/baseline-load-test.js --vus=100 --duration=60

# Quick sanity benchmark (20 VUs for 10s)
node load-tests/baseline-load-test.js --vus=20 --duration=10

# Stress test (250 VUs for 60s)
node load-tests/baseline-load-test.js --vus=250 --duration=60

# Test against a specific URL (e.g. staging or production)
node load-tests/baseline-load-test.js --target=http://localhost:3000 --external

# Re-generate the Excel spreadsheet report
python load-tests/generate_load_report.py
```

---

## 📑 Excel Report Specification

The generated workbook (`Legal_Copilot_Baseline_Load_Test_Report.xlsx`) includes:

1. **Sheet 1 — `Load Test Summary`**: Executive KPIs (100 VUs, RPS, Avg/Min/Max Latency, Success Rate, Status Codes).
2. **Sheet 2 — `Per-Second Timeline (60s)`**: Second-by-second throughput and latency metrics for all 60 seconds.
3. **Sheet 3 — `Endpoint Breakdown`**: Performance breakdown across `/api/health`, `/api/supabase/status`, `/`, and `/api/ai-copilot`.
4. **Sheet 4 — `Latency Distribution`**: Histogram percentile buckets (< 5ms, 5-15ms, 15-30ms, 30-60ms, > 150ms).

