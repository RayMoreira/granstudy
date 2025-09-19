"use client";
import { SessionProvider } from "next-auth/react";

/**
 * Providers:
 * - Envolve toda a aplicação com SessionProvider.
 * - Isso libera hooks como useSession(), signIn() e signOut() em qualquer página.
 */
export default function Providers({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
