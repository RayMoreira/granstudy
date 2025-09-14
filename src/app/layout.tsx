import type { Metadata } from "next";
import "./globals.css"; // importa Tailwind e estilos globais

// Metadados básicos do site (aparecem no navegador e ajudam no SEO)
export const metadata: Metadata = {
  title: "Gran Study Planner",
  description: "Planner de estudos acessível feito com Next.js + Tailwind",
};

// Este layout envolve todas as páginas.
// Tudo que cada página retornar vai aparecer dentro do <body>{children}</body>.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
