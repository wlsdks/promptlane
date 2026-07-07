export function projectLabel(cwd: string): string {
  return (
    cwd
      .trim()
      .replace(/[\\/]+$/, "")
      .split(/[\\/]/)
      .filter(Boolean)
      .at(-1) ?? "project"
  );
}
