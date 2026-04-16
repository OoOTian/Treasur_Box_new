<template>
  <PageFrame title="文本分段 + 限定词选择" description="按句子拆分分页，在当前页划取限定词，并可编辑全文限定词。">
    <el-steps :active="activeStep" finish-status="success" class="mb-4">
      <el-step title="步骤 1" description="请输入文本内容" />
      <el-step title="步骤 2" description="文本拆分及限定词选择" />
    </el-steps>

    <div v-if="activeStep === 0" class="grid gap-4">
      <div class="grid gap-2">
        <div class="text-sm font-medium">请输入文本内容</div>
        <el-input v-model="inputText" type="textarea" :rows="10" placeholder="请输入内容" />
      </div>
      <div class="flex flex-wrap gap-2">
        <el-button type="primary" @click="submitText">提交</el-button>
        <el-button @click="clearUpload">清空</el-button>
      </div>
    </div>

    <div v-else class="grid gap-4">
      <div class="flex flex-wrap items-center justify-between gap-2">
        <el-button @click="goFirstStep">返回文本输入</el-button>
        <div class="flex items-center gap-2">
          <el-button type="success" plain @click="copyPageText" :disabled="!currentText">复制当前页文本</el-button>
          <el-checkbox v-model="wrapWithBrackets">是否使用“[ ]”包裹限定词</el-checkbox>
        </div>
      </div>

      <div class="flex flex-wrap items-center justify-between gap-3">
        <div class="text-sm text-muted">共 {{ totalPages }} 页，当前第 {{ currentPage + 1 }} 页</div>
        <div v-if="totalPages > 0" class="flex flex-wrap items-center gap-2">
          <el-button plain :disabled="currentPage === 0" @click="goToFirst">首页</el-button>
          <el-pagination
            layout="prev, pager, next, jumper"
            :page-size="1"
            :total="totalPages"
            :current-page="currentPage + 1"
            @current-change="onPageChange"
          />
          <el-button plain :disabled="currentPage === totalPages - 1" @click="goToLast">末页</el-button>
        </div>
      </div>

      <div class="grid gap-2">
        <div class="text-sm font-medium">请在下面文本框中使用鼠标划取限定词</div>
        <pre
          class="mono max-h-[320px] min-h-[220px] overflow-auto rounded-lg border border-[var(--border)] bg-[rgba(31,35,41,0.02)] p-3 text-sm leading-6"
          @mouseup="extractSelectedText"
        ><code v-html="formattedOutputText" /></pre>
      </div>

      <div class="flex flex-wrap gap-2">
        <el-button type="primary" @click="copyFullContent" :disabled="!currentText">复制完整内容（全文限定词+限定词+文本内容）</el-button>
      </div>

      <div class="grid gap-4 md:grid-cols-2">
        <div class="grid gap-2">
          <div class="text-sm font-medium">手动输入的全文限定词</div>
          <el-input :model-value="formattedKeywords" readonly placeholder="输入的全文限定词将显示在这里" />
          <div class="flex flex-wrap gap-2">
            <el-button @click="showDialog">编辑全文限定词</el-button>
            <el-button type="danger" plain @click="clearAllKeywords" :disabled="fullKeywords.length === 0 && !includeTest">清空全文限定词</el-button>
          </div>
        </div>

        <div class="grid gap-2">
          <div class="text-sm font-medium">鼠标划取的限定词</div>
          <el-input :model-value="formattedSelectedText" readonly placeholder="划取的文本将显示在这里" />
          <div class="flex flex-wrap gap-2">
            <el-button type="danger" @click="undoSelection" :disabled="selectedTexts.length === 0">撤销上一个划取</el-button>
            <el-button type="warning" @click="clearSelections" :disabled="selectedTexts.length === 0">清空所有划取</el-button>
          </div>
        </div>
      </div>

      <div class="flex flex-wrap items-center gap-x-6 gap-y-1 text-sm">
        <div class="font-semibold">已划取数量：{{ selectedCount }}</div>
        <div class="font-semibold">限定词与当前显示文本总长度：{{ totalLength }}</div>
      </div>
    </div>

    <el-dialog v-model="dialogVisible" title="编辑全文限定词" width="520px">
      <div class="flex flex-wrap gap-2">
        <el-button type="primary" plain @click="handleAddTest">辟谣</el-button>
        <el-button @click="addKeywordStructure">添加全文限定词结构体</el-button>
        <el-button type="danger" plain @click="clearAllKeywords">清空</el-button>
      </div>
      <div class="mt-3 grid gap-2">
        <div v-for="(keyword, index) in fullKeywords" :key="keyword.id" class="flex items-center gap-2">
          <div class="w-6 text-right text-xs text-muted">{{ index + 1 }}.</div>
          <el-input v-model="keyword.text" placeholder="输入全文限定词" />
          <el-checkbox v-model="keyword.negated">否定</el-checkbox>
          <el-button type="danger" plain @click="removeKeyword(index)">删除</el-button>
        </div>
      </div>
      <div class="mt-3 grid gap-2">
        <div class="text-xs text-muted">拼接预览</div>
        <el-input :model-value="formattedKeywords" readonly type="textarea" :rows="4" />
      </div>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmKeywords">确认添加</el-button>
      </template>
    </el-dialog>
  </PageFrame>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { ElMessage } from 'element-plus'
import PageFrame from '@/components/PageFrame.vue'

