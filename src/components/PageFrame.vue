<template>
  <section class="min-h-full px-4 py-6 md:px-6">
    <div class="mx-auto w-full max-w-[1100px]">
      <header class="mb-4">
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            <h1 class="truncate text-lg font-semibold md:text-xl">{{ title }}</h1>
            <p v-if="description" class="mt-1 text-sm text-muted">{{ description }}</p>
          </div>
          <div v-if="$slots.actions" class="flex shrink-0 items-center gap-2">
            <slot name="actions" />
          </div>
        </div>
      </header>

      <div class="surface p-4 md:p-6">
        <slot />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps<{ title: string; description?: string }>()
</script>
