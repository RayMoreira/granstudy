"use client";
/**
 * /study: Aulas (esquerda) + Planner (direita)
 * Incrementos:
 *  - Busca de aulas (filtro em tempo real)
 *  - Totais de duração (por coluna e geral)
 *  - Reordenar tarefas dentro do balde (botões ↑/↓)
 * Persistência: localStorage
 * Drag & Drop: HTML5 nativo (sem libs)
 */

import { useEffect, useMemo, useState } from "react";

/* =========================
 * Tipos e utilitários
 * ========================= */

type Lesson = {
  id: string;
  title: string;
  durationMin: number;
};

type TaskType = "study" | "review" | "exercise";

type PlannedTask = {
  id: string;
  lessonId: string;
  title: string;
  type: TaskType;
  dueDate?: string;
  done: boolean;
  // guardamos também a duração para poder somar por coluna
  durationMin?: number;
};

const STORAGE_KEY = "granstudy:study_planner";

const MOCK_LESSONS: Lesson[] = [
  { id: "L1", title: "Proposições e conectivos", durationMin: 40 },
  { id: "L2", title: "Tabelas-verdade",          durationMin: 55 },
  { id: "L3", title: "Equivalências lógicas",    durationMin: 50 },
  { id: "L4", title: "Argumentos e validade",    durationMin: 45 },
  { id: "L5", title: "Diagramas lógicos",        durationMin: 35 },
];

