import { saveConfig } from "../client";

export async function login(apiKey: string, opts: { url?: string }): Promise<void> {
  const apiUrl = opts.url || "https://www.fullrun.app";

  saveConfig({ apiKey, apiUrl });

  // Verify the key works
  try {
    const url = new URL("/api/v1/campaigns", apiUrl);
    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${apiKey}` },
    });

    if (res.ok) {
      console.log(JSON.stringify({ ok: true, apiUrl, message: "Logged in successfully. Config saved to ~/.fullrun/config.json" }));
    } else {
      const json = await res.json().catch(() => ({}));
      console.error(JSON.stringify({ error: json.error || res.statusText }));
      process.exit(1);
    }
  } catch (err: any) {
    console.error(JSON.stringify({ error: `Could not reach ${apiUrl}: ${err.message}` }));
    process.exit(1);
  }
}
