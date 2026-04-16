import { Badge } from "@/components/ui/badge";

interface TagProps {
  text: string;
  variant?: "default" | "secondary" | "outline" | "destructive" | "primary";
  className?: string;
  onRemove?: () => void;
}

export function Tag({ text, variant = "secondary", className, onRemove }: TagProps) {
  let styles = className || "";
  let badgeVariant: "default" | "secondary" | "outline" | "destructive" = "secondary";

  if (variant === "primary") {
    styles += " bg-primary/10 text-primary hover:bg-primary/20 border-transparent font-medium";
    badgeVariant = "outline"; // Using outline as base shape
  } else if (variant === "secondary") {
    styles += " bg-secondary text-secondary-foreground hover:bg-secondary/80 font-medium";
    badgeVariant = "secondary";
  } else {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    badgeVariant = variant as any;
  }

  return (
    <Badge variant={badgeVariant} className={styles.trim()}>
      {text}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="ml-1 hover:text-destructive focus:outline-none"
        >
          &times;
        </button>
      )}
    </Badge>
  );
}
