# Deployment Guide

This document outlines the procedure to deploy both the `BatToken42` and `MultiSigWallet` contracts, successfully link them on-chain, and verify them publicly.

## Deployment Automation

Our deployment script automates the entire process:
1. Deploys the `MultiSigWallet`.
2. Deploys `BatToken42`.
3. Automatically transfers the ownership of `BatToken42` to the `MultiSigWallet` to enable DAO-style decentralized governance.

*(Note: On testnets like Sepolia where you only use 1 private key, the script intelligently assigns auxiliary placeholder addresses for the remaining 2 multisig owners).*

## Deploying to Sepolia Testnet

To deploy live to the Sepolia testnet, execute the following from the `code/` directory:

```bash
npx hardhat run scripts/deploy.ts --network sepolia 
```

*(Ensure your `.env` variables are correctly configured and your deployer wallet is funded with Sepolia ETH).*

---

## Contract Verification (Etherscan & Sourcify)

Once deployed, you should verify both contracts to make their Solidity code completely readable and public.

### 1. Verifying BatToken42 (Token)
Since it takes a single integer as a constructor parameter (initial supply), you can verify it directly:
```bash
npx hardhat verify --network sepolia <YOUR_TOKEN_ADDRESS> 1000000
```

### 2. Verifying MultiSigWallet (Governance)
Because `MultiSigWallet` takes an array of owner addresses in its constructor, shells like `zsh` or `bash` can fail to parse the command line array correctly. To solve this, a constructor arguments file is used:

1. Ensure the `arguments.js` file is at the root of the `code/` folder:
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
2. Verify using the `--constructor-args` option:
   ```bash
   npx hardhat verify --network sepolia --constructor-args arguments.js <YOUR_MULTISIG_ADDRESS>
   ```

*(Note: Verification publishes your Solidity files to both **Etherscan** and the decentralized **Sourcify** registry automatically!).*
