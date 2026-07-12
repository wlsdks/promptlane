import { useCallback, useEffect, useState } from "react";

import type { ActionInboxReport } from "./action-inbox-api.js";
import type { View } from "./routing.js";

export function useActionInboxQuery({
  getActionInbox,
  onError,
  viewName,
}: {
  getActionInbox(): Promise<ActionInboxReport>;
  onError(message: string | undefined): void;
  viewName: View["name"];
}) {
  const [report, setReport] = useState<ActionInboxReport | undefined>();
  const [loading, setLoading] = useState(false);
  const refresh = useCallback(async () => {
    setLoading(true);
    onError(undefined);
    try {
      setReport(await getActionInbox());
    } catch (error) {
      onError(
        error instanceof Error ? error.message : "Action inbox unavailable.",
      );
    } finally {
      setLoading(false);
    }
  }, [getActionInbox, onError]);

  useEffect(() => {
    if (viewName === "actions" && !report && !loading) void refresh();
  }, [loading, refresh, report, viewName]);

  return {
    actionInbox: report,
    actionInboxLoading: loading,
    refreshActionInbox: refresh,
  };
}
