"use client";

import { useEffect, useState } from "react";
import { subscribeToAuthChanges } from "@/lib/auth";
import { Loader } from "@/components/Loader";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges(() => {
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/10">
        <Loader text="Oturum denetleniyor..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/10">
      {children}
    </div>
  );
}
