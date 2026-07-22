import "server-only";

import { serverEnv } from "@/lib/env.server";

export const AI_MODEL =
  serverEnv.geminiModel;