"use client";

import { AssistantChat } from "@/components/assistant/assistant-chat";
import { Sparkles } from "lucide-react";

export default function AssistantPage() {
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-xl text-primary">
          <Sparkles className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">AI Fleet Assistant</h1>
          <p className="text-muted-foreground mt-1">
            Ask questions about your fleet's performance in natural language.
          </p>
        </div>
      </div>

      <AssistantChat />
    </div>
  );
}
