"use client";
/**
 * /planner — Board estilo Trello (drag & drop nativo)
 * ---------------------------------------------------
 * Layout:
 *  - Sidebar esquerda: "Aulas" (lista arrastável + busca)
 *  - Board com 3 colunas: Fazer, Revisar, Exercícios
 *  - Cards com: checkbox (feito), data, mover entre colunas, reordenar ↑/↓, excluir
 *
 * Persistência: localStorage
 * Estilos: Tailwind (v4)
 * A11y: feedback de foco/teclado, títulos semânticos
 *
 * Dica: tudo está comentado pra ficar “explicável”.
 */

import { useEffect, useMemo, useState } from "react";

/* ============================================================
 * Tipos e utilitários
 * ============================================================ */

type TaskType = "do" | "review" | "exercise";

type Lesson = {
  id: string;
  title: string;
  durationMin: number; // ajuda a estimar esforço
};

type Card = {
  id: string;
  lessonId?: string;      // opcional: qual aula originou
  title: string;          // título do card
  type: TaskType;         // coluna (Fazer/ Revisar/ Exercícios)
  done: boolean;          // concluído?
  dueDate?: string;       // yyyy-mm-dd
  durationMin?: number;   // usado no total por coluna
};

const STORAGE_KEY = "granstudy:kanban";

// aulas “mock” (lado esquerdo, arrastáveis)
const LESSONS: Lesson[] = [
  { id: "L1", title: "Proposições e conectivos", durationMin: 40 },
  { id: "L2", title: "Tabelas-verdade",          durationMin: 55 },
  { id: "L3", title: "Equivalências lógicas",    durationMin: 50 },
  { id: "L4", title: "Argumentos e validade",    durationMin: 45 },
  { id: "L5", title: "Diagramas lógicos",        durationMin: 35 },
];

// rótulos de coluna e estilos base
const TYPE_META: Record<
  TaskType,
  { label: string; border: string; bg: string; chip: string }
> = {
  do:       { label: "Fazer",     border: "border-sky-300",    bg: "bg-sky-50",    chip: "bg-sky-100 text-sky-700" },
  review:   { label: "Revisar",   border: "border-amber-300",  bg: "bg-amber-50",  chip: "bg-amber-100 text-amber-700" },
  exercise: { label: "Exercícios",border: "border-emerald-300",bg: "bg-emerald-50",chip: "bg-emerald-100 text-emerald-700" },
};

// formata minutos em “1 h 20 min”
function fmtMin(min: number) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (!h) return `${m} min`;
  if (!m) return `${h} h`;
  return `${h} h ${m} min`;
}

// soma duração de uma lista
function sumMin(list: Card[]) {
  return list.reduce((acc, c) => acc + (c.durationMin ?? 0), 0);
}

