<script setup lang="ts">
definePageMeta({ layout: "main" });

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
  location: string;
  status: "AVAILABLE" | "LOANED";
  book: Book;
  createdAt: string;
};

const config = useRuntimeConfig();
const api = config.public.apiBase;

const toast = useToast();

function getErrorText(e: any) {
  const status =
    e?.status ||
    e?.statusCode ||
    e?.response?.status ||
    e?.data?.statusCode ||
    500;

  const msgRaw = e?.data?.message ?? e?.message ?? "Unknown error";
  const message = Array.isArray(msgRaw) ? msgRaw.join(", ") : String(msgRaw);

  return { status, message };
}

function toastSuccess(description: string) {
  toast.add({
    title: "Yea!! All went good.",
    icon: "i-heroicons-check-circle",
    description,
    type: "foreground",
    color: "primary",
  });
}

function toastError(e: any) {
  const { status, message } = getErrorText(e);
  toast.add({
    title: "Oops!! Something went wrong.",
    icon: "i-heroicons-exclamation-triangle",
    description: `${status}: ${message}`,
    type: "foreground",
    color: "warning",
  });
}

const searchTerm = ref("");

const {
  data: copies,
  pending,
  error,
  refresh,
} = await useFetch<BookCopy[]>(`${api}/book-copies`, { default: () => [] });

// vajag books priekš select
const { data: books, pending: booksPending } = await useFetch<Book[]>(
  `${api}/books`,
  { default: () => [] },
);

/* ---------- modal state ---------- */
const isFormOpen = ref(false);

const selected = ref<BookCopy | null>(null);

const isDeleteOpen = ref(false);
const deleteTarget = ref<BookCopy | null>(null);

const saving = ref(false);
const deleting = ref(false);

function openCreate() {
  selected.value = null;
  isFormOpen.value = true;
}

function openEdit(id: number) {
  const c = (copies.value ?? []).find((x) => x.id === id) ?? null;
  if (!c) return;

  selected.value = c;
  isFormOpen.value = true;
}

function openDelete(id: number) {
  const c = (copies.value ?? []).find((x) => x.id === id) ?? null;
  if (!c) return;
  deleteTarget.value = c;
  isDeleteOpen.value = true;
}

/* ---------- API actions ---------- */
async function submitCopy(payload: {
  inventoryCode: string;
  location: string;
  bookId: number;
  status?: "AVAILABLE" | "LOANED";
}) {
  saving.value = true;

  try {
    await $fetch(`${api}/book-copies`, { method: "POST", body: payload });
    toastSuccess("201: Copy created");

    isFormOpen.value = false;
    selected.value = null;
    await refresh();
  } catch (e: any) {
    toastError(e);
  } finally {
    saving.value = false;
  }
}

async function confirmDelete() {
  if (!deleteTarget.value) return;
  deleting.value = true;

  try {
    await $fetch(`${api}/book-copies/${deleteTarget.value.id}`, {
      method: "DELETE",
    });

    toastSuccess("200: Copy deleted");

    isDeleteOpen.value = false;
    deleteTarget.value = null;
    await refresh();
  } catch (e: any) {
    toastError(e);
  } finally {
    deleting.value = false;
  }
}

const deleteLabel = computed(() => {
  const c = deleteTarget.value;
  if (!c) return "";
  const bookText = c.book ? `${c.book.title} — ${c.book.author}` : "-";
  return `${c.inventoryCode} (${bookText})`;
});

const loadingAny = computed(() => !!pending.value || !!booksPending.value);
</script>

<template>
  <div class="flex flex-col gap-5">
    <div class="flex items-center justify-between">
      <h1>Eksemplāri</h1>

      <div class="flex items-center gap-3">
        <UInput
          v-model="searchTerm"
          placeholder="Meklēt pēc inventāra koda, grāmatas, autora, vietas, statusa..."
          trailing-icon="i-heroicons-magnifying-glass"
          class="w-96"
          :ui="{
            base: 'px-3 py-3 text-base text-black !placeholder-[var(--inputs--placeholders--default)] !bg-[var(--inputs--backgrounds--default)] gap-2 ring ring-[var(--inputs--strokes--default)] rounded-md',
            leading: 'ps-3 text-[var(--globals--texts--basic)]',
            trailing: 'pe-3 text-[var(--globals--texts--basic)]',
          }"
        />

        <UButton
          icon="i-heroicons-plus"
          class="h-[3rem] text-white cursor-pointer"
          @click="openCreate"
          :disabled="loadingAny"
        >
          Pievienot
        </UButton>
      </div>
    </div>

    <UAlert
      v-if="error"
      title="Kļūda"
      description="Neizdevās ielādēt eksemplārus."
      icon="i-heroicons-exclamation-triangle"
    />

    <CopiesCopyList
      v-else
      :copies="copies"
      :search-term="searchTerm"
      :is-loading="pending"
      @edit="openEdit"
      @delete="openDelete"
    />

    <CopiesCopyFormModal
      v-model:open="isFormOpen"
      :initial="selected"
      :books="books"
      :loading="saving"
      @submit="submitCopy"
    />

    <CopiesDeleteCopyModal
      v-model:open="isDeleteOpen"
      :loading="deleting"
      :copy-label="deleteLabel"
      @confirm="confirmDelete"
    />
  </div>
</template>
