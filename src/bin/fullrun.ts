#!/usr/bin/env node
import { Command } from "commander";
import { login } from "../commands/login";
import { triage } from "../commands/triage";
import { listCampaigns } from "../commands/campaigns";
import { performance } from "../commands/performance";
import { run } from "../commands/run";
import { listKeywords } from "../commands/keywords";

const program = new Command();

program
  .name("fullrun")
  .description("Google Ads management CLI for AI agents")
  .version("0.1.0");

program
  .command("login")
  .description("Authenticate with your Fullrun API key")
  .argument("<api-key>", "Your API key (frun_...)")
  .option("--url <url>", "API base URL", "https://www.fullrun.app")
  .action(login);

program
  .command("triage")
  .description("Diagnose account health — returns prioritized issues")
  .option("--format <format>", "Output format: human (default) or json", "human")
  .action(triage);

program
  .command("campaigns:list")
  .description("List all campaigns with metrics")
  .option("--format <format>", "Output format: human or json", "human")
  .action(listCampaigns);

program
  .command("performance")
  .description("Get account performance metrics")
  .option("--days <days>", "Number of days to look back", "7")
  .option("--format <format>", "Output format: human or json", "human")
  .action(performance);

program
  .command("keywords:list")
  .description("List keywords with performance data")
  .option("--campaign <id>", "Filter by campaign ID")
  .option("--format <format>", "Output format: human or json", "human")
  .action(listKeywords);

program
  .command("run")
  .description("Trigger a full agent optimization run")
  .option("--format <format>", "Output format: human or json", "human")
  .action(run);

program.parse();
