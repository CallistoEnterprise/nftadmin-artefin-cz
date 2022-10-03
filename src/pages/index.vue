<script setup lang="ts">

  import { storeToRefs } from 'pinia'
  import { useCryptoStore } from '~/store/crypto'
  
  const property = ref(null as any)
  const feeLevel = ref(null as any)
  const cryptoStore = useCryptoStore()
  const { createNewClass, connectWallet } = useCryptoStore()
  const { account, classAdmin, classesDetails, classesCount, minterRole, owner } = storeToRefs(cryptoStore)
  
</script>
  
<template>
  <div class="flex flex-col items-center">
    <h1 class="text-2xl m-4">
      Artefin Admin Page
    </h1>
    <h2>Roles</h2>
    <ul>
      <li v-if="owner == account">Class Admin</li>
      <li v-if="classAdmin">Class Admin</li>
      <li v-if="minterRole">Minter Role</li>
    </ul>
    <button v-if="!account" class="bg-green-600 p-4" @click="connectWallet">
      Connect Wallet
    </button>
    <div v-if="account" class="mt-5">
      <input
        v-model="feeLevel"
        name="feeLevel"
        placeholder="Fee Level"
        class="py-4 px-4 shadow border"
        maxlength="20"
        type="number"
      >
      <input
        v-model="property"
        name="classesInput"
        placeholder="JSON format Property"
        class="py-4 px-4  shadow border"
      >
      <button class="bg-yellow-600 p-4 mt-10" @click="createNewClass(feeLevel, property)">
        Add New Class
      </button>
    </div>

    <div v-if="account" class="border shadow  w-4/12 p-4 mt-10">
      <h3 class="text-2xl">
        Number Of Classes: {{ classesCount }}
      </h3>
    </div>
    <div v-for="(classDetails, idx) in classesDetails" :key="idx" class="border shadow text-left flex flex-col m-auto " :class="{'mt-4': idx > 1}">
      <h1>{{idx}}</h1>
      <pre class="font-semibold">{{ JSON.parse(classDetails.property) }}</pre>
    </div>
  </div>
</template>

<style>
  pre {
    white-space: pre-wrap;
  }
</style>
  
<route lang="yaml">
meta:
  layout: home
</route>