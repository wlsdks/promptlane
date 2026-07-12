import {
  AlertTriangle,
  BarChart3,
  Database,
  FileText,
  FolderCog,
  ListChecks,
  Inbox,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  ShieldCheck,
  Target,
} from "lucide-react";
import type { ReactNode } from "react";

import type { Language } from "./i18n.js";
import type { View } from "./routing.js";

import "./primary-navigation.css";

export function PrimaryNavigation({
  health,
  language,
  onNavigate,
  onSetLanguage,
  onToggleSidebar,
  sidebarCollapsed,
  view,
}: {
  health?: { ok: boolean; version: string; instance_id: string };
  language: Language;
  onNavigate(view: View): void;
  onSetLanguage(language: Language): void;
  onToggleSidebar(): void;
  sidebarCollapsed: boolean;
  view: View;
}) {
  return (
    <aside className="sidebar" aria-label="Primary navigation">
      <div className="sidebar-header">
        <div className="brand">
          <Database size={16} />
          <span className="sidebar-label">looprelay</span>
        </div>
        <button
          aria-expanded={!sidebarCollapsed}
          aria-label={
            sidebarCollapsed ? "Expand navigation" : "Collapse navigation"
          }
          className="sidebar-toggle"
          onClick={onToggleSidebar}
          type="button"
        >
          {sidebarCollapsed ? (
            <PanelLeftOpen size={16} />
          ) : (
            <PanelLeftClose size={16} />
          )}
        </button>
      </div>

      <p className="nav-group-label sidebar-label">Operate</p>
      <NavigationButton
        active={view.name === "dashboard"}
        icon={<BarChart3 size={16} />}
        label="Overview"
        onClick={() => onNavigate({ name: "dashboard" })}
      />
      <NavigationButton
        active={view.name === "loops"}
        icon={<ListChecks size={16} />}
        label="Loops"
        onClick={() => onNavigate({ name: "loops" })}
      />
      <NavigationButton
        active={view.name === "actions"}
        icon={<Inbox size={16} />}
        label="Actions"
        onClick={() => onNavigate({ name: "actions" })}
      />

      <p className="nav-group-label sidebar-label">Learn</p>
      <NavigationButton
        active={view.name === "scores"}
        icon={<FileText size={16} />}
        label="Evidence"
        onClick={() => onNavigate({ name: "scores" })}
      />
      <NavigationButton
        active={view.name === "coach"}
        icon={<Target size={16} />}
        label="Insights"
        onClick={() => onNavigate({ name: "coach" })}
      />

      <p className="nav-group-label sidebar-label">Manage</p>
      <NavigationButton
        active={view.name === "list" || view.name === "detail"}
        icon={<FileText size={16} />}
        label="Archive"
        onClick={() => onNavigate({ name: "list" })}
      />
      <NavigationButton
        active={view.name === "projects" || view.name === "project"}
        icon={<FolderCog size={16} />}
        label="Projects"
        onClick={() => onNavigate({ name: "projects" })}
      />

      <p className="nav-group-label sidebar-label">Configure</p>
      <NavigationButton
        active={view.name === "mcp"}
        icon={<Database size={16} />}
        label="Integrations"
        onClick={() => onNavigate({ name: "mcp" })}
      />
      <NavigationButton
        active={view.name === "settings" || view.name === "exports"}
        icon={<Settings size={16} />}
        label="Settings"
        onClick={() => onNavigate({ name: "settings" })}
      />

      <div
        className="capture-status"
        aria-label={health?.ok ? "Server OK" : "Checking status"}
      >
        {health?.ok ? <ShieldCheck size={16} /> : <AlertTriangle size={16} />}
        <span className="sidebar-label">
          {health?.ok ? "Server OK" : "Checking status"}
        </span>
      </div>
      <div className="language-switch" aria-label="Language">
        <button
          aria-pressed={language === "en"}
          className={language === "en" ? "active" : ""}
          onClick={() => onSetLanguage("en")}
          type="button"
        >
          EN
        </button>
        <button
          aria-pressed={language === "ko"}
          className={language === "ko" ? "active" : ""}
          onClick={() => onSetLanguage("ko")}
          type="button"
        >
          KO
        </button>
      </div>
    </aside>
  );
}

function NavigationButton({
  active,
  icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: ReactNode;
  label: string;
  onClick(): void;
}) {
  return (
    <button
      aria-label={label}
      className={`nav-button ${active ? "active" : ""}`}
      onClick={onClick}
      type="button"
    >
      {icon}
      <span className="sidebar-label">{label}</span>
    </button>
  );
}
