<script setup lang="ts">
import type { DateValue } from "@internationalized/date";
import { CalendarDate, getLocalTimeZone, today } from "@internationalized/date";

definePageMeta({ layout: "main" });

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

type Loan = {
  id: number;
  reader: Reader;
  copy: BookCopy;
  loanDate: string;
  dueDate: string;
  returnDate?: string | null;
};

const config = useRuntimeConfig();
const api = config.public.apiBase;

/* ---------------- toast helpers ---------------- */
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

/* ---------------- fetch ---------------- */
const searchTerm = ref("");

const {
  data: loans,
  pending: pendingLoans,
  error: errorLoans,
  refresh: refreshLoans,
} = await useFetch<Loan[]>(`${api}/loans`, { default: () => [] });

const {
  data: readers,
  pending: pendingReaders,
  error: errorReaders,
} = await useFetch<Reader[]>(`${api}/readers`, { default: () => [] });

const {
  data: copies,
  pending: pendingCopies,
  error: errorCopies,
  refresh: refreshCopies,
} = await useFetch<BookCopy[]>(`${api}/book-copies`, { default: () => [] });

const pendingAny = computed(
  () => pendingLoans.value || pendingReaders.value || pendingCopies.value,
);

const errorAny = computed(
  () => errorLoans.value || errorReaders.value || errorCopies.value,
);

/* ---------------- issue form state ---------------- */
const creating = ref(false);

function defaultDueDate(): DateValue {
  return (today(getLocalTimeZone()) as any).add({
    days: 7,
  }) as unknown as DateValue;
}

const issueState = reactive<{
  readerId: number | null;
  copyId: number | null;
  dueDate: DateValue | null;
}>({
  readerId: null,
  copyId: null,
  dueDate: defaultDueDate(),
});

const readerItems = computed(() =>
  (readers.value ?? [])
    .filter((r) => r.active !== false)
    .map((r) => ({
      label: `${r.firstName} ${r.lastName} — ${r.email}`,
      value: r.id,
    })),
);

const copyItems = computed(() =>
  (copies.value ?? [])
    .filter((c) => c.status === "AVAILABLE")
    .map((c) => ({
      label: `${c.inventoryCode} — ${c.book?.title ?? "-"} (${c.location})`,
      value: c.id,
    })),
);

const dueLabel = computed(() => {
  if (!issueState.dueDate) return "Izvēlieties datumu";
  const v: any = issueState.dueDate;
  return `${v.year}-${String(v.month).padStart(2, "0")}-${String(v.day).padStart(2, "0")}`;
});

const isDateDisabled = (date: DateValue) => {
  const t = today(getLocalTimeZone());
  const d = new CalendarDate(
    (date as any).year,
    (date as any).month,
    (date as any).day,
  );
  return d.compare(t) <= 0;
};

async function createLoan() {
  if (!issueState.readerId || !issueState.copyId || !issueState.dueDate) {
    toastError({
      data: { statusCode: 400, message: "Aizpildiet visus laukus." },
    });
    return;
  }

  creating.value = true;
  try {
    const v: any = issueState.dueDate;
    const ymd = `${v.year}-${String(v.month).padStart(2, "0")}-${String(v.day).padStart(2, "0")}`;
    const dueIso = new Date(`${ymd}T00:00:00.000Z`).toISOString();

    await $fetch(`${api}/loans`, {
      method: "POST",
      body: {
        readerId: Number(issueState.readerId),
        copyId: Number(issueState.copyId),
        dueDate: dueIso,
      },
    });

    toastSuccess("201: Loan created");

    issueState.readerId = null;
    issueState.copyId = null;
    issueState.dueDate = defaultDueDate();

    await Promise.all([refreshLoans(), refreshCopies()]);
  } catch (e: any) {
    toastError(e);
  } finally {
    creating.value = false;
  }
}

/* ---------------- return confirmation modal ---------------- */
const isReturnOpen = ref(false);
const returnTarget = ref<Loan | null>(null);
const returning = ref(false);

function openReturnById(id: number) {
  const l = (loans.value ?? []).find((x) => x.id === id) ?? null;
  if (!l) return;
  returnTarget.value = l;
  isReturnOpen.value = true;
}

const returnLabel = computed(() => {
  const l = returnTarget.value;
  if (!l) return "";
  const inv = l.copy?.inventoryCode ?? "-";
  const book = l.copy?.book?.title ?? "-";
  const reader =
    `${l.reader?.firstName ?? ""} ${l.reader?.lastName ?? ""}`.trim();
  return `${inv} — ${book} (${reader})`;
});

async function confirmReturn() {
  if (!returnTarget.value) return;

  returning.value = true;
  try {
    await $fetch(`${api}/loans/${returnTarget.value.id}/return`, {
      method: "PATCH",
    });

    toastSuccess("200: Loan returned");

    isReturnOpen.value = false;
    returnTarget.value = null;

    await Promise.all([refreshLoans(), refreshCopies()]);
  } catch (e: any) {
    toastError(e);
  } finally {
    returning.value = false;
  }
}
</script>

