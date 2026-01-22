<script setup lang="ts">
import { useRoute } from "vue-router";
import { useAuth } from "~/composables/useAuth";

const route = useRoute();
const router = useRouter();
const { logout } = useAuth();

const links = [
  { to: "/", label: "Pārskats" },
  { to: "/readers", label: "Lasītāji" },
  { to: "/books", label: "Grāmatas" },
  { to: "/copies", label: "Eksemplāri" },
  { to: "/loans", label: "Izsniegtās grāmatas" },
];

const isActive = (to: string) => route.path === to;

const doLogout = () => {
  logout();
  router.push("/login");
};
</script>

<template>
  <header
    class="w-full border-b border-gray-200 bg-[var(--globals--backgrounds--lighter)] flex items-center"
  >
    <UContainer class="flex items-center justify-between h-14">
      <div class="flex gap-1">
        <UButton
          v-for="l in links"
          :key="l.to"
          :to="l.to"
          variant="ghost"
          class="text-md hover:bg-transparent"
          :class="isActive(l.to) ? 'text-primary' : 'text-black'"
        >
          {{ l.label }}
        </UButton>
      </div>

      <UButton
        icon="i-heroicons-arrow-right-on-rectangle"
        variant="ghost"
        class="cursor-pointer text-md"
        @click="doLogout"
      >
        Izlogoties
      </UButton>
    </UContainer>
  </header>
</template>
