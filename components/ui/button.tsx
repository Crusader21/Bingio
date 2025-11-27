import { cn } from "@/lib/utils";

export function Button({ className, children, ...props }: any) {
  return (
    <button
      className={cn(
        "px-4 py-2 rounded-lg bg-gradient-to-br from-[#FF5FA2] to-[#FF2C71] text-white font-medium shadow-md hover:opacity-90 transition-all",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
