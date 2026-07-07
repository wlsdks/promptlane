import { describe, expect, it, vi } from "vitest";

import {
  persistSidebarCollapsed,
  readSidebarCollapsed,
} from "./sidebar-storage.js";

describe("sidebar storage", () => {
  it("reads the collapsed flag only when local storage has the enabled value", () => {
    expect(
      readSidebarCollapsed(memoryStorage({ "pm:sidebar-collapsed": "1" })),
    ).toBe(true);
    expect(
      readSidebarCollapsed(memoryStorage({ "pm:sidebar-collapsed": "0" })),
    ).toBe(false);
    expect(readSidebarCollapsed(undefined)).toBe(false);
  });

  it("persists collapsed state without throwing when storage is available", () => {
    const storage = memoryStorage();

    persistSidebarCollapsed(storage, true);
    expect(storage.getItem("pm:sidebar-collapsed")).toBe("1");

    persistSidebarCollapsed(storage, false);
    expect(storage.getItem("pm:sidebar-collapsed")).toBe("0");
  });

  it("fails open when storage access throws", () => {
    const storage = {
      getItem: vi.fn(() => {
        throw new Error("blocked");
      }),
      setItem: vi.fn(() => {
        throw new Error("blocked");
      }),
    };

    expect(readSidebarCollapsed(storage)).toBe(false);
    expect(() => persistSidebarCollapsed(storage, true)).not.toThrow();
  });
});

function memoryStorage(initial: Record<string, string> = {}) {
  const values = new Map(Object.entries(initial));
  return {
    getItem(key: string): string | null {
      return values.get(key) ?? null;
    },
    setItem(key: string, value: string): void {
      values.set(key, value);
    },
  };
}
