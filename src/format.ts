export function output(data: any, format: string): void {
  if (format === "human") {
    console.log(typeof data === "string" ? data : JSON.stringify(data, null, 2));
  } else {
    console.log(JSON.stringify(data));
  }
}
