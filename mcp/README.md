# @fullrun/mcp

MCP server for managing Google Ads campaigns from Claude Desktop, Cursor, Windsurf, and other AI agents.

## Install

```bash
npm install -g @fullrun/mcp
```

## Setup

1. Get your API key at [fullrun.app](https://www.fullrun.app)
2. Add to your Claude Desktop config (`~/Library/Application Support/Claude/claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "fullrun": {
      "command": "npx",
      "args": ["-y", "@fullrun/mcp"],
      "env": {
        "FULLRUN_API_KEY": "frun_your_key_here"
      }
    }
  }
}
```

For Cursor, add to `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "fullrun": {
      "command": "npx",
      "args": ["-y", "@fullrun/mcp"],
      "env": {
        "FULLRUN_API_KEY": "frun_your_key_here"
      }
    }
  }
}
```

## Tools

| Tool | Description |
|------|-------------|
| `triage` | Diagnose account health. Returns prioritized issues. Always call this first. |
| `list_campaigns` | List all campaigns with status, budget, and metrics. |
| `get_performance` | Get account metrics (clicks, impressions, conversions, CPA) for 1-90 days. |
| `list_keywords` | List keywords with performance data. Optionally filter by campaign. |
| `run_optimization` | Trigger AI-powered optimization. Rate limited to 1 per hour. |

## Workflow

1. Call `triage` to see prioritized issues
2. Use `list_campaigns`, `get_performance`, `list_keywords` to investigate
3. Call `run_optimization` to fix the highest-priority issues automatically

## CLI

There's also a CLI for non-MCP usage:

```bash
npm install -g fullrun
fullrun triage
```

See [fullrun on npm](https://www.npmjs.com/package/fullrun) for CLI docs.

## License

MIT
