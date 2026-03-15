import { api } from "../client";
import { output } from "../format";

export async function performance(opts: { days: string; format: string }): Promise<void> {
  const result = await api("/performance", { params: { days: opts.days } });
  output(result, opts.format, "performance");
}
