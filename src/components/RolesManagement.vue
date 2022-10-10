<script  setup lang="ts">
import { storeToRefs } from 'pinia'
import { useCryptoStore } from '~/store/crypto'

const cryptoStore = useCryptoStore()
const { account, owner } = storeToRefs(cryptoStore)
</script>

<template>
  <div>{{ account }} {{ owner }}</div>
</template>
