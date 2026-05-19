# Deployment Guide

This document outlines the procedure to deploy both the `BatToken42` and `MultiSigWallet` contracts, successfully link them on-chain, and verify them publicly.

## Deployment Automation

Our deployment script automates the entire process:
1. Deploys the `MultiSigWallet`.
2. Deploys `BatToken42`.
3. Automatically transfers the ownership of `BatToken42` to the `MultiSigWallet` to enable DAO-style decentralized governance.

*(Note: On testnets like Sepolia where you only use 1 private key, the script intelligently assigns auxiliary placeholder addresses for the remaining 2 multisig owners).*

## Deploying to Sepolia Testnet

**What is Sepolia?**
Sepolia is one of the primary public test networks (testnets) for Ethereum. Testnets perfectly simulate the Ethereum mainnet but use "test ETH," which has no real-world financial value. This allows developers to safely deploy and interact with smart contracts in a live, public environment without incurring any real financial costs.

To deploy live to the Sepolia testnet, execute the following from the `code/` directory:

```bash
npx hardhat run ../deployment/deploy.ts --network sepolia 
```

*(Ensure your `.env` variables are correctly configured and your deployer wallet is funded with Sepolia ETH).*

---

## Contract Verification (Etherscan & Sourcify)

* **Etherscan**: The leading block explorer and analytics platform for Ethereum. Verifying your contract on Etherscan allows anyone to easily read your source code and interact with your contract directly through their web interface.
* **Sourcify**: A decentralized smart contract verification service. It securely links the deployed EVM bytecode to its original Solidity source code, ensuring total transparency and trust without relying on a centralized platform.

Once deployed, you should verify both contracts to make their Solidity code completely readable and public.

### 1. Verifying BatToken42 (Token)
Since it takes a single integer as a constructor parameter (initial supply), you can verify it directly:
```bash
npx hardhat verify --network sepolia <YOUR_TOKEN_ADDRESS> 1000000
```

### 2. Verifying MultiSigWallet (Governance)
Because `MultiSigWallet` takes an array of owner addresses in its constructor, shells like `zsh` or `bash` can fail to parse the command line array correctly. To solve this, a constructor arguments file is used:

1. The `arguments.js` file is located in the `deployment/` folder:
   ```javascript
   module.exports = [
     [
       "0xE3FB8f1f9125E63C7De7Fd48D2dA633767F5dC66", // Owner 1
       "0x1111111111111111111111111111111111111111", // Owner 2
       "0x2222222222222222222222222222222222222222"  // Owner 3
     ],
     2 // Threshold
   ];
   ```
2. Verify using the `--constructor-args` option (run this from the `code/` folder):
   ```bash
   npx hardhat verify --network sepolia --constructor-args ../deployment/arguments.js <YOUR_MULTISIG_ADDRESS>
   ```

*(Note: Verification publishes your Solidity files to both **Etherscan** and the decentralized **Sourcify** registry automatically!).*
