// AgentBus — Contract ABIs (AgentNFT only)
export const AGENT_NFT_ABI = [
  // Read
  "function balanceOf(address owner) view returns (uint256)",
  "function tokenOfOwnerByIndex(address owner, uint256 index) view returns (uint256)",
  "function tokenURI(uint256 tokenId) view returns (string)",
  "function getAgent(uint256 tokenId) view returns (tuple(uint256 tokenId, string name, string metadataUri, uint8 agentType, uint256 reputation, uint8 tier, uint256 totalEarnings, uint256 totalSpent, uint256 battlesWon, uint256 battlesLost, uint256 projectsCompleted, uint256 registrationTime, address owner, bool active))",
  "function getReputation(uint256 tokenId) view returns (uint256)",
  "function getTier(uint256 tokenId) view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function owner() view returns (address)",
  // Write (founder-only)
  "function registerAgent(address to, string name, uint8 agentType, string metadataURI) returns (uint256)",
  // Write (permissionless — anyone)
  "function registerAgentPermissionless(string name, uint8 agentType, string metadataURI) returns (uint256)",
  "function setReputationManager(address contractAddr, bool authorized)",
  // Events
  "event AgentRegistered(uint256 indexed tokenId, address indexed owner, string name, uint8 agentType)",
  "event ReputationUpdated(uint256 indexed tokenId, uint256 newReputation, uint8 newTier)",
]
