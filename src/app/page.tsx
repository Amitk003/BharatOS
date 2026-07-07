"use client";

import { useRouter } from "next/navigation";
import { ChatBar } from "@/components/chat-bar";

export default function Home() {
  const router = useRouter();

  return (
    <ChatBar
      onJourneyCreated={(journeyId) => {
        router.push("/dashboard");
      }}
    />
  );
}
