import "@nomicfoundation/hardhat-ethers";
import { ethers } from "hardhat";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

async function main() {
  const signers = await ethers.getSigners();
  const deployer = signers[0];
  console.log(`Deployer address: ${deployer.address}`);

  const owner1 = deployer.address;
  const owner2 = signers[1]?.address ?? process.env.MULTISIG_OWNER_2;
  const owner3 = signers[2]?.address ?? process.env.MULTISIG_OWNER_3;

  const owners = [owner1, owner2, owner3];
  for (const [i, addr] of owners.entries()) {
    if (!addr || !ethers.isAddress(addr) || addr === ethers.ZeroAddress) {
      throw new Error(`Owner ${i + 1} is missing or invalid: set MULTISIG_OWNER_${i + 1} in .env`);
    }
  }
  if (new Set(owners.map((a) => a!.toLowerCase())).size !== owners.length) {
    throw new Error("MultiSig owners must be three distinct addresses");
  }
  const multisigOwners = owners as string[];

  console.log("\n--- Deploying MultiSigWallet ---");
  console.log(`Owners: \n  1. ${owner1}\n  2. ${owner2}\n  3. ${owner3}`);
  console.log("Required confirmations: 2");

  const MultiSigFactory = await ethers.getContractFactory("MultiSigWallet");
  const multiSigWallet = await MultiSigFactory.deploy(multisigOwners, 2);
  await multiSigWallet.waitForDeployment();
  const multiSigAddress = await multiSigWallet.getAddress();
  console.log(`MultiSigWallet deployed to: ${multiSigAddress}`);

  console.log("\n--- Deploying BatToken42 ---");
  const TokenFactory = await ethers.getContractFactory("BatToken42");
  const batToken = await TokenFactory.deploy(1000000);
  await batToken.waitForDeployment();
  const tokenAddress = await batToken.getAddress();
  console.log(`BatToken42 deployed to: ${tokenAddress}`);

  console.log("\n--- Transferring Token Ownership to MultiSig ---");
  const tx = await batToken.transferOwnership(multiSigAddress);
  await tx.wait();
  console.log("Ownership successfully transferred to the MultiSigWallet!");

  console.log("\n🎉 SUCCESS!");
  console.log(`MultiSigWallet: ${multiSigAddress}`);
  console.log(`BatToken42:     ${tokenAddress}`);
  console.log(`\nView BatToken42 live: https://sepolia.etherscan.io/address/${tokenAddress}`);
  console.log(`View MultiSig live:   https://sepolia.etherscan.io/address/${multiSigAddress}`);
  console.log("\nTo verify on Etherscan & Sourcify, run these commands:");
  console.log(`npx hardhat verify --network sepolia ${multiSigAddress} '["${owner1}","${owner2}","${owner3}"]' 2`);
  console.log(`npx hardhat verify --network sepolia ${tokenAddress} 1000000`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});