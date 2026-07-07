"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Store,
  FileText,
  IndianRupee,
  AlertTriangle,
  Heart,
  GraduationCap,
  Briefcase,
  UserRound,
  ArrowRight,
  Bot,
  User,
  Send,
  ChevronLeft,
  HelpCircle,
} from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ClarifyingForm {
  questions: string[];
  answers: string[];
  goal: string;
}

const CATEGORIES = [
  {
    title: "Starting something",
    items: [
      { label: "Open a shop", icon: Store, goal: "I want to open a small retail shop" },
      { label: "Start a farm", icon: Briefcase, goal: "I want to start a farming business" },
      { label: "Register a company", icon: FileText, goal: "I want to register my business" },
    ],
  },
  {
    title: "Need a document",
    items: [
      { label: "Passport", icon: FileText, goal: "I need to apply for a passport" },
      { label: "Birth certificate", icon: FileText, goal: "I need a birth certificate" },
      { label: "Income certificate", icon: FileText, goal: "I need an income certificate" },
    ],
  },
  {
    title: "Report an issue",
    items: [
      { label: "Road damage", icon: AlertTriangle, goal: "There is a pothole on my street" },
      { label: "Water problem", icon: AlertTriangle, goal: "There is no water supply in my area" },
      { label: "Electricity issue", icon: AlertTriangle, goal: "There is an electricity problem" },
    ],
  },
  {
    title: "Life events",
    items: [
      { label: "Getting married", icon: Heart, goal: "I am getting married, what do I need to do" },
      { label: "Retiring soon", icon: UserRound, goal: "I am retiring soon, what schemes can I get" },
      { label: "Going to college", icon: GraduationCap, goal: "I need help with education documents" },
    ],
  },
];

