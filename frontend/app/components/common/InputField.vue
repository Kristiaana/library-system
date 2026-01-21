<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";

const props = defineProps<{
  modelValue: string | number | null | undefined;
  label: string;
  id: string;

  /** Nuxt UI icon name, piem: "i-heroicons-user" */
  icon?: string;

  disabled?: boolean;
  required?: boolean;

  /** password mode */
  isPassword?: boolean;

  /** textarea mode */
  textarea?: boolean;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", v: string): void;
}>();

const inputRef = ref<HTMLTextAreaElement | null>(null);
const isPasswordVisible = ref(false);

const inputType = computed(() =>
  props.isPassword && !isPasswordVisible.value ? "password" : "text",
);

function setValue(v: string) {
  emit("update:modelValue", v);
}

function autoGrow() {
  if (!props.textarea || !inputRef.value) return;

  inputRef.value.style.height = "auto";
  const lineHeight = 24;
  const minHeight = lineHeight * 2;
  const scrollHeight = inputRef.value.scrollHeight;

  inputRef.value.style.height = `${Math.max(scrollHeight, minHeight)}px`;
}

watch(
  () => props.modelValue,
  () => autoGrow(),
  { flush: "post" },
);

onMounted(() => autoGrow());

const leadingPadding = computed(() => (props.icon ? "pl-10" : "pl-4"));
const trailingPadding = computed(() =>
  props.isPassword && !props.textarea ? "pr-10" : "pr-4",
);

const baseInputClasses = computed(() => [
  "peer w-full px-4 pt-5 pb-2 text-[16px]",
  "!bg-[var(--inputs--backgrounds--default)]",
  "!text-[var(--inputs--text--default)]",
  "border border-[var(--inputs--strokes--default)] rounded-lg",
  "focus:outline-none focus:ring-0 focus:border-[var(--globals--accents--accent-teal)]",
  "placeholder-transparent",
  leadingPadding.value,
  trailingPadding.value,
  props.disabled
    ? "!bg-[var(--inputs--backgrounds--disabled)] !text-[var(--inputs--strokes--disabled)] cursor-not-allowed opacity-100"
    : "",
]);

const labelClasses =
  "absolute left-9 top-0.5 text-[#94A3B8] transition-all " +
  "peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-base peer-placeholder-shown:text-[#94A3B8] " +
  "peer-focus:top-0.5 peer-focus:text-[11px] " +
  "text-[11px] bg-transparent px-1 select-none";

const eyeIcon = computed(() =>
  isPasswordVisible.value ? "i-heroicons-eye" : "i-heroicons-eye-slash",
);
</script>

<template>
  <div class="relative w-full">
    <!-- Leading icon -->
    <div
      v-if="props.icon"
      class="absolute left-3 top-1/2 -translate-y-1/3"
      aria-hidden="true"
    >
      <UIcon
        :name="props.icon"
        class="w-5 h-5 text-[var(--globals--texts--secondary)]"
      />
    </div>

    <!-- Input -->
    <input
      v-if="!props.textarea"
      :id="props.id"
      :value="props.modelValue ?? ''"
      :type="inputType"
      :disabled="props.disabled"
      :autocomplete="props.disabled ? 'off' : 'on'"
      :class="baseInputClasses"
      :placeholder="props.label"
      @input="setValue(($event.target as HTMLInputElement).value)"
    />

    <!-- Textarea -->
    <textarea
      v-else
      ref="inputRef"
      :id="props.id"
      :value="props.modelValue ?? ''"
      :disabled="props.disabled"
      :rows="1"
      :autocomplete="props.disabled ? 'off' : 'on'"
      class="resize-none overflow-hidden"
      :class="baseInputClasses"
      :placeholder="props.label"
      @input="
        (e) => {
          setValue((e.target as HTMLTextAreaElement).value);
          autoGrow();
        }
      "
    />

    <!-- Floating label (+ asterisk inside) -->
    <label :for="props.id" :class="labelClasses">
      {{ props.label }}
      <span v-if="props.required" class="text-red-500">*</span>
    </label>

    <!-- Password toggle -->
    <button
      v-if="props.isPassword && !props.textarea"
      type="button"
      class="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
      :disabled="props.disabled"
      @click="isPasswordVisible = !isPasswordVisible"
      aria-label="Toggle password visibility"
    >
      <UIcon
        :name="eyeIcon"
        class="w-5 h-5 text-[var(--globals--texts--secondary)]"
      />
    </button>
  </div>
</template>
