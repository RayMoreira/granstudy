"use client"; // torna este componente um Client Component (precisa para usar estado e eventos)

import { useState } from "react";
import Link from "next/link";

// Exporta a página de login (rota /login)
export default function LoginPage() {
  // estado local dos campos (controla o valor digitado nos inputs)
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // função chamada ao enviar o formulário
  function onSubmit(e: React.FormEvent) {
    e.preventDefault(); // evita recarregar a página
    // versão simples: só mostra no console e alerta
    console.log("Login:", { email, password });
    alert("Login (demo): dados enviados ao console");
  }

  return (
    // container principal da página
    <main className="p-6 max-w-sm mx-auto space-y-4">
      {/* título */}
      <h1 className="text-2xl font-bold">Entrar</h1>

      {/* formulário de login */}
      <form onSubmit={onSubmit} className="space-y-3">
        {/* Campo de e-mail */}
        <div>
          <label className="block text-sm mb-1">Email</label>
          <input
            className="border rounded w-full p-2"
            type="email"
            placeholder="voce@exemplo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        {/* Campo de senha */}
        <div>
          <label className="block text-sm mb-1">Senha</label>
          <input
            className="border rounded w-full p-2"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {/* Botão de envio do formulário */}
        <button type="submit" className="border rounded px-4 py-2 w-full">
          Entrar
        </button>
      </form>

      {/* link auxiliar para registro */}
      <p className="text-sm">
        Não tem conta? <Link className="underline" href="/register">Cadastrar</Link>
      </p>
    </main>
  );
}
