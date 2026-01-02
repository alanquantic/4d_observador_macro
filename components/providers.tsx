
'use client';

import { SessionProvider } from "next-auth/react";
import { useState, useEffect } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="min-h-screen bg-gradient-to-br from-black via-slate-900 to-purple-900/20" />;
  }

  return (
    <SessionProvider>
      {children}
    </SessionProvider>
  );
}
