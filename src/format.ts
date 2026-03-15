// ANSI color helpers
const bold = (s: string) => `\x1b[1m${s}\x1b[0m`;
const dim = (s: string) => `\x1b[2m${s}\x1b[0m`;
const green = (s: string) => `\x1b[32m${s}\x1b[0m`;
const red = (s: string) => `\x1b[31m${s}\x1b[0m`;
const yellow = (s: string) => `\x1b[33m${s}\x1b[0m`;
const cyan = (s: string) => `\x1b[36m${s}\x1b[0m`;
const magenta = (s: string) => `\x1b[35m${s}\x1b[0m`;

function formatMoney(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

function formatMoneyMicros(micros: number): string {
  return `$${(micros / 1_000_000).toFixed(2)}`;
}

function formatPct(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

function statusBadge(status: string): string {
  switch (status.toLowerCase()) {
    case "active":
    case "enabled":
      return green("● active");
    case "paused":
      return yellow("● paused");
    case "removed":
    case "draft":
      return dim(`● ${status.toLowerCase()}`);
    default:
      return dim(`● ${status}`);
  }
}

// ── Triage ──────────────────────────────────────────

function formatTriage(data: any): string {
  const lines: string[] = [];
  lines.push("");
  lines.push(bold("  ⚡ Account Health Report"));
  lines.push(dim("  ─────────────────────────────────────────"));
  lines.push("");

  const md = data.triage as string;
  for (const line of md.split("\n")) {
    if (line.startsWith("### ")) {
      const cleaned = line.replace(/^### /, "");
      // Color by priority
      if (cleaned.includes("CRITICAL")) lines.push(`  ${red(bold(cleaned))}`);
      else if (cleaned.includes("HIGH")) lines.push(`  ${yellow(bold(cleaned))}`);
      else if (cleaned.includes("MEDIUM")) lines.push(`  ${cyan(bold(cleaned))}`);
      else if (cleaned.includes("LOW")) lines.push(`  ${dim(bold(cleaned))}`);
      else lines.push(`  ${bold(cleaned)}`);
    } else if (line.startsWith("## ")) {
      // skip the header
    } else if (line.startsWith("- ")) {
      lines.push(`    ${dim("→")} ${line.slice(2)}`);
    } else if (line.startsWith("**")) {
      lines.push("");
      lines.push(`  ${dim(line.replace(/\*\*/g, ""))}`);
    } else if (line.trim()) {
      lines.push(`  ${line}`);
    }
  }

  lines.push("");
  return lines.join("\n");
}

// ── Campaigns ───────────────────────────────────────

function formatCampaigns(data: any): string {
  const lines: string[] = [];
  lines.push("");
  lines.push(bold("  📊 Campaigns"));
  lines.push(dim("  ─────────────────────────────────────────"));

  const campaigns = data.campaigns || [];
  if (campaigns.length === 0) {
    lines.push("");
    lines.push(dim("  No campaigns found."));
    lines.push("");
    return lines.join("\n");
  }

  for (const c of campaigns) {
    lines.push("");
    lines.push(`  ${bold(c.name)}  ${statusBadge(c.status)}`);
    lines.push(`  ${dim("Budget:")} ${formatMoney(c.dailyBudget)}/day  ${dim("Spend:")} ${formatMoneyMicros(c.costMicros)}`);

    const clicks = c.clicks || 0;
    const impressions = c.impressions || 0;
    const conversions = c.conversions || 0;
    const ctr = impressions > 0 ? clicks / impressions : 0;

    lines.push(
      `  ${dim("Clicks:")} ${clicks.toLocaleString()}  ${dim("Impr:")} ${impressions.toLocaleString()}  ${dim("CTR:")} ${formatPct(ctr)}  ${dim("Conv:")} ${conversions}`
    );

    const adGroups = c.adGroups || [];
    if (adGroups.length > 0) {
      lines.push(`  ${dim(`${adGroups.length} ad group(s)`)}`);
      for (const ag of adGroups) {
        const kwCount = ag.keywords?.length || 0;
        const adCount = ag.ads?.length || 0;
        lines.push(`    ${dim("└")} ${ag.name}  ${dim(`${kwCount} keywords · ${adCount} ads`)}`);
      }
    }
  }

  lines.push("");
  return lines.join("\n");
}

// ── Performance ─────────────────────────────────────

function formatPerformance(data: any): string {
  const lines: string[] = [];
  lines.push("");
  lines.push(bold("  📈 Performance"));
  if (data.dateRange) {
    lines.push(dim(`  ${data.dateRange.start} → ${data.dateRange.end}`));
  }
  lines.push(dim("  ─────────────────────────────────────────"));

  const rows = data.performance || [];
  if (rows.length === 0) {
    lines.push("");
    lines.push(dim("  No performance data."));
    lines.push("");
    return lines.join("\n");
  }

  // Aggregate totals
  let totalClicks = 0, totalImpressions = 0, totalConversions = 0, totalCost = 0;
  for (const row of rows) {
    const m = row.metrics || row;
    totalClicks += Number(m.clicks || 0);
    totalImpressions += Number(m.impressions || 0);
    totalConversions += Number(m.conversions || 0);
    totalCost += Number(m.cost_micros || m.costMicros || 0);
  }

  const ctr = totalImpressions > 0 ? totalClicks / totalImpressions : 0;
  const cpc = totalClicks > 0 ? totalCost / totalClicks / 1_000_000 : 0;
  const cpa = totalConversions > 0 ? totalCost / totalConversions / 1_000_000 : 0;

  lines.push("");
  lines.push(`  ${bold(totalClicks.toLocaleString())} clicks   ${bold(totalImpressions.toLocaleString())} impressions   ${bold(String(totalConversions))} conversions`);
  lines.push(`  ${dim("Spend:")} ${bold(formatMoneyMicros(totalCost))}   ${dim("CTR:")} ${formatPct(ctr)}   ${dim("CPC:")} $${cpc.toFixed(2)}   ${dim("CPA:")} ${totalConversions > 0 ? `$${cpa.toFixed(2)}` : "—"}`);

  // Per-campaign breakdown if available
  if (rows.length > 1 && rows[0]?.campaign) {
    lines.push("");
    lines.push(dim("  By campaign:"));
    for (const row of rows) {
      const name = row.campaign?.name || "Unknown";
      const m = row.metrics || row;
      const clicks = Number(m.clicks || 0);
      const cost = Number(m.cost_micros || m.costMicros || 0);
      const conv = Number(m.conversions || 0);
      lines.push(`    ${name}  ${dim(`${clicks} clicks · ${formatMoneyMicros(cost)} · ${conv} conv`)}`);
    }
  }

  lines.push("");
  return lines.join("\n");
}

// ── Keywords ────────────────────────────────────────

function formatKeywords(data: any): string {
  const lines: string[] = [];
  lines.push("");
  lines.push(bold("  🔑 Keywords"));
  lines.push(dim("  ─────────────────────────────────────────"));

  const keywords = data.keywords || [];
  if (keywords.length === 0) {
    lines.push("");
    lines.push(dim("  No keywords found."));
    lines.push("");
    return lines.join("\n");
  }

  // Group by campaign
  const byCampaign: Record<string, any[]> = {};
  for (const kw of keywords) {
    const campName = kw.adGroup?.campaign?.name || "Unknown Campaign";
    if (!byCampaign[campName]) byCampaign[campName] = [];
    byCampaign[campName].push(kw);
  }

  for (const [campName, kws] of Object.entries(byCampaign)) {
    lines.push("");
    lines.push(`  ${bold(campName)}`);
    for (const kw of kws.slice(0, 20)) {
      const matchIcon = kw.matchType === "EXACT" ? dim("[exact]") : kw.matchType === "PHRASE" ? dim("[phrase]") : dim("[broad]");
      const clicks = kw.clicks || 0;
      const cost = Number(kw.costMicros || 0);
      const conv = kw.conversions || 0;
      const status = kw.status === "active" ? "" : `  ${statusBadge(kw.status)}`;
      lines.push(
        `    ${matchIcon} ${kw.text}${status}  ${dim(`${clicks} clicks · ${formatMoneyMicros(cost)} · ${conv} conv`)}`
      );
    }
    if (kws.length > 20) {
      lines.push(dim(`    ... and ${kws.length - 20} more`));
    }
  }

  lines.push("");
  return lines.join("\n");
}

// ── Run ─────────────────────────────────────────────

function formatRun(data: any): string {
  const lines: string[] = [];
  lines.push("");

  if (data.ok) {
    lines.push(green(bold("  ✓ Agent run complete")));
    lines.push(dim("  ─────────────────────────────────────────"));
    lines.push("");
    lines.push(`  ${dim("Mode:")} ${data.mode}   ${dim("Actions:")} ${data.actionsCount}`);

    if (data.actions?.length > 0) {
      lines.push("");
      for (const a of data.actions) {
        lines.push(`  ${green("→")} ${a.summary}`);
      }
    }
  } else {
    lines.push(red(bold("  ✗ Agent run failed")));
    lines.push("");
    lines.push(`  ${data.error}`);
    if (data.suggestion) {
      lines.push(`  ${dim("Suggestion:")} ${data.suggestion}`);
    }
  }

  lines.push("");
  return lines.join("\n");
}

// ── Generic ─────────────────────────────────────────

function formatGeneric(data: any): string {
  return JSON.stringify(data, null, 2);
}

// ── Public API ──────────────────────────────────────

type CommandType = "triage" | "campaigns" | "performance" | "keywords" | "run" | "generic";

export function output(data: any, format: string, command: CommandType = "generic"): void {
  // Auto-detect: if format wasn't explicitly set and stdout isn't a TTY, use JSON
  const useJson = format === "json" || (format === "auto" && !process.stdout.isTTY);

  if (useJson) {
    console.log(JSON.stringify(data));
    return;
  }

  // Human-readable formatting
  switch (command) {
    case "triage":
      console.log(formatTriage(data));
      break;
    case "campaigns":
      console.log(formatCampaigns(data));
      break;
    case "performance":
      console.log(formatPerformance(data));
      break;
    case "keywords":
      console.log(formatKeywords(data));
      break;
    case "run":
      console.log(formatRun(data));
      break;
    default:
      console.log(formatGeneric(data));
  }
}
