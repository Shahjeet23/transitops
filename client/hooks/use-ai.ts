import { useMutation } from "@tanstack/react-query";
import { aiApi } from "@/lib/ai.api";

export function useAskAssistant() {
  return useMutation({
    mutationFn: aiApi.askAssistant,
  });
}
