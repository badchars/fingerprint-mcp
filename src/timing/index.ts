import { z } from "zod";
import type { ToolDef, ToolContext } from "../types/index.js";
import { RateLimiter } from "../utils/rate-limiter.js";
import { json } from "../types/index.js";

const limiter = new RateLimiter(100);

// ─── Helpers ───

const REQUEST_TIMEOUT = 15_000;

interface TimingSample {
  index: number;
  responseTimeMs: number;
  statusCode: number;
  error?: string;
}

/** Send a single GET request and measure response time. */
async function measureRequest(url: string, index: number): Promise<TimingSample> {
  const start = performance.now();

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

    const response = await fetch(url, {
      method: "GET",
      signal: controller.signal,
      redirect: "follow",
      headers: {
        "User-Agent": "fingerprint-mcp/timing-baseline",
        Accept: "*/*",
      },
    });

    clearTimeout(timeout);

    // Consume body to ensure full response is received
    await response.arrayBuffer();

    const elapsed = performance.now() - start;

    return {
      index,
      responseTimeMs: Math.round(elapsed * 100) / 100,
      statusCode: response.status,
    };
  } catch (err) {
    const elapsed = performance.now() - start;
    return {
      index,
      responseTimeMs: Math.round(elapsed * 100) / 100,
      statusCode: 0,
      error: (err as Error).message,
    };
  }
}

/** Calculate statistical metrics from an array of numbers. */
function computeStats(values: number[]): {
  mean: number;
  median: number;
  min: number;
  max: number;
  stddev: number;
  p95: number;
} {
  if (values.length === 0) {
    return { mean: 0, median: 0, min: 0, max: 0, stddev: 0, p95: 0 };
  }

  const sorted = [...values].sort((a, b) => a - b);
  const n = sorted.length;

  const sum = sorted.reduce((a, b) => a + b, 0);
  const mean = sum / n;

  const median = n % 2 === 0
    ? (sorted[n / 2 - 1] + sorted[n / 2]) / 2
    : sorted[Math.floor(n / 2)];

  const min = sorted[0];
  const max = sorted[n - 1];

  const variance = sorted.reduce((acc, v) => acc + (v - mean) ** 2, 0) / n;
  const stddev = Math.sqrt(variance);

  const p95Index = Math.ceil(n * 0.95) - 1;
  const p95 = sorted[Math.min(p95Index, n - 1)];

  return {
    mean: Math.round(mean * 100) / 100,
    median: Math.round(median * 100) / 100,
    min: Math.round(min * 100) / 100,
    max: Math.round(max * 100) / 100,
    stddev: Math.round(stddev * 100) / 100,
    p95: Math.round(p95 * 100) / 100,
  };
}

/** Detect bimodal distribution: two clusters of timings with a gap between them. */
function detectBimodal(values: number[]): { bimodal: boolean; clusters?: { low: number[]; high: number[] } } {
  if (values.length < 4) return { bimodal: false };

  const sorted = [...values].sort((a, b) => a - b);

  // Find the largest gap between consecutive sorted values
  let maxGap = 0;
  let gapIndex = 0;

  for (let i = 1; i < sorted.length; i++) {
    const gap = sorted[i] - sorted[i - 1];
    if (gap > maxGap) {
      maxGap = gap;
      gapIndex = i;
    }
  }

  // Consider bimodal if the gap is > 50% of the overall range and both clusters have at least 2 points
  const range = sorted[sorted.length - 1] - sorted[0];
  if (range > 0 && maxGap / range > 0.3 && gapIndex >= 2 && sorted.length - gapIndex >= 2) {
    return {
      bimodal: true,
      clusters: {
        low: sorted.slice(0, gapIndex),
        high: sorted.slice(gapIndex),
      },
    };
  }

  return { bimodal: false };
}

// ─── Tool 1: timing_baseline ───

