import Link from "next/link";

export function Footer() {
  return (
    <footer className="w-full border-t bg-background mt-auto py-6 md:py-0">
      <div className="container flex flex-col md:flex-row items-center justify-between gap-4 h-16 px-4 md:px-8 mx-auto text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} pebaaos Platformu. Tüm hakları saklıdır.</p>
        <div className="flex items-center gap-4">
          <Link href="/admin" className="hover:underline underline-offset-4 font-medium">
            Yönetici Paneli
          </Link>
        </div>
      </div>
    </footer>
  );
}
