import { createRouter, createWebHashHistory, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import ShellLayout from '@/pages/ShellLayout.vue'
import KeywordPickerPage from '@/pages/KeywordPickerPage.vue'
import SegmentPickerPage from '@/pages/SegmentPickerPage.vue'
import OcrCleanerPage from '@/pages/OcrCleanerPage.vue'

// 定义路由配置
const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: ShellLayout,
    children: [
      {
        path: '',
        redirect: '/tools/keyword-picker',
      },
      {
        path: 'tools/keyword-picker',
        name: 'keyword-picker',
        component: KeywordPickerPage,
      },
      {
        path: 'tools/segment-picker',
        name: 'segment-picker',
        component: SegmentPickerPage,
      },
      {
        path: 'tools/ocr-cleaner',
        name: 'ocr-cleaner',
        component: OcrCleanerPage,
      },
    ],
  },
]

// 创建路由实例
const router = createRouter({
  history:
    import.meta.env.BASE_URL === '/'
      ? createWebHistory(import.meta.env.BASE_URL)
      : createWebHashHistory(import.meta.env.BASE_URL),
  routes,
})

export default router
