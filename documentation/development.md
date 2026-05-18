# Development Guide

Welcome to the development documentation for the **Tokenizer** project. This guide covers the prerequisites, setup, and compilation processes for the smart contracts.

## Prerequisites

Ensure your system meets the following requirements before starting:
- [Node.js](https://nodejs.org/) (v18+ recommended)
- [npm](https://www.npmjs.com/)

## Installation & Setup

1. Navigate to the `code` directory where the Hardhat project resides:
   ```bash
   cd code
   ```

2. Install the required Node.js dependencies:
   ```bash
   npm install
   npm install --save-dev dotenv
   ```

3. **Environment Setup**:
   Create a `.env` file at the root of the project to securely store your deployment keys. The Hardhat configuration dynamically resolves this file from the `code/` folder:
   ```env
   PRIVATE_KEY=your_private_key_here
   SEPOLIA_RPC_URL=your_rpc_url_here
   ETHERSCAN_API_KEY=your_etherscan_api_key_here
   ```

## Compiling the Smart Contracts

To compile `BatToken42` and `MultiSigWallet` into EVM bytecode, run the following from within the `code` directory:

```bash
npx hardhat compile
```

This will automatically trigger the Solidity compiler and generate the required ABI and typing artifacts in the `artifacts/` folder.

## Web3 Development Concepts

### EVM (Ethereum Virtual Machine) Compatibility
During development, you might notice that your public wallet address is exactly the same across many networks (Ethereum, Linea, Base, BNB Chain, Polygon, Optimism, etc.). This is completely normal and is a key architectural feature of Web3. All EVM-compatible chains run the same execution environment and use the same cryptography (the `secp256k1` elliptic curve) to generate addresses. 

### ERC-20 vs. Blockchain Networks
* **ERC-20 (or BEP-20)**: This is **not a network**. It is a standard interface specification for creating fungible tokens in Solidity.
* **The Networks**: Ethereum, BNB Smart Chain, and Polygon are entirely separate blockchains. `BatToken42` can be deployed on *any* of these networks, but its state remains strictly local to each blockchain.

### Testnet ETH (Play Money)
Tokens like **SepoliaETH** have **zero real-world financial value**. They exist strictly so developers can deploy and test smart contracts without spending real money. Even if your MetaMask displays a fiat USD value next to your testnet ETH balance, it is merely a harmless UI glitch where the wallet applies Mainnet ETH pricing to testnet assets.
