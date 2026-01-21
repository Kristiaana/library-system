<script setup lang="ts">
import { ref, computed, watch } from "vue";
import type { TableColumn } from "@nuxt/ui";

type Book = {
  id: number;
  title: string;
  author: string;
  createdAt: string;
};

type BookCopy = {
  id: number;
  inventoryCode: string;
  location: string;
  status: "AVAILABLE" | "LOANED";
  book: Book;
  createdAt: string;
};

const props = defineProps<{
  copies: BookCopy[];
  searchTerm: string;
  isLoading?: boolean;
}>();

const emit = defineEmits<{
  (e: "edit", id: number): void;
  (e: "delete", id: number): void;
}>();

const page = ref(1);
const pageSize = ref(4);

const filtered = computed(() => {
  const q = (props.searchTerm ?? "").trim().toLowerCase();
  const list = Array.isArray(props.copies) ? props.copies : [];
  if (!q) return list;

  return list.filter((c) => {
    const inv = (c.inventoryCode ?? "").toLowerCase();
    const loc = (c.location ?? "").toLowerCase();
    const st = (c.status ?? "").toLowerCase();
    const bt = (c.book?.title ?? "").toLowerCase();
    const ba = (c.book?.author ?? "").toLowerCase();
    return (
      inv.includes(q) ||
      loc.includes(q) ||
      st.includes(q) ||
      bt.includes(q) ||
      ba.includes(q)
    );
  });
});

const totalItems = computed(() => filtered.value.length);

const paginated = computed(() => {
  const start = (page.value - 1) * pageSize.value;
  return filtered.value.slice(start, start + pageSize.value);
});

watch(
  () => props.searchTerm,
  () => (page.value = 1),
);

const columns: TableColumn<BookCopy>[] = [
  { accessorKey: "inventoryCode", header: "Inventāra kods" },
  {
    id: "book",
    header: "Grāmata",
    cell: ({ row }) => {
      const b = row.original.book;
      return b ? `${b.title} — ${b.author}` : "-";
    },
  },
  { accessorKey: "location", header: "Vieta" },
  { accessorKey: "status", header: "Statuss" },
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
            :data="paginated"
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
            <template #inventoryCode-cell="{ row }">
              <span v-html="hl(row.getValue('inventoryCode'))" />
            </template>

            <template #location-cell="{ row }">
              <span v-html="hl(row.getValue('location'))" />
            </template>

            <template #status-cell="{ row }">
              <div class="flex items-center gap-2">
                <UBadge
                  v-if="row.original.status === 'AVAILABLE'"
                  color="success"
                  variant="soft"
                >
                  PIEEJAMA
                </UBadge>

                <UBadge v-else color="primary" variant="soft">
                  IZSNIEGTA
                </UBadge>
              </div>
            </template>

            <template #book-cell="{ row }">
              <span
                v-html="
                  hl(
                    row.original.book
                      ? `${row.original.book.title} — ${row.original.book.author}`
                      : '-',
                  )
                "
              />
            </template>

            <template #actions-cell="{ row }">
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