async function timingBaseline(
  args: Record<string, unknown>,
  _ctx: ToolContext,
): Promise<ReturnType<typeof json>> {
  const url = args.url as string;
  const count = (args.count as number | undefined) ?? 10;

  await limiter.acquire();

  // Send requests sequentially to get clean timing measurements
  const samples: TimingSample[] = [];
  for (let i = 0; i < count; i++) {
    const sample = await measureRequest(url, i);
    samples.push(sample);
  }

  const successSamples = samples.filter((s) => !s.error);
  const failedSamples = samples.filter((s) => s.error);
  const times = successSamples.map((s) => s.responseTimeMs);

  if (times.length === 0) {
    return json({
      url,
      requestCount: count,
      error: "All requests failed",
      failures: failedSamples.map((s) => ({ index: s.index, error: s.error })),
    });
  }

  const stats = computeStats(times);

  // Intelligence analysis
  const intelligence: {
    hostingType: string;
    confidence: "high" | "medium" | "low";
    indicators: string[];
  } = {
    hostingType: "unknown",
    confidence: "low",
    indicators: [],
  };

  // Stddev-based hosting type detection
  if (stats.stddev < 5) {
    intelligence.hostingType = "dedicated / bare metal";
    intelligence.confidence = "medium";
    intelligence.indicators.push(
      `Very low timing variance (stddev: ${stats.stddev}ms) suggests dedicated infrastructure`,
    );
  } else if (stats.stddev < 25) {
    intelligence.hostingType = "shared hosting / cloud VM";
    intelligence.confidence = "medium";
    intelligence.indicators.push(
      `Moderate timing variance (stddev: ${stats.stddev}ms) typical of shared/cloud hosting`,
    );
  } else {
    intelligence.hostingType = "heavily shared / CDN edge";
    intelligence.confidence = "medium";
    intelligence.indicators.push(
      `High timing variance (stddev: ${stats.stddev}ms) suggests heavily shared infrastructure or CDN edge variation`,
    );
  }

  // Cold start detection (serverless)
  if (times.length >= 3) {
    const firstTime = times[0];
    const restAvg = times.slice(1).reduce((a, b) => a + b, 0) / (times.length - 1);

    if (firstTime > restAvg * 2 && firstTime - restAvg > 100) {
      intelligence.hostingType = "serverless (Lambda / Cloud Functions)";
      intelligence.confidence = "high";
      intelligence.indicators.push(
        `First request (${firstTime.toFixed(1)}ms) is ${(firstTime / restAvg).toFixed(1)}x slower than average of subsequent requests (${restAvg.toFixed(1)}ms) — cold start pattern`,
      );
    }
  }

  // Bimodal distribution detection
  const bimodal = detectBimodal(times);
  if (bimodal.bimodal && bimodal.clusters) {
    const lowStats = computeStats(bimodal.clusters.low);
    const highStats = computeStats(bimodal.clusters.high);

    intelligence.indicators.push(
      `Bimodal distribution detected: cluster A (${bimodal.clusters.low.length} requests, avg ${lowStats.mean}ms) and cluster B (${bimodal.clusters.high.length} requests, avg ${highStats.mean}ms) — possible load balancer with different backends`,
    );
    intelligence.hostingType = "load-balanced (multiple backends)";
    intelligence.confidence = "high";
  }

  // Consistent response times suggest caching
  if (stats.stddev < 2 && stats.mean < 50) {
    intelligence.indicators.push(
      "Very consistent low response times suggest aggressive caching (CDN or reverse proxy cache)",
    );
  }

  return json({
    url,
    requestCount: count,
    successCount: successSamples.length,
    failedCount: failedSamples.length,
    samples: samples.map((s) => ({
      index: s.index,
      responseTimeMs: s.responseTimeMs,
      statusCode: s.statusCode,
      error: s.error,
    })),
    statistics: stats,
    intelligence,
    failures: failedSamples.length > 0
      ? failedSamples.map((s) => ({ index: s.index, error: s.error }))
      : undefined,
  });
}

// ─── Tool 2: timing_auth ───

const DEFAULT_VALID_USERNAMES = ["admin", "root", "user"];
const INVALID_USERNAME = "xyzrandom_nonexistent_user_1928374650";
const AUTH_ROUNDS = 5;
const WRONG_PASSWORD = "wrongpassword_timing_test_12345";

interface AuthTimingSample {
  username: string;
  round: number;
  responseTimeMs: number;
  statusCode: number;
  error?: string;
}

