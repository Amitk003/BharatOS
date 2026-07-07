"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Circle, Loader2, ExternalLink } from "lucide-react";

interface Task {
  id: string;
  title: string;
  description: string;
  status: string;
  order: number;
  documentType: string | null;
  linkUrl?: string | null;
}

interface Journey {
  id: string;
  title: string;
  description: string | null;
  status: string;
  progress: number;
  tasks: Task[];
}

export function JourneyBoard() {
  const [journeys, setJourneys] = useState<Journey[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    loadJourneys();
  }, []);

  async function loadJourneys() {
    try {
      const res = await fetch("/api/journey");
      const data = await res.json();
      setJourneys(data.journeys || []);
    } catch {
      console.error("Failed to load journeys");
    } finally {
      setLoading(false);
    }
  }

  async function toggleTask(taskId: string, currentStatus: string) {
    setUpdating(taskId);
    const newStatus =
      currentStatus === "COMPLETED" ? "PENDING" : "COMPLETED";
    try {
      await fetch("/api/journey", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId, status: newStatus }),
      });
      await loadJourneys();
    } catch {
      console.error("Failed to update task");
    } finally {
      setUpdating(null);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (journeys.length === 0) {
    return (
      <div className="text-center py-20">
        <Route className="h-12 w-12 text-gray-600 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-400 mb-2">
          No journeys yet
        </h3>
        <p className="text-sm text-gray-500">
          Go to the home page and tell me what you want to achieve!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {journeys.map((journey) => (
        <Card key={journey.id}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <CardTitle>{journey.title}</CardTitle>
                {journey.description && (
                  <p className="text-sm text-gray-400">
                    {journey.description}
                  </p>
                )}
              </div>
              <Badge
                variant={
                  journey.status === "COMPLETED"
                    ? "success"
                    : journey.status === "IN_PROGRESS"
                      ? "info"
                      : "default"
                }
              >
                {journey.status.replace("_", " ")}
              </Badge>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <Progress value={journey.progress} className="flex-1" />
              <span className="text-xs text-gray-400 min-w-[3rem] text-right">
                {journey.progress}%
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {journey.tasks
                .sort((a, b) => a.order - b.order)
                .map((task) => (
                  <div
                    key={task.id}
                    className="flex items-start gap-3 rounded-lg border border-gray-800 p-3 hover:border-gray-700 transition-colors"
                  >
                    <button
                      onClick={() => toggleTask(task.id, task.status)}
                      disabled={updating === task.id}
                      className="mt-0.5"
                    >
                      {updating === task.id ? (
                        <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                      ) : task.status === "COMPLETED" ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      ) : (
                        <Circle className="h-5 w-5 text-gray-600" />
                      )}
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-sm font-medium ${
                            task.status === "COMPLETED"
                              ? "text-gray-500 line-through"
                              : "text-gray-200"
                          }`}
                        >
                          {task.title}
                        </span>
                        {task.documentType && (
                          <Badge variant="info" className="text-[10px]">
                            Needs {task.documentType}
                          </Badge>
                        )}
                      </div>
                      {task.description && (
                        <p className="text-xs text-gray-500 mt-0.5">
                          {task.description}
                        </p>
                      )}
                    </div>
                    {task.linkUrl && (
                      <a
                        href={task.linkUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-500 hover:text-blue-400 transition-colors"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function Route(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="M12 5l7 7-7 7" />
    </svg>
  );
}
