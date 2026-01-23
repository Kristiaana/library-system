<script setup lang="ts">
import type { FormError, FormSubmitEvent } from "#ui/types";

type Book = {
  id: number;
  title: string;
  author: string;
  genre?: string | null;
  isbn?: string | null;
  createdAt: string;
};

type BookFormState = {
  title: string;
  author: string;
  genre: string | null;
  isbn: string | null;
};

const props = defineProps<{
  open: boolean;
  mode: "create" | "edit";
  initial?: Partial<Book> | null;
  loading?: boolean;
}>();

const emit = defineEmits<{
  (e: "update:open", v: boolean): void;
  (
    e: "submit",
    payload: {
      title: string;
      author: string;
      genre?: string | null;
      isbn?: string | null;
    },
  ): void;
}>();

const state = reactive<BookFormState>({
  title: props.initial?.title ?? "",
  author: props.initial?.author ?? "",
  genre: props.initial?.genre ?? null,
  isbn: props.initial?.isbn ?? null,
});

watch(
  () => [props.open, props.initial, props.mode] as const,
  () => {
    state.title = props.initial?.title ?? "";
    state.author = props.initial?.author ?? "";
    state.genre = props.initial?.genre ?? null;
    state.isbn = props.initial?.isbn ?? null;
  },
  { deep: true },
);

const titleText = computed(() =>
  props.mode === "create" ? "Pievienot grāmatu" : "Labot grāmatu",
);

const validate = (s: BookFormState): FormError[] => {
  const errors: FormError[] = [];

  const t = (s.title ?? "").trim();
  const a = (s.author ?? "").trim();
  const g = (s.genre ?? "").trim();
  const i = (s.isbn ?? "").trim();

  if (!t) errors.push({ name: "title", message: "Nosaukums ir obligāts." });
  if (t.length > 200)
    errors.push({ name: "title", message: "Maks. 200 simboli." });

  if (!a) errors.push({ name: "author", message: "Autors ir obligāts." });
  if (a.length > 120)
    errors.push({ name: "author", message: "Maks. 120 simboli." });

  if (g.length > 60)
    errors.push({ name: "genre", message: "Maks. 60 simboli." });
  if (i.length > 20)
    errors.push({ name: "isbn", message: "Maks. 20 simboli." });

  return errors;
};

function onSubmit(e: FormSubmitEvent<BookFormState>) {
  emit("submit", {
    title: e.data.title.trim(),
    author: e.data.author.trim(),
    genre: e.data.genre?.trim() ? e.data.genre.trim() : null,
    isbn: e.data.isbn?.trim() ? e.data.isbn.trim() : null,
  });
}

function close() {
  emit("update:open", false);
}
</script>

<template>
  <UModal
    :open="open"
    @update:open="(v) => emit('update:open', v)"
    :close="false"
    :dismissible="false"
    :ui="{
      content:
        'max-w-2xl fixed divide-y flex flex-col focus:outline-none !bg-[var(--globals--backgrounds--lighter)] !border border-[var(--globals--strokes--block)] !ring-0 !shadow-none !outline-none !rounded-2xl',
      body: 'space-y-4 !bg-[var(--globals--backgrounds--lighter)] !rounded-2xl border-none',
      overlay:
        'fixed inset-0 bg-black/20 backdrop-blur-sm transition-all duration-300',
    }"
  >
    <template #body>
      <div class="flex justify-between items-center">
        <h1 class="!text-xl !text-[var(--globals--texts--basic)]">
          {{ titleText }}
        </h1>

        <UButton
          icon="i-heroicons-x-mark"
          size="md"
          color="primary"
          variant="outline"
          class="w-[3rem] h-[3rem] flex items-center justify-center cursor-pointer"
          @click="close"
        />
      </div>

      <UForm
        :state="state"
        :validate="validate"
        :validate-on="[]"
        @submit.prevent="onSubmit"
      >
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <UFormField name="title" label="" class="md:col-span-2">
            <CommonInputField
              id="book-title"
              v-model="state.title"
              label="Nosaukums"
              icon="i-heroicons-book-open"
              :required="true"
              :disabled="!!loading"
            />
          </UFormField>

          <UFormField name="author" label="" class="md:col-span-2">
            <CommonInputField
              id="book-author"
              v-model="state.author"
              label="Autors"
              icon="i-heroicons-user"
              :required="true"
              :disabled="!!loading"
            />
          </UFormField>

          <UFormField name="genre" label="">
            <CommonInputField
              id="book-genre"
              v-model="state.genre"
              label="Žanrs"
              icon="i-heroicons-tag"
              :disabled="!!loading"
            />
          </UFormField>

          <UFormField name="isbn" label="">
            <CommonInputField
              id="book-isbn"
              v-model="state.isbn"
              label="ISBN"
              icon="i-heroicons-hashtag"
              :disabled="!!loading"
            />
          </UFormField>
        </div>

        <div
          class="flex flex-col-reverse gap-3 mt-5 md:flex-row md:justify-end"
        >
          <UButton
            variant="outline"
            class="h-[3rem] flex justify-center cursor-pointer"
            :disabled="!!loading"
            @click="close"
          >
            Atcelt
          </UButton>

          <UButton
            type="submit"
            class="h-[3rem] text-white flex justify-center cursor-pointer"
            :loading="!!loading"
          >
            Saglabāt
          </UButton>
        </div>
      </UForm>
    </template>
  </UModal>
</template>
