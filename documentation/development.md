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

## Development Framework: Hardhat

**Hardhat** is a premier development environment for Ethereum software. It allows developers to compile, deploy, test, and debug Ethereum software securely and seamlessly. Hardhat comes with a local Ethereum network designed for development, making it extremely easy to test smart contracts before interacting with a live network.

## Compiling the Smart Contracts

To compile `BatToken42` and `MultiSigWallet` into EVM bytecode, run the following from within the `code` directory:

```bash
npx hardhat compile
```

This will automatically trigger the Solidity compiler and generate the required ABI and typing artifacts in the `artifacts/` folder.


