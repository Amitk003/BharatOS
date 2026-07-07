export default function Loading() {
  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center">
      <div className="flex gap-1.5">
        <span className="h-2 w-2 animate-bounce rounded-full bg-gray-500" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-gray-500 [animation-delay:0.15s]" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-gray-500 [animation-delay:0.3s]" />
      </div>
    </div>
  );
}
