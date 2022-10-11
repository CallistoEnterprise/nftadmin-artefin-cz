<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useCryptoStore } from '~/store/crypto'

const show = ref(true)
const checked = ref(false)
const checked2 = ref(false)
const address = ref(null as any)
const address2 = ref(null as any)
const cryptoStore = useCryptoStore()
const { manageClassAdmin, isAdmin, manageMinterRoles, isMinter } = useCryptoStore()
const { classAdminQuery, minterRoleQuery, loading } = storeToRefs(cryptoStore)
</script>

<template>
  <div class="section">
    <button class="icon-btn !outline-none float-right" @click="show = !show">
      <div v-if="show" i="carbon-arrow-up" />
      <div
        v-else i="carbon-arrow-down"
      />
    </button>
    <h1>Owner Management </h1>
    <Loader v-if="loading" />
    <div v-if="show">
      <div class="ma-1">
        <h2>Manage Class Admins</h2>
        <input
          v-model="address"
          name="address"
          placeholder="Address"
          class="py-4 px-4 shadow border"
          type="text"
          @click="checked = false"
        >
        <button v-if="!checked" class="bg-gray-600 p-4" @click="isAdmin(address); checked = !checked">
          Check
        </button>
        <button v-if="!classAdminQuery && checked" class="bg-green-600 p-4" @click="manageClassAdmin(address, true)">
          Add
        </button>
        <button v-if="classAdminQuery && checked" class="bg-red-600 p-4" @click="manageClassAdmin(address, false)">
          Remove
        </button>
      </div>
      <div class="ma-1">
        <h2>Manage Minter Roles</h2>
        <input
          v-model="address2"
          name="address"
          placeholder="Address"
          class="py-4 px-4 shadow border"
          type="text"
          @click="checked = false"
        >
        <button v-if="!checked2" class="bg-gray-600 p-4" @click="isMinter(address2); checked2 = !checked2">
          Check
        </button>
        <button v-if="!minterRoleQuery && checked2" class="bg-green-600 p-4" @click="manageMinterRoles(address2, true)">
          Add
        </button>
        <button v-if="minterRoleQuery && checked2" class="bg-red-600 p-4" @click="manageMinterRoles(address2, false)">
          Remove
        </button>
      </div>
    </div>
  </div>
</template>
