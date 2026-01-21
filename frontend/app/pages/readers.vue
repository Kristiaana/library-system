<script setup lang="ts">
definePageMeta({ layout: "main" });

type Reader = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  active: boolean;
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
    color: "warning", // ja tev strādā "danger", vari nomainīt uz "danger"
  });
}

const searchTerm = ref("");

const {
  data: readers,
  pending,
  error,
  refresh,
} = await useFetch<Reader[]>(`${api}/readers`, { default: () => [] });

/* ---------- modal state ---------- */
const isFormOpen = ref(false);
const formMode = ref<"create" | "edit">("create");
const selected = ref<Reader | null>(null);

const isDeleteOpen = ref(false);
const deleteTarget = ref<Reader | null>(null);

const saving = ref(false);
const deleting = ref(false);

function openCreate() {
  formMode.value = "create";
  selected.value = null;
  isFormOpen.value = true;
}

function openEdit(id: number) {
  const r = (readers.value ?? []).find((x) => x.id === id) ?? null;
  if (!r) return;
  formMode.value = "edit";
  selected.value = r;
  isFormOpen.value = true;
}

function openDelete(id: number) {
  const r = (readers.value ?? []).find((x) => x.id === id) ?? null;
  if (!r) return;
  deleteTarget.value = r;
  isDeleteOpen.value = true;
}

/* ---------- API actions ---------- */
async function submitReader(payload: {
  firstName: string;
  lastName: string;
  email: string;
  active: boolean;
}) {
  saving.value = true;

  try {
    if (formMode.value === "create") {
      await $fetch(`${api}/readers`, { method: "POST", body: payload });
      toastSuccess("201: Reader created");
    } else {
      if (!selected.value) return;
      await $fetch(`${api}/readers/${selected.value.id}`, {
        method: "PATCH",
        body: payload,
      });
      toastSuccess("200: Reader updated");
    }

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
    await $fetch(`${api}/readers/${deleteTarget.value.id}`, {
      method: "DELETE",
    });

    toastSuccess("200: Reader deleted");

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
  const r = deleteTarget.value;
  if (!r) return "";
  return `${r.firstName} ${r.lastName} (${r.email})`;
});
</script>

<template>
  <div class="flex flex-col gap-5">
    <div class="flex items-center justify-between">
      <h1>Lasītāji</h1>

      <div class="flex items-center gap-3">
        <!-- Tavs standarta search input -->
        <UInput
          v-model="searchTerm"
          placeholder="Meklēt pēc vārda vai e-pasta..."
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
        >
          Pievienot
        </UButton>
      </div>
    </div>

    <UAlert
      v-if="error"
      title="Error"
      description="Failed to load readers."
      icon="i-heroicons-exclamation-triangle"
    />

    <ReadersReaderList
      v-else
      :readers="readers"
      :search-term="searchTerm"
      :is-loading="pending"
      @edit="openEdit"
      @delete="openDelete"
    />

    <!-- Create/Edit modal -->
    <ReadersReaderFormModal
      v-model:open="isFormOpen"
      :mode="formMode"
      :initial="selected"
      :loading="saving"
      @submit="submitReader"
    />

    <!-- Delete modal -->
    <ReadersDeleteReaderModal
      v-model:open="isDeleteOpen"
      :loading="deleting"
      :reader-label="deleteLabel"
      @confirm="confirmDelete"
    />
  </div>
</template>
