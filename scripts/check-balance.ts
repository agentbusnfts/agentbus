import { privateKeyToAccount } from 'viem/accounts'
import { createPublicClient, http } from 'viem'
import { optimism, mainnet, base } from 'viem/chains'

const privateKey = '0x3d23c3bd1c7689531d848d8a6df989dfde450f02767dc529e8df8e3991dde66e'
const account = privateKeyToAccount(privateKey)

const optimismClient = createPublicClient({
  chain: optimism,
  transport: http(),
})

const mainnetClient = createPublicClient({
  chain: mainnet,
  transport: http(),
})

const baseClient = createPublicClient({
  chain: base,
  transport: http(),
})

async function checkBalances() {
  console.log('Wallet Address:', account.address)
  
  // Check Optimism balance (Farcaster is on Optimism)
  const optimismBalance = await optimismClient.getBalance({
    address: account.address,
  })
  console.log('Optimism balance:', (Number(optimismBalance) / 1e18).toFixed(6), 'ETH')
  
  // Check Base mainnet balance
  const baseBalance = await baseClient.getBalance({
    address: account.address,
  })
  console.log('Base mainnet balance:', (Number(baseBalance) / 1e18).toFixed(6), 'ETH')
  
  // Check Mainnet balance
  const mainnetBalance = await mainnetClient.getBalance({
    address: account.address,
  })
  console.log('Mainnet balance:', (Number(mainnetBalance) / 1e18).toFixed(6), 'ETH')
}

checkBalances()
