"use client";

import { JourneyBoard } from "@/components/journey-board";

export default function JourneysPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-2xl font-bold text-white mb-6">My Journeys</h1>
      <JourneyBoard />
    </div>
  );
}
