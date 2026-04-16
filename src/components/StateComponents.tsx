import { AlertCircle, FileX2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function EmptyState({ title = "Sonuç Bulunamadı", description = "Arama kriterlerinize uygun kayıt bulunmuyor." }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center border rounded-xl border-dashed bg-muted/30">
      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
        <FileX2 className="w-6 h-6 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
      <p className="text-sm text-muted-foreground mt-2 max-w-sm">{description}</p>
    </div>
  );
}

export function ErrorState({ title = "Bir Hata Oluştu", error, onRetry }: { title?: string, error?: string, onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center border border-destructive/20 rounded-xl bg-destructive/5">
      <AlertCircle className="w-10 h-10 text-destructive mb-4" />
      <h3 className="text-lg font-semibold text-destructive">{title}</h3>
      {error && <p className="text-sm text-destructive/80 mt-2 max-w-sm">{error}</p>}
      {onRetry && (
        <Button variant="outline" className="mt-6" onClick={onRetry}>
          Tekrar Dene
        </Button>
      )}
    </div>
  );
}
