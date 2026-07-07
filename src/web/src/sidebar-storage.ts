const SIDEBAR_COLLAPSED_STORAGE_KEY = "pm:sidebar-collapsed";

type SidebarStorage = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
};

export function readSidebarCollapsed(
  storage = localStorageForSidebar(),
): boolean {
  if (!storage) return false;
  try {
    return storage.getItem(SIDEBAR_COLLAPSED_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

export function persistSidebarCollapsed(
  storage: SidebarStorage | undefined,
  collapsed: boolean,
): void {
  if (!storage) return;
  try {
    storage.setItem(SIDEBAR_COLLAPSED_STORAGE_KEY, collapsed ? "1" : "0");
  } catch {
    // Storage access can fail in private mode; the in-memory state still works.
  }
}

export function localStorageForSidebar(): SidebarStorage | undefined {
  if (typeof window === "undefined") return undefined;
  return window.localStorage;
}
