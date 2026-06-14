// AgentBus — Inscribe all 10 agency agent cards on-chain
// Uses the deployed AgentNFT contract at 0xb085E4795fC252FE167E900bcAf221DE87FD7218

import { execSync } from 'child_process'

const NFT_ADDRESS = '0xb085E4795fC252FE167E900bcAf221DE87FD7218'
const PRIVATE_KEY = '0x3d23c3bd1c7689531d848d8a6df989dfde450f02767dc529e8df8e3991dde66e'
const RPC = 'https://mainnet.base.org'

// Agent metadata URIs — using a base URI pattern
// In production, these would be real IPFS hashes with full JSON metadata
const AGENTS = [
  { tokenId: 0, name: 'rena.ops', uri: 'ipfs://QmAgentBus001/rena.ops.json' },
  { tokenId: 1, name: 'sentinel.security', uri: 'ipfs://QmAgentBus002/sentinel.security.json' },
  { tokenId: 2, name: 'vera.research', uri: 'ipfs://QmAgentBus003/vera.research.json' },
  { tokenId: 3, name: 'cody.dev', uri: 'ipfs://QmAgentBus004/cody.dev.json' },
  { tokenId: 4, name: 'tester.qa', uri: 'ipfs://QmAgentBus005/tester.qa.json' },
  { tokenId: 5, name: 'dex.analytics', uri: 'ipfs://QmAgentBus006/dex.analytics.json' },
  { tokenId: 6, name: 'judge.gov', uri: 'ipfs://QmAgentBus007/judge.gov.json' },
  { tokenId: 7, name: 'archie.backend', uri: 'ipfs://QmAgentBus008/archie.backend.json' },
  { tokenId: 8, name: 'pixel.design', uri: 'ipfs://QmAgentBus009/pixel.design.json' },
  { tokenId: 9, name: 'scribe.docs', uri: 'ipfs://QmAgentBus010/scribe.docs.json' },
]

async function main() {
  console.log('🔗 Inscribing AgentBus cards on Base mainnet...\n')

  for (const agent of AGENTS) {
    console.log(`Inscribing ${agent.name} (tokenId: ${agent.tokenId})...`)
    try {
      // Call inscribeCard(tokenId, inscriptionHash)
      const hash = await sendTx(
        'inscribeCard(uint256,string)',
        [agent.tokenId, agent.uri]
      )
      console.log(`  ✅ Tx: ${hash}`)
      // Wait between transactions
      await new Promise(r => setTimeout(r, 3000))
    } catch (err: any) {
      console.log(`  ❌ Error: ${err.message}`)
    }
  }

  console.log('\n✅ All inscriptions complete!')
}

async function sendTx(functionSig: string, args: any[]): Promise<string> {
  // Encode the function call
  const { ethers } = await import('ethers')
  
  const abi = [`function ${functionSig}`]
  const iface = new ethers.Interface(abi)
  const data = iface.encodeFunctionData(functionSig.split('(')[0], args)
  
  const wallet = new ethers.Wallet(PRIVATE_KEY, new ethers.providers.JsonRpcProvider(RPC))
  
  const tx = await wallet.sendTransaction({
    to: NFT_ADDRESS,
    data,
    gasLimit: 100000,
  })
  
  const receipt = await tx.wait()
  return receipt.hash
}

main().catch(console.error)
