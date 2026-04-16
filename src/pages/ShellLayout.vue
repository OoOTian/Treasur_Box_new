<template>
  <div class="h-full">
    <el-container class="h-full">
      <el-aside :width="isCollapsed ? '72px' : '240px'" class="border-r border-[var(--border)] bg-white">
        <div class="flex h-14 items-center justify-between gap-2 px-3">
          <div class="flex min-w-0 items-center gap-2">
            <div class="grid h-9 w-9 place-items-center rounded-lg bg-[var(--primary)] text-white">
              <WandSparkles :size="18" />
            </div>
            <div v-if="!isCollapsed" class="min-w-0">
              <div class="truncate text-sm font-semibold">工具箱</div>
              <div class="truncate text-xs text-muted">文本处理小工具</div>
            </div>
          </div>
          <el-button :text="true" class="!px-2" @click="toggleCollapsed">
            <PanelLeftClose v-if="!isCollapsed" :size="18" />
            <PanelLeftOpen v-else :size="18" />
          </el-button>
        </div>

        <el-menu :default-active="activePath" :collapse="isCollapsed" class="!border-r-0" @select="onSelect">
          <el-menu-item index="/tools/keyword-picker">
            <Tag :size="18" />
            <template #title>限定词选取</template>
          </el-menu-item>
          <el-menu-item index="/tools/segment-picker">
            <Split :size="18" />
            <template #title>文本分段+限定词</template>
          </el-menu-item>
          <el-menu-item index="/tools/ocr-cleaner">
            <Eraser :size="18" />
            <template #title>OCR无关信息删除</template>
          </el-menu-item>
        </el-menu>
      </el-aside>

      <el-container>
        <el-main class="!p-0">
          <router-view />
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Eraser, PanelLeftClose, PanelLeftOpen, Split, Tag, WandSparkles } from 'lucide-vue-next'

const router = useRouter()
const route = useRoute()

const isCollapsed = ref(typeof window !== 'undefined' ? window.matchMedia('(max-width: 1023px)').matches : false)
const activePath = computed(() => String(route.path))

function toggleCollapsed() {
  isCollapsed.value = !isCollapsed.value
}

function onSelect(index: string) {
  if (index !== route.path) {
    router.push(index)
  }
}
</script>
