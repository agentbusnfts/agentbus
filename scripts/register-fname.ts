import { privateKeyToAccount } from 'viem/accounts'

const privateKey = '0x3d23c3bd1c7689531d848d8a6df989dfde450f02767dc529e8df8e3991dde66e'
const account = privateKeyToAccount(privateKey)

const fname = 'agentbus'
const fid = 1
const owner = account.address
const timestamp = Math.floor(Date.now() / 1000)

// EIP-712 domain for Farcaster username proofs
const domain = {
  name: 'FnameRegistry',
  version: '1',
  chainId: 1, // Ethereum mainnet
  verifyingContract: '0x00000000Fc6c5F01Fc30151999387Bb99A9f489b' as const,
}

// EIP-712 types
const types = {
  UserNameProof: [
    { name: 'name', type: 'string' },
    { name: 'owner', type: 'address' },
    { name: 'timestamp', type: 'uint256' },
  ],
}

// EIP-712 message
const message = {
  name: fname,
  owner: owner,
  timestamp: timestamp,
}

async function registerFname() {
  try {
    console.log('Registering fname:', fname)
    console.log('FID:', fid)
    console.log('Owner:', owner)
    console.log('Timestamp:', timestamp)

    // Sign the message
    const signature = await account.signTypedData({
      domain,
      types,
      message,
      primaryType: 'UserNameProof',
    })

    console.log('Signature:', signature)

    // Call the FName Registry API
    const response = await fetch('https://fnames.farcaster.xyz/transfers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: fname,
        from: 0, // 0 for new registration
        to: fid,
        fid: fid,
        owner: owner,
        timestamp: timestamp,
        signature: signature,
      }),
    })

    const data = await response.json()
    console.log('Response:', data)

    if (response.ok) {
      console.log('Successfully registered fname!')
    } else {
      console.error('Failed to register fname:', data)
    }
  } catch (error) {
    console.error('Error registering fname:', error)
  }
}

registerFname()
