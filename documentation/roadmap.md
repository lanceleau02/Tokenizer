# 🚀 42 Tokenizer: Complete Roadmap to Defense

This is your master plan for the **Tokenizer** project. This roadmap assumes you are starting from an empty folder and guides you through every step required to build, test, deploy, and successfully defend your project according to the 42 School guidelines.

---

## 🛠️ Phase 1: Environment Setup
Before writing any code, you need a robust Web3 development environment. We will use **Hardhat**, the industry standard for Ethereum/EVM development.

1. **Initialize the Project**
   - Create your repository and folders: `code/`, `deployment/`, `documentation/`.
   - Inside `code/`, initialize a Node project: `npm init -y`
   - Install Hardhat: `npm install --save-dev hardhat`
   - Run the Hardhat wizard: `npx hardhat init` (Choose a *TypeScript project using Mocha and Ethers.js* or a *minimal project*).

2. **Install Essential Dependencies**
   - Install the Hardhat toolbox (includes testing tools and ethers.js):
     `npm install --save-dev @nomicfoundation/hardhat-toolbox`
   - Install `dotenv` to keep your private keys safe later:
     `npm install dotenv`

---

## 📜 Phase 2: Smart Contract Development
Since this is a 42 project, evaluators will want to see that you understand the code. While you *could* import OpenZeppelin, building the ERC-20 (or BEP-20) standard manually is highly recommended to prove your understanding.

1. **Contract Initialization (`Token42.sol`)**
   - The token name **MUST** contain "42" (e.g., `BatToken42`).
   - Define state variables: `name`, `symbol`, `decimals` (usually 18), and `totalSupply`.

2. **Core Functionality: Balances & Transfers**
   - Create a `mapping(address => uint256) public balanceOf;`
   - Write a `constructor` to mint the `totalSupply` and assign it to `msg.sender` (your wallet).
   - Implement the `transfer` function to allow users to send tokens.
   - Define and emit the `Transfer` event (required by the standard).

3. **Delegated Transfers (The tricky part)**
   - Create a nested mapping for allowances: `mapping(address => mapping(address => uint256)) public allowance;`
   - Implement the `approve` function (giving someone else permission to spend your tokens).
   - Implement the `transferFrom` function (the other person actually spending your tokens).
   - Define and emit the `Approval` event.

> [!IMPORTANT]
> **Security Check:** Ensure you have checks (`require`) to prevent transfers if the sender has an insufficient balance. Since you are using Solidity ^0.8.0, math overflows are handled automatically by the compiler.

---

## 🧪 Phase 3: Testing & Quality Assurance
A smart contract cannot be changed once deployed. 42 evaluators will expect you to have tested your token thoroughly.

1. **Setup the Test File**
   - Create `test/Token42.test.ts`.
   - Use Mocha and Chai (built into Hardhat) to structure your tests.

2. **Write Unit Tests**
   - **Deployment**: Verify the token name, symbol, decimals, and that the owner received the total supply.
   - **Transfers**: Test sending tokens between accounts. Test that balances update correctly.
   - **Failures**: Explicitly test that a transfer *fails* if the sender doesn't have enough tokens.
   - **Allowances**: Test the `approve` and `transferFrom` flow (e.g., Account A approves Account B to spend 100 tokens, then Account B transfers those tokens to Account C).

---

## 🔐 Phase 4: Preparation for Deployment
You need to deploy this to a public **Testnet** (like BNB Smart Chain Testnet or Ethereum Sepolia). You will use "fake" money to pay for the deployment gas.

1. **Wallet Setup**
   - Install the **MetaMask** browser extension.
   - Create a wallet and save your secret phrase offline.
   - Extract the **Private Key** of your deployment account.

2. **Get Testnet Funds**
   - Use a public Faucet (e.g., Sepolia Faucet or BNB Testnet Faucet) to request test ETH or test BNB.

3. **Secure Your Credentials (`.env`)**
   - Create a `.env` file in your root folder.
   - Add your variables: `PRIVATE_KEY=your_private_key_here` and an RPC URL (from Alchemy or Infura).
   - **CRITICAL:** Add `.env` to your `.gitignore`. *Never commit this file.*

4. **Update `hardhat.config.ts`**
   - Configure the target testnet in your Hardhat config, pulling the private key from your `.env` file.

---

## 🚀 Phase 5: Deployment & Verification
Time to put your token on the blockchain!

1. **Write the Deployment Script**
   - Create a script in `ignition/modules/` or `scripts/deploy.ts`.
   - Write the logic to deploy your specific contract.

2. **Deploy to Testnet**
   - Run the deployment command targeting your configured network:
     `npx hardhat run scripts/deploy.ts --network testnet_name`
   - Save the deployed contract address. You will need this for the defense!

3. **Verify the Contract on Block Explorer**
   - Use Hardhat to verify your contract source code on Etherscan/BscScan. This allows anyone (and your evaluator) to read your code directly on the blockchain explorer.
   - Command: `npx hardhat verify --network testnet_name DEPLOYED_CONTRACT_ADDRESS`

---

## 🎓 Phase 6: The 42 Defense
During the evaluation, you must prove that your token works and that you understand the underlying concepts.

### What you need to demonstrate:
- Show your token on a block explorer (like Sepolia Etherscan or BscScan).
- Import your custom token into MetaMask so the balance is visible.
- Send tokens from one MetaMask account to another, and show the transaction finalizing on the block explorer.

### Questions to be prepared for:
1. **"What is the difference between ERC-20 and a smart contract?"**
   *ERC-20 is just a standard (a set of rules/interfaces) that a smart contract follows to act as a token.*
2. **"Why do we need the `approve` and `transferFrom` functions?"**
   *They are required for decentralized exchanges (DEXs) or other contracts to move your tokens on your behalf safely.*
3. **"How did you handle security and prevent people from creating infinite tokens?"**
   *Explain that `totalSupply` is fixed at deployment, and `transfer` only subtracts/adds balances without creating new tokens. Mention Solidity ^0.8.0's built-in overflow protection.*
4. **"What happens if you lose your private key?"**
   *You lose access to the funds and any ownership privileges of the contract permanently.*
