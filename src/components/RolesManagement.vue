<script setup lang="ts">
import { useCryptoStore } from '~/store/crypto'

const show = ref(true)
const address = ref(null as any)
const { manageClassAdmin } = useCryptoStore()
</script>

<template>
  <div class="section">
    <button class="icon-btn !outline-none float-right" @click="show = !show">
      <div v-if="show" i="carbon-arrow-up" />
      <div
        v-else i="carbon-arrow-down"
      />
    </button>
    <h1>Ownership Management </h1>
    <div v-if="show">
      <div class="ma-1">
        <h2>Manage Class Admins</h2>
        <input
          v-model="address"
          name="address"
          placeholder="Address"
          class="py-4 px-4 shadow border"
          type="text"
        >
        <button class="bg-green-600 p-4" @click="manageClassAdmin(address, true)">
          Add
        </button>
        <button class="bg-red-600 p-4" @click="manageClassAdmin(address, false)">
          Remove
        </button>
      </div>
    </div>
  </div>
</template>
