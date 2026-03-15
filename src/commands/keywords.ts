import { api } from "../client";
import { output } from "../format";

export async function listKeywords(opts: { campaign?: string; format: string }): Promise<void> {
  const params: Record<string, string> = {};
  if (opts.campaign) params.campaignId = opts.campaign;
  const result = await api("/keywords", { params });
  output(result, opts.format, "keywords");
}
