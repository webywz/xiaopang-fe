<script setup>
import { computed } from 'vue'
import DefaultTheme from 'vitepress/theme'
import { useData } from 'vitepress'

const { Layout } = DefaultTheme
const { theme } = useData()

/**
 * Giscus配置对象
 * @type {Object}
 */
const giscusConfig = computed(() => theme.value.giscus || {})

/**
 * 是否启用评论系统
 * @type {boolean}
 */
const enableComments = computed(() => {
  return giscusConfig.value && 
         giscusConfig.value.repo && 
         giscusConfig.value.repoId && 
         giscusConfig.value.category && 
         giscusConfig.value.categoryId
})
</script>

<template>
  <Layout>
    <template #doc-after>
      <CommentProvider
        v-if="enableComments"
        :repo="giscusConfig.repo"
        :repo-id="giscusConfig.repoId"
        :category="giscusConfig.category"
        :category-id="giscusConfig.categoryId"
        :exclude="giscusConfig.exclude || []"
        :include="giscusConfig.include || []"
      />
    </template>
  </Layout>
</template> 