// carga/salva no localStorage
function load(): Card[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Card[]) : [];
  } catch {
    return [];
  }
}
function save(data: Card[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

/* ============================================================
 * Página principal
 * ============================================================ */

export default function PlannerBoard() {
  // estado “fonte da verdade” dos cards
  const [cards, setCards] = useState<Card[]>([]);
  // busca nas aulas (sidebar)
  const [query, setQuery] = useState("");
  // estado visual para destacar drop target
  const [dragOverType, setDragOverType] = useState<TaskType | null>(null);

  // carrega/salva
  useEffect(() => { setCards(load()); }, []);
  useEffect(() => { save(cards); }, [cards]);

  // filtra aulas por busca
  const filteredLessons = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return LESSONS;
    return LESSONS.filter(l => l.title.toLowerCase().includes(q));
  }, [query]);

  // separa cartões por coluna
  const byType = useMemo(() => ({
    do:       cards.filter(c => c.type === "do"),
    review:   cards.filter(c => c.type === "review"),
    exercise: cards.filter(c => c.type === "exercise"),
  }), [cards]);

  // totais por coluna e geral
  const totals = useMemo(() => {
    const d = sumMin(byType.do);
    const r = sumMin(byType.review);
    const e = sumMin(byType.exercise);
    return { do: d, review: r, exercise: e, all: d + r + e };
  }, [byType]);

  /* ---------------------- Drag da AULA (sidebar) ---------------------- */
  function onLessonDragStart(e: React.DragEvent, lessonId: string) {
    // passamos o ID via dataTransfer
    e.dataTransfer.setData("text/lesson", lessonId);
  }

  /* ---------------------- Drag do CARD (entre colunas) ---------------- */
  function onCardDragStart(e: React.DragEvent, cardId: string) {
    e.dataTransfer.setData("text/card", cardId);
  }

  /* ---------------------- Drop em coluna ------------------------------ */
  function onDropTo(type: TaskType, e: React.DragEvent) {
    e.preventDefault();
    setDragOverType(null);

    // 1) Se veio uma aula -> cria card novo nessa coluna
    const lessonId = e.dataTransfer.getData("text/lesson");
    if (lessonId) {
      const lesson = LESSONS.find(l => l.id === lessonId);
      if (!lesson) return;
      const newCard: Card = {
        id: String(Date.now()),
        lessonId: lesson.id,
        title: lesson.title,
        type,
        done: false,
        durationMin: lesson.durationMin,
      };
      setCards(prev => [...prev, newCard]);
      return;
    }

    // 2) Se veio um card -> apenas troca de coluna
    const cardId = e.dataTransfer.getData("text/card");
    if (cardId) {
      setCards(prev => prev.map(c => c.id === cardId ? { ...c, type } : c));
    }
  }

  function onDragOver(type: TaskType, e: React.DragEvent) {
    e.preventDefault(); // permite drop
    if (dragOverType !== type) setDragOverType(type);
  }
  function onDragLeave(type: TaskType) {
    if (dragOverType === type) setDragOverType(null);
  }

  /* ---------------------- Ações nos cards ----------------------------- */
  function toggleDone(id: string) {
    setCards(prev => prev.map(c => c.id === id ? ({ ...c, done: !c.done }) : c));
  }
  function removeCard(id: string) {
    setCards(prev => prev.filter(c => c.id !== id));
  }
  function moveTo(id: string, type: TaskType) {
    setCards(prev => prev.map(c => c.id === id ? ({ ...c, type }) : c));
  }
  function setDue(id: string, date: string) {
    setCards(prev => prev.map(c => c.id === id ? ({ ...c, dueDate: date }) : c));
  }

  // reordenar manualmente dentro do array global: sobe/ desce
  function moveUp(id: string) {
    setCards(prev => {
      const idx = prev.findIndex(c => c.id === id);
      if (idx <= 0) return prev;
      const copy = [...prev];
      const [item] = copy.splice(idx, 1);
      copy.splice(idx - 1, 0, item);
      return copy;
    });
  }
  function moveDown(id: string) {
    setCards(prev => {
      const idx = prev.findIndex(c => c.id === id);
      if (idx === -1 || idx >= prev.length - 1) return prev;
      const copy = [...prev];
      const [item] = copy.splice(idx, 1);
      copy.splice(idx + 1, 0, item);
      return copy;
    });
  }

  /* ============================================================
   * Render
   * ============================================================ */

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Topbar: título + totais */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b">
        <div className="mx-auto max-w-7xl px-6 py-4 flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold">📌 Planner de Estudos</h1>
          <span className="text-sm px-2 py-1 rounded bg-gray-100">
            Total estimado: <b>{fmtMin(totals.all)}</b>
          </span>
          <span className="text-xs opacity-70 ml-auto">
            Dica: arraste aulas para uma coluna ou arraste cards entre colunas.
          </span>
        </div>
      </header>

      {/* Grid principal: Sidebar aulas | Board */}
      <div className="mx-auto max-w-7xl px-6 py-6 grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
        {/* SIDEBAR: Aulas */}
        <aside className="border rounded-xl bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <h2 className="font-semibold">Aulas</h2>
            <span className="text-xs opacity-70">({filteredLessons.length})</span>
          </div>

          {/* Busca */}
          <div className="mb-3">
            <input
              className="w-full border rounded px-3 py-2 text-sm"
              placeholder="Buscar aulas…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Buscar aulas"
            />
          </div>

          <ul className="space-y-2">
            {filteredLessons.map(lesson => (
              <li
                key={lesson.id}
                draggable
                onDragStart={(e) => onLessonDragStart(e, lesson.id)}
                className="border rounded-lg p-3 bg-white shadow-sm cursor-grab active:cursor-grabbing hover:shadow transition"
                title="Arraste para uma coluna"
              >
                <div className="font-medium">{lesson.title}</div>
                <div className="text-xs opacity-70">~ {lesson.durationMin} min</div>
              </li>
            ))}
            {filteredLessons.length === 0 && (
              <li className="text-sm italic opacity-70">Nenhuma aula encontrada.</li>
            )}
          </ul>
        </aside>

        {/* BOARD: 3 colunas */}
        <section className="space-y-4">
          {/* Totais por coluna */}
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="px-2 py-1 rounded bg-sky-100 text-sky-700">
              Fazer: <b>{fmtMin(totals.do)}</b>
            </span>
            <span className="px-2 py-1 rounded bg-amber-100 text-amber-700">
              Revisar: <b>{fmtMin(totals.review)}</b>
            </span>
            <span className="px-2 py-1 rounded bg-emerald-100 text-emerald-700">
              Exercícios: <b>{fmtMin(totals.exercise)}</b>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Column
              type="do"
              title={TYPE_META.do.label}
              items={byType.do}
              dragOver={dragOverType === "do"}
              onDragOver={(e) => onDragOver("do", e)}
              onDragLeave={() => onDragLeave("do")}
              onDrop={(e) => onDropTo("do", e)}
              onToggle={toggleDone}
              onRemove={removeCard}
              onMove={moveTo}
              onDue={setDue}
              onUp={moveUp}
              onDown={moveDown}
            />
            <Column
              type="review"
              title={TYPE_META.review.label}
              items={byType.review}
              dragOver={dragOverType === "review"}
              onDragOver={(e) => onDragOver("review", e)}
              onDragLeave={() => onDragLeave("review")}
              onDrop={(e) => onDropTo("review", e)}
              onToggle={toggleDone}
              onRemove={removeCard}
              onMove={moveTo}
              onDue={setDue}
              onUp={moveUp}
              onDown={moveDown}
            />
            <Column
              type="exercise"
              title={TYPE_META.exercise.label}
              items={byType.exercise}
              dragOver={dragOverType === "exercise"}
              onDragOver={(e) => onDragOver("exercise", e)}
              onDragLeave={() => onDragLeave("exercise")}
              onDrop={(e) => onDropTo("exercise", e)}
              onToggle={toggleDone}
              onRemove={removeCard}
              onMove={moveTo}
              onDue={setDue}
              onUp={moveUp}
              onDown={moveDown}
            />
          </div>
        </section>
      </div>
    </main>
  );
}

