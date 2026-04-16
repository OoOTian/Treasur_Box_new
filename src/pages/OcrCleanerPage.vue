<template>
  <PageFrame title="OCR无关信息删除" description="勾选要删除的片段（可新增），一键处理并复制输出。">
    <div class="grid gap-4">
      <div class="grid gap-2">
        <div class="text-sm font-medium">输入你的内容</div>
        <el-input v-model="inputText" type="textarea" :rows="6" placeholder="输入你的内容" />
        <div class="flex flex-wrap gap-2">
          <el-button @click="clearInput">清空输入</el-button>
          <el-button type="primary" @click="processInput" :disabled="!inputText.trim()">处理文本</el-button>
        </div>
      </div>

      <div class="grid gap-2">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <div class="text-sm font-medium">需要删除的文本</div>
          <el-button type="primary" plain @click="showModal">添加删除对象</el-button>
        </div>
        <div class="flex flex-wrap items-center gap-3">
          <el-checkbox v-model="allSelected" @change="toggleSelectAll">全选</el-checkbox>
          <div class="flex flex-wrap gap-2">
            <el-checkbox v-for="(option, index) in options" :key="index" v-model="option.checked">{{ option.name }}</el-checkbox>
          </div>
        </div>
      </div>

      <div class="grid gap-2">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <div class="text-sm font-medium">输出</div>
          <div class="flex flex-wrap items-center gap-2">
            <el-button type="success" plain @click="copyOutput" :disabled="!outputText">复制输出内容</el-button>
            <div class="text-sm font-semibold" :style="{ color: outputLength > 500 ? 'var(--danger)' : 'var(--success)' }">
              文本长度：{{ outputLength }}
            </div>
          </div>
        </div>
        <div class="mono min-h-[140px] whitespace-pre-wrap rounded-lg border border-[var(--border)] bg-[rgba(31,35,41,0.02)] p-3 text-sm leading-6">
          {{ outputText }}
        </div>
      </div>
    </div>

    <el-dialog v-model="isModalVisible" title="添加新选项" width="420px" @closed="onDialogClosed">
      <el-input v-model="newOptionName" placeholder="输入文本" />
      <template #footer>
        <el-button @click="isModalVisible = false">取消</el-button>
        <el-button type="primary" @click="addOption">添加</el-button>
      </template>
    </el-dialog>
  </PageFrame>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import PageFrame from '@/components/PageFrame.vue'

type OptionItem = { name: string; checked: boolean }

const inputText = ref('')
const outputText = ref('')
const options = ref<OptionItem[]>([
  { name: '抽帧图片', checked: true },
  { name: '剔除', checked: true },
  { name: '保留', checked: true },
  { name: '图片消重库', checked: true },
])

const newOptionName = ref('')
const isModalVisible = ref(false)
const allSelected = ref(true)

const outputLength = computed(() => outputText.value.length)

watch(
  options,
  () => {
    allSelected.value = options.value.every((o) => o.checked)
  },
  { deep: true }
)

function processInput() {
  let text = inputText.value.replace(/\s+/g, '')
  for (const option of options.value) {
    if (option.checked) {
      text = text.replace(new RegExp(option.name, 'g'), '')
    }
  }
  outputText.value = text
}

function clearInput() {
  inputText.value = ''
  outputText.value = ''
}

async function copyOutput() {
  try {
    await navigator.clipboard.writeText(outputText.value)
    ElMessage.success('输出内容已复制到剪贴板！')
  } catch {
    ElMessage.error('复制失败，请重试！')
  }
}

function showModal() {
  isModalVisible.value = true
}

function onDialogClosed() {
  newOptionName.value = ''
}

function addOption() {
  const name = newOptionName.value.trim()
  if (!name) {
    ElMessage.warning('选项名称不能为空！')
    return
  }
  options.value.push({ name, checked: false })
  isModalVisible.value = false
}

function toggleSelectAll() {
  for (const option of options.value) {
    option.checked = allSelected.value
  }
}
</script>
