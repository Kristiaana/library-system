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

type SubmitBookPayload = {
  title: string;
  author: string;
  genre?: string | null;
  isbn?: string | null;
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
  data: books,
  pending,
  error,
  refresh: refreshBooks,
} = await useFetch<Book[]>(`${api}/books`, { default: () => [] });

const isFormOpen = ref(false);
const formMode = ref<"create" | "edit">("create");
const selected = ref<Book | null>(null);

const isDeleteOpen = ref(false);
const deleteTarget = ref<Book | null>(null);

const saving = ref(false);
const deleting = ref(false);

function openCreate() {
  formMode.value = "create";
  selected.value = null;
  isFormOpen.value = true;
}

function openEdit(id: number) {
  const b = (books.value ?? []).find((x) => x.id === id) ?? null;
  if (!b) return;
  formMode.value = "edit";
  selected.value = b;
  isFormOpen.value = true;
}

function openDelete(id: number) {
  const b = (books.value ?? []).find((x) => x.id === id) ?? null;
  if (!b) return;
  deleteTarget.value = b;
  isDeleteOpen.value = true;
}

async function submitBook(payload: SubmitBookPayload) {
  saving.value = true;

  try {
    if (formMode.value === "create") {
      await $fetch(`${api}/books`, { method: "POST", body: payload });
      toastSuccess("201: Book created");
    } else {
      if (!selected.value) return;
      await $fetch(`${api}/books/${selected.value.id}`, {
        method: "PATCH",
        body: payload,
      });
      toastSuccess("200: Book updated");
    }

    isFormOpen.value = false;
    selected.value = null;
    await refreshBooks();
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
    await $fetch(`${api}/books/${deleteTarget.value.id}`, {
      method: "DELETE",
    });

    toastSuccess("200: Book deleted");

    isDeleteOpen.value = false;
    deleteTarget.value = null;
    await refreshBooks();
  } catch (e: any) {
    toastError(e);
  } finally {
    deleting.value = false;
  }
}

const deleteLabel = computed(() => {
  const b = deleteTarget.value;
  if (!b) return "";
  return `${b.title} — ${b.author}`;
});
</script>

<template>
  <div class="flex flex-col gap-5">
    <div class="flex items-center justify-between">
      <h1>Grāmatas</h1>

      <div class="flex items-center gap-3">
        <UInput
          v-model="searchTerm"
          placeholder="Meklēt pēc nosaukuma, autora, žanra vai ISBN..."
          trailing-icon="i-heroicons-magnifying-glass"
          class="w-72"
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
          :disabled="!!pending"
        >
          Pievienot
        </UButton>
      </div>
    </div>

    <UAlert
      v-if="error"
      title="Kļūda"
      description="Neizdevās ielādēt grāmatas."
      icon="i-heroicons-exclamation-triangle"
    />

    <BooksBookList
      v-else
      :books="books"
      :search-term="searchTerm"
      :is-loading="pending"
      @edit="openEdit"
      @delete="openDelete"
    />

    <BooksBookFormModal
      v-model:open="isFormOpen"
      :mode="formMode"
      :initial="selected"
      :loading="saving"
      @submit="submitBook"
    />

    <BooksDeleteBookModal
      v-model:open="isDeleteOpen"
      :loading="deleting"
      :book-label="deleteLabel"
      @confirm="confirmDelete"
    />
  </div>
</template>
