# Token Features & Governance

This document details the architectural functionality and capabilities of the `BatToken42` token, alongside its bonus multi-signature governance system.

## 🦇 BatToken42 (ERC-20 Token)

`BatToken42` is a fully-compliant ERC-20 / BEP-20 fungible token built purely from scratch without the use of OpenZeppelin libraries, to strictly adhere to the educational scope of the 42 project.

### Core Features
* **Standard Implementation**: Provides a strictly standard-compliant implementation of `transfer`, `approve`, `transferFrom`, `allowance`, `balanceOf`, and `totalSupply`.
* **Zero-Address Protection**: All token transfers, minting, and approvals actively guard against the Zero Address (`0x00...00`) to prevent accidental destruction or locking of tokens.
* **Access Control**: Administrative functions are guarded by an `onlyOwner` modifier.
* **Minting**: The contract owner is permitted to mint new tokens to any user, effectively increasing the `_totalSupply`.
* **Burning**: Any user can permanently burn (destroy) their own tokens using the public `burn()` function, which safely updates the total supply dynamically.

---

## 👛 MultiSigWallet (Bonus Part)

To ensure the security of high-level token administrative features, the project implements a custom decentralized **Multi-Signature (MultiSig) system**.

### The Concept
Instead of relying on a single point of failure (a single wallet controlling the token's ability to mint), the MultiSig Wallet acts as a "decentralized board of directors". The owner of `BatToken42` is technically set to the `MultiSigWallet` contract address itself.

### How It Works
1. **Configuration**: The wallet is configured with a strict list of `owners` and a `numConfirmationsRequired` threshold (e.g., a 2-out-of-3 multisig).
2. **Proposing**: Any owner can call `submitTransaction` to propose an action—for example, calling the `mint` function on `BatToken42`.
3. **Voting/Confirming**: The proposed transaction sits in a pending state until enough independent owners call `confirmTransaction`.
4. **Execution**: Once the required threshold of confirmations is met, `executeTransaction` can be called. The MultiSig contract then performs a low-level external call, executing the transaction on behalf of the DAO.

This feature radically enhances security, trust, and decentralization for the token's ecosystem.
