export function projectLabel(value: string): string {
  const trimmed = value.trim().replace(/[\\/]+$/, "");
  return trimmed.split(/[\\/]/).at(-1) || trimmed || "unknown";
}
