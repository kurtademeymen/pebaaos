"use client";

import * as React from "react";
import { useState } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <Button variant="ghost" size="icon" className="rounded-full shadow-md w-9 h-9 opacity-50" disabled><div className="w-5 h-5" /></Button>;
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className="rounded-full shadow-[0_0_10px_rgba(0,0,0,0.1)] border border-border/50 bg-background/50 hover:bg-background/80 w-9 h-9 transition-all"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
    >
      {theme === "dark" ? (
        <Sun className="h-4 w-4 text-amber-500" />
      ) : (
        <Moon className="h-4 w-4 text-indigo-500" />
      )}
      <span className="sr-only">Tema Değiştir</span>
    </Button>
  );
}
