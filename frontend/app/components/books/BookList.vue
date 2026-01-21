<script setup lang="ts">
import { ref, computed, watch } from "vue";
import type { TableColumn } from "@nuxt/ui";

type Book = {
  id: number;
  title: string;
  author: string;
  genre?: string | null;
  isbn?: string | null;
  createdAt: string;
};

const props = defineProps<{
  books: Book[];
  searchTerm: string;
  isLoading?: boolean;
}>();

const emit = defineEmits<{
  (e: "edit", id: number): void;
  (e: "delete", id: number): void;
}>();

const page = ref(1);
const pageSize = ref(4);

const filteredBooks = computed(() => {
  const q = (props.searchTerm ?? "").trim().toLowerCase();
  const list = Array.isArray(props.books) ? props.books : [];
  if (!q) return list;

  return list.filter((b) => {
    const t = (b.title ?? "").toLowerCase();
    const a = (b.author ?? "").toLowerCase();
    const g = (b.genre ?? "").toLowerCase();
    const i = (b.isbn ?? "").toLowerCase();
    return t.includes(q) || a.includes(q) || g.includes(q) || i.includes(q);
  });
});

const totalItems = computed(() => filteredBooks.value.length);

const paginatedBooks = computed(() => {
  const start = (page.value - 1) * pageSize.value;
  return filteredBooks.value.slice(start, start + pageSize.value);
});

watch(
  () => props.searchTerm,
  () => (page.value = 1),
);

const columns: TableColumn<Book>[] = [
  { accessorKey: "title", header: "Nosaukums" },
  { accessorKey: "author", header: "Autors" },
  {
    accessorKey: "genre",
    header: "Žanrs",
    cell: ({ row }) => (row.getValue("genre") as string) || "-",
  },
  {
    accessorKey: "isbn",
    header: "ISBN",
    cell: ({ row }) => (row.getValue("isbn") as string) || "-",
  },
  { id: "actions", header: "" },
];

const escapeHtml = (s: string) =>
  (s ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[c as "&" | "<" | ">" | '"' | "'"] as string,
  );

const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const hl = (val: unknown) => {
  const text = String(val ?? "");
  const q = String(props.searchTerm ?? "").trim();
  if (!q) return escapeHtml(text);
  const rx = new RegExp(`(${escapeRegExp(q)})`, "gi");
  return escapeHtml(text).replace(
    rx,
    '<mark class="px-1 rounded bg-yellow-200">$1</mark>',
  );
};
</script>

<template>
  <div class="w-full h-full">
    <div
      class="border bg-[var(--globals--backgrounds--lighter)] border-[var(--globals--strokes--block)] p-[1.1rem] md:p-[2.5rem] rounded-2xl"
    >
      <div class="flex w-full flex-1 gap-1">
        <div class="flex-1 overflow-x-auto">
          <UTable
            class="no-ui-divider"
            :data="paginatedBooks"
            :columns="columns"
            :loading="!!props.isLoading"
            loading-color="primary"
            loading-animation="carousel"
            :ui="{
              root: 'border !border-[var(--globals--strokes--block)] rounded-md',
              base: '!bg-white w-full table-auto overflow-hidden',
              thead: '!border-[var(--globals--strokes--block)]',
              tbody: 'divide-y !divide-[var(--globals--strokes--block)]',
              th: 'border-b !border-[var(--globals--strokes--block)] bg-[#F1F5F9] text-base text-sm font-semibold text-[var(--globals--texts--secondary)] tracking-wide whitespace-nowrap [&[data-column-id=actions]]:sticky [&[data-column-id=actions]]:right-0 [&[data-column-id=actions]]:z-10 [&[data-column-id=actions]]:bg-[var(--globals--backgrounds--basic)]',
              td: 'whitespace-nowrap text-[var(--globals--texts--basic)] bg-[var(--globals--backgrounds--lighter)]',
              empty:
                'text-center text-[var(--globals--texts--secondary)] bg-[var(--globals--backgrounds--lighter)]',
            }"
          >
            <template #title-cell="{ row }">
              <span v-html="hl(row.getValue('title'))" />
            </template>

            <template #author-cell="{ row }">
              <span v-html="hl(row.getValue('author'))" />
            </template>

            <template #genre-cell="{ row }">
              <span v-html="hl(row.getValue('genre') || '-')" />
            </template>

            <template #isbn-cell="{ row }">
              <span v-html="hl(row.getValue('isbn') || '-')" />
            </template>

            <template #actions-cell="{ row }">
              <UButton
                icon="i-heroicons-pencil"
                size="sm"
                variant="ghost"
                color="primary"
                class="cursor-pointer"
                aria-label="Labot"
                @click="emit('edit', row.original.id)"
              />
              <UButton
                icon="i-heroicons-trash"
                size="sm"
                variant="ghost"
                color="error"
                class="cursor-pointer"
                aria-label="Dzēst"
                @click="emit('delete', row.original.id)"
              />
            </template>
          </UTable>

          <UPagination
            v-model:page="page"
            :total="totalItems"
            :items-per-page="pageSize"
            active-color="primary"
            class="mt-5 mb-1 flex justify-center"
            size="xl"
            :sibling-count="4"
            :ui="{
              first:
                'cursor-pointer ring-[var(--globals--strokes--dashed)] !bg-[var(--globals--backgrounds--lighter)] text-[var(--globals--texts--basic)] hover:!bg-[var(--globals--backgrounds--lighter)] focus:!bg-[var(--globals--backgrounds--lighter)] active:!bg-[var(--globals--backgrounds--lighter)]',
              prev: 'cursor-pointer ring-[var(--globals--strokes--dashed)] !bg-[var(--globals--backgrounds--lighter)] text-[var(--globals--texts--basic)] hover:!bg-[var(--globals--backgrounds--lighter)] focus:!bg-[var(--globals--backgrounds--lighter)] active:!bg-[var(--globals--backgrounds--lighter)]',
              item: 'cursor-pointer ring-[var(--globals--strokes--dashed)] !bg-[var(--globals--backgrounds--lighter)] text-[var(--globals--texts--basic)] hover:!bg-[var(--globals--backgrounds--lighter)] focus:!bg-[var(--globals--backgrounds--lighter)] active:!bg-[var(--globals--backgrounds--lighter)]',
              next: 'cursor-pointer ring-[var(--globals--strokes--dashed)] !bg-[var(--globals--backgrounds--lighter)] text-[var(--globals--texts--basic)] hover:!bg-[var(--globals--backgrounds--lighter)] focus:!bg-[var(--globals--backgrounds--lighter)] active:!bg-[var(--globals--backgrounds--lighter)]',
              last: 'cursor-pointer ring-[var(--globals--strokes--dashed)] !bg-[var(--globals--backgrounds--lighter)] text-[var(--globals--texts--basic)] hover:!bg-[var(--globals--backgrounds--lighter)] focus:!bg-[var(--globals--backgrounds--lighter)] active:!bg-[var(--globals--backgrounds--lighter)]',
            }"
          />
        </div>
      </div>
    </div>
  </div>
</template>