/** Send a login request (POST or GET) with given credentials. */
async function sendLoginRequest(
  url: string,
  usernameField: string,
  passwordField: string,
  username: string,
  password: string,
  method: "POST" | "GET",
): Promise<{ responseTimeMs: number; statusCode: number; error?: string }> {
  const start = performance.now();

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

    let response: Response;

    if (method === "POST") {
      const body = new URLSearchParams();
      body.set(usernameField, username);
      body.set(passwordField, password);

      response = await fetch(url, {
        method: "POST",
        body: body.toString(),
        signal: controller.signal,
        redirect: "follow",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent": "fingerprint-mcp/timing-auth",
          Accept: "*/*",
        },
      });
    } else {
      const params = new URLSearchParams();
      params.set(usernameField, username);
      params.set(passwordField, password);
      const separator = url.includes("?") ? "&" : "?";

      response = await fetch(`${url}${separator}${params.toString()}`, {
        method: "GET",
        signal: controller.signal,
        redirect: "follow",
        headers: {
          "User-Agent": "fingerprint-mcp/timing-auth",
          Accept: "*/*",
        },
      });
    }

    clearTimeout(timeout);
    await response.arrayBuffer();

    const elapsed = performance.now() - start;
    return {
      responseTimeMs: Math.round(elapsed * 100) / 100,
      statusCode: response.status,
    };
  } catch (err) {
    const elapsed = performance.now() - start;
    return {
      responseTimeMs: Math.round(elapsed * 100) / 100,
      statusCode: 0,
      error: (err as Error).message,
    };
  }
}

async function timingAuth(
  args: Record<string, unknown>,
  _ctx: ToolContext,
): Promise<ReturnType<typeof json>> {
  const url = args.url as string;
  const usernameField = (args.usernameField as string | undefined) ?? "username";
  const passwordField = (args.passwordField as string | undefined) ?? "password";
  const validUsernames = (args.validUsernames as string[] | undefined) ?? DEFAULT_VALID_USERNAMES;
  const method = ((args.method as string | undefined) ?? "POST") as "POST" | "GET";

  await limiter.acquire();

  const allSamples: AuthTimingSample[] = [];

  // Test each valid username
  for (const username of validUsernames) {
    for (let round = 0; round < AUTH_ROUNDS; round++) {
      const result = await sendLoginRequest(
        url,
        usernameField,
        passwordField,
        username,
        WRONG_PASSWORD,
        method,
      );
      allSamples.push({
        username,
        round,
        responseTimeMs: result.responseTimeMs,
        statusCode: result.statusCode,
        error: result.error,
      });
    }
  }

  // Test invalid username
  const invalidSamples: AuthTimingSample[] = [];
  for (let round = 0; round < AUTH_ROUNDS; round++) {
    const result = await sendLoginRequest(
      url,
      usernameField,
      passwordField,
      INVALID_USERNAME,
      WRONG_PASSWORD,
      method,
    );
    invalidSamples.push({
      username: INVALID_USERNAME,
      round,
      responseTimeMs: result.responseTimeMs,
      statusCode: result.statusCode,
      error: result.error,
    });
  }

  allSamples.push(...invalidSamples);

  // Analysis: compare timing per username vs invalid
  const invalidTimes = invalidSamples
    .filter((s) => !s.error)
    .map((s) => s.responseTimeMs);
  const invalidStats = computeStats(invalidTimes);

  interface UsernameAnalysis {
    username: string;
    stats: ReturnType<typeof computeStats>;
    timeDiffFromInvalid: number;
    percentDiffFromInvalid: number;
    enumerable: boolean;
    significance: "high" | "medium" | "low" | "none";
  }

  const usernameAnalyses: UsernameAnalysis[] = [];

  for (const username of validUsernames) {
    const userSamples = allSamples
      .filter((s) => s.username === username && !s.error);
    const userTimes = userSamples.map((s) => s.responseTimeMs);
    const userStats = computeStats(userTimes);

    const timeDiff = userStats.mean - invalidStats.mean;
    const percentDiff = invalidStats.mean > 0
      ? (timeDiff / invalidStats.mean) * 100
      : 0;

    // Statistical significance: is the difference larger than the noise?
    const combinedStddev = Math.max(userStats.stddev, invalidStats.stddev, 1);
    const zScore = Math.abs(timeDiff) / combinedStddev;

    let significance: "high" | "medium" | "low" | "none";
    let enumerable = false;

    if (zScore > 3 && Math.abs(timeDiff) > 10) {
      significance = "high";
      enumerable = true;
    } else if (zScore > 2 && Math.abs(timeDiff) > 5) {
      significance = "medium";
      enumerable = true;
    } else if (zScore > 1.5 && Math.abs(timeDiff) > 3) {
      significance = "low";
      enumerable = false;
    } else {
      significance = "none";
      enumerable = false;
    }

    usernameAnalyses.push({
      username,
      stats: userStats,
      timeDiffFromInvalid: Math.round(timeDiff * 100) / 100,
      percentDiffFromInvalid: Math.round(percentDiff * 100) / 100,
      enumerable,
      significance,
    });
  }

  // Overall vulnerability assessment
  const enumerableUsernames = usernameAnalyses.filter((a) => a.enumerable);
  const hasVulnerability = enumerableUsernames.length > 0;

  const vulnerability: {
    vulnerable: boolean;
    severity: "high" | "medium" | "low" | "none";
    description: string;
    enumerableUsernames: string[];
    recommendations: string[];
  } = {
    vulnerable: hasVulnerability,
    severity: "none",
    description: "",
    enumerableUsernames: enumerableUsernames.map((a) => a.username),
    recommendations: [],
  };

  if (hasVulnerability) {
    const highSig = enumerableUsernames.filter((a) => a.significance === "high");
    if (highSig.length > 0) {
      vulnerability.severity = "high";
      vulnerability.description =
        `Username enumeration via timing side-channel detected with high confidence. ${highSig.length} username(s) show statistically significant timing differences compared to invalid usernames.`;
    } else {
      vulnerability.severity = "medium";
      vulnerability.description =
        `Possible username enumeration via timing side-channel. ${enumerableUsernames.length} username(s) show timing differences that may indicate existence, but significance is moderate.`;
    }

    vulnerability.recommendations = [
      "Implement constant-time comparison for username lookup",
      "Add random delay jitter to authentication responses",
      "Use the same code path for valid and invalid usernames (hash the password regardless)",
      "Consider rate limiting login attempts",
      "Implement account lockout or CAPTCHA after failed attempts",
    ];
  } else {
    vulnerability.description =
      "No significant timing difference detected between valid and invalid usernames. The application appears resistant to timing-based username enumeration.";
  }

  return json({
    url,
    method,
    usernameField,
    passwordField,
    testedUsernames: [...validUsernames, INVALID_USERNAME],
    rounds: AUTH_ROUNDS,
    invalidBaseline: {
      username: INVALID_USERNAME,
      stats: invalidStats,
    },
    usernameAnalysis: usernameAnalyses.map((a) => ({
      username: a.username,
      meanResponseMs: a.stats.mean,
      stddevMs: a.stats.stddev,
      timeDiffFromInvalidMs: a.timeDiffFromInvalid,
      percentDiffFromInvalid: a.percentDiffFromInvalid,
      significance: a.significance,
      likelyExists: a.enumerable,
    })),
    vulnerability,
    rawSamples: allSamples.map((s) => ({
      username: s.username,
      round: s.round,
      responseTimeMs: s.responseTimeMs,
      statusCode: s.statusCode,
      error: s.error,
    })),
  });
}

