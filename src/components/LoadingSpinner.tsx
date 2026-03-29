"use client";

export default function LoadingSpinner({ text }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="relative">
        <div className="w-12 h-12 border-4 border-purple-200 rounded-full animate-spin border-t-purple-500" />
      </div>
      {text && (
        <p className="mt-3 text-gray-500 font-medium text-sm">{text}</p>
      )}
    </div>
  );
}
