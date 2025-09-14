
// Este é o componente da página do Planner.
// Como o arquivo está dentro de `src/app/planner/page.tsx`,
// o Next.js automaticamente mapeia para a rota "/planner".

"use client";
// torna ese artivo um client component (p/ usar estado, eventos e localStorage)

import { use, useEffect, useMemo, useState } from "react";

// Tipo e Utilitários

// Tipo (TypeScript) para as tarefas (id, título, data e status) - ajuda no auto-complete e validações
type Task = {
  id: string;       //identificador único
  title: string;    // título/descrição
  dueDate: string;  //data no formato DD-MM-YYYY
  done: boolean;    //concluída?
};

// chave única usada no localStorage para salvar/ler tarefas.
const STORAGE_KEY = "granstudy:tasks";

// Função utilitária para carregar tarefas do localStorage com fallback
function loadTasks(): Task[] {
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: Task[] = JSON.parse(raw);
    //ordena por data ascendente sempre que carrega
    return parsed.sort((a,b) => a.dueDate.localeCompare(b.dueDate));
  } catch {
    return [];
  }
}

//Salva tarefas no localStorage (semore que houver mudança).
function saveTasks(tasks: Task[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

//converte YYYY_MM-DD para dd/mm/aaaa para exibição
function formatBR(dateISO: string) {
  return new Date(dateISO).toLocaleDateString("pt-BR");
}

//Retorna o rótulo de statis da data (hoje, atrasada, futura) para estilizar
function dueDate(dueISO: string): "overdue" | "today" | "future" {
  const today = new Date();
  const d = new Date(dueISO);


  // Zera horas para comparação justa por dia
  today.setHours(0, 0, 0, 0);
  d.setHours(0, 0, 0, 0);

  if (d.getTime() < today.getTime()) return "overdue";
  if (d.getTime() === today.getTime()) return "today";
  return "future";
}

// Componente principal

// Componentes de toda "planner"
export default function PlannerPage() {
    // estados com a lista de tarefas (começa vazio; carregamos no useEffect)
    const [tasks, setTasks] = useState<Task[]>([]);
    //estados dos campos do formulátio de  "nova tarefa''
    const [title,setTitle] = useState(""); //campo novo título
    const [dueDate, setDureDate] = useState("");  // campo nova data
    const [filter, setFilter] = useState<"all" | "open" | "done">("all"); //filtro atual
    const [editingId, setEditingId] = useState<string |null>(null);       //id que está em edição
    const [editingTitle, setEditingTitle] = useState("");                 //texto sendo editado

//Carrega do localStorage uma única vez quando ao montar o componente.
useEffect(() => {
  setTasks(loadTasks());
}, []);

// Sempre que tasks mudar, persiste no localStorage.
useEffect(() => {
  saveTasks(tasks);
}, [tasks]);



// Contadores derivados (useMemo evita recalcular sempre)
const { total, open, done } = useMemo(() => {
  const t = tasks.length;
  const d = tasks.filter((x) => x.done).length;
  return { total: t, open: t - d, done: d };
}, [tasks]);

// Lista filtrada conforme aba selcionada
const filtered = useMemo(() => {
  switch (filter) {
    case "open":
      return tasks.filter((t) => !t.done);
      case "done":
        return tasks.filter((t) => t.done);
        default:
          return tasks; 
  }
}, [tasks, filter]);


/** Ações */

// Adicona uma nova tarefa à lista 
function addTask(e: React.FormEvent) {
  e.preventDefault();
  if (!title.trim() || !dueDate) {
    alert("Preencha título e data");
    return;
  }
  const newTask: Task = {
    id: String(Date.now()), // id simples basedo no timestamp
    title: title.trim(),
    dueDate,
    done: false,
  };

  //adiciona e reordena por data
  setTasks((prev) => [...prev, newTask].sort((a, b) => a.dueDate.localeCompare(b.dueDate)));
  setTitle("");
  setDueDate("");

}

//Alterna o "done" de uma tarefa
function toggleDone(id: string) {
  setTasks((prev) => 
    prev
      .map((t) => (t.id === id ? {...t, done: !t.done} : t))
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    );
}

//Remove uma tarefa
function removeTask(id: string) {
  setTasks((prev) => prev.filter((t) => t.id !== id));
  // se eu estva editando essa mesma tarefa, cancelo edição
  if (editingId === id) {
    setEditingId(null);
    setEditingTitle("");
  }
}

function startEdit(task: Task) {
  setEditingId(task.id);
  setEditingTitle(task.title);
}

function confirmEdit(id: string) {
  const text = editingTitle.trim();
  if (!text) {
    alert("O título não pode ficar vazio.");
    return;
  }
  setTasks((prev) => 
    prev.map((t) => (t.id === id ? {...t, title: text}: t))
);
setEditingId(null);
setEditingTitle("");
}

function cancelEdit() {
  setEditingId(null);
  setEditingTitle("");
}

function clearDone() {
  if (done === 0) return;
  if (confirm(`Remover ${done} tarefa(s) concluída(s)?`)) {
    setTasks((prev) => prev.filter((t) => !t.done));
  }
}


/**Render */

    // A função retorna JSX (HTML dentro do React).
    return (
      // <main> é a área principal da página (semântico e bom para acessibilidade).
      // className="p-6" aplica padding de 24px em toda a área.
      <main className="p-6 w-fulll mx-auto space-y-6">
        {/* <h1> é o título principal da página/cabeçalho */}
        <header className="space-y-1">
        <h1 className="text-2xl font-bold mb-4">Planner de Estudos</h1>
        <p className="opacty-80">Gerencie suas tarefas de estudo com tarefas, prazos e filtros.</p>
        </header>
        

        {/* Resumo + Ações rápidas*/}
        <section className="flex flex-wrap items-center gap border rounded p-3">
          <span className="text-sm">Total: <strong>{total}</strong></span>
          <span className="text-sm">Abertas: <strong>{open}</strong></span>
          <span className="text-sm">Concluídas: <strong>{done}</strong></span>

          <div className="ml-auto flex gap-3">
            {/* abas de filtro (apenas classes utilitárias para realçar selecionadas) */}
            <button
            onClick={() => setFilter("all")}
            className={`border rounded px-3 py-1 text-sm ${filter === "all" ? "bg-gray-100": ""}`}
            aria-pressed={filter === "all"}
          >
            Todas
          </button>
          <button
            onClick={() => setFilter("open")}
            className={`border rounded px-3 py-1 text-sm ${filter === "open" ? "bg-gray-100": ""}`}
            aria-pressed={filter === "open"}
          >
            Abertas
          </button>
          <button
            onClick={() => setFilter("open")}
            className={`border rounded px-3 py-1 text-sm ${filter === "open" ? "bg-gray-100": ""}`}
            aria-pressed={filter === "open"}
          >
            Concluídas
            </button>

            <button
              onClick={clearDone}
              className="border rounded px-3 py-1 text-sm"
              disabled={done === 0}
              title={done === 0? "nenhuma tarefa concluída" : "Remover todas as concluídas"}
          >
            Limpar concluídas
          </button>
          </div>
          </section>



        {/* Formulário para criar nova tarefa */}
      <form onSubmit={addTask} className="flex flex-col gap-3 border rounded p-4">
        <div className="flex flex-col gap-1">
          <label className="text-sm">Título da tarefa</label>
          <input
            className="border rounded p-2"
            placeholder="Ex.: Revisar Aula 1"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="felx flex-col gap-1">
          <label className="text-sm">Data (selecione no calendário)</label>
          <input
            className="border rounded p-2"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            //min = hoje (impede datas passadas; se não quisermos essa regra podemos remover)
            min={new Date().toISOString().slice(0, 10)}
            required
          />
          {/* Dica visual opcional */}
          <span className="text-xs opacity-60">Clique no campo para abrir o calendário.</span>
        </div>

        <button type="submit" className="border rounded px-4 py-2">
          Adicionar tarefa
        </button>
        </form>


       {/* Lista (filtrada) */}
      {filtered.length === 0 ? (
        <p className="italic opacity-70">Nada por aqui com esse filtro.</p>
      ) : (
        <ul className="space-y-2">
          {filtered.map((t) => {
            const status = dueStatus(t.dueDate);
            const dateClass =
              status === "overdue"
                ? "text-red-600"
                : status === "today"
                ? "text-amber-600"
                : "opacity-70";

            return (
              <li key={t.id} className="flex items-center gap-3 border rounded p-3">
                {/* checkbox: alterna conclusão */}
                <input
                  type="checkbox"
                  checked={t.done}
                  onChange={() => toggleDone(t.id)}
                  className="size-4"
                  aria-label={`Marcar ${t.title}`}
                />

              {/* Título (modo de exibição x edição inline) */}
              {editingId === t.id ? (
              <input
                className="border rounded p1-flex-1"
                value={editingTitle}
                onChange={(e) => setEditingTitle(e.target.value)}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") confirmEdit(t.id);
                  if (e.key === "Escape") cancelEdit();
                }}
              />
            ) : (
              <span className={t.done ? "line-through opacity-60" : ""}>
                {t.title}
              </span>
            )}
            
  
              {/* Data formatada e colorida por status (vencida/hoje/futura) */}
              <span className={`ml-auto text-sm ${dateClass}`}>
                  {formatBR(t.dueDate)}
                </span>

                {/* Botões de ação */}
                {editingId === t.id ? (
                  <>
                    <button
                      onClick={() => confirmEdit(t.id)}
                      className="border rounded px-2 py-1 text-sm"
                    >
                      Salvar
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="border rounded px-2 py-1 text-sm"
                    >
                      Cancelar
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => startEdit(t)}
                      className="border rounded px-2 py-1 text-sm"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => removeTask(t.id)}
                      className="border rounded px-2 py-1 text-sm"
                    >
                      Excluir
                    </button>
                  </>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}