import Database from 'better-sqlite3'
import path from 'path'

const DB_PATH = path.join(process.cwd(), 'data', 'agentbus.db')
const db = new Database(DB_PATH)

const agents = db.prepare('SELECT id, name, tokenId FROM agents ORDER BY tokenId').all()
console.log('Agents in database:', agents.length)
console.log(JSON.stringify(agents, null, 2))

db.close()
