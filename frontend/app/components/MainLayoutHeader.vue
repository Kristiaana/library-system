<script setup lang="ts">
import { useRoute } from "vue-router";

const route = useRoute();

const links = [
  { to: "/reports", label: "Pārskats" },
  { to: "/readers", label: "Lasītāji" },
  { to: "/books", label: "Grāmatas" },
  { to: "/copies", label: "Eksemplāri" },
  { to: "/loans", label: "Izsniegtās grāmatas" },
];

const isActive = (to: string) => {
  return route.path === to;
};
</script>

<template>
  <header class="w-full">
    <UContainer class="w-full h-full flex justify-center">
      <div class="flex justify-end gap-1">
        <UButton
          v-for="l in links"
          :key="l.to"
          :to="l.to"
          class="text-md hover:bg-transparent"
          :class="isActive(l.to) ? 'text-primary' : 'text-black'"
          variant="ghost"
        >
          {{ l.label }}
        </UButton>
      </div>
    </UContainer>
  </header>
</template>
