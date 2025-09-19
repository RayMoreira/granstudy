import type { Metadata } from "next";
import "./globals.css"; // importa Tailwind e estilos globais
import Providers from "@/components/Providers";

// Metadados básicos do site (aparecem no navegador e ajudam no SEO)
export const metadata: Metadata = {
  title: "Gran Study Planner",
  description: "Planner de estudos acessível feito com Next.js + Tailwind",
};

/**
 * Layout raiz da aplicação.
 * - Envolvemos o {children} com <Providers> para habilitar sessão (NextAuth)
 *   em todas as páginas (useSession, signIn, signOut, etc.).
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">

      {/* O providers precisa ficar dentro do <body> */}
      <body>
        <Providers>{children}</Providers>
        </body>
    </html>
  );
}
