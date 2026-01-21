<script setup lang="ts">
import type { FormError, FormSubmitEvent } from "#ui/types";

type Reader = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  active: boolean;
  createdAt: string;
};

type ReaderFormState = {
  firstName: string;
  lastName: string;
  email: string;
  active: boolean;
};

const props = defineProps<{
  open: boolean;
  mode: "create" | "edit";
  initial?: Partial<Reader> | null;
  loading?: boolean;
}>();

const emit = defineEmits<{
  (e: "update:open", v: boolean): void;
  (e: "submit", payload: ReaderFormState): void;
}>();

/* ---------------- state ---------------- */
const state = reactive<ReaderFormState>({
  firstName: props.initial?.firstName ?? "",
  lastName: props.initial?.lastName ?? "",
  email: props.initial?.email ?? "",
  active: props.initial?.active ?? true,
});

watch(
  () => [props.open, props.initial, props.mode] as const,
  () => {
    state.firstName = props.initial?.firstName ?? "";
    state.lastName = props.initial?.lastName ?? "";
    state.email = props.initial?.email ?? "";
    state.active = props.initial?.active ?? true;
  },
  { deep: true },
);

const title = computed(() =>
  props.mode === "create" ? "Pievienot lasītāju" : "Labot lasītāju",
);

/* ---------------- validation ---------------- */
const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

const validate = (s: ReaderFormState): FormError[] => {
  const errors: FormError[] = [];

  const fn = (s.firstName ?? "").trim();
  const ln = (s.lastName ?? "").trim();
  const em = (s.email ?? "").trim();

  if (!fn) errors.push({ name: "firstName", message: "Vārds ir obligāts." });
  if (fn.length > 60)
    errors.push({ name: "firstName", message: "Maks. 60 simboli." });

  if (!ln) errors.push({ name: "lastName", message: "Uzvārds ir obligāts." });
  if (ln.length > 60)
    errors.push({ name: "lastName", message: "Maks. 60 simboli." });

  if (!em) errors.push({ name: "email", message: "E-pasts ir obligāts." });
  else if (!isEmail(em))
    errors.push({ name: "email", message: "Ievadiet derīgu e-pastu." });
  if (em.length > 120)
    errors.push({ name: "email", message: "Maks. 120 simboli." });

  return errors;
};

/* ---------------- submit / close ---------------- */
function onSubmit(e: FormSubmitEvent<ReaderFormState>) {
  emit("submit", {
    firstName: e.data.firstName.trim(),
    lastName: e.data.lastName.trim(),
    email: e.data.email.trim(),
    active: !!e.data.active,
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
          {{ title }}
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

      <!-- ✅ validate only on submit -->
      <UForm
        :state="state"
        :validate="validate"
        :validate-on="[]"
        @submit.prevent="onSubmit"
      >
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <!-- firstName (required *) -->
          <UFormField name="firstName">
            <CommonInputField
              icon="i-heroicons-user"
              id="reader-firstName"
              v-model="state.firstName"
              label="Vārds"
              :required="true"
              :disabled="!!loading"
            />
          </UFormField>

          <!-- lastName (required *) -->
          <UFormField name="lastName">
            <CommonInputField
              icon="i-heroicons-user"
              id="reader-lastName"
              v-model="state.lastName"
              label="Uzvārds"
              :required="true"
              :disabled="!!loading"
            />
          </UFormField>

          <!-- email (required *) -->
          <UFormField name="email" class="md:col-span-2">
            <CommonInputField
              icon="i-heroicons-envelope"
              id="reader-email"
              v-model="state.email"
              label="E-pasts"
              :required="true"
              :disabled="!!loading"
            />
          </UFormField>

          <!-- active -->
          <UFormField name="active" class="md:col-span-2">
            <UCheckbox
              v-model="state.active"
              size="xl"
              :label="'Aktīvs lasītājs'"
              class="text-[var(--globals--texts--basic)]"
              :ui="{
                base: 'rounded-sm ring ring-inset bg-transparent ring-[var(--inputs--strokes--default)]',
                label: 'text-[var(--globals--texts--basic)] font-normal',
                icon: 'text-white',
              }"
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
