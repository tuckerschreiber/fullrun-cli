import { api } from "../client";
import { output } from "../format";

export async function run(opts: { format: string }): Promise<void> {
  const result = await api("/run-agent", { method: "POST" });
  output(result, opts.format, "run");
}
