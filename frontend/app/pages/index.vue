<script setup lang="ts">
definePageMeta({ layout: "main" });

const config = useRuntimeConfig();
const api = config.public.apiBase;

type ActiveLoansResp = { activeLoans: number };
type OverdueLoansResp = { overdueLoans: number };

const {
  data: active,
  pending: p1,
  error: e1,
  refresh: r1,
} = await useFetch<ActiveLoansResp>(`${api}/reports/active-loans-count`, {
  default: () => ({ activeLoans: 0 }),
});

const {
  data: overdue,
  pending: p2,
  error: e2,
  refresh: r2,
} = await useFetch<OverdueLoansResp>(`${api}/reports/overdue-loans-count`, {
  default: () => ({ overdueLoans: 0 }),
});

const errorAny = computed(() => e1.value || e2.value);
</script>

<template>
  <div class="flex flex-col gap-5">
    <div class="flex items-center justify-between">
      <h1>Pārskats</h1>
    </div>

    <UAlert
      v-if="errorAny"
      title="Kļūda"
      description="Neizdevās ielādēt pārskatu."
      icon="i-heroicons-exclamation-triangle"
    />

    <div v-else class="flex gap-5">
      <div
        class="rounded-2xl border border-[var(--globals--strokes--block)] bg-[var(--globals--backgrounds--lighter)] p-5 flex flex-col gap-2 w-[20rem]"
      >
        <div class="flex items-center justify-between">
          <p
            class="text-sm font-semibold text-[var(--globals--texts--secondary)]"
          >
            Šobrīd izsniegtās grāmatas
          </p>
        </div>

        <div class="text-4xl font-semibold text-[var(--globals--texts--basic)]">
          <span v-if="p1">—</span>
          <span v-else>{{ active?.activeLoans ?? 0 }}</span>
        </div>
      </div>

      <div
        class="rounded-2xl border border-[var(--globals--strokes--block)] bg-[var(--globals--backgrounds--lighter)] p-5 flex flex-col gap-2 w-[20rem]"
      >
        <div class="flex items-center justify-between">
          <p
            class="text-sm font-semibold text-[var(--globals--texts--secondary)]"
          >
            Kavētie aizdevumi
          </p>
          <UBadge v-if="overdue?.overdueLoans > 0" color="error" variant="soft">
            UZMANĪBU
          </UBadge>
        </div>

        <div class="text-4xl font-semibold text-[var(--globals--texts--basic)]">
          <span v-if="p2">—</span>
          <span v-else>{{ overdue?.overdueLoans ?? 0 }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
