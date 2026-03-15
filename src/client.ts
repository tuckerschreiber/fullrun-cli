import * as fs from "fs";
import * as path from "path";
import * as os from "os";

const CONFIG_DIR = path.join(os.homedir(), ".fullrun");
const CONFIG_FILE = path.join(CONFIG_DIR, "config.json");

interface Config {
  apiKey: string;
  apiUrl: string;
}

export function getConfig(): Config {
  // Env vars take priority
  if (process.env.FULLRUN_API_KEY) {
    return {
      apiKey: process.env.FULLRUN_API_KEY,
      apiUrl: process.env.FULLRUN_API_URL || "https://fullrun.app",
    };
  }

  if (!fs.existsSync(CONFIG_FILE)) {
    throw new Error("Not logged in. Run 'fullrun login' first, or set FULLRUN_API_KEY env var.");
  }
  const raw = fs.readFileSync(CONFIG_FILE, "utf-8");
  const config = JSON.parse(raw);

  return {
    apiKey: config.apiKey,
    apiUrl: config.apiUrl || "https://fullrun.app",
  };
}

export function saveConfig(config: Partial<Config>): void {
  fs.mkdirSync(CONFIG_DIR, { recursive: true });
  const existing = fs.existsSync(CONFIG_FILE)
    ? JSON.parse(fs.readFileSync(CONFIG_FILE, "utf-8"))
    : {};
  const merged = { ...existing, ...config };
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(merged, null, 2));
}

export async function api<T = any>(
  endpoint: string,
  options: { method?: string; body?: any; params?: Record<string, string> } = {}
): Promise<T> {
  const config = getConfig();
  const url = new URL(`/api/v1${endpoint}`, config.apiUrl);

  if (options.params) {
    for (const [k, v] of Object.entries(options.params)) {
      url.searchParams.set(k, v);
    }
  }

  const res = await fetch(url.toString(), {
    method: options.method || "GET",
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      "Content-Type": "application/json",
    },
    ...(options.body ? { body: JSON.stringify(options.body) } : {}),
  });

  const json = await res.json();

  if (!res.ok) {
    const err: any = new Error(json.error || `API error ${res.status}`);
    err.status = res.status;
    err.suggestion = json.suggestion;
    throw err;
  }

  return json;
}