<template>
  <div class="flex flex-col gap-5">
    <div class="flex items-center justify-between">
      <h1>Izsniegtās grāmatas</h1>
      <UInput
        v-model="searchTerm"
        placeholder="Meklēt pēc lasītāja, inventāra koda, grāmatas..."
        trailing-icon="i-heroicons-magnifying-glass"
        class="w-80"
        :ui="{
          base: 'px-3 py-3 text-base text-black !placeholder-[var(--inputs--placeholders--default)] !bg-[var(--inputs--backgrounds--default)] gap-2 ring ring-[var(--inputs--strokes--default)] rounded-md',
          leading: 'ps-3 text-[var(--globals--texts--basic)]',
          trailing: 'pe-3 text-[var(--globals--texts--basic)]',
        }"
      />
    </div>

    <UAlert
      v-if="errorAny"
      title="Kļūda"
      description="Neizdevās ielādēt izsniegtās grāmatas/lasītājus/eksemplārus."
      icon="i-heroicons-exclamation-triangle"
    />

    <div
      v-else
      class="border bg-[var(--globals--backgrounds--lighter)] border-[var(--globals--strokes--block)] p-[1.1rem] md:p-[2.5rem] rounded-2xl"
    >
      <h2
        class="text-lg font-semibold text-[var(--globals--texts--basic)] mb-4"
      >
        Izsniegt eksemplāru
      </h2>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
        <div>
          <USelectMenu
            v-model="issueState.readerId!"
            :items="readerItems"
            label-key="label"
            value-key="value"
            placeholder="Lasītājs"
            icon="i-heroicons-user"
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
          />
        </div>

        <div>
          <USelectMenu
            v-model="issueState.copyId!"
            :items="copyItems"
            label-key="label"
            value-key="value"
            placeholder="Eksemplārs (AVAILABLE)"
            icon="i-heroicons-archive-box"
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
          />
        </div>

        <div>
          <UPopover
            :teleport="true"
            :popper="{ strategy: 'fixed', placement: 'bottom-start' }"
            :ui="{
              content:
                'z-[9999] rounded-xl shadow-xl ring ring-[var(--globals--strokes--block)] bg-[var(--inputs--backgrounds--default)] text-[var(--globals--texts--basic)] p-0',
            }"
          >
            <UButton
              color="neutral"
              variant="subtle"
              icon="i-lucide-calendar"
              class="w-full"
              :ui="{
                base: 'w-full justify-start gap-2 h-[3rem]  bg-[var(--inputs--backgrounds--default)] text-[var(--globals--texts--basic)] rounded-md ring ring-[var(--inputs--strokes--default)]',
                leadingIcon: 'size-4',
              }"
            >
              {{ dueLabel }}
            </UButton>

            <template #content>
              <UCalendar
                :model-value="issueState.dueDate as any"
                @update:model-value="(v: any) => (issueState.dueDate = v)"
                locale="lv-LV"
                :first-day-of-week="1"
                color="primary"
                class="p-2"
                :is-date-disabled="isDateDisabled"
                :ui="{
                  root: 'rounded-xl bg-[var(--inputs--backgrounds--default)] text-[var(--globals--texts--basic)]',
                  header:
                    'flex items-center justify-between text-[var(--globals--texts--basic)] [&_button]:text-[var(--globals--texts--basic)] [&_svg]:text-[var(--globals--texts--basic)]',
                }"
              />
            </template>
          </UPopover>
        </div>
      </div>

      <div class="flex justify-end mt-4">
        <UButton
          icon="i-heroicons-plus"
          class="h-[3rem] text-white cursor-pointer"
          :loading="creating"
          @click="createLoan"
        >
          Izsniegt
        </UButton>
      </div>
    </div>

    <!-- Table component -->
    <LoansLoanList
      v-if="!errorAny"
      :loans="loans"
      :search-term="searchTerm"
      :is-loading="pendingAny"
      @return="openReturnById"
    />

    <!-- Return confirm modal -->
    <UModal
      :open="isReturnOpen"
      @update:open="(v) => (isReturnOpen = v)"
      :close="false"
      :dismissible="false"
      :ui="{
        content:
          'w-[90vw] max-w-[360px] fixed divide-y flex flex-col focus:outline-none !bg-[var(--globals--backgrounds--basic)] !border border-[var(--globals--strokes--block)] !ring-0 !shadow-none !outline-none !rounded-2xl',
        body: 'space-y-4 !bg-[var(--globals--backgrounds--basic)] !rounded-2xl border-none',
        overlay:
          'fixed inset-0 bg-black/20 backdrop-blur-sm transition-all duration-300',
      }"
    >
      <template #body>
        <h3 class="text-lg font-semibold text-[var(--globals--texts--basic)]">
          Atgriezt grāmatu?
        </h3>

        <p class="text-sm text-[var(--globals--texts--secondary)]">
          {{ returnLabel }}
        </p>

        <div class="flex flex-col sm:flex-row justify-between gap-3">
          <UButton
            variant="outline"
            class="cursor-pointer h-[3rem] flex justify-center"
            :disabled="!!returning"
            @click="isReturnOpen = false"
          >
            Atcelt
          </UButton>

          <UButton
            icon="i-heroicons-arrow-uturn-left"
            color="primary"
            variant="solid"
            class="cursor-pointer h-[3rem] flex justify-center text-white"
            :loading="!!returning"
            @click="confirmReturn"
          >
            Atgriezt
          </UButton>
        </div>
      </template>
    </UModal>
  </div>
</template>
