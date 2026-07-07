"use client";

import { useEffect, useState } from "react";
import { JourneyBoard } from "@/components/journey-board";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Loader2, IndianRupee, CheckCircle2, Clock, Target } from "lucide-react";

interface Opportunity {
  name: string;
  description: string;
  estimatedBenefit: number;
  eligibilityStatus: string;
}

export default function DashboardPage() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [totalBenefit, setTotalBenefit] = useState(0);
  const [loadingOpp, setLoadingOpp] = useState(true);
  const [activeJourneys, setActiveJourneys] = useState(0);
  const [docCount, setDocCount] = useState(0);
  const [caseCount, setCaseCount] = useState(0);

  useEffect(() => {
    loadDashboardData();
  }, []);

  async function loadDashboardData() {
    const sessionId = sessionStorage.getItem("bharat-session");
    if (!sessionId) {
      setLoadingOpp(false);
      return;
    }

    await Promise.allSettled([
      (async () => {
        const res = await fetch("/api/opportunities", {
          headers: { "x-session-id": sessionId },
        });
        const data = await res.json();
        if (data.opportunities) {
          setOpportunities(data.opportunities.schemes || []);
          setTotalBenefit(data.opportunities.totalEstimatedBenefit || 0);
        }
      })(),
      (async () => {
        const res = await fetch("/api/journey", {
          headers: { "x-session-id": sessionId },
        });
        const data = await res.json();
        const j = data.journeys || [];
        setActiveJourneys(j.filter((j: { status: string }) => j.status !== "COMPLETED").length);
      })(),
      (async () => {
        const res = await fetch("/api/documents", {
          headers: { "x-session-id": sessionId },
        });
        const data = await res.json();
        setDocCount((data.documents || []).length);
      })(),
      (async () => {
        const res = await fetch("/api/cases", {
          headers: { "x-session-id": sessionId },
        });
        const data = await res.json();
        setCaseCount((data.cases || []).length);
      })(),
    ]);

    setLoadingOpp(false);
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-bold text-white mb-6">Dashboard</h1>

      <div className="grid gap-6 lg:grid-cols-3 mb-8">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-500" />
              Your Journeys
            </CardTitle>
          </CardHeader>
          <CardContent>
            <JourneyBoard />
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IndianRupee className="h-5 w-5 text-green-500" />
                Available Benefits
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingOpp ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                </div>
              ) : opportunities.length > 0 ? (
                <div>
                  <div className="text-3xl font-bold text-green-400 mb-4">
                    Rs {totalBenefit.toLocaleString("en-IN")}
                  </div>
                  <div className="space-y-3">
                    {opportunities.map((scheme, i) => (
                      <div key={i} className="border-b border-gray-800 pb-3 last:border-0">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-200">
                            {scheme.name}
                          </span>
                          <Badge
                            variant={
                              scheme.eligibilityStatus === "ELIGIBLE"
                                ? "success"
                                : scheme.eligibilityStatus === "LIKELY"
                                  ? "warning"
                                  : "default"
                            }
                            className="text-[10px]"
                          >
                            {scheme.eligibilityStatus.replace("_", " ")}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {scheme.description}
                        </p>
                        <p className="text-xs text-green-500 mt-1">
                          Up to Rs {scheme.estimatedBenefit.toLocaleString("en-IN")}/year
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-sm text-gray-500">
                    Complete your profile to see available schemes
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-blue-500" />
                Quick Stats
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Active Journeys</span>
                  <span className="text-sm font-medium text-white">{activeJourneys}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Documents</span>
                  <span className="text-sm font-medium text-white">{docCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Cases</span>
                  <span className="text-sm font-medium text-white">{caseCount}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
