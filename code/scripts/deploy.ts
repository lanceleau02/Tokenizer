import "@nomicfoundation/hardhat-ethers";
import { ethers } from "hardhat";

async function main() {
  console.log("Preparing to deploy BatToken42 to Sepolia...");

  // 1. Grab the compiled smart contract by its exact name
  const TokenFactory = await ethers.getContractFactory("BatToken42");

  // 2. Trigger the deployment transaction
  // Note: If your constructor requires arguments (like an initial supply), 
  // you pass them inside deploy() like this: .deploy(1000000)
  const batToken = await TokenFactory.deploy(1000000); 

  // 3. Wait for the block to be mined on the network
  await batToken.waitForDeployment();

  // 4. Get the official address where your token now lives!
  const address = await batToken.getAddress();
  
  console.log("🎉 SUCCESS!");
  console.log(`BatToken42 deployed to: ${address}`);
  console.log(`View it live: https://sepolia.etherscan.io/address/${address}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});