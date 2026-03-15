import { api } from "../client";
import { output } from "../format";

export async function triage(opts: { format: string }): Promise<void> {
  const result = await api("/triage");
  output(result, opts.format, "triage");
}
