<script setup lang="ts">
const { t } = useI18n()
</script>

<template>
  <nav text-xl float-right ma-1>
    <button class="icon-btn !outline-none" :title="t('button.toggle_dark')" @click="toggleDark()">
      <div i="carbon-sun dark:carbon-moon" />
    </button>
  </nav>
</template>
