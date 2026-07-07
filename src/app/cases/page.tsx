"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, AlertTriangle, Plus, Clock, CheckCircle2 } from "lucide-react";

interface CivicCase {
  id: string;
  title: string;
  description: string | null;
  status: string;
  category: string | null;
  timeline: string | null;
  createdAt: string;
}

export default function CasesPage() {
  const [cases, setCases] = useState<CivicCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("ROAD");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadCases();
  }, []);

  async function loadCases() {
    try {
      const sessionId = sessionStorage.getItem("bharat-session");
      if (!sessionId) return;
      const res = await fetch("/api/cases", {
        headers: { "x-session-id": sessionId },
      });
      const data = await res.json();
      setCases(data.cases || []);
    } catch {
      console.error("Failed to load cases");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title) return;
    setSubmitting(true);

    try {
      const sessionId = sessionStorage.getItem("bharat-session");
      if (!sessionId) return;

      const res = await fetch("/api/cases", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-session-id": sessionId,
        },
        body: JSON.stringify({ title, description, category }),
      });

      if (res.ok) {
        setTitle("");
        setDescription("");
        setCategory("ROAD");
        setShowForm(false);
        await loadCases();
      }
    } catch {
      console.error("Failed to submit case");
    } finally {
      setSubmitting(false);
    }
  }

  const statusBadge = (status: string) => {
    switch (status) {
      case "SUBMITTED":
        return <Badge variant="info">Submitted</Badge>;
      case "ASSIGNED":
        return <Badge variant="warning">Assigned</Badge>;
      case "RESOLVED":
        return <Badge variant="success">Resolved</Badge>;
      case "APPEALED":
        return <Badge variant="danger">Appealed</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  const categoryIcon = (cat: string | null) => {
    switch (cat) {
      case "ROAD":
        return "Road";
      case "WATER":
        return "Water";
      case "ELECTRICITY":
        return "Electricity";
      case "SANITATION":
        return "Sanitation";
      default:
        return "Other";
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Civic Cases</h1>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 mr-1" />
          Report Issue
        </Button>
      </div>

      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Report a Civic Issue</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="ROAD">Road</option>
                  <option value="WATER">Water</option>
                  <option value="ELECTRICITY">Electricity</option>
                  <option value="SANITATION">Sanitation</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Issue Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Pothole on Main Road"
                  className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Description (optional)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide details about the issue..."
                  className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px]"
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={!title || submitting}>
                  {submitting ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-1" />
                  ) : null}
                  Submit Case
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>All Cases</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
            </div>
          ) : cases.length === 0 ? (
            <div className="text-center py-8">
              <AlertTriangle className="h-12 w-12 text-gray-600 mx-auto mb-4" />
              <p className="text-sm text-gray-500">
                No cases reported yet
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {cases.map((c) => (
                <div
                  key={c.id}
                  className="rounded-lg border border-gray-800 p-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      {c.status === "RESOLVED" ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                      ) : (
                        <Clock className="h-5 w-5 text-blue-500 mt-0.5" />
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-200">
                            {c.title}
                          </span>
                          {statusBadge(c.status)}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {categoryIcon(c.category)} -{" "}
                          {new Date(c.createdAt).toLocaleDateString()}
                        </p>
                        {c.description && (
                          <p className="text-sm text-gray-400 mt-2">
                            {c.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
