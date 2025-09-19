"use client";

/**
 * Home (landing explicável)
 * -----------------------------------------------------------
 * - Seções: Hero, Features, CTA final.
 * - "Entrar" → /login (auto-login demo → /study)
 * - "Criar conta" → /register (auto-login demo → /study)
 * - Se já autenticada → “Ir para o Planner” + “Sair”.
 */

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";

export default function Home() {
  const { status, data } = useSession();

  return (
    <main className="min-h-screen bg-gray-50">
      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-20">
        <div className="mx-auto max-w-5xl px-6 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">Gran Study Planner</h1>
          <p className="text-lg md:text-xl opacity-90 mb-8">
            Organize seus estudos, acompanhe seu progresso e alcance suas metas
            com uma interface simples e acessível.
          </p>

          {status === "authenticated" ? (
            <div className="flex justify-center gap-4">
              <Link
                href="/planner"
                className="bg-white text-indigo-600 font-semibold px-6 py-3 rounded-lg shadow hover:bg-gray-100 transition"
              >
                Ir para o Planner
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="bg-transparent border border-white px-6 py-3 rounded-lg hover:bg-white hover:text-indigo-600 transition"
              >
                Sair
              </button>
            </div>
          ) : status === "loading" ? (
            <span className="opacity-90">Verificando sessão…</span>
          ) : (
            <div className="flex justify-center gap-4">
              <Link
                href="/login"
                className="bg-white text-indigo-600 font-semibold px-6 py-3 rounded-lg shadow hover:bg-gray-100 transition"
              >
                Entrar
              </Link>
              <Link
                href="/register"
                className="bg-transparent border border-white px-6 py-3 rounded-lg hover:bg-white hover:text-indigo-600 transition"
              >
                Criar Conta
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* FEATURES */}
      <section className="mx-auto max-w-6xl px-6 py-16 grid md:grid-cols-3 gap-12 text-center">
        <div className="p-6 bg-white rounded-xl shadow hover:shadow-lg transition">
          <h3 className="text-xl font-semibold mb-3">📅 Planejamento</h3>
          <p className="text-gray-600">Monte cronogramas práticos e flexíveis.</p>
        </div>
        <div className="p-6 bg-white rounded-xl shadow hover:shadow-lg transition">
          <h3 className="text-xl font-semibold mb-3">📊 Acompanhamento</h3>
          <p className="text-gray-600">Monitore tarefas, revisões e progresso.</p>
        </div>
        <div className="p-6 bg-white rounded-xl shadow hover:shadow-lg transition">
          <h3 className="text-xl font-semibold mb-3">🌍 Acessível</h3>
          <p className="text-gray-600">Rápido e responsivo em qualquer dispositivo.</p>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="bg-indigo-600 text-white py-12">
        <div className="mx-auto max-w-4xl text-center space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold">
            Comece agora a organizar seus estudos
          </h2>
          <p className="opacity-90">
            Leva menos de 1 minuto para acessar o planner com a conta demo.
          </p>

          {status !== "authenticated" && (
            <div className="flex justify-center">
              <Link
                href="/register"
                className="bg-white text-indigo-600 font-semibold px-8 py-4 rounded-lg shadow hover:bg-gray-100 transition"
              >
                Criar Conta (Demo)
              </Link>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
