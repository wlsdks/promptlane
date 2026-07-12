import { lazy } from "react";

export const ActionsPage = lazy(async () => {
  const module = await import("./actions-page.js");
  return { default: module.ActionsPage };
});

export const CommandCenter = lazy(async () => {
  const module = await import("./command-center.js");
  return { default: module.CommandCenter };
});

export const GapRateChart = lazy(async () => {
  const module = await import("./charts.js");
  return { default: module.GapRateChart };
});

export const InsightInventory = lazy(async () => {
  const module = await import("./insight-inventory.js");
  return { default: module.InsightInventory };
});

export const LoopsView = lazy(async () => {
  const module = await import("./loops-view.js");
  return { default: module.LoopsView };
});

export const McpToolsView = lazy(async () => {
  const module = await import("./mcp-tools-view.js");
  return { default: module.McpToolsView };
});

export const ProjectWorkspace = lazy(async () => {
  const module = await import("./project-workspace.js");
  return { default: module.ProjectWorkspace };
});

export const PromptDetailView = lazy(async () => {
  const module = await import("./prompt-detail-view.js");
  return { default: module.PromptDetailView };
});

export const QualityTrendChart = lazy(async () => {
  const module = await import("./charts.js");
  return { default: module.QualityTrendChart };
});

export const ScoreDistributionChart = lazy(async () => {
  const module = await import("./charts.js");
  return { default: module.ScoreDistributionChart };
});
