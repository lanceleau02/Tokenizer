# Demonstration

This guide walks through a live demonstration of the deployed `BatToken42` token and its `MultiSigWallet` (bonus) on the Sepolia testnet, using only MetaMask and Etherscan.

## 📌 Reference Values

| What | Value |
|---|---|
| Token (`BatToken42`, `BT42`) | `0xD1A2B71300a9364Fb6921a701C8224cAA99d83Ef` |
| MultiSig wallet | `0xd0497b669Cc01c6FA45e1E5601Ea88e074b0013a` |
| **Account A** (Owner 1, deployer) | `0xE3FB8f1f9125E63C7De7Fd48D2dA633767F5dC66` |
| **Account B** (Owner 2) | `0x7C46aF327455837d6c7aB5DF79638B45628DF9d3` |
| Owner 3 (not used in this demo) | `0xA58497644a5561b42FfAB45248b29dDcaEdEc55a` |
| **Account C** (stranger) | Any other MetaMask account, which must **not** be one of the three owners |
| Mint payload (100 BT42 → Account A) | `0x40c10f19000000000000000000000000e3fb8f1f9125e63c7de7fd48d2da633767f5dc660000000000000000000000000000000000000000000000056bc75e2d63100000` |

Token amounts are always entered in the smallest unit (18 decimals): `1 BT42` = `1000000000000000000`, `100 BT42` = `100000000000000000000`.

## 🛠️ Prerequisites

1. **MetaMask** is installed, and the network selected at the top left is **Sepolia**. If it is not listed, enable *Show test networks* in MetaMask's settings.
2. MetaMask contains **Account A**, **Account B** and **Account C**. Check each address against the table above (click the account name in MetaMask to copy its address).
3. **Account A and Account B have a little Sepolia ETH** for gas, a few thousandths of an ETH each is enough. Account C needs none: every transaction it attempts is rejected.
4. Two browser tabs are open:
   * **Tab TOKEN**: `https://sepolia.etherscan.io/address/0xD1A2B71300a9364Fb6921a701C8224cAA99d83Ef#code`
   * **Tab MULTISIG**: `https://sepolia.etherscan.io/address/0xd0497b669Cc01c6FA45e1E5601Ea88e074b0013a#code`

   On each tab, the **Contract** section has **Code**, **Read Contract** and **Write Contract** sub-tabs.

### ⚠️ Rules for every Write action
* **Before writing**, look at the address on Etherscan's **Connect** button. After switching accounts in MetaMask, **refresh the page and click Connect again**, because Etherscan keeps the previous connection otherwise.
* **After confirming in MetaMask**, wait for the transaction to show **Success** (about 12 seconds) before the next step. Otherwise MetaMask simulates the next call against the old state and reports that it will fail.
* When a step says **"should fail"**, MetaMask shows *"This transaction is likely to fail"* and *"Network fee: Unavailable"*. That is the proof: click **Reject**, never send it.

---

## 🦇 Part 1: The ERC-20 Token (`BatToken42`)

### 1.1 Token identity and ownership (read only, no wallet needed)
**Tab TOKEN → Read Contract**, expand each function and click **Query**:
* `name` → `BatToken42`, `symbol` → `BT42`, `decimals` → `18`
* `totalSupply` → **write this value down**, Part 2 compares against it.
* `owner` → `0xd0497b669Cc01c6FA45e1E5601Ea88e074b0013a`: the token is administered by the MultiSig contract, not by a single wallet.

### 1.2 Basic transfer
1. **Tab TOKEN → Write Contract → Connect to Web3**, and select **Account A**.
2. Expand `transfer`:
   * `to (address)`: Account C's address
   * `value (uint256)`: `1000000000000000000` (1 BT42)
3. Click **Write**, **Confirm** in MetaMask, and wait for **Success**.
4. **Proof**: **Read Contract → `balanceOf`**, paste Account C's address, **Query**. Account C now holds `1000000000000000000`.

### 1.3 Zero-address protection (should fail)
1. Still on **Write Contract** as Account A, expand `transfer`:
   * `to (address)`: `0x0000000000000000000000000000000000000000`
   * `value (uint256)`: `1000000000000000000`
2. Click **Write**. MetaMask reports the transaction is likely to fail (revert reason: `Transfer to zero address`). **Reject.**

### 1.4 Burning tokens
1. Still as Account A, expand `burn`:
   * `value (uint256)`: `1000000000000000000`
2. Click **Write**, **Confirm**, and wait for **Success**.
3. **Proof**: **Read Contract → `totalSupply`**: it decreased by exactly 1 BT42 compared to step 1.1. Write the new value down.

---

## 👛 Part 2: MultiSig Governance (Bonus)

The token's `owner` is the MultiSig wallet. Minting therefore requires **2 of the 3 owners** to approve the same proposal.

