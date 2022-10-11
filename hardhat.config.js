require('@nomicfoundation/hardhat-toolbox')
require('dotenv').config()

const CALLISTO_PRIVATE_KEY = process.env.CALLISTO_PRIVATE_KEY

module.exports = {
  solidity: {
    version: '0.8.17',
    settings: {
      optimizer: {
        enabled: true,
        runs: 1000,
      },
    },
  },
  path: {
    artifacts: './src/artifacts',
  },
  networks: {
    testnet: {
      url: 'https://testnet-rpc.callisto.network',
      accounts: [`${CALLISTO_PRIVATE_KEY}`],
    },
    mainnet: {
      url: 'https://rpc.callisto.network/',
      accounts: [`${CALLISTO_PRIVATE_KEY}`],
    },
  },
}
