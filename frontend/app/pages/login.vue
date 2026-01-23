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

const showTestUserModal = ref(false);

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
    <div class="flex justify-between items-center">
      <h1 class="text-xl font-semibold text-[var(--globals--texts--basic)]">
        Pieslēgties
      </h1>
      <UButton
        icon="i-heroicons-information-circle"
        variant="ghost"
        size="xl"
        class="text-[var(--globals--texts--basic)] h-[3rem] cursor-pointer w-[3rem] flex justify-center"
        @click="showTestUserModal = true"
      ></UButton>
    </div>

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

      <div class="pt-2 flex justify-end items-center">
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
  <UModal
    v-model:open="showTestUserModal"
    :close="true"
    :ui="{
      header: 'hidden',
      content:
        'max-w-2xl fixed divide-y flex flex-col focus:outline-none !bg-[var(--globals--backgrounds--lighter)] !border border-[var(--globals--strokes--block)] !ring-0 !shadow-none !outline-none !rounded-2xl',
      body: '!p-0 !bg-[var(--globals--backgrounds--lighter)] !rounded-2xl border-none',
      overlay:
        'fixed inset-0 bg-black/20 backdrop-blur-sm transition-all duration-300',
    }"
  >
    <template #body>
      <div class="relative p-6 rounded-2xl space-y-4">
        <h2 class="text-lg font-semibold pr-[3.5rem]">Testa vides piekļuve</h2>

        <div class="text-sm bg-[var(--globals--backgrounds--block)] rounded-xl">
          <div><strong>E-pasts:</strong> admin@local.test</div>
          <div><strong>Parole:</strong> admin123</div>
        </div>

        <div class="flex justify-end pt-2">
          <UButton
            @click="showTestUserModal = false"
            class="h-[3rem] text-white cursor-pointer"
            >Aizvērt</UButton
          >
        </div>
      </div>
    </template>
  </UModal>
</template>
