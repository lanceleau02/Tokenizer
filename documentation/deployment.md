# Deployment Guide

This document outlines the procedure to deploy both the `BatToken42` and `MultiSigWallet` contracts, successfully link them on-chain, and verify them publicly.

## Deployment Automation

Our deployment script (`deployment/deploy.ts`) automates the entire process:
1. Checks that the three MultiSig owners are valid, non-zero and distinct addresses (the script stops before deploying anything otherwise).
2. Deploys the `MultiSigWallet` (2-out-of-3 confirmations required).
3. Deploys `BatToken42` with an initial supply of 1,000,000 tokens.
4. Transfers the ownership of `BatToken42` to the `MultiSigWallet` to enable DAO-style decentralized governance.

**MultiSig owners:**
* **Owner 1**: the deployer (the account whose `PRIVATE_KEY` is in `.env`).
* **Owner 2 and Owner 3**: on the local Hardhat network, the script uses the extra test accounts. On Sepolia, it reads them from the `MULTISIG_OWNER_2` and `MULTISIG_OWNER_3` variables in `.env`.

> ⚠️ Owners 2 and 3 must be wallets you actually control (e.g. two other MetaMask accounts). The token's ownership is handed to the MultiSig, so if 2 of the 3 owners cannot sign, nobody will ever be able to mint again.

## Deploying to Sepolia Testnet

**What is Sepolia?**
Sepolia is one of the primary public test networks (testnets) for Ethereum. Testnets perfectly simulate the Ethereum mainnet but use "test ETH," which has no real-world financial value. This allows developers to safely deploy and interact with smart contracts in a live, public environment without incurring any real financial costs.

### 1. Configure `.env`
Create a `.env` file at the root of the repository (it is ignored by Git):

```env
PRIVATE_KEY=your_private_key_here
SEPOLIA_RPC_URL=your_rpc_url_here
ETHERSCAN_API_KEY=your_etherscan_api_key_here
MULTISIG_OWNER_2=0x...   # second wallet you control
MULTISIG_OWNER_3=0x...   # third wallet you control
```

Make sure the deployer wallet is funded with Sepolia ETH.

### 2. Run the deployment
From the `code/` directory:

```bash
cd code
npm install
npm run deploy
```

The `deploy` script runs `hardhat run ../deployment/deploy.ts --network sepolia`. It sets `NODE_PATH` to `code/node_modules`, because the script lives outside the `code/` folder and Node would otherwise not find the Hardhat packages.

At the end, the script prints the addresses of both contracts and their Etherscan links.

---

## Contract Verification (Etherscan & Sourcify)

* **Etherscan**: The leading block explorer and analytics platform for Ethereum. Verifying your contract on Etherscan allows anyone to easily read your source code and interact with your contract directly through their web interface.
* **Sourcify**: A decentralized smart contract verification service. It securely links the deployed EVM bytecode to its original Solidity source code, ensuring total transparency and trust without relying on a centralized platform.

Once deployed, you should verify both contracts to make their Solidity code completely readable and public. Run the following commands from the `code/` folder.

### 1. Verifying BatToken42 (Token)
Since it takes a single integer as a constructor parameter (initial supply), you can verify it directly:
```bash
npx hardhat verify --network sepolia <YOUR_TOKEN_ADDRESS> 1000000
```

### 2. Verifying MultiSigWallet (Governance)
Because `MultiSigWallet` takes an array of owner addresses in its constructor, shells like `zsh` or `bash` can fail to parse the command line array correctly. To solve this, a constructor arguments file is used:

1. Update `deployment/arguments.js` with the three owners printed by the deployment script:
   ```javascript
   module.exports = [
     [
       "0x...", // Owner 1 (deployer)
       "0x...", // Owner 2 (MULTISIG_OWNER_2)
       "0x..."  // Owner 3 (MULTISIG_OWNER_3)
     ],
     2 // Threshold
   ];
   ```
2. Verify using the `--constructor-args` option:
   ```bash
   npx hardhat verify --network sepolia --constructor-args ../deployment/arguments.js <YOUR_MULTISIG_ADDRESS>
   ```

*(Note: Verification publishes your Solidity files to both **Etherscan** and the decentralized **Sourcify** registry automatically!).*

### 3. Update the repository
Copy the new contract addresses into the **Deployed Addresses** section of the root `README.md`.