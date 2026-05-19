# Testing Guide

Security is paramount in smart contract development. This project utilizes a comprehensive, professional-grade test suite using the **Hardhat** framework and **Chai** assertions.

### Testing Framework & Assertions
* **Hardhat**: Used to simulate the blockchain environment, manage accounts, and deploy the contracts locally.
* **Chai**: A popular BDD/TDD assertion library for JavaScript. We use Chai (combined with Hardhat's custom matchers) to assert that our smart contracts return expected values and properly revert on invalid actions.

## Running the Tests

To execute the entire test suite, run the following command from the `code/` directory:

```bash
npx hardhat test
```

## Test Coverage

Our test suite guarantees that both the token logic and the MultiSig wallet behave exactly as intended, achieving a robust 49/49 passing tests.

### 1. BatToken42 (Token Tests)
The mandatory ERC-20 functionality is strictly evaluated against edge cases:
- **Deployment**: Verifies correct name, symbol, decimals, and initial supply allocation.
- **Supply Consistency**: Ensures that minting and burning correctly update the `_totalSupply`.
- **Transactions & Allowances**: Strictly verifies `transfer` and `transferFrom` mechanics, including failure on insufficient balance/allowance.
- **Administrative Functions**: Validates that only the `owner` can mint new tokens.
- **Security**: Verifies the rejection of the `Zero Address` (`0x000...00`) for all transfers, approvals, and minting to prevent accidental coin burn.

### 2. MultiSigWallet (Governance Tests)
The Multi-Signature wallet integration handles the bonus requirements:
- **Deployment & Settings**: Ensures the threshold and signer list correctly initializes.
- **Transaction Flow**: Verifies that any owner can submit, confirm, and execute a transaction, while non-owners are strictly rejected.
- **Revocation**: Tests the ability of signers to revoke a prior confirmation.
- **Execution Limits**: Validates that double-confirmations or premature execution (under threshold) natively revert.

### 3. DAO Governance Integration (The Master Test)
A specialized master test verifies the end-to-end integration of both contracts:
1. Deploys both `BatToken42` and `MultiSigWallet`.
2. Transfers ownership of the token to the MultiSig contract.
3. Successfully tests decentralized token minting by proposing a mint transaction, gathering required multi-signatures, and executing it through the MultiSig wallet.