function loadPlanned(): PlannedTask[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as PlannedTask[];
  } catch {
    return [];
  }
}
function savePlanned(data: PlannedTask[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function typeLabel(t: TaskType) {
  if (t === "study") return "Estudar";
  if (t === "review") return "Revisar";
  return "Exercícios";
}
function bucketClasses(t: TaskType) {
  if (t === "study") return "border-sky-300/80 bg-sky-50";
  if (t === "review") return "border-amber-300/80 bg-amber-50";
  return "border-emerald-300/80 bg-emerald-50";
}

function sumMinutes(items: PlannedTask[]) {
  return items.reduce((acc, it) => acc + (it.durationMin ?? 0), 0);
}
function formatMinutes(min: number) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} h`;
  return `${h} h ${m} min`;
}

/* =========================
 * Componente principal
 * ========================= */

export default function StudyPlannerPage() {
  // planner (lado direito)
  const [planned, setPlanned] = useState<PlannedTask[]>([]);
  // busca de aulas (lado esquerdo)
  const [query, setQuery] = useState("");

  useEffect(() => { setPlanned(loadPlanned()); }, []);
  useEffect(() => { savePlanned(planned); }, [planned]);

  // aulas filtradas pelo termo de busca
  const filteredLessons = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return MOCK_LESSONS;
    return MOCK_LESSONS.filter(l => l.title.toLowerCase().includes(q));
  }, [query]);

  // agrupa por tipo para listar por coluna
  const byType = useMemo(() => {
    return {
      study: planned.filter(p => p.type === "study"),
      review: planned.filter(p => p.type === "review"),
      exercise: planned.filter(p => p.type === "exercise"),
    };
  }, [planned]);

  // totais por coluna e geral
  const totals = useMemo(() => {
    const s = sumMinutes(byType.study);
    const r = sumMinutes(byType.review);
    const e = sumMinutes(byType.exercise);
    return {
      study: s,
      review: r,
      exercise: e,
      all: s + r + e,
    };
  }, [byType]);

  /* ------------- Drag & Drop ------------- */

  function onLessonDragStart(e: React.DragEvent, lessonId: string) {
    e.dataTransfer.setData("text/plain", lessonId);
  }
  function onDropToBucket(e: React.DragEvent, bucketType: TaskType) {
    e.preventDefault();
    const lessonId = e.dataTransfer.getData("text/plain");
    if (!lessonId) return;
    const lesson = MOCK_LESSONS.find(l => l.id === lessonId);
    if (!lesson) return;

    const newTask: PlannedTask = {
      id: String(Date.now()),
      lessonId: lesson.id,
      title: lesson.title,
      type: bucketType,
      done: false,
      durationMin: lesson.durationMin,
    };
    setPlanned(prev => [...prev, newTask]);
  }

  /* ------------- Ações dos cards ------------- */

  function toggleDone(id: string) {
    setPlanned(prev => prev.map(p => p.id === id ? { ...p, done: !p.done } : p));
  }
  function removeTask(id: string) {
    setPlanned(prev => prev.filter(p => p.id !== id));
  }
  function moveTask(id: string, newType: TaskType) {
    setPlanned(prev => prev.map(p => p.id === id ? { ...p, type: newType } : p));
  }
  function setDue(id: string, date: string) {
    setPlanned(prev => prev.map(p => p.id === id ? { ...p, dueDate: date } : p));
  }

  // reordenar dentro do mesmo balde (index-based, sem drag libs)
  function moveUp(id: string) {
    setPlanned(prev => {
      const idx = prev.findIndex(p => p.id === id);
      if (idx <= 0) return prev;
      const copy = [...prev];
      const [item] = copy.splice(idx, 1);
      copy.splice(idx - 1, 0, item);
      return copy;
    });
  }
  function moveDown(id: string) {
    setPlanned(prev => {
      const idx = prev.findIndex(p => p.id === id);
      if (idx === -1 || idx >= prev.length - 1) return prev;
      const copy = [...prev];
      const [item] = copy.splice(idx, 1);
      copy.splice(idx + 1, 0, item);
      return copy;
    });
  }

  return (
    <main className="min-h-screen p-6">
      {/* Cabeçalho */}
      <header className="mb-6">
        <h1 className="text-2xl font-bold">🎯 Estudo + Planner Integrado</h1>
        <p className="opacity-80">
          Arraste uma aula da esquerda para um dos baldes da direita (Estudar, Revisar, Exercícios).
        </p>
      </header>

      {/* Grid: aulas | planner */}
      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
        {/* AULAS */}
        <aside className="border rounded p-4">
          <div className="flex items-center gap-2 mb-3">
            <h2 className="font-semibold">Aulas</h2>
            <span className="text-xs opacity-70">({filteredLessons.length})</span>
          </div>

          {/* Busca */}
          <div className="mb-3">
            <input
              className="w-full border rounded px-2 py-1 text-sm"
              placeholder="Buscar aulas..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <ul className="space-y-2">
            {filteredLessons.map(lesson => (
              <li
                key={lesson.id}
                draggable
                onDragStart={(e) => onLessonDragStart(e, lesson.id)}
                className="border rounded p-3 bg-white shadow-sm cursor-grab active:cursor-grabbing"
                title="Arraste para um balde do Planner"
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

        {/* PLANNER */}
        <section className="space-y-4">
          {/* Totais (tempo estimado) */}
          <div className="flex flex-wrap items-center gap-3 border rounded p-3 text-sm">
            <span>Total: <strong>{formatMinutes(totals.all)}</strong></span>
            <span className="ml-auto">
              Estudar: <strong>{formatMinutes(totals.study)}</strong> ·{" "}
              Revisar: <strong>{formatMinutes(totals.review)}</strong> ·{" "}
              Exercícios: <strong>{formatMinutes(totals.exercise)}</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Bucket
              title="Estudar"
              type="study"
              items={byType.study}
              onDrop={onDropToBucket}
              onToggle={toggleDone}
              onRemove={removeTask}
              onMove={moveTask}
              onDue={setDue}
              onUp={moveUp}
              onDown={moveDown}
            />
            <Bucket
              title="Revisar"
              type="review"
              items={byType.review}
              onDrop={onDropToBucket}
              onToggle={toggleDone}
              onRemove={removeTask}
              onMove={moveTask}
              onDue={setDue}
              onUp={moveUp}
              onDown={moveDown}
            />
            <Bucket
              title="Exercícios"
              type="exercise"
              items={byType.exercise}
              onDrop={onDropToBucket}
              onToggle={toggleDone}
              onRemove={removeTask}
              onMove={moveTask}
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

/* =========================
 * Componente: Bucket
 * ========================= */

function Bucket(props: {
  title: string;
  type: TaskType;
  items: PlannedTask[];
  onDrop: (e: React.DragEvent, type: TaskType) => void;
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
  onMove: (id: string, t: TaskType) => void;
  onDue: (id: string, date: string) => void;
  onUp: (id: string) => void;
  onDown: (id: string) => void;
}) {
  const { title, type, items, onDrop, onToggle, onRemove, onMove, onDue, onUp, onDown } = props;
  const minutes = sumMinutes(items);

  return (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => onDrop(e, type)}
      className={`border-2 rounded p-3 min-h-[240px] ${bucketClasses(type)}`}
    >
      <div className="flex items-center gap-2 mb-3">
        <h3 className="font-semibold">{title}</h3>
        <span className="text-xs opacity-70">({items.length})</span>
        <span className="text-xs ml-auto opacity-80">
          {minutes > 0 ? `~ ${formatMinutes(minutes)}` : ""}
        </span>
      </div>

      {items.length === 0 ? (
        <p className="text-sm italic opacity-70">Arraste aulas para cá…</p>
      ) : (
        <ul className="space-y-2">
          {items.map((t, i) => (
            <li key={t.id} className="border rounded p-3 bg-white shadow-sm">
              {/* Linha 1: título + concluir + excluir */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={t.done}
                  onChange={() => onToggle(t.id)}
                  className="size-4"
                  aria-label={`Concluir ${t.title}`}
                />
                <span className={`flex-1 ${t.done ? "line-through opacity-60" : ""}`}>
                  {t.title}
                </span>
                <button
                  onClick={() => onRemove(t.id)}
                  className="text-xs border rounded px-2 py-1"
                  aria-label={`Excluir ${t.title}`}
                >
                  Excluir
                </button>
              </div>

              {/* Linha 2: data + mover entre baldes + reordenar */}
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <input
                  type="date"
                  className="border rounded px-2 py-1 text-sm"
                  value={t.dueDate ?? ""}
                  onChange={(e) => onDue(t.id, e.target.value)}
                  min={new Date().toISOString().slice(0, 10)}
                />

                <span className="ml-auto text-xs opacity-70">Mover:</span>
                <select
                  className="border rounded px-2 py-1 text-sm"
                  value={t.type}
                  onChange={(e) => onMove(t.id, e.target.value as TaskType)}
                >
                  <option value="study">Estudar</option>
                  <option value="review">Revisar</option>
                  <option value="exercise">Exercícios</option>
                </select>

                {/* Reordenar dentro do balde */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onUp(t.id)}
                    className="text-xs border rounded px-2 py-1"
                    disabled={i === 0}
                    title="Subir"
                  >
                    ↑
                  </button>
                  <button
                    onClick={() => onDown(t.id)}
                    className="text-xs border rounded px-2 py-1"
                    disabled={i === items.length - 1}
                    title="Descer"
                  >
                    ↓
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
