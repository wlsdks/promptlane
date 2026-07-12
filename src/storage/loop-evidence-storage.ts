import type Database from "better-sqlite3";

import type {
  FailureEpisodeStoragePort,
  LoopCloseStoragePort,
} from "./ports.js";
import * as failureEpisodes from "./failure-episodes.js";
import * as loopClose from "./loop-close.js";

export function createLoopEvidenceStorage(
  db: Database.Database,
  now: () => Date,
): FailureEpisodeStoragePort & LoopCloseStoragePort {
  return {
    recordFailureEpisode: (input) =>
      failureEpisodes.recordFailureEpisode(db, input, now()),
    listFailureEpisodes: (input = {}) =>
      failureEpisodes.listFailureEpisodes(db, input),
    getFailureEpisodePatternCounts: (input = {}) =>
      failureEpisodes.getFailureEpisodePatternCounts(db, input),
    closeLoop: (input) => loopClose.closeLoop(db, input, now()),
  };
}
