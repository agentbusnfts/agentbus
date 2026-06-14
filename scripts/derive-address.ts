import { privateKeyToAccount } from 'viem/accounts'

const privateKey = '0x3d23c3bd1c7689531d848d8a6df989dfde450f02767dc529e8df8e3991dde66e'
const account = privateKeyToAccount(privateKey)

console.log('Wallet Address:', account.address)
