import { privateKeyToAccount } from 'viem/accounts'
import { createPublicClient, createWalletClient, http } from 'viem'
import { optimism } from 'viem/chains'

const privateKey = '0x3d23c3bd1c7689531d848d8a6df989dfde450f02767dc529e8df8e3991dde66e'
const account = privateKeyToAccount(privateKey)

// Farcaster IdRegistry contract on Optimism
const ID_REGISTRY_ADDRESS = '0x00000000Fc6c5F01Fc30151999387Bb99A9f489b' as const
const ID_REGISTRY_ABI = [
  {
    inputs: [],
    name: 'register',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: '', type: 'address' }],
    name: 'idOf',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const

const publicClient = createPublicClient({
  chain: optimism,
  transport: http(),
})

const walletClient = createWalletClient({
  account,
  chain: optimism,
  transport: http(),
})

async function createFarcasterAccount() {
  try {
    console.log('Wallet Address:', account.address)
    console.log('Creating Farcaster account on Optimism...')

    // Check if wallet already has a FID
    const existingFid = await publicClient.readContract({
      address: ID_REGISTRY_ADDRESS,
      abi: ID_REGISTRY_ABI,
      functionName: 'idOf',
      args: [account.address],
    })

    if (existingFid !== 0n) {
      console.log('Wallet already has FID:', existingFid.toString())
      return Number(existingFid)
    }

    console.log('No existing FID found. Creating new account...')

    // Check wallet balance
    const balance = await publicClient.getBalance({
      address: account.address,
    })
    console.log('Wallet balance:', (Number(balance) / 1e18).toFixed(4), 'ETH')

    if (balance === 0n) {
      console.error('ERROR: Wallet has no ETH on Optimism. Please fund the wallet before continuing.')
      console.log('Send ETH to:', account.address)
      return null
    }

    // Estimate gas for registration
    const gasEstimate = await publicClient.estimateContractGas({
      address: ID_REGISTRY_ADDRESS,
      abi: ID_REGISTRY_ABI,
      functionName: 'register',
      account,
    })
    console.log('Estimated gas:', gasEstimate.toString())

    // Register the account
    console.log('Sending registration transaction...')
    const hash = await walletClient.writeContract({
      address: ID_REGISTRY_ADDRESS,
      abi: ID_REGISTRY_ABI,
      functionName: 'register',
    })

    console.log('Transaction sent:', hash)
    console.log('Waiting for confirmation...')

    const receipt = await publicClient.waitForTransactionReceipt({ hash })
    console.log('Transaction confirmed!', receipt)

    // Get the new FID
    const fid = await publicClient.readContract({
      address: ID_REGISTRY_ADDRESS,
      abi: ID_REGISTRY_ABI,
      functionName: 'idOf',
      args: [account.address],
    })

    console.log('Successfully created Farcaster account!')
    console.log('FID:', fid.toString())
    console.log('Transaction hash:', hash)

    return Number(fid)
  } catch (error) {
    console.error('Error creating Farcaster account:', error)
    return null
  }
}

createFarcasterAccount()
