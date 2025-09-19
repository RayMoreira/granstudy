"use client";
/**
 * /login (versão DEMO com auto-login)
 * -----------------------------------------------------------
 * Objetivo:
 *  - Ao visitar /login, entrar automaticamente com a conta DEMO
 *    e redirecionar para o Planner em /planner.
 *
 * Por que assim?
 *  - "clicou em Login → vê o Planner".
 *  - Depois, quando quiser formulário real, é só trocar o auto-login
 *    pelo snippet alternativo no final deste arquivo.
 */

import { useEffect, useState } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  /* Estado da sessão atual:
   * - "loading": NextAuth está checando cookie/token
   * - "authenticated": já existe sessão
   * - "unauthenticated": sem sessão
   */
  const { status } = useSession();

  // Navegação programática (para redirecionar)
  const router = useRouter();

  // Estados locais para feedback de UI
  const [trying, setTrying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Efeito: assim que a página carrega e não estamos mais em "loading",
   * - se já está autenticado: vai direto para /planner
   * - se não: tenta login DEMO com NextAuth (provider "credentials")
   */
  useEffect(() => {
    if (status === "loading") return; // espera NextAuth checar sessão

    if (status === "authenticated") {
      // Já logado? Vai para o planner e não renderiza nada aqui
      router.replace("/planner");
      return;
    }

    // Não logado: tenta auto-login DEMO
    const doAutoLogin = async () => {
      try {
        setTrying(true);
        setError(null);

        // Chama o NextAuth (provider "credentials"), com a conta DEMO definida em src/lib/auth.ts
        const res = await signIn("credentials", {
          email: "demo@gran.com",
          password: "gran1234",
          redirect: false,       // controlamos o redirecionamento manualmente
          callbackUrl: "/planner" // rota oficial do planner; troque para "/study" se preferir
        });

        if (res?.error) {
          // Caso o authorize do NextAuth retorne null/erro
          setError("Não foi possível fazer login automático.");
          setTrying(false);
          return;
        }

        // Sucesso: envia ao Planner
        router.replace(res?.url ?? "/planner");
      } catch {
        setError("Erro inesperado ao autenticar.");
        setTrying(false);
      }
    };

    doAutoLogin();
  }, [status, router]);

  // Se já autenticado, não precisamos mostrar a UI desta página
  if (status === "authenticated") return null;

  // UI mínima para feedback durante o auto-login
  return (
    <main className="min-h-[60vh] grid place-items-center p-6">
      <div className="max-w-md w-full text-center space-y-4">
        <h1 className="text-2xl font-bold">Conectando…</h1>
        <p className="opacity-80">
          Estamos autenticando sua sessão demo e levando você ao Planner.
        </p>

        {trying && <p className="text-sm opacity-70">Aguarde um instante…</p>}

        {error && (
          <div className="space-y-3">
            <p className="text-sm text-red-600">{error}</p>
            <button
              className="border rounded px-4 py-2"
              onClick={() => {
                // "Tentar novamente": recarrega a rota (dispara o efeito de novo)
                setError(null);
                setTrying(false);
                router.refresh();
              }}
            >
              Tentar novamente
            </button>
          </div>
        )}

        <p className="text-xs opacity-60">
          Dica: quando quiser um formulário real, substitua este auto-login
          pelo snippet alternativo abaixo.
        </p>
      </div>
    </main>
  );
}

/* =====================================================================
 * SNIPPET ALTERNATIVO (FORMULÁRIO MANUAL)
 * ---------------------------------------------------------------------
 * Caso queira trocar o auto-login por um formulário, substitua o
 * componente acima por este aqui. Ele exibe inputs e chama signIn().
 *
 * Observação:
 * - Lembre de manter APENAS UM "export default function LoginPage()".
 * - Ajuste o callbackUrl para "/planner" ou "/study" conforme sua rota.
 * =====================================================================

"use client";
import { useState } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginPage() {
  const { status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  // valores padrão: credenciais DEMO (facilitam teste rápido)
  const [email, setEmail] = useState("demo@gran.com");
  const [password, setPassword] = useState("gran1234");
  const [error, setError] = useState<string | null>(null);

  // após login, para onde ir (padrão: /planner)
  const callbackUrl = searchParams.get("callbackUrl") ?? "/planner";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl,
    });

    if (res?.error) return setError("Credenciais inválidas.");
    router.push(res?.url ?? "/planner");
  }

  if (status === "loading") return <main className="p-6">Carregando…</main>;
  if (status === "authenticated") { router.replace("/planner"); return null; }

  return (
    <main className="p-6 max-w-sm mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Entrar</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <div>
          <label className="block text-sm mb-1">Email</label>
          <input
            className="border rounded w-full p-2"
            type="email"
            value={email}
            onChange={(e)=>setEmail(e.target.value)}
            required
            autoFocus
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Senha</label>
          <input
            className="border rounded w-full p-2"
            type="password"
            value={password}
            onChange={(e)=>setPassword(e.target.value)}
            required
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button type="submit" className="border rounded px-4 py-2 w-full">
          Entrar
        </button>
        <p className="text-xs opacity-70">Dica: <b>demo@gran.com</b> / <b>gran1234</b></p>
      </form>
    </main>
  );
}
*/