### 2.1 Read the MultiSig configuration (read only)
**Tab MULTISIG → Read Contract**:
* `getOwners` → the three owner addresses from the table above.
* `numConfirmationsRequired` → `2`.
* `getTransactionCount` → **write this number down: it is the ID of the proposal you are about to create.** It is called **`ID`** below. Proposals are numbered from `0`, so after one test run the next ID is `1`.

### 2.2 Account A cannot mint alone (should fail)
1. **Tab TOKEN → Write Contract**, connected as **Account A**.
2. Expand `mint`:
   * `to (address)`: `0xE3FB8f1f9125E63C7De7Fd48D2dA633767F5dC66`
   * `value (uint256)`: `100000000000000000000`
3. Click **Write**. The transaction is likely to fail (`Not the owner`): even the deployer lost the right to mint alone. **Reject.**

### 2.3 Account A submits a mint proposal
1. **Tab MULTISIG → Write Contract → Connect to Web3**, and check that **Account A** is connected.
2. Expand `submitTransaction`:
   * `_to (address)`: `0xD1A2B71300a9364Fb6921a701C8224cAA99d83Ef` (the token)
   * `_value (uint256)`: `0` (no ETH is sent)
   * `_data (bytes)`: the mint payload from the reference table, pasted in one piece with no spaces.
3. Click **Write**, **Confirm**, and wait for **Success**.
4. **Check**: **Read Contract → `getTransaction`** with `_txIndex` = `ID`: `executed` = `false`, `numConfirmations` = `0`.

**What is the payload?** It is the ABI-encoded call `mint(0xE3FB…dC66, 100 × 10¹⁸)`:
* `0x40c10f19`: the function selector, the first 4 bytes of `keccak256("mint(address,uint256)")`.
* The next 32 bytes: the recipient address, left-padded with zeros.
* The last 32 bytes: the amount, `100 × 10¹⁸` = `0x56bc75e2d63100000`.

The MultiSig does not know about tokens: it just forwards these bytes to `_to` once enough owners have approved.

### 2.4 Account A confirms (1/2)
Submitting a proposal does **not** count as a vote, so the proposer must also confirm it.
1. Still as Account A: **Write Contract → `confirmTransaction`**, `_txIndex` = `ID`.
2. Click **Write**, **Confirm**, and wait for **Success**.
3. **Check**: `getTransaction(ID)` → `numConfirmations` = `1`.

### 2.5 Executing too early (should fail)
1. Still as Account A: `executeTransaction`, `_txIndex` = `ID`, then **Write**.
2. Likely to fail (`Not enough confirmations`): one signature is not enough. **Reject.**

### 2.6 A stranger cannot vote (should fail)
1. In MetaMask, switch to **Account C**, refresh Tab MULTISIG, and **Connect to Web3** again. Check that the button shows Account C's address.
2. `confirmTransaction`, `_txIndex` = `ID`, then **Write**.
3. Likely to fail (`Not an owner`). **Reject.**

### 2.7 Account B confirms (2/2)
1. In MetaMask, switch to **Account B**, refresh Tab MULTISIG, and **Connect to Web3**. Check that the button shows `0x7C46…F9d3`.
2. `confirmTransaction`, `_txIndex` = `ID`, then **Write**, **Confirm**, and wait for **Success**.
3. **Check**: `getTransaction(ID)` → `numConfirmations` = `2`.

### 2.8 Execution
1. Still as Account B (any owner can execute once the threshold is reached): `executeTransaction`, `_txIndex` = `ID`, then **Write**, **Confirm**, and wait for **Success**.
2. On the transaction page, the **Logs** tab shows the token's `Transfer` event from `0x0000…0000` to Account A (a mint), then the MultiSig's `ExecuteTransaction` event.

### 2.9 Proof
* **Tab TOKEN → Read Contract** (refresh first): `totalSupply` increased by **exactly 100 BT42** (`100000000000000000000`) compared to the value written down in Part 1, and `balanceOf(Account A)` increased by the same amount.
* **Tab MULTISIG → Read Contract**: `getTransaction(ID)` → `executed` = `true`, `numConfirmations` = `2`.

The token was minted without any single wallet being able to do it alone.

---

## 🧯 Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| "Likely to fail" at 1.2, 1.4, 2.3, 2.4, 2.7 or 2.8 | Wrong account connected, or a typo in the inputs | Check the address on the Connect button, and that `_data` starts with `0x40c10f19` with no spaces |
| `submitTransaction` likely to fail | The connected account is not an owner | **Read Contract → `isOwner`** with the connected address must return `true` |
| "Transaction does not exist" | Wrong `ID`, or the proposal was not submitted yet | Re-read `getTransactionCount`; the latest proposal is `count − 1` |
| `executeTransaction` → "Not enough confirmations" | Account A skipped step 2.4 | Run `confirmTransaction` as Account A |
| "Transaction already confirmed by you" | The same owner is confirming twice | Switch to the other owner |
| Etherscan still uses the previous account | It did not pick up the MetaMask account switch | Refresh the page and click Connect again |
| A step fails right after the previous one | The previous transaction was not mined yet | Wait for **Success**, then retry |