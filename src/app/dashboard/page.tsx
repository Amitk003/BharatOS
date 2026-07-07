"use client";

import { useEffect, useState } from "react";
import { JourneyBoard } from "@/components/journey-board";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Loader2,
  IndianRupee,
  CheckCircle2,
  Clock,
  Target,
  User,
  Edit2,
  Save,
  X,
  MapPin,
  Briefcase,
  GraduationCap,
  Sparkles,
} from "lucide-react";

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

  // Profile States
  const [profile, setProfile] = useState<any>(null);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [age, setAge] = useState<number>(0);
  const [occupation, setOccupation] = useState("");
  const [monthlyIncome, setMonthlyIncome] = useState<number>(0);
  const [locationState, setLocationState] = useState("");
  const [education, setEducation] = useState("");
  const [maritalStatus, setMaritalStatus] = useState("Single");
  const [hasLand, setHasLand] = useState(false);
  const [disabilityStatus, setDisabilityStatus] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  async function loadDashboardData() {
    const sessionId = sessionStorage.getItem("bharat-session");
    if (!sessionId) {
      setLoadingOpp(false);
      return;
    }

    setLoadingOpp(true);

    await Promise.allSettled([
      // Fetch Opportunities
      (async () => {
        const res = await fetch("/api/opportunities", {
          headers: { "x-session-id": sessionId },
        });
        const data = await res.json();
        if (data.opportunities) {
          setOpportunities(data.opportunities.schemes || []);
          setTotalBenefit(data.opportunities.totalEstimatedBenefit || 0);
        } else {
          setOpportunities([]);
          setTotalBenefit(0);
        }
      })(),
      // Fetch Journeys
      (async () => {
        const res = await fetch("/api/journey", {
          headers: { "x-session-id": sessionId },
        });
        const data = await res.json();
        const j = data.journeys || [];
        setActiveJourneys(j.filter((j: { status: string }) => j.status !== "COMPLETED").length);
      })(),
      // Fetch Documents
      (async () => {
        const res = await fetch("/api/documents", {
          headers: { "x-session-id": sessionId },
        });
        const data = await res.json();
        setDocCount((data.documents || []).length);
      })(),
      // Fetch Cases
      (async () => {
        const res = await fetch("/api/cases", {
          headers: { "x-session-id": sessionId },
        });
        const data = await res.json();
        setCaseCount((data.cases || []).length);
      })(),
      // Fetch Profile
      (async () => {
        const res = await fetch("/api/profile", {
          headers: { "x-session-id": sessionId },
        });
        const data = await res.json();
        if (data.profile) {
          setProfile(data.profile);
          setName(data.user?.name || "");
          setAge(data.profile.age || 0);
          setOccupation(data.profile.occupation || "");
          setMonthlyIncome(data.profile.monthlyIncome || 0);
          setLocationState(data.profile.locationState || "");
          setEducation(data.profile.education || "");
          setMaritalStatus(data.profile.maritalStatus || "Single");
          setHasLand(data.profile.hasLand || false);
          setDisabilityStatus(data.profile.disabilityStatus || false);
        } else {
          setProfile(null);
        }
      })(),
    ]);

    setLoadingOpp(false);
  }

  async function handleSaveProfile() {
    const sessionId = sessionStorage.getItem("bharat-session");
    if (!sessionId) return;
    setSavingProfile(true);

    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-session-id": sessionId,
        },
        body: JSON.stringify({
          name,
          age,
          occupation,
          monthlyIncome,
          locationState,
          education,
          maritalStatus,
          hasLand,
          disabilityStatus,
        }),
      });

      if (res.ok) {
        setEditing(false);
        await loadDashboardData();
      }
    } catch (error) {
      console.error("Failed to save profile:", error);
    } finally {
      setSavingProfile(false);
    }
  }

  const isProfileComplete = profile && profile.locationState && profile.age > 0;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Citizen Dashboard</h1>
          <p className="text-sm text-gray-400 mt-1">Manage your active plans, eligibility status, and documents</p>
        </div>
        {name && (
          <div className="flex items-center gap-2 bg-gray-900/60 border border-gray-800 rounded-xl px-4 py-2">
            <User className="h-4 w-4 text-blue-500" />
            <span className="text-sm font-semibold text-gray-200">Welcome, {name}</span>
          </div>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3 mb-8">
        {/* Left Column: Journeys */}
        <Card className="lg:col-span-2 shadow-xl shadow-black/20 border-gray-800/80 bg-gray-900/40 backdrop-blur-sm">
          <CardHeader className="border-b border-gray-850/60 pb-4">
            <CardTitle className="flex items-center gap-2 text-xl text-white font-bold">
              <Target className="h-5 w-5 text-blue-500" />
              Active Journeys
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <JourneyBoard />
          </CardContent>
        </Card>

        {/* Right Column: Profile & Opportunities */}
        <div className="space-y-6">
          {/* Profile Card */}
          <Card className="shadow-xl shadow-black/20 border-gray-800/80 bg-gray-900/40 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-gray-850/60">
              <CardTitle className="flex items-center gap-2 text-lg text-white font-bold">
                <User className="h-5 w-5 text-blue-500" />
                Citizen Profile
              </CardTitle>
              {!editing ? (
                <button
                  onClick={() => setEditing(true)}
                  className="flex items-center gap-1 text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors bg-blue-500/10 hover:bg-blue-500/20 px-2.5 py-1.5 rounded-lg border border-blue-500/20"
                >
                  <Edit2 className="h-3 w-3" />
                  Edit
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveProfile}
                    disabled={savingProfile}
                    className="flex items-center gap-1 text-xs font-semibold text-green-400 hover:text-green-300 transition-colors bg-green-500/10 hover:bg-green-500/20 px-2.5 py-1.5 rounded-lg border border-green-500/20"
                  >
                    {savingProfile ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Save className="h-3 w-3" />
                    )}
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setEditing(false);
                      // Reset fields to current profile
                      if (profile) {
                        setName(profile.user?.name || "");
                        setAge(profile.age || 0);
                        setOccupation(profile.occupation || "");
                        setMonthlyIncome(profile.monthlyIncome || 0);
                        setLocationState(profile.locationState || "");
                        setEducation(profile.education || "");
                        setMaritalStatus(profile.maritalStatus || "Single");
                        setHasLand(profile.hasLand || false);
                        setDisabilityStatus(profile.disabilityStatus || false);
                      }
                    }}
                    className="flex items-center gap-1 text-xs font-semibold text-gray-400 hover:text-gray-300 transition-colors bg-gray-500/10 hover:bg-gray-500/20 px-2.5 py-1.5 rounded-lg border border-gray-500/20"
                  >
                    <X className="h-3 w-3" />
                    Cancel
                  </button>
                </div>
              )}
            </CardHeader>
            <CardContent className="pt-4">
              {editing ? (
                <div className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">Full Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Amit Kumar"
                      className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1">Age</label>
                      <input
                        type="number"
                        value={age || ""}
                        onChange={(e) => setAge(Number(e.target.value))}
                        placeholder="e.g. 28"
                        className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1">State</label>
                      <input
                        type="text"
                        value={locationState}
                        onChange={(e) => setLocationState(e.target.value)}
                        placeholder="e.g. Karnataka"
                        className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1">Occupation</label>
                      <input
                        type="text"
                        value={occupation}
                        onChange={(e) => setOccupation(e.target.value)}
                        placeholder="e.g. Farmer"
                        className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1">Monthly Income (₹)</label>
                      <input
                        type="number"
                        value={monthlyIncome || ""}
                        onChange={(e) => setMonthlyIncome(Number(e.target.value))}
                        placeholder="e.g. 25000"
                        className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">Education</label>
                    <input
                      type="text"
                      value={education}
                      onChange={(e) => setEducation(e.target.value)}
                      placeholder="e.g. Graduate"
                      className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">Marital Status</label>
                    <select
                      value={maritalStatus}
                      onChange={(e) => setMaritalStatus(e.target.value)}
                      className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="Single">Single</option>
                      <option value="Married">Married</option>
                      <option value="Widowed">Widowed</option>
                      <option value="Divorced">Divorced</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-2 pt-2 border-t border-gray-800">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={hasLand}
                        onChange={(e) => setHasLand(e.target.checked)}
                        className="rounded border-gray-700 bg-gray-800 text-blue-600 focus:ring-blue-500 focus:ring-offset-gray-900"
                      />
                      <span className="text-sm text-gray-300 font-medium">I own agricultural land</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={disabilityStatus}
                        onChange={(e) => setDisabilityStatus(e.target.checked)}
                        className="rounded border-gray-700 bg-gray-800 text-blue-600 focus:ring-blue-500 focus:ring-offset-gray-900"
                      />
                      <span className="text-sm text-gray-300 font-medium">Person with Disability (PwD)</span>
                    </label>
                  </div>
                </div>
              ) : profile ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 border-b border-gray-800 pb-3">
                    <div>
                      <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold block">Age</span>
                      <span className="text-sm text-gray-200 font-medium">{profile.age || "Not specified"} years</span>
                    </div>
                    <div className="flex items-start gap-1">
                      <MapPin className="h-4 w-4 text-gray-500 mt-0.5 shrink-0" />
                      <div>
                        <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold block">State</span>
                        <span className="text-sm text-gray-200 font-medium">{profile.locationState || "Not specified"}</span>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 border-b border-gray-800 pb-3">
                    <div className="flex items-start gap-1">
                      <Briefcase className="h-4 w-4 text-gray-500 mt-0.5 shrink-0" />
                      <div>
                        <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold block">Occupation</span>
                        <span className="text-sm text-gray-200 font-medium">{profile.occupation || "Not specified"}</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold block">Monthly Income</span>
                      <span className="text-sm text-green-400 font-bold">
                        {profile.monthlyIncome ? `₹${profile.monthlyIncome.toLocaleString("en-IN")}` : "Not specified"}
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 border-b border-gray-800 pb-3">
                    <div className="flex items-start gap-1">
                      <GraduationCap className="h-4 w-4 text-gray-500 mt-0.5 shrink-0" />
                      <div>
                        <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold block">Education</span>
                        <span className="text-sm text-gray-200 font-medium">{profile.education || "Not specified"}</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold block">Marital Status</span>
                      <span className="text-sm text-gray-200 font-medium">{profile.maritalStatus}</span>
                    </div>
                  </div>
                  <div className="flex gap-2.5 flex-wrap">
                    {profile.hasLand && (
                      <Badge variant="info" className="px-2.5 py-1">
                        Landowner
                      </Badge>
                    )}
                    {profile.disabilityStatus && (
                      <Badge variant="danger" className="px-2.5 py-1">
                        PwD Status
                      </Badge>
                    )}
                    {!profile.hasLand && !profile.disabilityStatus && (
                      <span className="text-xs text-gray-500 italic">No additional profile tags active</span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-sm text-gray-500 mb-3">No profile details saved yet.</p>
                  <button
                    onClick={() => setEditing(true)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-500 hover:text-blue-400 transition-colors"
                  >
                    <Plus className="h-3 w-3" />
                    Create Profile
                  </button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Opportunities Card */}
          <Card className="shadow-xl shadow-black/20 border-gray-800/80 bg-gray-900/40 backdrop-blur-sm">
            <CardHeader className="border-b border-gray-850/60 pb-3">
              <CardTitle className="flex items-center gap-2 text-lg text-white font-bold">
                <IndianRupee className="h-5 w-5 text-green-500" />
                Available Benefits
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              {loadingOpp ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                </div>
              ) : opportunities.length > 0 ? (
                <div>
                  <div className="flex items-center gap-1.5 text-3xl font-extrabold text-green-400 mb-4 tracking-tight">
                    <span className="text-2xl text-green-500 font-medium">₹</span>
                    {totalBenefit.toLocaleString("en-IN")}
                    <span className="text-xs text-gray-400 font-normal tracking-normal self-end mb-1.5 ml-1">/ year est.</span>
                  </div>
                  <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
                    {opportunities.map((scheme, i) => (
                      <div key={i} className="border-b border-gray-800/80 pb-3 last:border-0 last:pb-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-semibold text-gray-200 line-clamp-1">
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
                            className="text-[10px] shrink-0"
                          >
                            {scheme.eligibilityStatus.replace("_", " ")}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-400 mt-1 line-clamp-2 leading-relaxed">
                          {scheme.description}
                        </p>
                        <p className="text-xs text-green-400 font-medium mt-1.5 flex items-center gap-1">
                          <Sparkles className="h-3 w-3" />
                          Up to ₹{scheme.estimatedBenefit.toLocaleString("en-IN")}/year
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-950/40 rounded-xl border border-gray-800/50 p-4">
                  <p className="text-sm text-gray-500 mb-1">
                    {!isProfileComplete
                      ? "Complete your profile to see available schemes"
                      : "No matching schemes found"}
                  </p>
                  <p className="text-xs text-gray-650">
                    {!isProfileComplete
                      ? "We need your age, location, and income to run AI eligibility match."
                      : "Try updating your profile details to see new opportunities."}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats Card */}
          <Card className="shadow-xl shadow-black/20 border-gray-800/80 bg-gray-900/40 backdrop-blur-sm">
            <CardHeader className="border-b border-gray-850/60 pb-3">
              <CardTitle className="flex items-center gap-2 text-lg text-white font-bold">
                <CheckCircle2 className="h-5 w-5 text-blue-500" />
                Quick Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-gray-850/40 pb-2">
                  <span className="text-sm text-gray-450">Active Journeys</span>
                  <span className="text-sm font-semibold text-white bg-blue-500/10 px-2 py-0.5 rounded-md border border-blue-550/10">{activeJourneys}</span>
                </div>
                <div className="flex items-center justify-between border-b border-gray-850/40 pb-2">
                  <span className="text-sm text-gray-450">Documents Uploaded</span>
                  <span className="text-sm font-semibold text-white bg-gray-500/10 px-2 py-0.5 rounded-md border border-gray-550/10">{docCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-450">Civic Cases</span>
                  <span className="text-sm font-semibold text-white bg-orange-500/10 px-2 py-0.5 rounded-md border border-orange-550/10">{caseCount}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Plus icon helper, since Plus was not listed in imports but is used in page
function Plus({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
      className={className}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  );
}
