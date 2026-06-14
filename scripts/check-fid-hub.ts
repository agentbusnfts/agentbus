import { privateKeyToAccount } from 'viem/accounts'
import { getHubRpcClient } from '@farcaster/hub-web'

const privateKey = '0x3d23c3bd1c7689531d848d8a6df989dfde450f02767dc529e8df8e3991dde66e'
const account = privateKeyToAccount(privateKey)

console.log('Wallet Address:', account.address)

// Connect to a public Farcaster hub
const hub = getHubRpcClient('https://hub.farcaster.xyz:2281', {})

async function checkFid() {
  try {
    console.log('Checking Farcaster hub for custody address...')
    
    // Try to get the custody address for FIDs by checking the IdRegistry
    // Since we can't directly query by address, we'll need to check if this address
    // is the custody address for any FID
    
    // Alternative: Use the FName Registry to find fnames owned by this address
    const response = await fetch(`https://fnames.farcaster.xyz/transfers?owner=${account.address}`)
    const data = await response.json()
    
    if (data.transfers && data.transfers.length > 0) {
      console.log('Found fname transfers for this address:', data.transfers.length)
      // Check the most recent transfer
      const latestTransfer = data.transfers[data.transfers.length - 1]
      console.log('Latest transfer:', latestTransfer)
      
      // The 'to' field is the FID, but we need to verify this address is the custody address
      const fid = latestTransfer.to
      console.log('Potential FID:', fid)
      
      // Now we need to verify this address is actually the custody address for this FID
      // We can do this by checking the IdRegistry contract
      return fid
    }
    
    console.log('No fname transfers found - wallet may not have a Farcaster account')
    return null
  } catch (error) {
    console.error('Error checking FID:', error)
    return null
  }
}

checkFid()
