import { Loader2 } from "lucide-react";

interface LoaderProps {
  text?: string;
  className?: string;
}

export function Loader({ text = "Yükleniyor...", className = "" }: LoaderProps) {
  return (
    <div className={`flex flex-col items-center justify-center p-8 space-y-4 ${className}`}>
      <Loader2 className="w-8 h-8 text-primary animate-spin" />
      <p className="text-sm text-muted-foreground animate-pulse">{text}</p>
    </div>
  );
}
