# Tokenizer Project (BatToken42)

Welcome to the Tokenizer project! This repository contains the smart contract code and test suite for `BatToken42`, a fully-featured ERC-20 token built purely from scratch using Solidity and Hardhat, along with a custom **Multi-Signature Wallet** for decentralized governance (Bonus Part).

## 📚 Project Documentation

To keep the repository clean and modular, the complete documentation is organized into dedicated files located in the `documentation/` directory:

* 🛠️ **[Development Guide](documentation/development.md)**: Setup, prerequisites, environment configuration, compiling instructions, and core Web3 concepts.
* 🧪 **[Testing Guide](documentation/testing.md)**: Details on our robust 49/49 passing test coverage, including standard token tests, edge cases, and the Master DAO Integration test.
* 🚀 **[Deployment Guide](documentation/deployment.md)**: Steps to deploy the token, transfer ownership, and successfully execute Etherscan & Sourcify verification.
* 🦇 **[Features & Governance](documentation/features.md)**: An in-depth explanation of the ERC-20 token mechanics and the Bonus Multi-Signature governance system.

---

## 🏗️ Architectural Choices & Reasoning

As required by the project specifications, here are the core technical choices made during the development of this token:

1. **Hardhat over Truffle/Remix**: Hardhat was chosen as the primary development framework due to its superior TypeScript integration, faster compilation times, and excellent local network testing capabilities via Chai matchers.
2. **From-Scratch ERC-20**: Instead of inheriting from standard OpenZeppelin libraries, the entire `BatToken42` contract was written completely from scratch. This ensures a deep, fundamental understanding of the ERC-20 interface, token balances mapping, allowances, and zero-address security checks.
3. **Decentralized Governance (MultiSig)**: For the bonus, a Multi-Signature Wallet was developed instead of a simple Timelock or single-owner model. This drastically enhances the security of the token by acting as a decentralized board of directors, eliminating a single point of failure.
4. **Sepolia Testnet**: Sepolia was chosen for deployment over Goerli (which is deprecated) because it is currently the most stable, developer-friendly Ethereum testnet for proof-of-concept deployments.

---

## 🌍 Deployed Addresses (Sepolia Testnet)

Both contracts have been successfully deployed, linked via ownership transfer, and verified on the public Sepolia Testnet!

* **BatToken42 (Token)**: `0x585C4A0b6DF6b703D74b7cbF78CD87b19422F96F`
  * [View on Sepolia Etherscan](https://sepolia.etherscan.io/address/0x585C4A0b6DF6b703D74b7cbF78CD87b19422F96F#code)
* **MultiSigWallet (Governance/Bonus)**: `0xB144E9A94d0F760a8b5df344eAc27EDe295579F4`
  * [View on Sepolia Etherscan](https://sepolia.etherscan.io/address/0xB144E9A94d0F760a8b5df344eAc27EDe295579F4#code)

### Token Details
* **Contract Name**: `BatToken42`
* **Symbol**: `BT42`
* **Decimals**: `18`