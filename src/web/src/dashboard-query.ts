import { useEffect, useState } from "react";

import type {
  ArchiveScoreReport,
  CoachFeedbackSummary,
  QualityDashboard,
} from "./api.js";
import {
  needsArchiveScoreData,
  needsDashboardData,
  type View,
} from "./routing.js";
import {
  archiveScoreQueryErrorMessage,
  qualityDashboardErrorMessage,
} from "./error-message.js";

export function shouldLoadDashboard(
  viewName: View["name"],
  dashboard: QualityDashboard | undefined,
  trendDays: 7 | 30,
): boolean {
  if (!needsDashboardData(viewName)) {
    return false;
  }
  return !dashboard || dashboard.trend.daily.length !== trendDays;
}

export function shouldLoadArchiveScore(
  viewName: View["name"],
  hasArchiveScore: boolean,
): boolean {
  return needsArchiveScoreData(viewName) && !hasArchiveScore;
}

export function shouldLoadCoachFeedback(
  viewName: View["name"],
  hasCoachFeedback: boolean,
): boolean {
  return viewName === "dashboard" && !hasCoachFeedback;
}

export function useDashboardQuery({
  getArchiveScoreReport,
  getCoachFeedbackSummary,
  getQualityDashboard,
  onError,
  trendDays,
  viewName,
}: {
  getArchiveScoreReport(): Promise<ArchiveScoreReport>;
  getCoachFeedbackSummary(): Promise<CoachFeedbackSummary>;
  getQualityDashboard(options: {
    trendDays: 7 | 30;
  }): Promise<QualityDashboard>;
  onError(message: string | undefined): void;
  trendDays: 7 | 30;
  viewName: View["name"];
}): {
  archiveScore: ArchiveScoreReport | undefined;
  coachFeedback: CoachFeedbackSummary | undefined;
  dashboard: QualityDashboard | undefined;
  setArchiveScore: (archiveScore: ArchiveScoreReport | undefined) => void;
  setDashboard: (dashboard: QualityDashboard | undefined) => void;
} {
  const [dashboard, setDashboard] = useState<QualityDashboard | undefined>();
  const [archiveScore, setArchiveScore] = useState<
    ArchiveScoreReport | undefined
  >();
  const [coachFeedback, setCoachFeedback] = useState<
    CoachFeedbackSummary | undefined
  >();

  useEffect(() => {
    if (!shouldLoadDashboard(viewName, dashboard, trendDays)) {
      return;
    }

    void getQualityDashboard({ trendDays })
      .then(setDashboard)
      .catch((error) => onError(qualityDashboardErrorMessage(error)));
  }, [dashboard, getQualityDashboard, onError, trendDays, viewName]);

  useEffect(() => {
    if (!shouldLoadArchiveScore(viewName, Boolean(archiveScore))) {
      return;
    }

    void getArchiveScoreReport()
      .then(setArchiveScore)
      .catch((error) => onError(archiveScoreQueryErrorMessage(error)));
  }, [archiveScore, getArchiveScoreReport, onError, viewName]);

  useEffect(() => {
    if (!shouldLoadCoachFeedback(viewName, Boolean(coachFeedback))) {
      return;
    }

    void getCoachFeedbackSummary()
      .then(setCoachFeedback)
      .catch(() => undefined);
  }, [coachFeedback, getCoachFeedbackSummary, viewName]);

  return {
    archiveScore,
    coachFeedback,
    dashboard,
    setArchiveScore,
    setDashboard,
  };
}
