<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useCryptoStore } from '~/store/crypto'

const cryptoStore = useCryptoStore()
const { connectWallet, switchChain, getRoles, getChain } = useCryptoStore()
const { account, classAdmin, minterRole, owner, chainID } = storeToRefs(cryptoStore)

onBeforeMount(() => {
  getChain()
})

onMounted(() => {
  window.ethereum
    .on('accountsChanged', async () => {
      await getRoles()
    })
    .on('chainChanged', async () => {
      location.reload()
    })
})
</script>

<template>
  <div class="flex flex-col items-center">
    <h1 class="text-2xl m-4">
      Artefin Admin Page
    </h1>
    <div v-if="account && chainID">
      <h2>
        Roles:
        <span :class="owner ? 'green' : 'red'">Owner</span> -
        <span :class="classAdmin ? 'green' : 'red'">Class Admin</span> -
        <span :class="minterRole ? 'green' : 'red'">Minter Role</span>
      </h2>
      <div v-if="!(owner || classAdmin || minterRole)" class="noRoles">
        <h2>
          This account has not applicable roles
        </h2>
        <p>Please, try another account.</p>
      </div>
    </div>
    <button v-if="!account && chainID" class="bg-green-600 p-4" @click="connectWallet">
      Connect Wallet
    </button>
    <button v-if="!chainID" class="bg-green-600 p-4" @click="switchChain">
      Change Network
    </button>
    <RolesManagement
      v-if="owner"
    />
    <ClassesManagement
      v-if="classAdmin"
    />
  </div>
</template>

<style>
  .red {
    color: red !important;
  }

  .green {
    color: greenyellow !important;
  }

  .noRoles {
    border: 2px red solid;
  }

  .section{
    border: 2px red solid;
    width: 100%;
  }
</style>

<route lang="yaml">
meta:
  layout: home
</route>