export default function Home() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [mode, setMode] = useState<"landing" | "chat">("landing");
  const [clarifyingForm, setClarifyingForm] = useState<ClarifyingForm | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const sid = sessionStorage.getItem("bharat-session") || crypto.randomUUID();
    setSessionId(sid);
    sessionStorage.setItem("bharat-session", sid);
  }, []);

  useEffect(() => {
    if (mode === "chat") {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [mode]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, clarifyingForm]);

  async function handleSend(overrideMsg?: string) {
    const msg = overrideMsg || query;
    if (!msg.trim() || loading || !sessionId) return;

    setQuery("");
    setClarifyingForm(null);
    setMessages((prev) => [...prev, { role: "user", content: msg }]);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg, sessionId }),
      });
      const data = await res.json();

      if (data.clarifyingQuestions && data.clarifyingQuestions.length > 0) {
        setClarifyingForm({
          questions: data.clarifyingQuestions,
          answers: new Array(data.clarifyingQuestions.length).fill(""),
          goal: msg,
        });
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.message || "I could not process that." },
        ]);
        if (data.journeyId) {
          setTimeout(() => router.push("/dashboard"), 1500);
        }
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Something went wrong. Try again." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleAnswerChange(index: number, value: string) {
    if (!clarifyingForm) return;
    const updated = [...clarifyingForm.answers];
    updated[index] = value;
    setClarifyingForm({ ...clarifyingForm, answers: updated });
  }

  function submitAnswers() {
    if (!clarifyingForm || !sessionId) return;

    const filledAnswers = clarifyingForm.answers.filter((a) => a.trim()).length;
    if (filledAnswers === 0) return;

    const profileAnswers: Record<string, string> = {};
    clarifyingForm.questions.forEach((q, i) => {
      const ans = clarifyingForm.answers[i]?.trim();
      if (ans) profileAnswers[q] = ans;
    });

    const combined = `${clarifyingForm.goal}. ${clarifyingForm.questions
      .map((q, i) => {
        const ans = clarifyingForm.answers[i]?.trim();
        return ans ? `${q.replace(/\?$/, "")}: ${ans}` : null;
      })
      .filter(Boolean)
      .join(". ")}`;

    setClarifyingForm(null);
    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        content: clarifyingForm.answers
          .map((a, i) => `${clarifyingForm.questions[i]} ${a}`)
          .join("\n"),
      },
    ]);
    setLoading(true);

    fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: combined,
        sessionId,
        skipClarifying: true,
        profileAnswers,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.message || "I could not process that." },
        ]);
        if (data.journeyId) {
          setTimeout(() => router.push("/dashboard"), 1500);
        }
      })
      .catch(() => {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "Something went wrong. Try again." },
        ]);
      })
      .finally(() => setLoading(false));
  }

  function startChat(goal: string) {
    setMode("chat");
    setQuery(goal);
    setTimeout(() => handleSend(goal), 300);
  }

  if (mode === "chat") {
    return (
      <div className="mx-auto flex min-h-[calc(100vh-3.5rem)] max-w-4xl flex-col px-4 py-6">
        <button
          onClick={() => { setMode("landing"); setMessages([]); setClarifyingForm(null); }}
          className="mb-4 flex items-center gap-1.5 text-sm text-gray-500 hover:text-white transition-colors w-fit"
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </button>

        <div className="flex-1 space-y-4 overflow-y-auto pb-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className="flex items-start gap-3 max-w-[80%]">
                {msg.role === "assistant" && (
                  <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-blue-600/20">
                    <Bot className="h-4 w-4 text-blue-500" />
                  </div>
                )}
                <div
                  className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-blue-600 text-white rounded-br-sm"
                      : "bg-gray-800/80 text-gray-200 rounded-bl-sm border border-gray-700/50"
                  }`}
                >
                  {msg.content}
                </div>
                {msg.role === "user" && (
                  <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gray-800">
                    <User className="h-4 w-4 text-gray-400" />
                  </div>
                )}
              </div>
            </div>
          ))}

          {clarifyingForm && (
            <div className="flex justify-start">
              <div className="flex items-start gap-3 max-w-[85%]">
                <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-blue-600/20">
                  <Bot className="h-4 w-4 text-blue-500" />
                </div>
                <div className="rounded-2xl rounded-bl-sm border border-blue-900/50 bg-gray-900/80 px-5 py-4">
                  <div className="mb-3 flex items-center gap-2">
                    <HelpCircle className="h-4 w-4 text-blue-500" />
                    <span className="text-sm font-medium text-blue-400">
                      A few details to get started
                    </span>
                  </div>
                  <div className="space-y-3">
                    {clarifyingForm.questions.map((q, i) => (
                      <div key={i}>
                        <label className="mb-1 block text-xs text-gray-400">
                          {q}
                        </label>
                        <input
                          type="text"
                          value={clarifyingForm.answers[i]}
                          onChange={(e) => handleAnswerChange(i, e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              const next = document.querySelector<HTMLInputElement>(
                                `[data-qidx="${i + 1}"]`
                              );
                              if (next) next.focus();
                            }
                          }}
                          data-qidx={String(i)}
                          placeholder="Type your answer..."
                          className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                        />
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={submitAnswers}
                    disabled={
                      loading ||
                      !clarifyingForm.answers.some((a) => a.trim())
                    }
                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white" />
                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white [animation-delay:0.15s]" />
                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white [animation-delay:0.3s]" />
                        Processing...
                      </span>
                    ) : (
                      <>
                        Continue
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {loading && !clarifyingForm && (
            <div className="flex justify-start">
              <div className="flex items-start gap-3">
                <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-blue-600/20">
                  <Bot className="h-4 w-4 text-blue-500" />
                </div>
                <div className="rounded-2xl rounded-bl-sm border border-gray-700/50 bg-gray-800/80 px-4 py-3">
                  <div className="flex gap-1.5">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-gray-500" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-gray-500 [animation-delay:0.15s]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-gray-500 [animation-delay:0.3s]" />
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
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Ask anything..."
              className="w-full rounded-2xl border border-gray-700 bg-gray-800/80 px-5 py-3 pr-14 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
            />
            <button
              onClick={() => handleSend()}
              disabled={loading || !query.trim()}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-3.5rem)] max-w-5xl flex-col px-4">
      <div className="flex flex-1 flex-col items-center justify-center gap-10 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
            What do you need to do?
          </h1>
          <p className="mt-3 text-gray-500 text-lg">
            Tell me once, I will handle the rest. No forms, no searching.
          </p>
        </div>

        <div className="relative w-full max-w-2xl">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-600" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && query.trim()) {
                setMode("chat");
                setTimeout(() => handleSend(query), 300);
              }
            }}
            placeholder='Try "start a dairy business" or "need a passport"...'
            className="w-full rounded-2xl border border-gray-700 bg-gray-800/80 px-12 py-4 text-base text-white placeholder:text-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all shadow-lg shadow-black/20"
            autoFocus
          />
          {query.trim() && (
            <button
              onClick={() => { setMode("chat"); setTimeout(() => handleSend(query), 300); }}
              className="absolute right-2 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-all"
            >
              <ArrowRight className="h-5 w-5" />
            </button>
          )}
        </div>

        <div className="grid w-full grid-cols-1 gap-6 md:grid-cols-2">
          {CATEGORIES.map((cat) => (
            <div key={cat.title}>
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-gray-600">
                {cat.title}
              </h3>
              <div className="space-y-2">
                {cat.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.label}
                      onClick={() => startChat(item.goal)}
                      className="group flex w-full items-center gap-3 rounded-xl border border-gray-800 bg-gray-900/50 px-4 py-3 text-left transition-all hover:border-gray-700 hover:bg-gray-800/60 hover:shadow-lg hover:shadow-black/10"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-600/10 group-hover:bg-blue-600/20 transition-colors">
                        <Icon className="h-4 w-4 text-blue-500" />
                      </div>
                      <span className="text-sm text-gray-300 group-hover:text-white transition-colors">
                        {item.label}
                      </span>
                      <ArrowRight className="ml-auto h-4 w-4 shrink-0 text-gray-700 group-hover:text-blue-500 transition-colors" />
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
