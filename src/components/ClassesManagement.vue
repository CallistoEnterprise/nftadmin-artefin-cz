<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useCryptoStore } from '~/store/crypto'

const property = ref(null as any)
const newProperty = ref(null as any)
const classID = ref(null as any)
const feeLevel = ref(null as any)
const show = ref(true)
const cryptoStore = useCryptoStore()
const { createNewClass, modifyClass, addProperty } = useCryptoStore()
const { classesDetails, classesCount } = storeToRefs(cryptoStore)
</script>

<template>
  <div class="section">
    <button class="icon-btn !outline-none float-right" @click="show = !show">
      <div v-if="show" i="carbon-arrow-up" />
      <div
        v-else i="carbon-arrow-down"
      />
    </button>

    <h1>Classes Management ({{ classesCount }})</h1>
    <div v-if="show">
      <div class="ma-2">
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
        <button class="bg-yellow-600 p-4" @click="createNewClass(feeLevel, property)">
          Add New Class
        </button>
      </div>
      <div class="ma-2">
        <input
          v-model="classID"
          name="ClassID"
          placeholder="ClassID"
          class="py-4 px-4 shadow border"
          maxlength="20"
          type="number"
        >
        <input
          v-model="newProperty"
          name="classesInput"
          placeholder="JSON format Property"
          class="py-4 px-4  shadow border"
        >
        <button class="bg-yellow-600 p-4" @click="addProperty(classID, newProperty)">
          Add New Property
        </button>
      </div>

      <div v-for="(classDetails, idx) in classesDetails" :key="idx" class="border shadow text-left flex flex-col m-auto " :class="{ 'mt-4': idx > 1 }">
        <div class="classHeader">
          <h2>
            Class: {{ classDetails.class }} - Property: {{ classDetails.property_index }}
          </h2>
          <button v-if="classDetails.show" class="bg-green-600" @click="classDetails.show = !classDetails.show">
            Edit
          </button>
          <div v-else>
            <button class="bg-yellow-600" @click="modifyClass(classDetails.class, classDetails.property_index, classDetails.property_detail)">
              Save
            </button>
            <button class="bg-red-600" @click="classDetails.show = !classDetails.show">
              Cancel
            </button>
          </div>
        </div>
        <pre v-if="classDetails.show" class="font-semibold">{{ JSON.parse(classDetails.property_detail) }}</pre>
        <textarea v-else v-model="classDetails.property_detail" name="property" rows="10" cols="150" />
      </div>
    </div>
  </div>
</template>

<style>
  h1 {
    font-size: 3rem !important;
  }

  .classHeader {
    background-color: grey;
    display: inline-flex;
  }

  .classHeader button {
    margin: 0 5px;
    padding: 2px 3px;
  }
</style>
