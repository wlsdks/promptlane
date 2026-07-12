import Database from "better-sqlite3";
import { mkdtempSync, readFileSync, readdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, join } from "node:path";
import type { Command } from "commander";
import { describe, expect, it } from "vitest";

import { createProgram } from "../cli/index.js";
import { initializeLoopRelay } from "../config/config.js";
import { listLoopRelayMcpToolNames } from "../mcp/tool-registry.js";
import { createSqlitePromptStorage } from "../storage/sqlite.js";

function collectCommandPaths(
  command: Command,
  prefix: string[] = [],
): string[] {
  return command.commands.flatMap((child) => {
    const path = [...prefix, child.name()];
    return [path.join(" "), ...collectCommandPaths(child, path)];
  });
}

function collectHttpRoutes(): string[] {
  const routeDir = join(process.cwd(), "src/server/routes");
  const routePattern =
    /(?:server|fastify)\.(get|post|put|patch|delete)\(\s*"([^"]+)"/g;

  return readdirSync(routeDir)
    .filter((file) => file.endsWith(".ts") && !file.endsWith(".test.ts"))
    .flatMap((file) => {
      const source = readFileSync(join(routeDir, file), "utf8");
      return [...source.matchAll(routePattern)].map(
        (match) => `${match[1]!.toUpperCase()} ${match[2]!}`,
      );
    })
    .sort();
}

function collectWebViewNames(): string[] {
  const source = readFileSync(
    join(process.cwd(), "src/web/src/routing.ts"),
    "utf8",
  );

  return [
    ...new Set(
      [...source.matchAll(/\{ name: "([^"]+)"/g)].map((match) => match[1]!),
    ),
  ].sort();
}

function collectLogicalTableNames(): string[] {
  const dataDir = mkdtempSync(join(tmpdir(), "looprelay-feature-inventory-"));

  try {
    initializeLoopRelay({ dataDir });
    const storage = createSqlitePromptStorage({
      dataDir,
      hmacSecret: "feature-inventory-schema-audit",
    });
    storage.close();
    const database = new Database(join(dataDir, "looprelay.sqlite"), {
      readonly: true,
    });

    try {
      return (
        database
          .prepare(
            "SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name",
          )
          .all() as Array<{ name: string }>
      )
        .map((row) => row.name)
        .filter(
          (name) =>
            !name.startsWith("sqlite_") &&
            (name === "prompt_fts" || !name.startsWith("prompt_fts_")),
        );
    } finally {
      database.close();
    }
  } finally {
    rmSync(dataDir, { recursive: true, force: true });
  }
}

describe("canonical feature inventory", () => {
  const inventoryPath = "docs/FEATURE_INVENTORY.md";
  const inventory = readFileSync(join(process.cwd(), inventoryPath), "utf8");

  it("lists every CLI command path exposed by Commander", () => {
    const commandPaths = collectCommandPaths(createProgram());

    expect(commandPaths).toHaveLength(74);
    for (const commandPath of commandPaths) {
      expect(inventory, `missing CLI command: ${commandPath}`).toContain(
        `\`${commandPath}\``,
      );
    }
  });

  it("lists every MCP tool exposed by the registry", () => {
    const toolNames = listLoopRelayMcpToolNames();

    expect(toolNames).toHaveLength(27);
    for (const toolName of toolNames) {
      expect(inventory, `missing MCP tool: ${toolName}`).toContain(
        `\`${toolName}\``,
      );
    }
  });

  it("lists every HTTP API, SPA, and asset route registered by the server", () => {
    const routes = collectHttpRoutes();

    expect(routes).toHaveLength(59);
    for (const route of routes) {
      expect(inventory, `missing HTTP route: ${route}`).toContain(
        `\`${route}\``,
      );
    }
  });

  it("lists every client-side web view", () => {
    const viewNames = collectWebViewNames();

    expect(viewNames).toHaveLength(12);
    for (const viewName of viewNames) {
      expect(inventory, `missing web view: ${viewName}`).toContain(
        `\`view:${viewName}\``,
      );
    }
  });

  it("lists every installed slash command", () => {
    const commandNames = readdirSync(join(process.cwd(), "commands"))
      .filter((file) => file.endsWith(".md"))
      .map((file) => basename(file, ".md"))
      .sort();

    expect(commandNames).toHaveLength(10);
    for (const commandName of commandNames) {
      expect(inventory, `missing slash command: ${commandName}`).toContain(
        `\`/looprelay:${commandName}\``,
      );
    }
  });

  it("lists every logical SQLite table in a freshly initialized schema", () => {
    const tableNames = collectLogicalTableNames();

    expect(tableNames).toHaveLength(31);
    for (const tableName of tableNames) {
      expect(inventory, `missing logical table: ${tableName}`).toContain(
        `\`${tableName}\``,
      );
    }
  });

  it("lists every npm maintainer script and shipped binary", () => {
    const packageJson = JSON.parse(
      readFileSync(join(process.cwd(), "package.json"), "utf8"),
    ) as { bin: Record<string, string>; scripts: Record<string, string> };
    const scriptNames = Object.keys(packageJson.scripts).sort();
    const binNames = Object.keys(packageJson.bin).sort();

    expect(scriptNames).toHaveLength(40);
    expect(binNames).toEqual(["looprelay", "lr-claude", "lr-codex"]);
    for (const scriptName of scriptNames) {
      expect(inventory, `missing npm script: ${scriptName}`).toContain(
        `\`${scriptName}\``,
      );
    }
    for (const binName of binNames) {
      expect(inventory, `missing binary: ${binName}`).toContain(
        `\`${binName}\``,
      );
    }
  });

  it("ships the canonical inventory in the npm package", () => {
    const auditPath = "docs/FEATURE_INVENTORY_AUDIT_2026-07-12.md";
    const packageJson = JSON.parse(
      readFileSync(join(process.cwd(), "package.json"), "utf8"),
    ) as { files: string[] };
    const packageContents = readFileSync(
      join(process.cwd(), "docs/PACKAGE_CONTENTS.md"),
      "utf8",
    );

    expect(packageJson.files).toContain(inventoryPath);
    expect(packageJson.files).toContain(auditPath);
    expect(packageContents).toContain(`\`${inventoryPath}\``);
    expect(packageContents).toContain(`\`${auditPath}\``);
  });
});
