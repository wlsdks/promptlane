import {
  getActionInbox,
  recordFailureEpisode,
  type FailureEpisodeInput,
} from "./action-inbox-api.js";
import { useActionInboxQuery } from "./action-inbox-query.js";
import { ActionsView } from "./actions-view.js";

export function ActionsPage({
  onError,
}: {
  onError(message: string | undefined): void;
}) {
  const { actionInbox, actionInboxLoading, refreshActionInbox } =
    useActionInboxQuery({
      getActionInbox,
      onError,
      viewName: "actions",
    });

  async function confirmFailure(input: FailureEpisodeInput): Promise<void> {
    await recordFailureEpisode(input);
    await refreshActionInbox();
  }

  return (
    <ActionsView
      loading={actionInboxLoading}
      onConfirmFailure={confirmFailure}
      onRefresh={refreshActionInbox}
      report={actionInbox}
    />
  );
}