/* ============================================================
 * Coluna (Column) — recebe drops e lista cards
 * ============================================================ */

function Column(props: {
  type: TaskType;
  title: string;
  items: Card[];
  dragOver: boolean;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent) => void;
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
  onMove: (id: string, t: TaskType) => void;
  onDue: (id: string, d: string) => void;
  onUp: (id: string) => void;
  onDown: (id: string) => void;
}) {
  const { type, title, items, dragOver,
    onDragOver, onDragLeave, onDrop,
    onToggle, onRemove, onMove, onDue, onUp, onDown } = props;

  const meta = TYPE_META[type];

  return (
    <div
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className={[
        "rounded-xl p-3 min-h-[260px] border-2 transition",
        meta.border, meta.bg,
        dragOver ? "ring-4 ring-offset-2 ring-indigo-300" : "ring-0"
      ].join(" ")}
      aria-label={`Coluna ${meta.label}`}
    >
      <div className="flex items-center gap-2 mb-3">
        <h3 className="font-semibold">{title}</h3>
        <span className={`text-xs px-2 py-0.5 rounded ${meta.chip}`}>{items.length}</span>
      </div>

      {items.length === 0 ? (
        <p className="text-sm italic opacity-70">Arraste aulas ou cards para cá…</p>
      ) : (
        <ul className="space-y-2">
          {items.map((c, idx) => (
            <li
              key={c.id}
              draggable
              onDragStart={(e) => e.dataTransfer.setData("text/card", c.id)}
              className="border rounded-lg p-3 bg-white shadow-sm hover:shadow transition"
            >
              {/* Linha 1: título + ações rápidas */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={c.done}
                  onChange={() => onToggle(c.id)}
                  className="size-4"
                  aria-label={`Concluir ${c.title}`}
                />
                <span className={`flex-1 ${c.done ? "line-through opacity-60" : ""}`}>
                  {c.title}
                </span>
                <button
                  onClick={() => onRemove(c.id)}
                  className="text-xs border rounded px-2 py-1"
                  aria-label={`Excluir ${c.title}`}
                  title="Excluir"
                >
                  Excluir
                </button>
              </div>

              {/* Linha 2: data + mover entre colunas + reordenar */}
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <input
                  type="date"
                  className="border rounded px-2 py-1 text-sm"
                  value={c.dueDate ?? ""}
                  onChange={(e) => onDue(c.id, e.target.value)}
                  min={new Date().toISOString().slice(0, 10)}
                  aria-label="Definir data"
                />

                <span className="ml-auto text-xs opacity-70">Mover:</span>
                <select
                  className="border rounded px-2 py-1 text-sm"
                  value={c.type}
                  onChange={(e) => onMove(c.id, e.target.value as TaskType)}
                  aria-label="Mover para coluna"
                >
                  <option value="do">Fazer</option>
                  <option value="review">Revisar</option>
                  <option value="exercise">Exercícios</option>
                </select>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onUp(c.id)}
                    className="text-xs border rounded px-2 py-1"
                    disabled={idx === 0}
                    title="Subir"
                  >
                    ↑
                  </button>
                  <button
                    onClick={() => onDown(c.id)}
                    className="text-xs border rounded px-2 py-1"
                    disabled={idx === items.length - 1}
                    title="Descer"
                  >
                    ↓
                  </button>
                </div>
              </div>

              {/* Linha 3: metadata (opcional) */}
              {c.durationMin ? (
                <div className="mt-2 text-xs opacity-70">
                  ~ {fmtMin(c.durationMin)}
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
