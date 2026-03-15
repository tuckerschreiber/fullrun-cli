#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const API_KEY = process.env.FULLRUN_API_KEY;
const API_URL = process.env.FULLRUN_API_URL || "https://app.fullrun.ai";

if (!API_KEY) {
  console.error("FULLRUN_API_KEY environment variable is required");
  process.exit(1);
}

async function apiCall(
  endpoint: string,
  options: { method?: string; params?: Record<string, string> } = {}
): Promise<unknown> {
  const url = new URL(`/api/v1${endpoint}`, API_URL);
  if (options.params) {
    for (const [k, v] of Object.entries(options.params)) {
      url.searchParams.set(k, v);
    }
  }
  const res = await fetch(url.toString(), {
    method: options.method || "GET",
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
    },
  });
  return res.json();
}

function toTextResult(data: unknown) {
  return {
    content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
  };
}

const server = new McpServer({
  name: "fullrun",
  version: "0.1.0",
});

server.tool(
  "triage",
  "Diagnose Google Ads account health. Returns prioritized issues. Always call this first.",
  async () => {
    const data = await apiCall("/triage");
    return toTextResult(data);
  }
);

server.tool(
  "list_campaigns",
  "List all campaigns with status, budget, and metrics.",
  async () => {
    const data = await apiCall("/campaigns");
    return toTextResult(data);
  }
);

(server as any).tool(
  "get_performance",
  "Get account performance metrics for the specified number of days (1-90, default 7).",
  { days: z.number() },
  async ({ days }: { days: number }) => {
    const d = Math.max(1, Math.min(90, days || 7));
    const data = await apiCall("/performance", {
      params: { days: String(d) },
    });
    return toTextResult(data);
  }
);

(server as any).tool(
  "list_keywords",
  "List keywords with performance data. Optionally filter by campaign ID.",
  { campaignId: z.string().optional() },
  async ({ campaignId }: { campaignId?: string }) => {
    const params: Record<string, string> = {};
    if (campaignId) params.campaignId = campaignId;
    const data = await apiCall("/keywords", { params });
    return toTextResult(data);
  }
);

server.tool(
  "run_optimization",
  "Trigger AI-powered optimization of your Google Ads account. Rate limited to 1 per hour.",
  async () => {
    const data = await apiCall("/run-agent", { method: "POST" });
    return toTextResult(data);
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
