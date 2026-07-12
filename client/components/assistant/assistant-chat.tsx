"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, AlertCircle, RefreshCw } from "lucide-react";
import { useAskAssistant } from "@/hooks/use-ai";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  isError?: boolean;
}

export function AssistantChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hello! I am your AI Fleet Assistant. I have real-time access to your fleet's operations and financial data. What would you like to know?",
    }
  ]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { mutateAsync: askAssistant, isPending } = useAskAssistant();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isPending) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    try {
      const response = await askAssistant({ prompt: userMessage.content });
      
      if (response.data?.success && response.data?.data) {
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: response.data.data || "",
          }
        ]);
      } else {
        // Handle custom error from backend (like missing API key)
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: response.data?.error || "Sorry, I encountered an error.",
            isError: true,
          }
        ]);
      }
    } catch (error: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: error.response?.data?.error || "Failed to communicate with the server. Please try again.",
          isError: true,
        }
      ]);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] bg-card rounded-xl border border-border shadow-sm overflow-hidden">
      {/* Chat History */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-4 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {msg.role === "assistant" && (
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${msg.isError ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"}`}>
                {msg.isError ? <AlertCircle className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
              </div>
            )}
            
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                msg.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : msg.isError
                  ? "bg-destructive/10 text-destructive border border-destructive/20"
                  : "bg-muted text-foreground"
              }`}
            >
              <div className="whitespace-pre-wrap text-sm leading-relaxed">
                {msg.content}
              </div>
            </div>

            {msg.role === "user" && (
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                <User className="w-5 h-5" />
              </div>
            )}
          </div>
        ))}
        {isPending && (
          <div className="flex gap-4 justify-start">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
              <RefreshCw className="w-4 h-4 animate-spin" />
            </div>
            <div className="bg-muted text-muted-foreground rounded-2xl px-4 py-3 text-sm flex items-center gap-1">
              Thinking<span className="animate-pulse">...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-border bg-background/50">
        <form onSubmit={handleSubmit} className="flex gap-2 relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your fleet's profit, most efficient vehicles..."
            className="flex-1 rounded-full border border-input bg-background px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring pr-12"
            disabled={isPending}
          />
          <button
            type="submit"
            disabled={!input.trim() || isPending}
            className="absolute right-1 top-1 bottom-1 w-10 flex items-center justify-center rounded-full bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
