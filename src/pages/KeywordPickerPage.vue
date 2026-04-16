<template>
  <PageFrame title="限定词选取" description="输入文本后，在展示区用鼠标划取限定词并复制结果。">
    <div class="grid gap-4">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <el-checkbox v-model="wrapWithBrackets">是否使用“[ ]”包裹限定词</el-checkbox>
        <div class="flex items-center gap-2">
          <el-button type="primary" @click="submitText">提交</el-button>
          <el-button @click="clearAll">清空</el-button>
        </div>
      </div>

      <div class="grid gap-3">
        <div class="text-sm font-medium">请输入文本内容</div>
        <el-input v-model="inputText" :disabled="isInputDisabled" type="textarea" :rows="6" placeholder="请输入内容" />
        <div v-if="isInputDisabled" class="text-xs text-muted">已提交文本，可清空后重新输入。</div>
      </div>

      <div class="grid gap-3">
        <div class="text-sm font-medium">在下面文本框中使用鼠标划取限定词</div>
        <div
          class="mono max-h-[320px] min-h-[220px] overflow-auto rounded-lg border border-[var(--border)] bg-[rgba(31,35,41,0.02)] p-3 text-sm leading-6"
          @mouseup="extractSelectedText"
        >
          <span v-html="formattedOutputText" />
        </div>
      </div>

      <div class="grid gap-3">
        <div class="flex flex-wrap items-center gap-x-6 gap-y-1 text-sm">
          <div class="font-semibold">已划取数量：{{ selectedCount }}</div>
          <div class="font-semibold">限定词与输入内容总长度：{{ totalLength }}</div>
        </div>
        <el-input :model-value="formattedSelectedText" readonly placeholder="你划取的限定词将显示在这里" />
        <div class="flex flex-wrap gap-2">
          <el-button type="danger" @click="undoSelection" :disabled="selectedTexts.length === 0">撤销上一个划取</el-button>
          <el-button type="warning" @click="clearSelections" :disabled="selectedTexts.length === 0">清空所有划取</el-button>
          <el-button type="success" @click="copyToClipboard" :disabled="selectedTexts.length === 0">复制限定词结果</el-button>
          <el-button v-if="wrapWithBrackets" type="primary" plain @click="copyFullContent" :disabled="!displayedText">
            复制完整内容
          </el-button>
        </div>
      </div>
    </div>
  </PageFrame>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { ElMessage } from 'element-plus'
import PageFrame from '@/components/PageFrame.vue'

const inputText = ref('')
const displayedText = ref('')
const selectedTexts = ref<string[]>([])
const wrapWithBrackets = ref(true)
const isContentSubmitted = ref(false)
const isInputDisabled = ref(false)

const formattedOutputText = computed(() => {
  let text = displayedText.value
  for (const sel of selectedTexts.value) {
    if (!sel) continue
    const escapedSel = sel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const re = new RegExp(escapedSel, 'g')
    text = text.replace(re, `<mark class="rounded px-1" style="background: var(--highlight-bg)">${sel}</mark>`)
  }
  return text
})

const formattedSelectedText = computed(() => {
  const text = selectedTexts.value.join(' ')
  if (!text) return ''
  return wrapWithBrackets.value ? `[${text}]` : text
})

const selectedCount = computed(() => selectedTexts.value.length)

const totalLength = computed(() => {
  const a = formattedSelectedText.value.length
  const b = inputText.value.length
  return a + b
})

function submitText() {
  if (isContentSubmitted.value) {
    ElMessage.warning('请先清空上传后再提交新的内容！')
    return
  }
  if (!inputText.value.trim()) {
    ElMessage.warning('请输入内容')
    return
  }
  displayedText.value += (displayedText.value ? ' ' : '') + inputText.value
  isInputDisabled.value = true
  isContentSubmitted.value = true
}

function clearAll() {
  inputText.value = ''
  displayedText.value = ''
  selectedTexts.value = []
  isContentSubmitted.value = false
  isInputDisabled.value = false
}

function extractSelectedText() {
  const selection = window.getSelection()
  if (!selection || selection.rangeCount === 0) return
  const selected = selection.toString().trim()
  if (selected && !selectedTexts.value.includes(selected)) {
    selectedTexts.value.push(selected)
  }
  selection.removeAllRanges()
}

function undoSelection() {
  selectedTexts.value.pop()
}

function clearSelections() {
  selectedTexts.value = []
}

async function copyToClipboard() {
  try {
    await navigator.clipboard.writeText(formattedSelectedText.value)
    ElMessage.success('复制限定词结果成功！')
  } catch {
    ElMessage.error('复制失败，请手动复制。')
  }
}

async function copyFullContent() {
  try {
    const textToCopy = `${formattedSelectedText.value}${displayedText.value ? displayedText.value : ''}`
    await navigator.clipboard.writeText(textToCopy)
    ElMessage.success('复制完整内容成功！')
  } catch {
    ElMessage.error('复制失败，请手动复制。')
  }
}
</script>