type FullKeyword = { id: number; text: string; negated: boolean }

const activeStep = ref(0)
const inputText = ref('')
const paginatedText = ref<string[]>([])
const currentPage = ref(0)
const selectedTexts = ref<string[]>([])
const wrapWithBrackets = ref(true)
const dialogVisible = ref(false)
const fullKeywords = ref<FullKeyword[]>([])
const includeTest = ref(false)
let keywordCounter = 0

const totalPages = computed(() => paginatedText.value.length)
const currentText = computed(() => paginatedText.value[currentPage.value] ?? '')

const formattedKeywords = computed(() => {
  const base = fullKeywords.value
    .map((k) => {
      const inner = k.text
      return k.negated ? `!{${inner}}` : `{${inner}}`
    })
    .join('')
  return includeTest.value ? `!{谣言|谣|辟谣|假的|造谣|虚假|编造}${base}` : base
})

const formattedOutputText = computed(() => {
  let text = currentText.value
  for (const sel of selectedTexts.value) {
    if (!sel) continue
    const escapedSel = sel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const re = new RegExp(escapedSel, 'g')
    text = text.replace(re, `<mark class="rounded px-1" style="background: var(--highlight-bg)">${sel}</mark>`)
  }
  return text
})

const formattedSelectedText = computed(() => {
  const raw = selectedTexts.value.join(' ')
  if (!raw) return ''
  return wrapWithBrackets.value ? `[${raw}]` : raw
})

const selectedCount = computed(() => selectedTexts.value.length)

const totalLength = computed(() => {
  const displayedLen = Array.from(currentText.value).length
  const selectedLen = Array.from(formattedSelectedText.value).length
  const fullKeywordLen = Array.from(formattedKeywords.value).length
  return displayedLen + selectedLen + fullKeywordLen
})

function splitText(text: string, maxLength: number) {
  const result: string[] = []
  const sentenceEndRegex = /[。！？.?!]/
  let start = 0

  while (start < text.length) {
    if (text.length - start <= maxLength) {
      result.push(text.slice(start).trimStart())
      break
    }

    const subStr = text.slice(start, start + maxLength)
    let splitPos = -1
    for (let i = subStr.length - 1; i >= 0; i--) {
      if (sentenceEndRegex.test(subStr[i])) {
        splitPos = i
        break
      }
    }

    if (splitPos === -1) {
      result.push(subStr.trimStart())
      start += maxLength
    } else {
      result.push(text.slice(start, start + splitPos + 1).trimStart())
      start += splitPos + 1
    }
  }

  return result
}

function submitText() {
  if (!inputText.value.trim()) {
    ElMessage.warning('请输入内容')
    return
  }
  paginatedText.value = splitText(inputText.value, 470).map((t) => t.trimStart())
  currentPage.value = 0
  activeStep.value = 1
  selectedTexts.value = []
  fullKeywords.value = []
  includeTest.value = false
}

function clearUpload() {
  inputText.value = ''
  paginatedText.value = []
  currentPage.value = 0
  selectedTexts.value = []
  fullKeywords.value = []
  includeTest.value = false
  activeStep.value = 0
}

function onPageChange(page: number) {
  const idx = page - 1
  if (idx === currentPage.value) return
  currentPage.value = idx
  selectedTexts.value = []
  fullKeywords.value = []
  includeTest.value = false
}

function goToFirst() {
  if (totalPages.value <= 0) return
  onPageChange(1)
}

function goToLast() {
  if (totalPages.value <= 0) return
  onPageChange(totalPages.value)
}

function extractSelectedText() {
  const selection = window.getSelection()
  const selected = selection?.toString().trim() ?? ''
  if (selected && !selectedTexts.value.includes(selected)) {
    selectedTexts.value.push(selected)
  }
  selection?.removeAllRanges()
}

function undoSelection() {
  selectedTexts.value.pop()
}

function clearSelections() {
  selectedTexts.value = []
}

function showDialog() {
  dialogVisible.value = true
}

function handleAddTest() {
  includeTest.value = true
}

function addKeywordStructure() {
  keywordCounter += 1
  fullKeywords.value.push({ id: keywordCounter, text: '', negated: false })
}

function removeKeyword(index: number) {
  fullKeywords.value.splice(index, 1)
}

function clearAllKeywords() {
  fullKeywords.value = []
  includeTest.value = false
}

function confirmKeywords() {
  const emptyKeyword = fullKeywords.value.some((k) => !k.text.trim())
  if (emptyKeyword) {
    ElMessage.error('存在未输入内容的全文限定词结构体，请检查后再提交！')
    return
  }
  dialogVisible.value = false
}

async function copyPageText() {
  try {
    await navigator.clipboard.writeText(currentText.value)
    ElMessage.success('复制当前页文本成功！')
  } catch {
    ElMessage.error('复制失败，请手动复制。')
  }
}

async function copyFullContent() {
  try {
    const baseText = currentText.value
    const textToCopy = `${formattedKeywords.value}${formattedSelectedText.value}${baseText}`
    await navigator.clipboard.writeText(textToCopy)
    ElMessage.success('复制完整内容成功！')
  } catch {
    ElMessage.error('复制失败，请手动复制。')
  }
}

function goFirstStep() {
  selectedTexts.value = []
  fullKeywords.value = []
  includeTest.value = false
  activeStep.value = 0
}
</script>
