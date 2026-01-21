<script setup lang="ts">
const props = defineProps<{
  open: boolean;
  loading?: boolean;
  bookLabel?: string;
}>();

const emit = defineEmits<{
  (e: "update:open", v: boolean): void;
  (e: "confirm"): void;
}>();
</script>

<template>
  <UModal
    :open="open"
    @update:open="(v) => emit('update:open', v)"
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
        Dzēst grāmatu?
      </h3>

      <p class="text-sm text-[var(--globals--texts--secondary)]">
        {{ `Tiks dzēsta: ${bookLabel}` }}
      </p>

      <div class="flex flex-col sm:flex-row justify-between gap-3">
        <UButton
          variant="outline"
          class="cursor-pointer h-[3rem] flex justify-center"
          :disabled="!!loading"
          @click="emit('update:open', false)"
        >
          Atcelt
        </UButton>

        <UButton
          icon="i-heroicons-trash"
          color="error"
          variant="outline"
          class="cursor-pointer h-[3rem] flex justify-center"
          :loading="!!loading"
          @click="emit('confirm')"
        >
          Dzēst
        </UButton>
      </div>
    </template>
  </UModal>
</template>
