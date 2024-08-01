import LoadingPrompt from "@/components/pages/loading-prompt";
import { cn } from "@/lib/utils";
import { FaThreads } from "react-icons/fa6";

export default function SearchLoadingPage() {
  return (
    <div
      className={cn(
        "z-50 w-full h-full fixed inset-0 transition-all duration-700 flex justify-center bg-background items-center opacity-1"
      )}
    >
      {/* <LoaderCircle className="h-8 w-8 text-center animate-spin" /> */}
      <FaThreads className="h-16 w-16" />
    </div>
  );
}
