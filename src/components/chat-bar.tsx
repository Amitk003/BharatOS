"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Sparkles } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ChatBarProps {
  onJourneyCreated?: (journeyId: string) => void;
}

const SUGGESTIONS = [
  "Start a business",
  "Apply for passport",
  "Find schemes I qualify for",
  "Report a pothole",
];

export function ChatBar({ onJourneyCreated }: ChatBarProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const sid = crypto.randomUUID();
    setSessionId(sid);
    sessionStorage.setItem("bharat-session", sid);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend(overrideMsg?: string) {
    const userMsg = overrideMsg || input.trim();
    if (!userMsg || loading || !sessionId) return;

    setInput("");
    setShowSuggestions(false);
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg, sessionId }),
      });

      const data = await res.json();
      const reply = data.message || "I could not process that.";

      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);

      if (data.journeyId && onJourneyCreated) {
        onJourneyCreated(data.journeyId);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Something went wrong. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-3.5rem)] max-w-3xl flex-col px-4">
      {messages.length === 0 && !loading ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-8">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600/20">
              <Bot className="h-8 w-8 text-blue-500" />
            </div>
            <h1 className="text-3xl font-bold text-white">
              What do you need?
            </h1>
            <p className="mt-2 text-gray-500">
              Just type what you want to do. No forms, no searching.
            </p>
          </div>

          <div className="flex w-full max-w-xl flex-col gap-2">
            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSend();
                }}
                placeholder='Try "I want to start a dairy business"...'
                className="w-full rounded-2xl border border-gray-700 bg-gray-800/80 px-5 py-4 pr-14 text-base text-white placeholder:text-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                autoFocus
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>

            <div className="flex flex-wrap gap-2 justify-center mt-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => handleSend(s)}
                  className="rounded-full border border-gray-700 bg-gray-800/50 px-4 py-2 text-sm text-gray-400 hover:border-gray-600 hover:text-white hover:bg-gray-800 transition-all"
                >
                  <Sparkles className="mr-1.5 inline h-3.5 w-3.5 text-blue-500" />
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-1 flex-col py-6">
          <div className="flex-1 space-y-4 overflow-y-auto pb-4">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div className="flex items-start gap-3 max-w-[85%]">
                  {msg.role === "assistant" && (
                    <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-blue-600/20">
                      <Bot className="h-4 w-4 text-blue-500" />
                    </div>
                  )}
                  <div
                    className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-blue-600 text-white rounded-br-sm"
                        : "bg-gray-800/80 text-gray-200 rounded-bl-sm"
                    }`}
                  >
                    {msg.content.split("\n").map((line, j) => (
                      <span key={j}>
                        {line}
                        {j < msg.content.split("\n").length - 1 && <br />}
                      </span>
                    ))}
                  </div>
                  {msg.role === "user" && (
                    <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gray-800">
                      <User className="h-4 w-4 text-gray-400" />
                    </div>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="flex items-start gap-3">
                  <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-blue-600/20">
                    <Bot className="h-4 w-4 text-blue-500" />
                  </div>
                  <div className="rounded-2xl rounded-bl-sm bg-gray-800/80 px-4 py-3">
                    <div className="flex gap-1">
                      <span className="h-2 w-2 animate-bounce rounded-full bg-gray-500" />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-gray-500 [animation-delay:0.1s]" />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-gray-500 [animation-delay:0.2s]" />
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div className="border-t border-gray-800 pt-4">
            <div className="relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Type your message..."
                className="w-full rounded-2xl border border-gray-700 bg-gray-800/80 px-5 py-3 pr-14 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              />
              <button
                onClick={() => handleSend()}
                disabled={loading || !input.trim()}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
