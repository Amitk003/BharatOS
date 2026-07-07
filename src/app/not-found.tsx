import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] flex-col items-center justify-center gap-4 px-4">
      <h1 className="text-6xl font-bold text-white">404</h1>
      <p className="text-sm text-gray-500">Page not found</p>
      <Link href="/">
        <Button>Go home</Button>
      </Link>
    </div>
  );
}
