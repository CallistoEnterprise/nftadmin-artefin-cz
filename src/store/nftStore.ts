import fs from 'fs'
import path from 'path'
import { File, NFTStorage } from 'nft.storage'
import mime from 'mime'
import { acceptHMRUpdate, defineStore } from 'pinia'
import * as dotenv from 'dotenv'
dotenv.config()

export const useCryptoStore = defineStore('user', () => {
  const NFT_STORAGE_TOKEN = process.env.KEY as string
  const client = new NFTStorage({ token: NFT_STORAGE_TOKEN })

  async function fileFromPath(filePath: string) {
    const content = await fs.promises.readFile(filePath)
    const type = mime.getType(filePath) as string
    return new File([content], path.basename(filePath), { type })
  }

  async function main() {
    const image = await fileFromPath('./token.png')
    const cid = await client.storeBlob(image)
    // console.log(`https://${cid}.ipfs.nftstorage.link/`)
  }

  return {
    main,
  }
})

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(useCryptoStore, import.meta.hot))
