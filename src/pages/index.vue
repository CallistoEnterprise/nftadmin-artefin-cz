<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useCryptoStore } from '~/store/crypto'

const property = ref(null as any)
const feeLevel = ref(null as any)
const cryptoStore = useCryptoStore()
const { createNewClass, connectWallet, modifyClass } = useCryptoStore()
const { account, classAdmin, classesDetails, classesCount, minterRole, owner } = storeToRefs(cryptoStore)
</script>

<template>
  <div class="flex flex-col items-center">
    <h1 class="text-2xl m-4">
      Artefin Admin Page
    </h1>
    <h2>Roles</h2>
    <ul>
      <li :class="owner === account ? 'green' : 'red'">
        Owner
      </li>
      <li :class="classAdmin ? 'green' : 'red'">
        Class Admin
      </li>
      <li :class="minterRole ? 'green' : 'red'">
        Minter Role
      </li>
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
    <div v-for="(classDetails, idx) in classesDetails" :key="idx" class="border shadow text-left flex flex-col m-auto " :class="{ 'mt-4': idx > 1 }">
      <h1 class="ma-1">
        Class: {{ classDetails.class }} - Property: {{ classDetails.property_index }}
      </h1>
      <button v-if="classDetails.show" class="bg-green-600 p-4" @click="classDetails.show = !classDetails.show">
        Edit
      </button>
      <div v-else>
        <button class="bg-yellow-600 p-4" @click="modifyClass(classDetails.class, classDetails.property_index, classDetails.property_detail)">
          Save
        </button>
        <button class="bg-red-600 p-4" @click="classDetails.show = !classDetails.show">
          Cancel
        </button>
      </div>
      <pre v-if="classDetails.show" class="font-semibold">{{ JSON.parse(classDetails.property_detail) }}</pre>
      <textarea v-else v-model="classDetails.property_detail" name="property" rows="10" cols="150" />
    </div>
  </div>
</template>

<style>
  pre {
    white-space: pre-wrap;
  }

  .red {
    color: red !important;
  }

  .green {
    color: greenyellow !important;
  }
</style>

<route lang="yaml">
meta:
  layout: home
</route>
