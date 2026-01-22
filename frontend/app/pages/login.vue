<script setup lang="ts">
import { useAuth } from "~/composables/useAuth";

definePageMeta({ layout: "default" });

const { $api } = useNuxtApp();
const { setToken, token } = useAuth();
const isAuthed = computed(() => !!token.value);

const email = ref("");
const password = ref("");
const loading = ref(false);
const errorText = ref<string | null>(null);

watch(
  () => isAuthed.value,
  (v) => {
    if (v) navigateTo("/");
  },
  { immediate: true },
);

async function submit() {
  errorText.value = null;
  loading.value = true;

  try {
    const config = useRuntimeConfig();

    const res = await $fetch<{ access_token: string }>(
      `${config.public.apiBase}/auth/login`,
      {
        method: "POST",
        body: { email: email.value, password: password.value },
      },
    );

    setToken(res.access_token);
    await navigateTo("/loans");
  } catch (e: any) {
    errorText.value = e?.data?.message
      ? String(e.data.message)
      : "Login neizdevās";
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div
    class="max-w-md mx-auto mt-10 border border-[var(--globals--strokes--block)] bg-[var(--globals--backgrounds--lighter)] rounded-2xl p-6"
  >
    <h1 class="text-xl font-semibold text-[var(--globals--texts--basic)]">
      Pieslēgties
    </h1>

    <div v-if="errorText" class="mt-4 text-sm text-red-600">
      {{ errorText }}
    </div>

    <form class="mt-5 space-y-4" @submit.prevent="submit">
      <CommonInputField
        icon="i-heroicons-user"
        id="login-email"
        v-model="email"
        label="E-pasts"
        :required="true"
        :disabled="loading"
      />

      <CommonInputField
        icon="i-heroicons-lock-closed"
        id="login-pass"
        v-model="password"
        label="Parole"
        :required="true"
        :disabled="loading"
        :is-password="true"
      />

      <div class="pt-2 flex justify-end">
        <UButton
          type="submit"
          class="h-[3rem] cursor-pointer text-white"
          :loading="loading"
        >
          Pieslēgties
        </UButton>
      </div>
    </form>
  </div>
</template>
