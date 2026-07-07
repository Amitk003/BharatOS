"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChatBar } from "@/components/chat-bar";
import { Card, CardContent } from "@/components/ui/card";
import {
  Target,
  FileText,
  IndianRupee,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";

const quickActions = [
  {
    icon: Target,
    title: "Start a Business",
    desc: "Get step-by-step plan for MSME, loans, licenses",
  },
  {
    icon: FileText,
    title: "Apply for Passport",
    desc: "Document checklist, application process, tracking",
  },
  {
    icon: IndianRupee,
    title: "Find Government Schemes",
    desc: "Discover schemes you are eligible for",
  },
  {
    icon: AlertTriangle,
    title: "Report an Issue",
    desc: "File complaint about roads, water, electricity",
  },
];

export default function Home() {
  const router = useRouter();

  return (
    <div className="mx-auto flex min-h-[calc(100vh-3.5rem)] max-w-6xl flex-col px-4">
      <div className="py-12 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
          Your AI Civic Companion
        </h1>
        <p className="mt-3 text-lg text-gray-400 max-w-2xl mx-auto">
          Tell me what you want to achieve and I will create a step-by-step
          plan. No more searching through confusing government websites.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 mb-8">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.title}
              onClick={() => router.push("/dashboard")}
              className="group rounded-xl border border-gray-800 bg-gray-900/50 p-4 text-left transition-all hover:border-gray-700 hover:bg-gray-800/50"
            >
              <Icon className="h-5 w-5 text-blue-500 mb-2" />
              <h3 className="text-sm font-medium text-gray-200 group-hover:text-white transition-colors">
                {action.title}
              </h3>
              <p className="mt-1 text-xs text-gray-500">{action.desc}</p>
            </button>
          );
        })}
      </div>

      <Card className="flex-1 flex flex-col min-h-[400px]">
        <CardContent className="flex-1 flex flex-col p-0">
          <ChatBar
            onJourneyCreated={(journeyId) => {
              router.push("/dashboard");
            }}
          />
        </CardContent>
      </Card>

      <div className="flex items-center justify-center gap-6 py-6 text-xs text-gray-600">
        <span>No login required</span>
        <span className="w-1 h-1 rounded-full bg-gray-700" />
        <span>Privacy first</span>
        <span className="w-1 h-1 rounded-full bg-gray-700" />
        <span>Available in Indian languages</span>
      </div>
    </div>
  );
}
