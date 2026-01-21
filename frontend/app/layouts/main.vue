<script setup lang="ts">
const headerHeightPx = 92; // līdzīgi kā tavā projektā
</script>

<template>
  <div class="flex flex-col min-h-screen">
    <!-- Fixed Header -->
    <MainLayoutHeader
      class="fixed top-0 left-0 w-full z-50 border-b border-[#E2E8F0] bg-[#F8FAFC]"
      :style="{ height: `${headerHeightPx}px` }"
    />

    <!-- Main Content -->
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
