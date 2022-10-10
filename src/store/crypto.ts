/* eslint-disable no-alert */
/* eslint-disable no-console */
import { ethers } from 'ethers'
import { acceptHMRUpdate, defineStore } from 'pinia'
import contractABI from '../../artifacts/contracts/ArtefinNFT.sol/ArtefinNFT.json'
const contractAddress = '0x9557f57556e4F21623D078625d1dc059A72B8ca3'

export const useCryptoStore = defineStore('user', () => {
  const account = ref(null)
  const chainID = ref()
  const classAdmin = ref(null)
  const minterRole = ref(null)
  const owner = ref(false)
  const loading = ref(false)
  const classesCount = ref(0)
  const classesDetails = ref([] as any)
  const { ethereum } = window
  const provider = new ethers.providers.Web3Provider(ethereum)

  function setLoader(value: boolean) {
    console.log('setloader', value)
    loading.value = value
  }

  async function getAllClasses() {
    try {
      setLoader(true)

      if (ethereum) {
        const signer = provider.getSigner()
        const artefinContract = new ethers.Contract(contractAddress, contractABI.abi, signer)

        const count = (await artefinContract.nextClassIndex()).toNumber()
        classesCount.value = count
        console.log('Retrieved total classes count...', count)
        const classesCleaned = [] as any
        setLoader(false)
        for (let i = 0; i < count; i++) {
          const properties = await artefinContract.getClassProperties(i)
          for (let j = 0; j < properties.length; j++) {
            classesCleaned.push({
              class: i,
              property_index: j,
              property_detail: properties[j],
              show: true,
            })
          }
        }

        classesDetails.value = classesCleaned
      }
      else {
        setLoader(false)
        console.log('Ethereum object doesn\'t exist!')
      }
    // setLoading(false)
    }
    catch (error) {
      console.log(error)
    }
  }

  async function createNewClass(_feeLevel: number, _property: string) {
    console.log('setting loader')
    setLoader(true)
    try {
      if (ethereum) {
      // create provider object from ethers library, using ethereum object injected by metamask

        const signer = provider.getSigner()
        const artefinContract = new ethers.Contract(contractAddress, contractABI.abi, signer)
        const addClassTxn = await artefinContract.addNewTokenClass(_feeLevel, _property)
        console.log('Mining...', addClassTxn.hash)
        await addClassTxn.wait()
        console.log('Mined -- ', addClassTxn.hash)

        await getAllClasses()
        _feeLevel = 0
        _property = ''
        setLoader(false)
      }
      else {
        console.log('Ethereum object doesn\'t exist!')
      }
    }
    catch (error) {
      setLoader(false)
      console.log(error)
    }
  }

  async function modifyClass(_classID: number, _propertyID: number, _property: string) {
    console.log('setting loader')
    setLoader(true)
    try {
      if (ethereum) {
      // create provider object from ethers library, using ethereum object injected by metamask

        const signer = provider.getSigner()
        const artefinContract = new ethers.Contract(contractAddress, contractABI.abi, signer)
        const addClassTxn = await artefinContract.modifyClassProperty(_classID, _propertyID, _property)
        console.log('Mining...', addClassTxn.hash)
        await addClassTxn.wait()
        console.log('Mined -- ', addClassTxn.hash)

        await getAllClasses()
        _classID = 0
        _propertyID = 0
        _property = ''
        setLoader(false)
      }
      else {
        console.log('Ethereum object doesn\'t exist!')
      }
    }
    catch (error) {
      setLoader(false)
      console.log(error)
    }
  }

  async function getRoles() {
    try {
      if (ethereum) {
      // create provider object from ethers library, using ethereum object injected by metamask
        const myAccounts = await ethereum.request({ method: 'eth_requestAccounts' })
        const address = myAccounts[0]
        const signer = provider.getSigner()
        const artefinContract = new ethers.Contract(contractAddress, contractABI.abi, signer)
        classAdmin.value = await artefinContract.classAdmins(address)
        owner.value = address.toUpperCase() === (await artefinContract.owner()).toUpperCase()
        minterRole.value = await artefinContract.minter_role(address)
      }
      else {
        console.log('Ethereum object doesn\'t exist!')
      }
    }
    catch (error) {
      console.log(error)
    }
  }

  async function connectWallet() {
    try {
      if (!ethereum) {
        alert('Must connect to MetaMask!')
        return
      }
      const myAccounts = await ethereum.request({ method: 'eth_requestAccounts' })

      chainID.value = (await provider.getNetwork()).chainId === 20729
      console.log('Connected: ', myAccounts[0])
      await getRoles(myAccounts[0])
      account.value = myAccounts[0]
      await getAllClasses()
    }
    catch (error) {
      console.log(error)
    }
  }

  async function switchChain() {
    try {
      await ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x334' }],
      })
    }
    catch (switchError: any) {
      // This error code indicates that the chain has not been added to MetaMask.
      if (switchError.code === 4902) {
        try {
          await ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: '0x334',
              chainName: 'Callisto',
              nativeCurrency: {
                name: 'Callisto',
                symbol: 'CLO',
                decimals: 18,
              },
              rpcUrls: ['https://rpc.callisto.network/'],
              blockExplorerUrls: ['https://explorer.callisto.network/'],
            }],
          })
        }
        catch (addError) {
          // handle "add" error
        }
      }
      // handle other "switch" errors
    }
  }

  return {
    setLoader,
    loading,
    createNewClass,
    modifyClass,
    connectWallet,
    switchChain,
    getRoles,
    account,
    classAdmin,
    minterRole,
    owner,
    classesCount,
    classesDetails,
    chainID,
  }
})

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(useCryptoStore, import.meta.hot))
