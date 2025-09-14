import Link from "next/link";

export default function HomePage() {
  return (
    <main className="p-6 space-y-4">
      <h1 className="text-3xl font-bold">📚 Gran Study Planner</h1>
      <p className="text-lg">Bem-vindo ao seu organizador de estudos!</p>

      <p className="opacity-80">
        Aqui você pode planejar suas tarefas, acompanhar seu progresso e manter
        seus estudos em dia de forma simples e organizada.
      </p>

      <div className="flex gap-4">
        <Link className="underline" href="/login">Entrar</Link>
        <Link className="underline" href="/register">Cadastrar</Link>
        <Link className="underline" href="/planner">Planner</Link>
      </div>
    </main>
  );
}
