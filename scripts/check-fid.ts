import { privateKeyToAccount } from 'viem/accounts'

const privateKey = '0x3d23c3bd1c7689531d848d8a6df989dfde450f02767dc529e8df8e3991dde66e'
const account = privateKeyToAccount(privateKey)

console.log('Wallet Address:', account.address)

// Try to get the FID from the custody address using multiple methods
async function checkFid() {
  try {
    // Method 1: Check FName Registry for this specific address as owner
    console.log('Checking FName Registry...')
    const response = await fetch(`https://fnames.farcaster.xyz/transfers?owner=${account.address}`)
    const data = await response.json()
    
    if (data.transfers && data.transfers.length > 0) {
      console.log('Found fname transfers for this address:', data.transfers.length)
      // The 'to' field in the transfer is the FID
      const fid = data.transfers[0].to
      console.log('FID from fname transfers:', fid)
      return fid
    }
    
    console.log('No fname transfers found for this address')
    
    // Method 2: Try to use the Farcaster API to check verifications
    console.log('Checking Farcaster API for verifications...')
    try {
      const fcResponse = await fetch(`https://api.farcaster.xyz/v1/verificationsByAddress?address=${account.address}`)
      const fcData = await fcResponse.json()
      console.log('Farcaster API response:', fcData)
      
      if (fcData.result && fcData.result.length > 0) {
        console.log('Found FID from verifications:', fcData.result[0].fid)
        return fcData.result[0].fid
      }
    } catch (fcError) {
      console.log('Farcaster API check failed:', fcError)
    }
    
    console.log('No FID found for this address - wallet may not have a Farcaster account')
    return null
  } catch (error) {
    console.error('Error checking FID:', error)
    return null
  }
}

checkFid()
