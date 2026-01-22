<script setup lang="ts">
import { ref, computed, watch } from "vue";
import type { TableColumn } from "@nuxt/ui";

type Reader = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  active: boolean;
  createdAt: string;
};

type Book = {
  id: number;
  title: string;
  author: string;
  genre?: string | null;
  isbn?: string | null;
  createdAt: string;
};

type BookCopy = {
  id: number;
  inventoryCode: string;
  status: "AVAILABLE" | "LOANED";
  location: string;
  book: Book;
  createdAt: string;
};

export type Loan = {
  id: number;
  reader: Reader;
  copy: BookCopy;
  loanDate: string;
  dueDate: string;
  returnDate?: string | null;
};

const props = defineProps<{
  loans: Loan[];
  searchTerm: string;
  isLoading?: boolean;
}>();

const emit = defineEmits<{
  (e: "return", id: number): void;
}>();

/* ---------------- pagination ---------------- */
const page = ref(1);
const pageSize = ref(6);

const filteredLoans = computed(() => {
  const q = (props.searchTerm ?? "").trim().toLowerCase();
  const list = Array.isArray(props.loans) ? props.loans : [];
  if (!q) return list;

  return list.filter((l) => {
    const reader =
      `${l.reader?.firstName ?? ""} ${l.reader?.lastName ?? ""}`.toLowerCase();
    const inv = (l.copy?.inventoryCode ?? "").toLowerCase();
    const title = (l.copy?.book?.title ?? "").toLowerCase();
    const author = (l.copy?.book?.author ?? "").toLowerCase();
    const status = l.returnDate ? "returned" : "active";

    return (
      reader.includes(q) ||
      inv.includes(q) ||
      title.includes(q) ||
      author.includes(q) ||
      status.includes(q)
    );
  });
});

watch(
  () => props.searchTerm,
  () => {
    page.value = 1;
  },
);

const totalItems = computed(() => filteredLoans.value.length);

const paginatedLoans = computed(() => {
  const start = (page.value - 1) * pageSize.value;
  return filteredLoans.value.slice(start, start + pageSize.value);
});

/* ---------------- helpers ---------------- */
function formatDate(s?: string | null) {
  if (!s) return "—";
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? String(s) : d.toLocaleDateString();
}

function isOverdue(loan: Loan) {
  if (loan.returnDate) return false;
  const due = new Date(loan.dueDate).getTime();
  if (Number.isNaN(due)) return false;
  return Date.now() > due;
}

function openReturnConfirm(loan: Loan) {
  emit("return", loan.id);
}

/* ---------------- columns ---------------- */
const columns: TableColumn<Loan>[] = [
  { accessorKey: "id", header: "ID" },
  { accessorKey: "reader", header: "Lasītājs" },
  { accessorKey: "copy", header: "Inventārs" },
  { accessorKey: "book", header: "Grāmata" },
  { accessorKey: "loanDate", header: "Izsniegts" },
  { accessorKey: "dueDate", header: "Termiņš" },
  { accessorKey: "state", header: "Statuss" },
  { id: "actions", header: "" },
];
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
            :data="paginatedLoans"
            :columns="columns"
            :loading="!!props.isLoading"
            loading-color="primary"
            loading-animation="carousel"
            :ui="{
              root: 'border !border-[var(--globals--strokes--block)] rounded-md',
              base: '!bg-white w-full table-auto overflow-hidden',
              thead: '!border-[var(--globals--strokes--block)]',
              tbody: 'divide-y !divide-[var(--globals--strokes--block)]',
              th: 'border-b !border-[var(--globals--strokes--block)] bg-[#F1F5F9] text-sm font-semibold text-[var(--globals--texts--secondary)] tracking-wide whitespace-nowrap [&[data-column-id=actions]]:sticky [&[data-column-id=actions]]:right-0 [&[data-column-id=actions]]:z-10 [&[data-column-id=actions]]:bg-[#F1F5F9]',
              td: 'whitespace-nowrap text-[var(--globals--texts--basic)] bg-[var(--globals--backgrounds--lighter)]',
              empty:
                'text-center text-[var(--globals--texts--secondary)] bg-[var(--globals--backgrounds--lighter)]',
            }"
          >
            <template #reader-cell="{ row }">
              <span>
                {{ row.original.reader?.firstName }}
                {{ row.original.reader?.lastName }}
              </span>
            </template>

            <template #copy-cell="{ row }">
              <span>{{ row.original.copy?.inventoryCode ?? "—" }}</span>
            </template>

            <template #book-cell="{ row }">
              <span>{{ row.original.copy?.book?.title ?? "—" }}</span>
            </template>

            <template #loanDate-cell="{ row }">
              <span>{{ formatDate(row.original.loanDate) }}</span>
            </template>

            <template #dueDate-cell="{ row }">
              <span>{{ formatDate(row.original.dueDate) }}</span>
            </template>

            <template #state-cell="{ row }">
              <div class="flex items-center gap-2">
                <UBadge
                  v-if="row.original.returnDate"
                  color="success"
                  variant="soft"
                >
                  ATGRIEZTA
                </UBadge>

                <UBadge
                  v-else-if="isOverdue(row.original)"
                  color="error"
                  variant="soft"
                >
                  KAVĒTA
                </UBadge>

                <UBadge v-else color="primary" variant="soft">
                  IZSNIEGTA
                </UBadge>
              </div>
            </template>

            <template #actions-cell="{ row }">
              <UButton
                v-if="!row.original.returnDate"
                icon="i-heroicons-arrow-uturn-left"
                size="sm"
                title="Atgriezt grāmatu"
                variant="ghost"
                color="primary"
                aria-label="Atgriezt"
                class="cursor-pointer"
                @click="openReturnConfirm(row.original)"
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
