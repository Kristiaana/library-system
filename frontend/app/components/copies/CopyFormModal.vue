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

type CopyFormState = {
  inventoryCode: string;
  location: string;
  bookId: number | null;
};

const props = defineProps<{
  open: boolean;
  books: Book[];
  loading?: boolean;
}>();

const emit = defineEmits<{
  (e: "update:open", v: boolean): void;
  (
    e: "submit",
    payload: { inventoryCode: string; location: string; bookId: number },
  ): void;
}>();

// state
const state = reactive<CopyFormState>({
  inventoryCode: "",
  location: "",
  bookId: null,
});

// reset when modal opens
watch(
  () => props.open,
  (isOpen) => {
    if (!isOpen) return;
    state.inventoryCode = "";
    state.location = "";
    state.bookId = null;
  },
);

// select options
const bookItems = computed(() =>
  (props.books ?? []).map((b) => ({
    label: `${b.title} — ${b.author}`,
    value: b.id,
  })),
);

// validation
const validate = (s: CopyFormState): FormError[] => {
  const errors: FormError[] = [];

  const inv = (s.inventoryCode ?? "").trim();
  const loc = (s.location ?? "").trim();

  if (!inv)
    errors.push({
      name: "inventoryCode",
      message: "Inventāra kods ir obligāts.",
    });
  if (inv.length > 80)
    errors.push({
      name: "inventoryCode",
      message: "Pārāk garš inventāra kods (maks. 80).",
    });

  if (!loc)
    errors.push({ name: "location", message: "Atrašanās vieta ir obligāta." });
  if (loc.length > 120)
    errors.push({
      name: "location",
      message: "Pārāk gara atrašanās vieta (maks. 120).",
    });

  if (!s.bookId || !Number.isFinite(Number(s.bookId))) {
    errors.push({ name: "bookId", message: "Izvēlieties grāmatu." });
  }

  return errors;
};

// submit/close
function onSubmit(e: FormSubmitEvent<CopyFormState>) {
  emit("submit", {
    inventoryCode: e.data.inventoryCode.trim(),
    location: e.data.location.trim(),
    bookId: Number(e.data.bookId),
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
          Pievienot eksemplāru
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
          <UFormField name="inventoryCode" label="">
            <CommonInputField
              id="copy-inventoryCode"
              v-model="state.inventoryCode"
              label="Inventāra kods"
              icon="i-heroicons-hashtag"
              :required="true"
              :disabled="!!loading"
            />
          </UFormField>

          <UFormField name="location" label="">
            <CommonInputField
              id="copy-location"
              v-model="state.location"
              label="Atrašanās vieta"
              icon="i-heroicons-map-pin"
              :required="true"
              :disabled="!!loading"
            />
          </UFormField>

          <UFormField name="bookId" label="" class="md:col-span-2">
            <USelectMenu
              v-model="state.bookId!"
              :items="bookItems"
              label-key="label"
              value-key="value"
              placeholder="Izvēlieties grāmatu"
              icon="i-heroicons-book-open"
              size="xl"
              class="w-full"
              :ui="{
                base: 'px-3 h-[3rem] py-3 text-base bg-[var(--inputs--backgrounds--default)] gap-2 ring ring-[var(--inputs--strokes--default)] rounded-md',
                value:
                  'truncate leading-none !text-[var(--globals--texts--basic)]',

                placeholder: 'text-[var(--inputs--placeholders--default)]',
                leading: 'ps-3 text-[var(--globals--texts--basic)]',
                trailing: 'pe-3 text-[var(--globals--texts--basic)]',
                content:
                  'bg-[var(--inputs--backgrounds--default)] shadow-lg rounded-xl ring ring-[var(--inputs--strokes--default)]',
                item:
                  'p-2 text-base text-[var(--globals--texts--basic)] bg-[var(--inputs--backgrounds--default)] rounded-md ' +
                  'data-[highlighted]:!text-[var(--globals--texts--basic)] data-[highlighted]:!bg-[var(--inputs--backgrounds--hover)] ' +
                  'data-[state=checked]:!text-[var(--globals--texts--basic)] data-[state=checked]:!bg-[var(--inputs--backgrounds--hover)]',
              }"
            >
              <template #leading>
                <div class="flex items-center gap-1">
                  <UIcon name="i-heroicons-book-open" class="size-5" />
                  <span
                    class="text-red-500 -ml-0.5 select-none"
                    aria-hidden="true"
                    title="Obligāts lauks"
                    >*</span
                  >
                </div>
              </template>
            </USelectMenu>
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
