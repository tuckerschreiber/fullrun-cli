import { api } from "../client";
import { output } from "../format";

export async function listCampaigns(opts: { format: string }): Promise<void> {
  const result = await api("/campaigns");
  output(result, opts.format);
}
