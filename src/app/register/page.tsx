"use client";
/**
 * /register (Cadastro DEMO com redirecionamento)
 * -----------------------------------------------------------
 * Objetivo:
 *  - Manter um formulário simples (nome, email, senha) para UX.
 *  - Ao enviar, como ainda não temos backend de cadastro,
 *    fazemos LOGIN DEMO via NextAuth (credentials) e redirecionamos
 *    diretamente para o planner (rota oficial: /planner).
 *
 * Trocar rota do planner:
 *  - Se quiser usar /study como rota oficial, troque "/planner" por "/study"
 *    nas linhas indicadas abaixo.
 */

import { useState } from "react";
import Link from "next/link";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  /* -------------------------
   * Estado dos campos do form
   * ------------------------- */
  const [name, setName] = useState("");       // Nome da usuária (apenas UI por enquanto)
  const [email, setEmail] = useState("");     // Email digitado (não usado p/ login demo)
  const [password, setPassword] = useState(""); // Senha digitada (não usada p/ login demo)

  /* -------------------------
   * Infra de navegação/aut
   * ------------------------- */
  const { status } = useSession(); // "authenticated" | "unauthenticated" | "loading"
  const router = useRouter();

  /* -------------------------
   * Feedback de UI
   * ------------------------- */
  const [submitting, setSubmitting] = useState(false); // mostra que estamos processando
  const [error, setError] = useState<string | null>(null); // mensagem de erro (se houver)

  /* ------------------------------------------------------------
   * onSubmit: simula "cadastro" e, em seguida, faz LOGIN DEMO.
   * ------------------------------------------------------------
   * Explicação:
   *  - Como ainda não existe API real de cadastro, apenas guardamos
   *    os valores em memória (console) e seguimos para login demo.
   *  - O login demo usa as credenciais fixas definidas em src/lib/auth.ts:
   *      email:    demo@gran.com
   *      password: gran1234
   *  - Após logar, redirecionamos para o planner (/planner).
   */
  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      // Simulação de "cadastro": aqui você chamaria sua API real
      // e criaria o usuário no banco. Por enquanto, só logamos no console.
      console.log("Cadastro (DEMO):", { name, email, password });

      // LOGIN DEMO (NextAuth credentials) → redireciona ao planner
      const res = await signIn("credentials", {
        email: "demo@gran.com",
        password: "gran1234",
        redirect: false,       // controlamos o redirecionamento manualmente
        callbackUrl: "/planner", // ⬅️ TROQUE PARA "/study" se essa for sua rota oficial
      });

      if (res?.error) {
        setError("Não foi possível concluir o acesso. Tente novamente.");
        setSubmitting(false);
        return;
      }

      // Vai para o planner
      router.replace(res?.url ?? "/planner"); // ⬅️ TROQUE PARA "/study" se preferir
    } catch {
      setError("Erro inesperado. Tente novamente.");
      setSubmitting(false);
    }
  }

  /* --------------------------------
   * Se já estiver autenticada, sai daqui
   * e envia direto ao planner.
   * -------------------------------- */
  if (status === "authenticated") {
    router.replace("/planner"); // ⬅️ TROQUE PARA "/study" se preferir
    return null;
  }

  return (
    <main className="p-6 max-w-sm mx-auto space-y-4">
      {/* Título da página */}
      <h1 className="text-2xl font-bold">Criar conta</h1>

      {/* Formulário de cadastro (apenas UI por enquanto) */}
      <form onSubmit={onSubmit} className="space-y-3">
        {/* Campo Nome */}
        <div>
          <label className="block text-sm mb-1">Nome</label>
          <input
            className="border rounded w-full p-2"
            placeholder="Seu nome completo"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            aria-label="Nome completo"
          />
        </div>

        {/* Campo Email */}
        <div>
          <label className="block text-sm mb-1">Email</label>
          <input
            className="border rounded w-full p-2"
            type="email"
            placeholder="voce@exemplo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            aria-label="Email"
          />
        </div>

        {/* Campo Senha */}
        <div>
          <label className="block text-sm mb-1">Senha</label>
          <input
            className="border rounded w-full p-2"
            type="password"
            placeholder="Crie uma senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            aria-label="Senha"
          />
        </div>

        {/* Erros de submissão, se houver */}
        {error && <p className="text-sm text-red-600">{error}</p>}

        {/* Botão enviar: desabilita enquanto processa */}
        <button
          type="submit"
          disabled={submitting}
          className="border rounded px-4 py-2 w-full disabled:opacity-60"
        >
          {submitting ? "Criando acesso…" : "Cadastrar"}
        </button>
      </form>

      {/* Links auxiliares */}
      <p className="text-sm">
        Já tem conta?{" "}
        <Link className="underline" href="/login">
          Entrar
        </Link>
      </p>
      <p className="text-sm">
        <Link className="underline" href="/">
          ← Voltar para Home
        </Link>
      </p>

      {/* Dica para o desenvolvedor (você) */}
      <p className="text-xs opacity-60">
        Dica: quando tiver sua API de cadastro, troque o console.log por uma
        chamada real; ao terminar, chame <code>signIn()</code> e redirecione
        para o planner.
      </p>
    </main>
  );
}
