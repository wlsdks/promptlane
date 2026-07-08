import { describe, expect, it } from "vitest";

import type { QualityDashboard } from "./api.js";
import {
  refreshDashboardSummaries,
  shouldLoadArchiveScore,
  shouldLoadCoachFeedback,
  shouldLoadDashboard,
} from "./dashboard-query.js";

const dashboardWith7Days = {
  trend: {
    daily: Array.from({ length: 7 }, (_, index) => ({
      date: `2026-07-0${index + 1}`,
      average_score: 0.8,
      prompt_count: 1,
    })),
  },
} as unknown as QualityDashboard;

describe("dashboard query", () => {
  it("loads dashboard data only for dashboard-backed views", () => {
    expect(shouldLoadDashboard("list", undefined, 7)).toBe(false);
    expect(shouldLoadDashboard("dashboard", undefined, 7)).toBe(true);
    expect(shouldLoadDashboard("coach", undefined, 7)).toBe(true);
  });

  it("reloads dashboard data when the cached trend window differs", () => {
    expect(shouldLoadDashboard("dashboard", dashboardWith7Days, 7)).toBe(false);
    expect(shouldLoadDashboard("dashboard", dashboardWith7Days, 30)).toBe(true);
  });

  it("loads archive score only for archive-score backed views", () => {
    expect(shouldLoadArchiveScore("list", false)).toBe(false);
    expect(shouldLoadArchiveScore("dashboard", false)).toBe(true);
    expect(shouldLoadArchiveScore("dashboard", true)).toBe(false);
    expect(shouldLoadArchiveScore("coach", false)).toBe(true);
  });

  it("loads coach feedback only for the dashboard view", () => {
    expect(shouldLoadCoachFeedback("coach", false)).toBe(false);
    expect(shouldLoadCoachFeedback("dashboard", false)).toBe(true);
    expect(shouldLoadCoachFeedback("dashboard", true)).toBe(false);
  });

  it("refreshes dashboard and archive score summaries after prompt mutations", async () => {
    const dashboard = dashboardWith7Days;
    const archiveScore = { status: "ok" } as never;
    const calls: string[] = [];

    await refreshDashboardSummaries({
      getArchiveScoreReport: async () => {
        calls.push("archive");
        return archiveScore;
      },
      getQualityDashboard: async () => {
        calls.push("dashboard");
        return dashboard;
      },
      setArchiveScore: (value) => {
        expect(value).toBe(archiveScore);
      },
      setDashboard: (value) => {
        expect(value).toBe(dashboard);
      },
    });

    expect(calls).toEqual(["dashboard", "archive"]);
  });

  it("still refreshes archive score when dashboard refresh fails", async () => {
    const archiveScore = { status: "ok" } as never;
    const calls: string[] = [];

    await refreshDashboardSummaries({
      getArchiveScoreReport: async () => {
        calls.push("archive");
        return archiveScore;
      },
      getQualityDashboard: async () => {
        calls.push("dashboard");
        throw new Error("dashboard unavailable");
      },
      setArchiveScore: (value) => {
        expect(value).toBe(archiveScore);
      },
      setDashboard: () => {
        throw new Error("dashboard setter should not run");
      },
    });

    expect(calls).toEqual(["dashboard", "archive"]);
  });
});
