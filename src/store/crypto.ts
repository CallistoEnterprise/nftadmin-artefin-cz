/* eslint-disable no-alert */
/* eslint-disable no-console */
import { ethers } from 'ethers'
import { acceptHMRUpdate, defineStore } from 'pinia'
import contractABI from '../../artifacts/contracts/ArtefinNFT.sol/ArtefinNFT.json'
// const contractAddress = '0x69c878B44fb427cd084125Ce3b76a8Ee4685E78c'
const contractAddress = '0xB1651e9c2499657e8e0939285589f5B4060caC88'
export const useCryptoStore = defineStore('user', () => {
  const account = ref(null)
  const chainID = ref()
  const classAdmin = ref(false)
  const classAdminQuery = ref(false)
  const minterRoleQuery = ref(false)
  const minterRole = ref(false)
  const owner = ref(false)
  const loading = ref(false)
  const classesCount = ref(0)
  const classesDetails = ref([] as any)
  const { ethereum } = window
  const provider = new ethers.providers.Web3Provider(ethereum)
  const signer = provider.getSigner()
  const artefinContract = new ethers.Contract(contractAddress, contractABI.abi, signer)

  function setLoader(value: boolean) {
    console.log('setloader', value)
    loading.value = value
  }

  async function getAllClasses() {
    try {
      setLoader(true)

      if (ethereum) {
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

  async function manageClassAdmin(_address: string, _enable: boolean) {
    console.log('setting loader')
    setLoader(true)
    try {
      if (ethereum) {
        const addClassTxn = await artefinContract.classAdmin(_address, _enable)
        console.log('Mining...', addClassTxn.hash)
        await addClassTxn.wait()
        console.log('Mined -- ', addClassTxn.hash)

        _address = ''
        _enable = false
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

  async function manageMinterRoles(_address: string, _enable: boolean) {
    console.log('setting loader')
    setLoader(true)
    try {
      if (ethereum) {
        const addClassTxn = await artefinContract.setMinterRole(_address, _enable)
        console.log('Mining...', addClassTxn.hash)
        await addClassTxn.wait()
        console.log('Mined -- ', addClassTxn.hash)

        _address = ''
        _enable = false
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

  async function addProperty(_classID: number, _property: string) {
    console.log('setting loader')
    setLoader(true)
    try {
      if (ethereum) {
        const addClassTxn = await artefinContract.addClassPropertyWithContent(_classID, _property)
        console.log('Mining...', addClassTxn.hash)
        await addClassTxn.wait()
        console.log('Mined -- ', addClassTxn.hash)

        await getAllClasses()
        _classID = 0
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
        const address = (await ethereum.request({ method: 'eth_requestAccounts' }))[0]
        classAdmin.value = await artefinContract.classAdmins(address)
        owner.value = (address).toUpperCase() === (await artefinContract.owner()).toUpperCase()
        minterRole.value = await artefinContract.minter_role(address)
        account.value = address
      }
      else {
        console.log('Ethereum object doesn\'t exist!')
      }
    }
    catch (error) {
      console.log(error)
    }
  }

  async function getChain() {
    await provider.getNetwork()
      .then((res) => {
        // chainID.value = res.chainId === 20729
        chainID.value = res.chainId === 820
      })
      .catch(console.log)
  }

  async function isAdmin(address: string) {
    try {
      if (ethereum)
        classAdminQuery.value = await artefinContract.classAdmins(address)

      else console.log('Ethereum object doesn\'t exist!')
    }
    catch (error) {
      console.log(error)
    }
  }

  async function isMinter(address: string) {
    try {
      if (ethereum)
        minterRoleQuery.value = await artefinContract.minter_role(address)

      else console.log('Ethereum object doesn\'t exist!')
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
      await getChain()
      if (chainID.value) {
        await getRoles()
        console.log('Connected: ', account.value)
        await getAllClasses()
      }
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
    manageClassAdmin,
    addProperty,
    isAdmin,
    manageMinterRoles,
    isMinter,
    getRoles,
    getChain,
    account,
    classAdmin,
    minterRole,
    owner,
    classesCount,
    classesDetails,
    chainID,
    classAdminQuery,
    minterRoleQuery,
  }
})

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(useCryptoStore, import.meta.hot))
