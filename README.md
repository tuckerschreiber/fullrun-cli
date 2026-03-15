<p align="center">
  <img src="logo.svg" alt="Fullrun" width="400" />
</p>

<p align="center">
  Google Ads management CLI for AI agents.<br/>
  Works with <a href="https://openclaw.ai">OpenClaw</a>, <a href="https://claude.ai/claude-code">Claude</a>, and any agent that can run shell commands.
</p>

---

```bash
npm install -g fullrun
fullrun login frun_YOUR_API_KEY
fullrun triage
```

## What it does

Fullrun gives AI agents (and humans) a command-line interface to manage Google Ads campaigns. Every command returns structured JSON when piped, and human-readable colored output in a terminal.

An agent can autonomously:

1. **Diagnose** account health with `fullrun triage`
2. **Inspect** campaigns, keywords, and performance metrics
3. **Fix** issues by triggering an AI-powered optimization run

All business logic, guardrails, and Google Ads API calls happen server-side. The CLI is a thin client — no credentials on your machine.

## Commands

| Command | Description |
|---------|-------------|
| `fullrun login <key>` | Authenticate with your API key |
| `fullrun triage` | Account health report with prioritized issues |
| `fullrun campaigns:list` | List campaigns with status, budget, and metrics |
| `fullrun performance` | Account metrics — clicks, conversions, CPA |
| `fullrun keywords:list` | Keywords with performance data |
| `fullrun run` | Trigger a full AI-powered optimization run |

### Options

- `--format json` — Force JSON output (default when piped)
- `--format human` — Force colored terminal output (default in TTY)
- `--days <n>` — Look-back period for performance data (default 7, max 90)
- `--campaign <id>` — Filter keywords by campaign

## Agent integration

### OpenClaw

Install the CLI globally and OpenClaw auto-discovers it via the bundled `SKILL.md`:

```bash
npm install -g fullrun
```

Then tell your agent: *"Check my Google Ads and fix anything that's underperforming."*

### Claude Code

The `SKILL.md` works as a Claude Code skill. The agent reads it and knows how to use every command.

### MCP (Claude Desktop / Cursor)

```json
{
  "mcpServers": {
    "fullrun": {
      "command": "npx",
      "args": ["@fullrun/mcp"],
      "env": {
        "FULLRUN_API_KEY": "frun_..."
      }
    }
  }
}
```

### Any agent

Any agent that can execute shell commands can use Fullrun. Output is auto-detected — JSON when piped, human-readable in a terminal.

## Getting an API key

1. Sign up at [fullrun.app](https://www.fullrun.app)
2. Connect your Google Ads account
3. Go to **Settings > API Keys**
4. Create a key and copy it

## How it works

```
CLI / MCP / Agent
      │
      ▼
  Fullrun API (api key auth)
      │
      ▼
  Triage engine → Google Ads API
  Guardrails, bid caps, PPC rules
```

The CLI never touches Google Ads directly. It calls the Fullrun API, which runs the same triage and optimization engine that powers the web dashboard. All guardrails (mutation limits, bid caps, budget safety) are enforced server-side.

## Development

```bash
git clone https://github.com/tuckerschreiber/fullrun-cli
cd fullrun-cli
npm install
npx tsx src/bin/fullrun.ts --help
```

## License

MIT
