"use client"; // marca como Client Component (precisamos de estado e eventos do navegador)

import { useState } from "react";
import Link from "next/link";

// Exporta a página de cadastro (rota /register)
export default function RegisterPage() {
  // estados locais dos campos do formulário
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // função chamada ao enviar o formulário
  function onSubmit(e: React.FormEvent) {
    e.preventDefault(); // evita refresh da página
    // versão simples: só mostra no console e alerta
    console.log("Cadastro:", { name, email, password });
    alert("Cadastro (demo): dados enviados ao console");
  }

  return (
    // container principal
    <main className="p-6 max-w-sm mx-auto space-y-4">
      {/* título */}
      <h1 className="text-2xl font-bold">Criar conta</h1>

      {/* formulário */}
      <form onSubmit={onSubmit} className="space-y-3">
        {/* Campo nome */}
        <div>
          <label className="block text-sm mb-1">Nome</label>
          <input
            className="border rounded w-full p-2"
            placeholder="Seu nome completo"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        {/* Campo email */}
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

        {/* Campo senha */}
        <div>
          <label className="block text-sm mb-1">Senha</label>
          <input
            className="border rounded w-full p-2"
            type="password"
            placeholder="Crie uma senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {/* Botão enviar */}
        <button type="submit" className="border rounded px-4 py-2 w-full">
          Cadastrar
        </button>
      </form>

      {/* links auxiliares */}
      <p className="text-sm">
        Já tem conta? <Link className="underline" href="/login">Entrar</Link>
      </p>
      <p className="text-sm">
        <Link className="underline" href="/">← Voltar para Home</Link>
      </p>
    </main>
  );
}
