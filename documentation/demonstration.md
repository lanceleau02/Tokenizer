# Live Demonstration Guide (For Evaluation)

This guide provides a step-by-step walkthrough on how to manually demonstrate your deployed `BatToken42` and `MultiSigWallet` on the Sepolia Testnet. This is exactly what you will show your peers during the 42 defense to prove everything works perfectly in a real Web3 environment!

## 🛠️ Prerequisites Before the Evaluation
1. **MetaMask**: Have your MetaMask wallet installed and open in your browser.
2. **Accounts**: Have at least 3 different accounts/addresses in your MetaMask. Let's call them:
   * **Account A**: The main owner (Owner 1).
   * **Account B**: A second owner of the MultiSig (Owner 2).
   * **Account C**: A random user (Not an owner).
3. **Sepolia ETH**: Ensure Account A and Account B have a little bit of Sepolia ETH to pay for transaction gas fees.
4. **Etherscan Links**: Have the Etherscan pages for your deployed `BatToken42` and `MultiSigWallet` open in your browser.

---

## 🦇 Part 1: Demonstrating the ERC-20 Token (`BatToken42`)

Navigate to your `BatToken42` contract on Sepolia Etherscan and click the **Contract** tab, then the **Write Contract** button. **Connect your MetaMask** using Account A.

### 1. Basic Transfer
* **Goal**: Show that users can send tokens to each other.
* **Action**:
  1. Expand the `transfer` function.
  2. In `to`, paste the address of Account C.
  3. In `amount`, enter `1000000000000000000` (which is 1 Token, because of 18 decimals).
  4. Click **Write**, confirm in MetaMask, and wait for the green success checkmark.
* **Proof**: Go to the **Read Contract** tab, expand `balanceOf`, paste Account C's address, and click Query. You will see they now have the token!

### 2. Zero-Address Protection (Security)
* **Goal**: Prove that tokens cannot be accidentally sent to the void.
* **Action**:
  1. Go back to `transfer` in **Write Contract**.
  2. In `to`, enter exactly `0x0000000000000000000000000000000000000000`.
  3. In `amount`, enter `1000000000000000000`.
  4. Click **Write**. MetaMask will immediately pop up with a red warning saying **"This transaction is expected to fail"**. This proves your zero-address protection works perfectly! Reject the transaction.

### 3. Burning Tokens
* **Goal**: Show that users can destroy their own tokens.
* **Action**:
  1. In **Write Contract**, expand the `burn` function.
  2. Enter `1000000000000000000` and click **Write**. Confirm in MetaMask.
* **Proof**: Go to **Read Contract**, expand `totalSupply`, and Query it. You will see the total number has decreased.

---

## 👛 Part 2: Demonstrating the MultiSig DAO (Bonus)

Your `BatToken42` ownership was transferred to the `MultiSigWallet`. Now, we will prove that nobody can mint tokens alone, and the DAO must vote to do it.

### 1. The Single Point of Failure Rejection
* **Goal**: Prove that Account A (the original deployer) can no longer mint tokens alone.
* **Action**:
  1. Stay on the `BatToken42` **Write Contract** page with Account A connected.
  2. Expand the `mint` function.
  3. Enter Account A's address and any amount.
  4. Click **Write**. MetaMask will warn you it will fail because Account A is **not the owner anymore**. Reject it.

### 2. Proposing the Mint via MultiSig
* **Goal**: Account A proposes to the DAO to mint tokens.
* **Action**:
  1. Navigate to the **MultiSigWallet** contract on Etherscan -> **Contract** -> **Write Contract**.
  2. Connect MetaMask with **Account A**.
  3. Expand `submitTransaction`.
  4. In `to`, paste the `BatToken42` contract address: `0xD1A2B71300a9364Fb6921a701C8224cAA99d83Ef`. 
  5. In `value`, enter `0`.
  6. In `data`, paste the encoded call to `mint(0xE3FB8f1f9125E63C7De7Fd48D2dA633767F5dC66, 100 * 10^18)`, which mints 100 BT42 to Account A: `0x40c10f19000000000000000000000000e3fb8f1f9125e63c7de7fd48d2da633767f5dc660000000000000000000000000000000000000000000000056bc75e2d63100000`
     * `0x40c10f19` is the function selector of `mint(address,uint256)`.
     * The next 32 bytes are the recipient address, padded with zeros.
     * The last 32 bytes are the amount: `100 * 10^18` = `0x56bc75e2d63100000`.
  7. Click **Write** and confirm. Take note of the transaction ID (likely `0` if it's the first one).

### 3. Non-Owner Rejection (Security)
* **Goal**: Prove strangers cannot vote on the MultiSig.
* **Action**:
  1. Switch your MetaMask to **Account C** (the random user).
  2. On the MultiSig page, click the red "Connect to Web3" button to refresh the connection to Account C.
  3. Expand `confirmTransaction`, enter ID `0`, and click **Write**.
  4. MetaMask will show a red error! Strangers cannot vote. Reject it.

### 4. Reaching Consensus & Execution
* **Goal**: Account B votes "Yes", reaching the 2-out-of-3 threshold, and executes the action.
* **Action**:
  1. Switch MetaMask to **Account B** (Owner 2). Connect to Etherscan.
  2. Expand `confirmTransaction`, enter ID `0`, and click **Write**. Confirm the transaction.
  3. Once confirmed, expand `executeTransaction`.
     * **Proof**: On `BatToken42` → **Read Contract**, query `totalSupply`: it went from `1000000000000000000000000` to `1000100000000000000000000` (1,000,000 → 1,000,100 BT42).
  4. Enter ID `0` and click **Write**.
  5. Confirm in MetaMask. The transaction will successfully execute!
