import { advancePositionWithClone } from '@vue/compiler-core'
import { ethers } from 'ethers'
import { acceptHMRUpdate, defineStore  } from 'pinia'
import contractABI from '../../artifacts/contracts/ArtefinNFT.sol/ArtefinNFT.json'
const contractAddress = '0x9557f57556e4F21623D078625d1dc059A72B8ca3'

export const useCryptoStore = defineStore('user', () => {
    const account = ref(null)
    const classAdmin = ref(null)
    const minterRole = ref(null)
    const owner = ref(null)
    const loading = ref(false)
    const classesCount = ref(0)
    const classesDetails = ref([] as any)

    function setLoader(value: boolean) {
      console.log('setloader', value)
      loading.value = value
    }

    async function getAllClasses() {
      try {
        setLoader(true)
        const { ethereum } = window
        if (ethereum) {
          const provider = new ethers.providers.Web3Provider(ethereum)
          const signer = provider.getSigner()
          const artefinContract = new ethers.Contract(contractAddress, contractABI.abi, signer)
  
          const count = (await artefinContract.nextClassIndex()).toNumber()
          classesCount.value = count
          console.log('Retrieved total classes count...', count)
          const classesCleaned = [] as any
          setLoader(false)
          for (let i = 0; i < count; i++) {
            const properties = await artefinContract.getClassProperties(i)
            for (let j = 0; j < properties.length; j++){
              classesCleaned.push({
                property: properties[j]
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
        const { ethereum } = window
        if (ethereum) {
        // create provider object from ethers library, using ethereum object injected by metamask
          const provider = new ethers.providers.Web3Provider(ethereum)
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

    async function getRoles (address: string){
      try {
        const { ethereum } = window
        if (ethereum) {
        // create provider object from ethers library, using ethereum object injected by metamask
          const provider = new ethers.providers.Web3Provider(ethereum)
          const signer = provider.getSigner()
          const artefinContract = new ethers.Contract(contractAddress, contractABI.abi, signer)
          classAdmin.value = await artefinContract.classAdmins(address)
          owner.value = await artefinContract.owner()
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
        const { ethereum } = window
        if (!ethereum) {
          alert('Must connect to MetaMask!')
          return
        }
        const myAccounts = await ethereum.request({ method: 'eth_requestAccounts' })
  
        console.log('Connected: ', myAccounts[0])
        account.value = myAccounts[0]
        await getAllClasses()
        await getRoles(myAccounts[0])
      }
      catch (error) {
        console.log(error)
      }
    }
  

  
    return {
      setLoader,
      loading,
      createNewClass,
      connectWallet,
      account,
      classAdmin,
      minterRole,
      owner,
      classesCount,
      classesDetails,
    }
  })
  
  if (import.meta.hot)
    import.meta.hot.accept(acceptHMRUpdate(useCryptoStore, import.meta.hot))