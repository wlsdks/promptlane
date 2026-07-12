import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";

export const WEB_ENTRY_CHUNK_BUDGET_BYTES = 500_000;

export function webEntryChunkBudgetError(
  fileName: string,
  code: string,
): string | undefined {
  const bytes = Buffer.byteLength(code);
  return bytes > WEB_ENTRY_CHUNK_BUDGET_BYTES
    ? `${fileName} is ${bytes} bytes; LoopRelay web entry chunks must stay at or below ${WEB_ENTRY_CHUNK_BUDGET_BYTES} bytes.`
    : undefined;
}

export function webInitialPreloadError(html: string): string | undefined {
  return /<link[^>]+rel="modulepreload"[^>]+charts-|<link[^>]+charts-[^>]+rel="modulepreload"/.test(
    html,
  )
    ? "LoopRelay initial HTML must not preload the route-exclusive charts chunk."
    : undefined;
}

export function enforceWebEntryChunkBudget(): Plugin {
  return {
    name: "looprelay-web-entry-chunk-budget",
    generateBundle(_options, bundle) {
      for (const artifact of Object.values(bundle)) {
        if (artifact.type !== "chunk" || !artifact.isEntry) continue;
        const error = webEntryChunkBudgetError(
          artifact.fileName,
          artifact.code,
        );
        if (error) this.error(error);
      }
    },
    transformIndexHtml: {
      order: "post",
      handler(html) {
        const error = webInitialPreloadError(html);
        if (error) this.error(error);
        return html;
      },
    },
  };
}

export default defineConfig({
  plugins: [react(), enforceWebEntryChunkBudget()],
  root: "src/web",
  build: {
    outDir: "../../dist/web",
    emptyOutDir: true,
  },
});
