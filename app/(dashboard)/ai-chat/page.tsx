import type { Metadata } from "next";

import { AiChat } from "@/components/ai/ai-chat";

export const metadata: Metadata = {
  title: "AI Assistant | Duratu Kafe",
  description:
    "Asisten AI untuk membantu pengelolaan bisnis kafe.",
};

export default function AiChatPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          AI Assistant
        </h1>

        <p className="mt-1 text-muted-foreground">
          Diskusikan ide, strategi, dan
          operasional bisnis kafe bersama
          Duratu AI.
        </p>
      </div>

      <AiChat />
    </div>
  );
}