// ─── Tool Definitions ───

export const timingTools: ToolDef[] = [
  {
    name: "timing_baseline",
    description:
      "Response time analysis for infrastructure fingerprinting. Sends multiple identical GET requests and calculates mean, median, min, max, standard deviation, and p95. Detects hosting type from variance (low stddev = dedicated, medium = cloud, high = shared/CDN), cold start patterns (serverless), and bimodal distribution (load balancer with different backends).",
    schema: {
      url: z.string().url().describe("URL to measure response timing"),
      count: z.number().optional().default(10).describe("Number of requests to send"),
    },
    execute: timingBaseline,
  },
  {
    name: "timing_auth",
    description:
      "Authentication timing side-channel analysis. Compares response times for likely-valid usernames (admin, root, user) vs clearly-invalid usernames with wrong passwords. Detects username enumeration vulnerabilities when valid usernames take significantly longer due to password hash computation. Uses statistical significance testing (z-score) over multiple rounds for reliable detection.",
    schema: {
      url: z.string().url().describe("Login form URL"),
      usernameField: z
        .string()
        .optional()
        .default("username")
        .describe("Username form field name"),
      passwordField: z
        .string()
        .optional()
        .default("password")
        .describe("Password form field name"),
      validUsernames: z
        .array(z.string())
        .optional()
        .describe("Likely valid usernames to test (default: admin, root, user)"),
      method: z
        .enum(["POST", "GET"])
        .optional()
        .default("POST")
        .describe("HTTP method for login form"),
    },
    execute: timingAuth,
  },
];
