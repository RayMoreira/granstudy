# 📚 Gran Study Planner

Um **planner de estudos digital**, simples e acessível, desenvolvido com **Next.js 15 (App Router)** e **Tailwind CSS**.  
O projeto é um MVP (Produto Mínimo Viável) que integra:

- **Lista de Aulas** (conteúdos organizados em ordem)
- **Planner de Tarefas** (organização de estudos por data)
- **Persistência local** via `localStorage` (mesmo sem backend)

---

## Funcionalidades

- Visualizar aulas disponíveis.
- Criar, marcar como concluídas e remover tarefas.
- As tarefas são salvas no navegador (não perdem ao atualizar a página).
- Interface responsiva e minimalista, pensada para estudos.

---

## Tecnologias Utilizadas

- [Next.js 15](https://nextjs.org/) (App Router)
- [React 19](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- **LocalStorage API** para persistência no cliente.

---

## 📂 Estrutura de Pastas

```bash
src/
 └── app/
     ├── page.tsx        # Página inicial simples
     └── study/
         └── page.tsx    # Página principal (aulas + planner integrados)
