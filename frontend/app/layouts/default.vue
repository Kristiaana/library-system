<script setup lang="ts">
const headerHeightPx = 92;
</script>

<template>
  <div
    class="flex min-h-screen items-center bg-[var(--globals--backgrounds--basic)]"
  >
    <main
      class="flex-1 bg-[#f1f5f9]"
      :style="{ paddingTop: `${headerHeightPx}px` }"
    >
      <UContainer class="py-6">
        <slot />
      </UContainer>
    </main>
  </div>
</template>
